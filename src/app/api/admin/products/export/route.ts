import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import * as XLSX from "xlsx";
import { query } from "@/lib/db";
import { PRODUCT_HEADERS, VARIANT_HEADERS, buildProductFilter } from "@/lib/admin-products";

const secretKey = process.env.JWT_SECRET || "fallback_secret_key_meepro_2026";
const key = new TextEncoder().encode(secretKey);

const yn = (v: any) => (Number(v) ? "Y" : "N");

// Exports the products matching the same filters/sort as the admin list, in the same layout as
// the import template, so the file can be edited and imported straight back.
// Images are written exactly as stored: a full URL for images hosted elsewhere (BigSeller etc.)
// and a site-relative path (/uploads/products/xxx.jpg) for images hosted on our own server.
export async function GET(req: NextRequest) {
  // Defense-in-depth: verify auth directly (middleware also covers /api/admin/*)
  const token = req.cookies.get("admin_token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    await jwtVerify(token, key);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { where, params, orderBy } = buildProductFilter(req.nextUrl.searchParams);

    const products = await query<any>(
      `SELECT p.*, c.name AS categoryName, b.name AS brandName
       FROM products p
       LEFT JOIN categories c ON p.categoryId = c.id
       LEFT JOIN brands b ON p.brandId = b.id
       ${where}
       ORDER BY ${orderBy}`,
      params
    );

    const images = await query<any>(
      `SELECT pi.productId, pi.url, pi.isMain
       FROM product_images pi JOIN products p ON p.id = pi.productId ${where}
       ORDER BY pi.productId, pi.isMain DESC, pi.sortOrder, pi.id`,
      params
    );
    const imagesByProduct = new Map<number, string[]>();
    for (const im of images) {
      const list = imagesByProduct.get(im.productId) || [];
      list.push(im.url);
      imagesByProduct.set(im.productId, list);
    }

    const variants = await query<any>(
      `SELECT v.*, p.sku AS productSku
       FROM product_variants v JOIN products p ON p.id = v.productId ${where}
       ORDER BY v.productId, v.id`,
      params
    );

    const bundleItems = await query<any>(
      `SELECT bp.sku AS bundleSku, bp.name AS bundleName, cp.sku AS componentSku, cp.name AS componentName, bi.quantity
       FROM product_bundle_items bi
       JOIN products bp ON bp.id = bi.bundleProductId
       JOIN products cp ON cp.id = bi.componentProductId
       ${where.replace(/\bp\./g, "bp.")}
       ORDER BY bp.id, bi.id`,
      params
    ).catch(() => [] as any[]); // table is created by a migration; tolerate it not existing yet

    const productRows = products.map((p) => {
      const imgs = imagesByProduct.get(p.id) || [];
      return [
        p.sku ?? "", p.name, p.categoryName ?? "", p.brandName ?? "",
        Number(p.price), p.comparePrice == null ? "" : Number(p.comparePrice), p.costPrice == null ? "" : Number(p.costPrice),
        Number(p.stock), p.weight ?? "", p.unit ?? "", p.shortDesc ?? "", p.description ?? "",
        p.tags ?? "", p.status ?? "available", yn(p.isFeatured), yn(p.isActive),
        imgs[0] ?? "", imgs.slice(1).join("|"),
      ];
    });

    const variantRows = variants.map((v) => [
      v.productSku ?? "", v.name, v.value, Number(v.priceAdjust), Number(v.stock), v.sku ?? "", yn(v.isActive),
    ]);

    const wb = XLSX.utils.book_new();

    const wsProducts = XLSX.utils.aoa_to_sheet([[...PRODUCT_HEADERS], ...productRows]);
    wsProducts["!cols"] = [18, 50, 18, 16, 11, 11, 11, 12, 14, 10, 30, 40, 20, 14, 12, 12, 50, 50].map((wch) => ({ wch }));
    wsProducts["!freeze"] = { xSplit: 2, ySplit: 1 } as any;
    wsProducts["!autofilter"] = { ref: XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: Math.max(productRows.length, 1), c: PRODUCT_HEADERS.length - 1 } }) };
    XLSX.utils.book_append_sheet(wb, wsProducts, "สินค้า");

    const wsVariants = XLSX.utils.aoa_to_sheet([[...VARIANT_HEADERS], ...variantRows]);
    wsVariants["!cols"] = [18, 18, 18, 14, 14, 18, 12].map((wch) => ({ wch }));
    XLSX.utils.book_append_sheet(wb, wsVariants, "ตัวเลือกสินค้า");

    if (bundleItems.length > 0) {
      // Informational only: the import template has no bundle sheet, so this is ignored on re-import.
      const wsBundle = XLSX.utils.aoa_to_sheet([
        ["SKU Bundle", "ชื่อ Bundle", "SKU ส่วนประกอบ", "ชื่อส่วนประกอบ", "จำนวน"],
        ...bundleItems.map((b) => [b.bundleSku ?? "", b.bundleName, b.componentSku ?? "", b.componentName, Number(b.quantity)]),
      ]);
      wsBundle["!cols"] = [24, 40, 24, 40, 8].map((wch) => ({ wch }));
      XLSX.utils.book_append_sheet(wb, wsBundle, "Bundle ส่วนประกอบ");
    }

    const buf: Buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    const filename = `meepro-products-${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}.xlsx`;

    return new NextResponse(new Uint8Array(buf), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "ส่งออกไม่สำเร็จ" }, { status: 500 });
  }
}
