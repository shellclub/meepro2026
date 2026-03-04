import { NextResponse } from 'next/server';
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
    return NextResponse.json({ product: { ...product, images, variants } });
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
    await execute('DELETE FROM products WHERE id=?', [Number(id)]);
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
