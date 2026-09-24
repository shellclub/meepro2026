import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import * as XLSX from "xlsx";
import { query, execute } from "@/lib/db";

const secretKey = process.env.JWT_SECRET || "fallback_secret_key_meepro_2026";
const key = new TextEncoder().encode(secretKey);

const PRODUCT_HEADERS = [
  "SKU*", "ชื่อสินค้า*", "หมวดหมู่", "แบรนด์", "ราคาขาย*", "ราคาเต็ม", "ราคาทุน",
  "จำนวนสต๊อก*", "น้ำหนัก/ขนาด", "หน่วย", "คำอธิบายสั้น", "คำอธิบายเต็ม",
  "แท็ก", "สถานะ", "สินค้าแนะนำ", "เปิดใช้งาน", "รูปภาพหลัก (URL)", "รูปภาพเพิ่มเติม (URL)",
] as const;

const VARIANT_HEADERS = [
  "SKU สินค้า*", "ชื่อตัวเลือก*", "ค่า*", "ส่วนต่างราคา", "สต๊อกตัวเลือก", "SKU ตัวเลือก", "เปิดใช้งาน",
] as const;

// Columns actually used from a BigSeller "SKU" export (the tool sellers use to sync SKUs
// across marketplaces). Only the columns we read are required — unused columns (GTIN,
// dimensions, etc.) are tolerated so minor export-format drift doesn't break import.
const BIGSELLER_HEADERS = [
  "เลข SKU", "ชื่อ SKU", "หมวดหมู่", "อ้างอิงราคาต้นทุน", "อ้างอิงราคาขาย", "แบรนด์",
  "แท็ก", "สต็อกที่มีอยู่ทั้งหมด", "น้ำหนักสุทธิ(g)", "Image URL", "ประเภทSKU",
] as const;

const VALID_STATUS = ["available", "out_of_stock", "discontinued"];

function toSlug(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9ก-๙-]/g, "");
}

function parseYN(val: any, defaultVal: boolean) {
  if (val === undefined || val === null || String(val).trim() === "") return defaultVal;
  return String(val).trim().toUpperCase() === "Y";
}

function toNumberOrNull(val: any): number | null {
  if (val === undefined || val === null || String(val).trim() === "") return null;
  const n = Number(val);
  return Number.isFinite(n) ? n : NaN;
}

function sheetToRows(ws: XLSX.WorkSheet, expectedHeaders: readonly string[]): { rows: any[][]; headerIndex: Record<string, number> } {
  const raw: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1, blankrows: false, defval: "" });
  if (raw.length === 0) return { rows: [], headerIndex: {} };
  const headerRow = raw[0].map((h) => String(h).trim());
  const headerIndex: Record<string, number> = {};
  headerRow.forEach((h, i) => { headerIndex[h] = i; });
  const missing = expectedHeaders.filter((h) => !(h in headerIndex));
  if (missing.length > 0) {
    throw new Error(`หัวคอลัมน์ไม่ถูกต้องหรือถูกแก้ไข ขาดคอลัมน์: ${missing.join(", ")} — กรุณาใช้ไฟล์ template ต้นฉบับ`);
  }
  return { rows: raw.slice(1), headerIndex };
}

async function loadLookups() {
  const categories = await query<{ id: number; name: string }>("SELECT id, name FROM categories");
  const brands = await query<{ id: number; name: string }>("SELECT id, name FROM brands");
  const categoryByName = new Map(categories.map((c) => [c.name.trim().toLowerCase(), c.id]));
  const brandByName = new Map(brands.map((b) => [b.name.trim().toLowerCase(), b.id]));
  const usedSlugs = new Set<string>((await query<{ slug: string }>("SELECT slug FROM products")).map((r) => r.slug));
  return { categoryByName, brandByName, usedSlugs };
}

// Imports a "SKU" export from BigSeller (a multi-marketplace SKU sync tool many sellers already
// use). Unlike the system's own template, this format has no reliable selling price — sellers set
// live prices per-marketplace, not in this export — so every row imports with isActive=false
// ("pending price") until an admin fills in a real price. Category/brand names in this export are
// marketplace tags (VAT rate, promo labels, etc.), not this store's taxonomy, so unmatched values
// are just left blank instead of blocking the row.
async function handleBigSellerImport(workbook: XLSX.WorkBook, skuSheetName: string, bundleSheetName: string | undefined) {
  let productRows: any[][], productHeaderIndex: Record<string, number>;
  try {
    ({ rows: productRows, headerIndex: productHeaderIndex } = sheetToRows(workbook.Sheets[skuSheetName], BIGSELLER_HEADERS));
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }

  // Bundle component detail sheet: one row per bundle SKU, with repeating column groups
  // "SKU เดียว N" / "ชื่อ SKU N" / "จำนวน SKUN" / ... for each component slot (N is dynamic).
  const bundleDetailBySku = new Map<string, any[]>();
  const componentGroups: { skuCol: number; qtyCol: number }[] = [];
  let bundleSkuColIdx = 0;
  if (bundleSheetName) {
    const raw: any[][] = XLSX.utils.sheet_to_json(workbook.Sheets[bundleSheetName], { header: 1, blankrows: false, defval: "" });
    if (raw.length > 0) {
      const headerRow = raw[0].map((h) => String(h).trim());
      headerRow.forEach((h, i) => {
        if (h === "เลข SKU") bundleSkuColIdx = i;
        const m = h.match(/^SKU เดียว (\d+)$/);
        if (m) componentGroups.push({ skuCol: i, qtyCol: i + 2 });
      });
      for (const row of raw.slice(1)) {
        const sku = String(row[bundleSkuColIdx] ?? "").trim();
        if (sku) bundleDetailBySku.set(sku, row);
      }
    }
  }

  const { categoryByName, brandByName, usedSlugs } = await loadLookups();

  const results: { row: number; sku: string; status: "created" | "updated" | "error"; message?: string }[] = [];
  const skuToProductId = new Map<string, number>();
  const bundleProductsToLink: { row: number; sku: string; productId: number }[] = [];
  let pendingPriceCount = 0;
  let categoryUnmatched = 0;

  for (let i = 0; i < productRows.length; i++) {
    const r = productRows[i];
    const rowNum = i + 2;
    const get = (h: string) => {
      const v = r[productHeaderIndex[h]];
      return v === undefined ? "" : String(v).trim();
    };

    const sku = get("เลข SKU");
    const name = get("ชื่อ SKU");
    if (!sku && !name) continue;

    try {
      if (!sku) throw new Error("ไม่ได้กรอก SKU");
      if (!name) throw new Error("ไม่ได้กรอกชื่อสินค้า");

      const priceRaw = toNumberOrNull(get("อ้างอิงราคาขาย"));
      if (Number.isNaN(priceRaw as any)) throw new Error("อ้างอิงราคาขายต้องเป็นตัวเลข");
      const price = priceRaw && priceRaw > 0 ? priceRaw : 0;
      const isActive = price > 0;
      if (!isActive) pendingPriceCount++;

      const costPrice = toNumberOrNull(get("อ้างอิงราคาต้นทุน"));
      if (Number.isNaN(costPrice as any)) throw new Error("อ้างอิงราคาต้นทุนต้องเป็นตัวเลข");

      const stockRaw = toNumberOrNull(get("สต็อกที่มีอยู่ทั้งหมด"));
      if (Number.isNaN(stockRaw as any)) throw new Error("สต็อกต้องเป็นตัวเลข");
      const stock = stockRaw ? Math.round(stockRaw) : 0;

      const weightG = toNumberOrNull(get("น้ำหนักสุทธิ(g)"));
      const weight = weightG ? `${weightG} g` : null;

      const categoryNameRaw = get("หมวดหมู่");
      let categoryId: number | null = null;
      if (categoryNameRaw) {
        categoryId = categoryByName.get(categoryNameRaw.toLowerCase()) ?? null;
        if (categoryId === null) categoryUnmatched++;
      }

      const brandNameRaw = get("แบรนด์");
      const brandId = brandNameRaw ? brandByName.get(brandNameRaw.toLowerCase()) ?? null : null;

      const tags = get("แท็ก") || null;
      const mainImageUrl = get("Image URL");
      const skuType = get("ประเภทSKU");

      const existing = await query<{ id: number; slug: string }>("SELECT id, slug FROM products WHERE sku = ? LIMIT 1", [sku]);

      let productId: number;
      let action: "created" | "updated";

      if (existing.length > 0) {
        productId = existing[0].id;
        action = "updated";
        await execute(
          `UPDATE products SET name=?, price=?, costPrice=?, stock=?, weight=?, isActive=?, categoryId=?, brandId=?, tags=?, updatedAt=NOW() WHERE id=?`,
          [name, price, costPrice, stock, weight, isActive ? 1 : 0, categoryId, brandId, tags, productId]
        );
      } else {
        let slug = toSlug(name) || `product-${sku.toLowerCase()}`;
        let baseSlug = slug;
        let n = 2;
        while (usedSlugs.has(slug)) {
          slug = `${baseSlug}-${n}`;
          n++;
        }
        usedSlugs.add(slug);

        const result = await execute(
          `INSERT INTO products (name, slug, sku, price, costPrice, stock, weight, isFeatured, isActive, status, categoryId, brandId, tags, createdAt, updatedAt)
           VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?, 'available', ?, ?, ?, NOW(), NOW())`,
          [name, slug, sku, price, costPrice, stock, weight, isActive ? 1 : 0, categoryId, brandId, tags]
        );
        productId = Number(result.insertId);
        action = "created";
      }

      if (mainImageUrl) {
        await execute("DELETE FROM product_images WHERE productId = ?", [productId]);
        await execute("INSERT INTO product_images (productId, url, sortOrder, isMain) VALUES (?, ?, 0, 1)", [productId, mainImageUrl]);
      }

      skuToProductId.set(sku, productId);
      if (skuType === "Bundle SKU") bundleProductsToLink.push({ row: rowNum, sku, productId });
      results.push({ row: rowNum, sku, status: action });
    } catch (e: any) {
      results.push({ row: rowNum, sku: sku || "(ไม่มี SKU)", status: "error", message: e.message || "เกิดข้อผิดพลาด" });
    }
  }

  // Bundle linking runs after every row is imported so components listed later in the
  // file are already in skuToProductId by the time their parent bundle is linked.
  const bundleErrors: { row: number; sku: string; status: "error"; message: string }[] = [];
  let bundlesLinked = 0;

  for (const { row, sku, productId } of bundleProductsToLink) {
    const detailRow = bundleDetailBySku.get(sku);
    if (!detailRow) {
      bundleErrors.push({ row, sku, status: "error", message: `ไม่พบรายละเอียดส่วนประกอบของ Bundle SKU "${sku}" ในชีต "${bundleSheetName}"` });
      continue;
    }

    await execute("DELETE FROM product_bundle_items WHERE bundleProductId = ?", [productId]);

    let linkedAny = false;
    for (const { skuCol, qtyCol } of componentGroups) {
      const componentSku = String(detailRow[skuCol] ?? "").trim();
      if (!componentSku) continue;
      const qty = Number(detailRow[qtyCol]) || 1;

      let componentProductId = skuToProductId.get(componentSku);
      if (!componentProductId) {
        const found = await query<{ id: number }>("SELECT id FROM products WHERE sku = ? LIMIT 1", [componentSku]);
        if (found.length > 0) componentProductId = found[0].id;
      }
      if (!componentProductId) {
        bundleErrors.push({ row, sku, status: "error", message: `ไม่พบ SKU ส่วนประกอบ "${componentSku}" (ทั้งในไฟล์นี้และในระบบ)` });
        continue;
      }

      await execute(
        "INSERT INTO product_bundle_items (bundleProductId, componentProductId, quantity) VALUES (?, ?, ?)",
        [productId, componentProductId, qty]
      );
      linkedAny = true;
    }
    if (linkedAny) bundlesLinked++;
  }

  const allResults = [...results, ...bundleErrors];
  const summary = {
    created: results.filter((r) => r.status === "created").length,
    updated: results.filter((r) => r.status === "updated").length,
    errors: allResults.filter((r) => r.status === "error").length,
    pendingPrice: pendingPriceCount,
    categoryUnmatched,
    bundlesLinked,
  };

  return NextResponse.json({ success: true, summary, results: allResults });
}

export async function POST(req: NextRequest) {
  // Defense-in-depth: verify auth directly (middleware also covers /api/admin/*)
  const token = req.cookies.get("admin_token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    await jwtVerify(token, key);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let file: File | null;
  try {
    const formData = await req.formData();
    file = formData.get("file") as File | null;
  } catch {
    return NextResponse.json({ error: "ไม่สามารถอ่านไฟล์ที่ส่งมาได้" }, { status: 400 });
  }

  if (!file) {
    return NextResponse.json({ error: "กรุณาแนบไฟล์ Excel (.xlsx)" }, { status: 400 });
  }
  if (!/\.xlsx$/i.test(file.name)) {
    return NextResponse.json({ error: "รองรับเฉพาะไฟล์ .xlsx เท่านั้น" }, { status: 400 });
  }
  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: "ไฟล์ใหญ่เกินไป (สูงสุด 10MB)" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  let workbook: XLSX.WorkBook;
  try {
    workbook = XLSX.read(buffer, { type: "buffer" });
  } catch {
    return NextResponse.json({ error: "ไม่สามารถอ่านไฟล์ Excel ได้ ไฟล์อาจเสียหายหรือไม่ใช่ไฟล์ .xlsx ที่ถูกต้อง" }, { status: 400 });
  }

  const productSheetName = workbook.SheetNames.find((n) => n === "สินค้า") || workbook.SheetNames.find((n) => n.includes("สินค้า") && !n.includes("ตัวเลือก") && !n.includes("อ้างอิง"));
  const variantSheetName = workbook.SheetNames.find((n) => n === "ตัวเลือกสินค้า") || workbook.SheetNames.find((n) => n.includes("ตัวเลือกสินค้า"));

  if (!productSheetName) {
    const bigSellerSheetName = workbook.SheetNames.find((n) => n === "SKU");
    if (bigSellerSheetName) {
      const bigSellerBundleSheetName = workbook.SheetNames.find((n) => n.includes("Bundle SKU"));
      return handleBigSellerImport(workbook, bigSellerSheetName, bigSellerBundleSheetName);
    }
    return NextResponse.json({ error: 'ไม่พบชีต "สินค้า" ในไฟล์ที่อัปโหลด กรุณาใช้ไฟล์ template ต้นฉบับ หรือไฟล์ export จาก BigSeller (ชีต "SKU")' }, { status: 400 });
  }

  let productRows: any[][], productHeaderIndex: Record<string, number>;
  let variantRows: any[][] = [], variantHeaderIndex: Record<string, number> = {};
  try {
    ({ rows: productRows, headerIndex: productHeaderIndex } = sheetToRows(workbook.Sheets[productSheetName], PRODUCT_HEADERS));
    if (variantSheetName) {
      ({ rows: variantRows, headerIndex: variantHeaderIndex } = sheetToRows(workbook.Sheets[variantSheetName], VARIANT_HEADERS));
    }
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }

  const { categoryByName, brandByName, usedSlugs } = await loadLookups();

  const results: { row: number; sku: string; status: "created" | "updated" | "error"; message?: string }[] = [];
  const skuToProductId = new Map<string, number>();

  for (let i = 0; i < productRows.length; i++) {
    const r = productRows[i];
    const rowNum = i + 2; // account for header row, 1-indexed for user-facing message
    const get = (h: string) => {
      const v = r[productHeaderIndex[h]];
      return v === undefined ? "" : String(v).trim();
    };

    const sku = get("SKU*");
    const name = get("ชื่อสินค้า*");
    if (!sku && !name) continue; // skip fully blank row

    try {
      if (!sku) throw new Error("ไม่ได้กรอก SKU");
      if (!name) throw new Error("ไม่ได้กรอกชื่อสินค้า");

      const price = toNumberOrNull(get("ราคาขาย*"));
      if (price === null) throw new Error("ไม่ได้กรอกราคาขาย");
      if (Number.isNaN(price) || price < 0) throw new Error("ราคาขายต้องเป็นตัวเลข");

      const comparePrice = toNumberOrNull(get("ราคาเต็ม"));
      if (Number.isNaN(comparePrice as any)) throw new Error("ราคาเต็มต้องเป็นตัวเลข");

      const costPrice = toNumberOrNull(get("ราคาทุน"));
      if (Number.isNaN(costPrice as any)) throw new Error("ราคาทุนต้องเป็นตัวเลข");

      const stockRaw = get("จำนวนสต๊อก*");
      const stock = stockRaw === "" ? 0 : Number(stockRaw);
      if (Number.isNaN(stock)) throw new Error("จำนวนสต๊อกต้องเป็นตัวเลข");

      const categoryName = get("หมวดหมู่");
      let categoryId: number | null = null;
      if (categoryName) {
        categoryId = categoryByName.get(categoryName.toLowerCase()) ?? null;
        if (categoryId === null) throw new Error(`ไม่พบหมวดหมู่ "${categoryName}" ในระบบ`);
      }

      const brandName = get("แบรนด์");
      let brandId: number | null = null;
      if (brandName) {
        brandId = brandByName.get(brandName.toLowerCase()) ?? null;
        if (brandId === null) throw new Error(`ไม่พบแบรนด์ "${brandName}" ในระบบ`);
      }

      const statusVal = get("สถานะ") || "available";
      if (!VALID_STATUS.includes(statusVal)) throw new Error(`สถานะ "${statusVal}" ไม่ถูกต้อง (ต้องเป็น available, out_of_stock หรือ discontinued)`);

      const isFeatured = parseYN(get("สินค้าแนะนำ"), false);
      const isActive = parseYN(get("เปิดใช้งาน"), true);
      const weight = get("น้ำหนัก/ขนาด") || null;
      const unit = get("หน่วย") || null;
      const shortDesc = get("คำอธิบายสั้น") || null;
      const description = get("คำอธิบายเต็ม") || null;
      const tags = get("แท็ก") || null;
      const mainImageUrl = get("รูปภาพหลัก (URL)");
      const additionalImages = get("รูปภาพเพิ่มเติม (URL)")
        .split("|")
        .map((s) => s.trim())
        .filter(Boolean);

      const existing = await query<{ id: number; slug: string }>("SELECT id, slug FROM products WHERE sku = ? LIMIT 1", [sku]);

      let productId: number;
      let action: "created" | "updated";

      if (existing.length > 0) {
        productId = existing[0].id;
        action = "updated";
        await execute(
          `UPDATE products SET name=?, description=?, shortDesc=?, price=?, comparePrice=?, costPrice=?, stock=?, weight=?, unit=?, isFeatured=?, isActive=?, status=?, categoryId=?, brandId=?, tags=?, updatedAt=NOW() WHERE id=?`,
          [name, description, shortDesc, price, comparePrice, costPrice, stock, weight, unit, isFeatured ? 1 : 0, isActive ? 1 : 0, statusVal, categoryId, brandId, tags, productId]
        );
      } else {
        let slug = toSlug(name) || `product-${sku.toLowerCase()}`;
        let baseSlug = slug;
        let n = 2;
        while (usedSlugs.has(slug)) {
          slug = `${baseSlug}-${n}`;
          n++;
        }
        usedSlugs.add(slug);

        const result = await execute(
          `INSERT INTO products (name, slug, description, shortDesc, sku, price, comparePrice, costPrice, stock, weight, unit, isFeatured, isActive, status, categoryId, brandId, tags, createdAt, updatedAt)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
          [name, slug, description, shortDesc, sku, price, comparePrice, costPrice, stock, weight, unit, isFeatured ? 1 : 0, isActive ? 1 : 0, statusVal, categoryId, brandId, tags]
        );
        productId = Number(result.insertId);
        action = "created";
      }

      // Images: only touch if this row provided image data
      if (mainImageUrl || additionalImages.length > 0) {
        await execute("DELETE FROM product_images WHERE productId = ?", [productId]);
        let sortOrder = 0;
        if (mainImageUrl) {
          await execute("INSERT INTO product_images (productId, url, sortOrder, isMain) VALUES (?, ?, ?, 1)", [productId, mainImageUrl, sortOrder++]);
        }
        for (const url of additionalImages) {
          await execute("INSERT INTO product_images (productId, url, sortOrder, isMain) VALUES (?, ?, ?, 0)", [productId, url, sortOrder++]);
        }
      }

      skuToProductId.set(sku, productId);
      results.push({ row: rowNum, sku, status: action });
    } catch (e: any) {
      results.push({ row: rowNum, sku: sku || "(ไม่มี SKU)", status: "error", message: e.message || "เกิดข้อผิดพลาด" });
    }
  }

  // Variants: group by product SKU, replace variants for any SKU mentioned
  const variantsByProductSku = new Map<string, { row: number; name: string; value: string; priceAdjust: number; stock: number; sku: string; isActive: boolean }[]>();
  const variantErrors: { row: number; sku: string; status: "error"; message: string }[] = [];

  for (let i = 0; i < variantRows.length; i++) {
    const r = variantRows[i];
    const rowNum = i + 2;
    const get = (h: string) => {
      const v = r[variantHeaderIndex[h]];
      return v === undefined ? "" : String(v).trim();
    };
    const productSku = get("SKU สินค้า*");
    const vName = get("ชื่อตัวเลือก*");
    const vValue = get("ค่า*");
    if (!productSku && !vName && !vValue) continue;

    if (!productSku || !vName || !vValue) {
      variantErrors.push({ row: rowNum, sku: productSku || "(ไม่มี SKU)", status: "error", message: "ต้องกรอก SKU สินค้า, ชื่อตัวเลือก และค่า ให้ครบ" });
      continue;
    }
    const priceAdjust = toNumberOrNull(get("ส่วนต่างราคา")) ?? 0;
    const vStockRaw = get("สต๊อกตัวเลือก");
    const vStock = vStockRaw === "" ? 0 : Number(vStockRaw);
    if (Number.isNaN(priceAdjust) || Number.isNaN(vStock)) {
      variantErrors.push({ row: rowNum, sku: productSku, status: "error", message: "ส่วนต่างราคา/สต๊อกตัวเลือก ต้องเป็นตัวเลข" });
      continue;
    }
    const list = variantsByProductSku.get(productSku) || [];
    list.push({ row: rowNum, name: vName, value: vValue, priceAdjust, stock: vStock, sku: get("SKU ตัวเลือก"), isActive: parseYN(get("เปิดใช้งาน"), true) });
    variantsByProductSku.set(productSku, list);
  }

  for (const [productSku, variants] of variantsByProductSku) {
    let productId = skuToProductId.get(productSku);
    if (!productId) {
      const found = await query<{ id: number }>("SELECT id FROM products WHERE sku = ? LIMIT 1", [productSku]);
      if (found.length > 0) productId = found[0].id;
    }
    if (!productId) {
      for (const v of variants) variantErrors.push({ row: v.row, sku: productSku, status: "error", message: `ไม่พบสินค้าที่มี SKU "${productSku}" (ทั้งในไฟล์นี้และในระบบ)` });
      continue;
    }
    await execute("DELETE FROM product_variants WHERE productId = ?", [productId]);
    for (const v of variants) {
      await execute(
        "INSERT INTO product_variants (productId, name, value, priceAdjust, stock, sku, isActive) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [productId, v.name, v.value, v.priceAdjust, v.stock, v.sku || null, v.isActive ? 1 : 0]
      );
    }
  }

  const allResults = [...results, ...variantErrors];
  const summary = {
    created: results.filter((r) => r.status === "created").length,
    updated: results.filter((r) => r.status === "updated").length,
    errors: allResults.filter((r) => r.status === "error").length,
    variantsImported: variantsByProductSku.size - new Set(variantErrors.map((e) => e.sku)).size,
  };

  return NextResponse.json({ success: true, summary, results: allResults });
}
