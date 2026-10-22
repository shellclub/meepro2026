import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import * as XLSX from "xlsx";
import { query, execute } from "@/lib/db";
import { syncProductStock } from "@/lib/stock";
import { PRODUCT_HEADERS, VARIANT_HEADERS } from "@/lib/admin-products";

const secretKey = process.env.JWT_SECRET || "fallback_secret_key_meepro_2026";
const key = new TextEncoder().encode(secretKey);

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

type RowResult = { sheet?: string; row: number; sku: string; status: "created" | "updated" | "error"; message?: string };
type SheetInfo = { name: string; kind: string; rows: number; note?: string };
type ImportPart = { summary: Record<string, number>; results: RowResult[]; sheets: SheetInfo[] };
// One data row plus where it came from, so rows from several tabs (each with its own column
// order) can be processed in a single pass and errors can point at "tab X, row N".
type SheetRow = { r: any[]; rowNum: number; sheet: string; idx: Record<string, number> };

type SheetKind = "template-product" | "template-variant" | "bigseller-product" | "bigseller-bundle" | "unknown";

// Tabs are recognised by their header row (not by tab name), so any number of tabs, in any order
// and with any names, can be dropped into one file.
function classifySheet(ws: XLSX.WorkSheet): { kind: SheetKind; headers: string[]; rows: number } {
  const raw: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1, blankrows: false, defval: "" });
  const headers = (raw[0] || []).map((h) => String(h).trim());
  const has = (h: string) => headers.includes(h);
  const rows = Math.max(0, raw.length - 1);
  let kind: SheetKind = "unknown";
  if (PRODUCT_HEADERS.every(has)) kind = "template-product";
  else if (VARIANT_HEADERS.every(has)) kind = "template-variant";
  else if (has("เลข SKU") && headers.some((h) => /^SKU เดียว \d+$/.test(h))) kind = "bigseller-bundle";
  else if (BIGSELLER_HEADERS.every(has)) kind = "bigseller-product";
  return { kind, headers, rows };
}

function collectRows(workbook: XLSX.WorkBook, sheetNames: string[], expectedHeaders: readonly string[]): SheetRow[] {
  const out: SheetRow[] = [];
  for (const sheet of sheetNames) {
    const { rows, headerIndex } = sheetToRows(workbook.Sheets[sheet], expectedHeaders);
    rows.forEach((r, i) => out.push({ r, rowNum: i + 2, sheet, idx: headerIndex })); // +2: header row, 1-indexed
  }
  return out;
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

// BigSeller's "ไม่มีหมวดหมู่" ("no category") is kept as a real category, so products that were never
// categorised still show up on the storefront under it.
const NO_CATEGORY_NAME = "ไม่มีหมวดหมู่";
const NO_CATEGORY_SLUG = "no-category";

// Finds a category by name or creates it (slug made unique), keeping the lookup map in sync.
async function ensureCategory(name: string, categoryByName: Map<string, number>): Promise<number> {
  const key = name.trim().toLowerCase();
  const found = categoryByName.get(key);
  if (found) return found;
  const baseSlug = name.trim() === NO_CATEGORY_NAME ? NO_CATEGORY_SLUG : toSlug(name) || "category";
  let slug = baseSlug;
  for (let n = 2; (await query("SELECT 1 FROM categories WHERE slug = ? LIMIT 1", [slug])).length > 0; n++) slug = `${baseSlug}-${n}`;
  const maxSort = await query<{ m: number | null }>("SELECT MAX(sortOrder) AS m FROM categories");
  const result = await execute(
    "INSERT INTO categories (name, slug, sortOrder, isActive, createdAt, updatedAt) VALUES (?, ?, ?, 1, NOW(), NOW())",
    [name.trim(), slug, Number(maxSort[0]?.m ?? 0) + 1]
  );
  const id = Number(result.insertId);
  categoryByName.set(key, id);
  return id;
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
async function handleBigSellerImport(workbook: XLSX.WorkBook, productSheetNames: string[], bundleSheetNames: string[]): Promise<ImportPart> {
  // Every SKU tab is swept into one pass (a SKU that appears on several tabs is just updated again).
  const productItems = collectRows(workbook, productSheetNames, BIGSELLER_HEADERS);

  // Bundle component detail tabs: one row per bundle SKU, with repeating column groups
  // "SKU เดียว N" / "ชื่อ SKU N" / "จำนวน SKUN" / ... for each component slot (N is dynamic, and
  // can differ between tabs, so each row keeps its own tab's column groups).
  const bundleDetailBySku = new Map<string, { row: any[]; sheet: string; groups: { skuCol: number; qtyCol: number }[] }>();
  for (const sheet of bundleSheetNames) {
    const raw: any[][] = XLSX.utils.sheet_to_json(workbook.Sheets[sheet], { header: 1, blankrows: false, defval: "" });
    if (raw.length === 0) continue;
    const headerRow = raw[0].map((h) => String(h).trim());
    const skuCol = headerRow.indexOf("เลข SKU");
    const groups: { skuCol: number; qtyCol: number }[] = [];
    headerRow.forEach((h, i) => { if (/^SKU เดียว \d+$/.test(h)) groups.push({ skuCol: i, qtyCol: i + 2 }); });
    for (const row of raw.slice(1)) {
      const sku = String(row[skuCol] ?? "").trim();
      if (sku) bundleDetailBySku.set(sku, { row, sheet, groups });
    }
  }

  const { categoryByName, brandByName, usedSlugs } = await loadLookups();

  const results: RowResult[] = [];
  const skuToProductId = new Map<string, number>();
  const bundleProductsToLink: { sheet: string; row: number; sku: string; productId: number }[] = [];
  let pendingPriceCount = 0;
  let categoryUnmatched = 0;

  for (const { r, rowNum, sheet, idx } of productItems) {
    const get = (h: string) => {
      const v = r[idx[h]];
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
      // A real category name from the file is created on demand. Blank / "ไม่มีหมวดหมู่" only fills in
      // the no-category bucket when the product has no category yet (never overrides an admin's choice).
      const isNoCategory = !categoryNameRaw || categoryNameRaw === NO_CATEGORY_NAME;
      const categoryId: number | null = isNoCategory ? null : await ensureCategory(categoryNameRaw, categoryByName);
      const noCategoryId = await ensureCategory(NO_CATEGORY_NAME, categoryByName);

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
        // BigSeller has no reliable selling price/cost, so a blank value must not wipe what an
        // admin already set: price, cost and isActive are only overwritten when the file has a
        // real price, and category/brand are only replaced when the file matched one.
        await execute(
          `UPDATE products SET name=?, price=IF(?>0, ?, price), costPrice=IF(? IS NOT NULL AND ?>0, ?, costPrice), stock=?, weight=?,
             isActive=IF(?>0, 1, isActive), categoryId=COALESCE(?, categoryId, ?), brandId=COALESCE(?, brandId), tags=COALESCE(?, tags), updatedAt=NOW() WHERE id=?`,
          [name, price, price, costPrice, costPrice, costPrice, stock, weight, price, categoryId, noCategoryId, brandId, tags, productId]
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
          [name, slug, sku, price, costPrice, stock, weight, isActive ? 1 : 0, categoryId ?? noCategoryId, brandId, tags]
        );
        productId = Number(result.insertId);
        action = "created";
      }

      if (mainImageUrl) {
        // Only seed the image for new products or ones without any; never replace images an admin uploaded.
        const hasImages = await query<{ id: number }>("SELECT id FROM product_images WHERE productId = ? LIMIT 1", [productId]);
        if (hasImages.length === 0) {
          await execute("INSERT INTO product_images (productId, url, sortOrder, isMain) VALUES (?, ?, 0, 1)", [productId, mainImageUrl]);
        }
      }

      skuToProductId.set(sku, productId);
      if (skuType === "Bundle SKU") bundleProductsToLink.push({ sheet, row: rowNum, sku, productId });
      results.push({ sheet, row: rowNum, sku, status: action });
    } catch (e: any) {
      results.push({ sheet, row: rowNum, sku: sku || "(ไม่มี SKU)", status: "error", message: e.message || "เกิดข้อผิดพลาด" });
    }
  }

  // Bundle linking runs after every row is imported so components listed later in the
  // file are already in skuToProductId by the time their parent bundle is linked.
  const bundleErrors: RowResult[] = [];
  let bundlesLinked = 0;

  for (const { sheet, row, sku, productId } of bundleProductsToLink) {
    const detail = bundleDetailBySku.get(sku);
    if (!detail) {
      bundleErrors.push({ sheet, row, sku, status: "error", message: `ไม่พบรายละเอียดส่วนประกอบของ Bundle SKU "${sku}" (ไม่มีแท็บรายละเอียด Bundle ที่มี SKU นี้)` });
      continue;
    }
    const detailRow = detail.row;

    await execute("DELETE FROM product_bundle_items WHERE bundleProductId = ?", [productId]);

    let linkedAny = false;
    for (const { skuCol, qtyCol } of detail.groups) {
      const componentSku = String(detailRow[skuCol] ?? "").trim();
      if (!componentSku) continue;
      const qty = Number(detailRow[qtyCol]) || 1;

      let componentProductId = skuToProductId.get(componentSku);
      if (!componentProductId) {
        const found = await query<{ id: number }>("SELECT id FROM products WHERE sku = ? LIMIT 1", [componentSku]);
        if (found.length > 0) componentProductId = found[0].id;
      }
      if (!componentProductId) {
        bundleErrors.push({ sheet, row, sku, status: "error", message: `ไม่พบ SKU ส่วนประกอบ "${componentSku}" (ทั้งในไฟล์นี้และในระบบ)` });
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

  const sheets: SheetInfo[] = [
    ...productSheetNames.map((name) => ({ name, kind: "SKU สินค้า (BigSeller)", rows: productItems.filter((i) => i.sheet === name).length })),
    ...bundleSheetNames.map((name) => ({ name, kind: "รายละเอียด Bundle (BigSeller)", rows: [...bundleDetailBySku.values()].filter((d) => d.sheet === name).length })),
  ];
  return { summary, results: allResults, sheets };
}

// Imports one or more tabs in the system's own template layout (products + optional variants).
async function handleTemplateImport(workbook: XLSX.WorkBook, productSheetNames: string[], variantSheetNames: string[]): Promise<ImportPart> {
  const productItems = collectRows(workbook, productSheetNames, PRODUCT_HEADERS);
  const variantItems = collectRows(workbook, variantSheetNames, VARIANT_HEADERS);

  const { categoryByName, brandByName, usedSlugs } = await loadLookups();

  const results: RowResult[] = [];
  const skuToProductId = new Map<string, number>();

  for (const { r, rowNum, sheet, idx } of productItems) {
    const get = (h: string) => {
      const v = r[idx[h]];
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
      results.push({ sheet, row: rowNum, sku, status: action });
    } catch (e: any) {
      results.push({ sheet, row: rowNum, sku: sku || "(ไม่มี SKU)", status: "error", message: e.message || "เกิดข้อผิดพลาด" });
    }
  }

  // Variants: group by product SKU, replace variants for any SKU mentioned
  const variantsByProductSku = new Map<string, { sheet: string; row: number; name: string; value: string; priceAdjust: number; stock: number; sku: string; isActive: boolean }[]>();
  const variantErrors: RowResult[] = [];

  for (const { r, rowNum, sheet, idx } of variantItems) {
    const get = (h: string) => {
      const v = r[idx[h]];
      return v === undefined ? "" : String(v).trim();
    };
    const productSku = get("SKU สินค้า*");
    const vName = get("ชื่อตัวเลือก*");
    const vValue = get("ค่า*");
    if (!productSku && !vName && !vValue) continue;

    if (!productSku || !vName || !vValue) {
      variantErrors.push({ sheet, row: rowNum, sku: productSku || "(ไม่มี SKU)", status: "error", message: "ต้องกรอก SKU สินค้า, ชื่อตัวเลือก และค่า ให้ครบ" });
      continue;
    }
    const priceAdjust = toNumberOrNull(get("ส่วนต่างราคา")) ?? 0;
    const vStockRaw = get("สต๊อกตัวเลือก");
    const vStock = vStockRaw === "" ? 0 : Number(vStockRaw);
    if (Number.isNaN(priceAdjust) || Number.isNaN(vStock)) {
      variantErrors.push({ sheet, row: rowNum, sku: productSku, status: "error", message: "ส่วนต่างราคา/สต๊อกตัวเลือก ต้องเป็นตัวเลข" });
      continue;
    }
    const list = variantsByProductSku.get(productSku) || [];
    list.push({ sheet, row: rowNum, name: vName, value: vValue, priceAdjust, stock: vStock, sku: get("SKU ตัวเลือก"), isActive: parseYN(get("เปิดใช้งาน"), true) });
    variantsByProductSku.set(productSku, list);
  }

  for (const [productSku, variants] of variantsByProductSku) {
    let productId = skuToProductId.get(productSku);
    if (!productId) {
      const found = await query<{ id: number }>("SELECT id FROM products WHERE sku = ? LIMIT 1", [productSku]);
      if (found.length > 0) productId = found[0].id;
    }
    if (!productId) {
      for (const v of variants) variantErrors.push({ sheet: v.sheet, row: v.row, sku: productSku, status: "error", message: `ไม่พบสินค้าที่มี SKU "${productSku}" (ทั้งในไฟล์นี้และในระบบ)` });
      continue;
    }
    await execute("DELETE FROM product_variants WHERE productId = ?", [productId]);
    for (const v of variants) {
      await execute(
        "INSERT INTO product_variants (productId, name, value, priceAdjust, stock, sku, isActive) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [productId, v.name, v.value, v.priceAdjust, v.stock, v.sku || null, v.isActive ? 1 : 0]
      );
    }
    await syncProductStock(productId);
  }

  const allResults = [...results, ...variantErrors];
  const summary = {
    created: results.filter((r) => r.status === "created").length,
    updated: results.filter((r) => r.status === "updated").length,
    errors: allResults.filter((r) => r.status === "error").length,
    variantsImported: variantsByProductSku.size - new Set(variantErrors.map((e) => e.sku)).size,
  };

  const sheets: SheetInfo[] = [
    ...productSheetNames.map((name) => ({ name, kind: "สินค้า (template)", rows: productItems.filter((i) => i.sheet === name).length })),
    ...variantSheetNames.map((name) => ({ name, kind: "ตัวเลือกสินค้า (template)", rows: variantItems.filter((i) => i.sheet === name).length })),
  ];
  return { summary, results: allResults, sheets };
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

  // Sweep every tab: classify each by its header row, then import all the tabs we recognise.
  const kinds: Record<SheetKind, string[]> = { "template-product": [], "template-variant": [], "bigseller-product": [], "bigseller-bundle": [], unknown: [] };
  const skipped: SheetInfo[] = [];
  const REFERENCE_TAB = /คำอธิบาย|อ้างอิง/; // the template's own help/lookup tabs: expected, not worth a warning
  for (const name of workbook.SheetNames) {
    const { kind, rows, headers } = classifySheet(workbook.Sheets[name]);
    kinds[kind].push(name);
    if (kind === "unknown" && !REFERENCE_TAB.test(name)) {
      // A tab that is *almost* a known layout (edited/missing header) deserves a precise message
      const near = ([PRODUCT_HEADERS, BIGSELLER_HEADERS, VARIANT_HEADERS] as (readonly string[])[])
        .map((exp) => ({ exp, hit: exp.filter((h) => headers.includes(h)).length }))
        .sort((a, b) => b.hit - a.hit)[0];
      const almost = rows > 0 && near.hit >= Math.ceil(near.exp.length * 0.6);
      skipped.push({
        name, kind: "ข้าม", rows,
        note: rows === 0
          ? "แท็บว่าง"
          : almost
            ? `หัวคอลัมน์ไม่ครบหรือถูกแก้ไข ขาด: ${near.exp.filter((h) => !headers.includes(h)).join(", ")}`
            : `ไม่รู้จักรูปแบบหัวคอลัมน์ (${headers.filter(Boolean).slice(0, 4).join(", ")}…)`,
      });
    }
  }

  const hasTemplate = kinds["template-product"].length > 0;
  const hasBigSeller = kinds["bigseller-product"].length > 0;
  if (!hasTemplate && !hasBigSeller) {
    return NextResponse.json({
      error: "ไม่พบแท็บสินค้าที่รู้จักในไฟล์ที่อัปโหลด กรุณาใช้ไฟล์ template ต้นฉบับ หรือไฟล์ export จาก BigSeller (แท็บ SKU)" +
        (skipped.length ? ` — แท็บที่พบ: ${skipped.map((s) => `"${s.name}"`).join(", ")}` : ""),
    }, { status: 400 });
  }

  const parts: ImportPart[] = [];
  try {
    if (hasTemplate) parts.push(await handleTemplateImport(workbook, kinds["template-product"], kinds["template-variant"]));
    if (hasBigSeller) parts.push(await handleBigSellerImport(workbook, kinds["bigseller-product"], kinds["bigseller-bundle"]));
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "นำเข้าไม่สำเร็จ" }, { status: 400 });
  }

  const summary: Record<string, number> = {};
  for (const part of parts) for (const [k, v] of Object.entries(part.summary)) summary[k] = (summary[k] || 0) + v;
  const sheets = [...parts.flatMap((p) => p.sheets), ...skipped];
  return NextResponse.json({ success: true, summary, results: parts.flatMap((p) => p.results), sheets });
}
