import { NextResponse } from 'next/server';
import { syncProductStock } from '@/lib/stock';
import { query, queryOne, execute } from '@/lib/db';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const product = await queryOne(
      `SELECT p.*, c.name as categoryName, b.name as brandName 
       FROM products p LEFT JOIN categories c ON p.categoryId=c.id LEFT JOIN brands b ON p.brandId=b.id WHERE p.id=?`, [Number(id)]
    );
    if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    const images = await query('SELECT * FROM product_images WHERE productId=? ORDER BY sortOrder', [Number(id)]);
    const variants = await query('SELECT * FROM product_variants WHERE productId=?', [Number(id)]);
    const bundleItems = await query(
      `SELECT bi.componentProductId, bi.quantity, p.name, p.sku
       FROM product_bundle_items bi JOIN products p ON p.id = bi.componentProductId
       WHERE bi.bundleProductId=?`, [Number(id)]
    );
    return NextResponse.json({ product: { ...product, images, variants, bundleItems } });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await req.json();
    await execute(
      `UPDATE products SET name=?, slug=?, description=?, shortDesc=?, sku=?, price=?, comparePrice=?, costPrice=?, stock=?, weight=?, unit=?, isFeatured=?, isActive=?, status=?, categoryId=?, brandId=?, tags=?, updatedAt=NOW() WHERE id=?`,
      [body.name, body.slug, body.description, body.shortDesc, body.sku, body.price, body.comparePrice, body.costPrice, body.stock, body.weight, body.unit, body.isFeatured ? 1 : 0, body.isActive ? 1 : 0, body.status, body.categoryId || null, body.brandId || null, body.tags, Number(id)]
    );
    if (Array.isArray(body.variants)) {
      const productId = Number(id);
      const keepIds: number[] = [];
      for (const v of body.variants) {
        const stock = Math.max(0, Number(v.stock) || 0);
        const priceAdjust = Number(v.priceAdjust) || 0;
        if (v.id) {
          await execute('UPDATE product_variants SET name=?, value=?, priceAdjust=?, stock=? WHERE id=? AND productId=?', [v.name, v.value, priceAdjust, stock, Number(v.id), productId]);
          keepIds.push(Number(v.id));
        } else {
          const r: any = await execute('INSERT INTO product_variants (productId, name, value, priceAdjust, stock, isActive) VALUES (?, ?, ?, ?, ?, 1)', [productId, v.name, v.value, priceAdjust, stock]);
          keepIds.push(Number(r.insertId));
        }
      }
      // Removed variants: keep rows referenced by past orders (deactivate), delete the rest
      const existing = await query<{ id: number }>('SELECT id FROM product_variants WHERE productId=?', [productId]);
      for (const { id: vid } of existing) {
        if (keepIds.includes(vid)) continue;
        const used = await query('SELECT 1 FROM order_items WHERE variantId=? LIMIT 1', [vid]);
        if (used.length > 0) await execute('UPDATE product_variants SET isActive=0, stock=0 WHERE id=?', [vid]);
        else await execute('DELETE FROM product_variants WHERE id=?', [vid]);
      }
    }
    await syncProductStock(Number(id));
    return NextResponse.json({ product: { id: Number(id) } });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await execute('DELETE FROM product_images WHERE productId=?', [Number(id)]);
    await execute('DELETE FROM product_variants WHERE productId=?', [Number(id)]);
    await execute('DELETE FROM product_bundle_items WHERE bundleProductId=? OR componentProductId=?', [Number(id), Number(id)]);
    await execute('DELETE FROM products WHERE id=?', [Number(id)]);
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
