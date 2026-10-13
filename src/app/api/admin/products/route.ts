import { NextResponse } from 'next/server';
import { query, execute } from '@/lib/db';
import { buildProductFilter } from '@/lib/admin-products';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get('page') || '1') || 1);
  const limit = Math.min(200, Math.max(1, parseInt(searchParams.get('limit') || '20') || 20));
  const offset = (page - 1) * limit;

  try {
    const { where, params, orderBy } = buildProductFilter(searchParams);
    const [countRow] = await query(`SELECT COUNT(*) as c FROM products p ${where}`, params);
    const total = Number(countRow.c);
    const [statRow] = await query('SELECT COUNT(*) as total, COALESCE(SUM(isActive), 0) as active FROM products');
    const stats = { total: Number(statRow.total), active: Number(statRow.active), inactive: Number(statRow.total) - Number(statRow.active) };

    const products = await query(
      `SELECT p.*, c.name as categoryName, c.id as catId, b.name as brandName, b.id as brId,
       pi.url as imageUrl
       FROM products p 
       LEFT JOIN categories c ON p.categoryId = c.id 
       LEFT JOIN brands b ON p.brandId = b.id 
       LEFT JOIN product_images pi ON pi.productId = p.id AND pi.isMain = 1
       ${where}
       ORDER BY ${orderBy} LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    const formatted = products.map((p: any) => ({
      ...p,
      category: p.catId ? { id: p.catId, name: p.categoryName } : null,
      brand: p.brId ? { id: p.brId, name: p.brandName } : null,
      images: p.imageUrl ? [{ url: p.imageUrl }] : [],
    }));

    return NextResponse.json({ products: formatted, stats, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await execute(
      `INSERT INTO products (name, slug, description, shortDesc, sku, price, comparePrice, costPrice, stock, weight, unit, isFeatured, isActive, status, rating, reviewCount, salesCount, categoryId, brandId, tags, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [body.name, body.slug, body.description || null, body.shortDesc || null, body.sku || null, body.price || 0, body.comparePrice || null, body.costPrice || null, body.stock || 0, body.weight || null, body.unit || null, body.isFeatured ? 1 : 0, body.isActive !== false ? 1 : 0, body.status || 'available', body.rating || 0, body.reviewCount || 0, body.salesCount || 0, body.categoryId || null, body.brandId || null, body.tags || null]
    );
    const productId = Number(result.insertId);
    if (body.images) {
      for (let i = 0; i < body.images.length; i++) {
        if (body.images[i].url) {
          await execute('INSERT INTO product_images (productId, url, alt, sortOrder, isMain) VALUES (?, ?, ?, ?, ?)', [productId, body.images[i].url, body.images[i].alt || null, i, i === 0 ? 1 : 0]);
        }
      }
    }
    if (body.variants) {
      for (const v of body.variants) {
        await execute('INSERT INTO product_variants (productId, name, value, priceAdjust, stock, isActive) VALUES (?, ?, ?, ?, ?, 1)', [productId, v.name, v.value, v.priceAdjust || 0, v.stock || 0]);
      }
    }
    return NextResponse.json({ product: { id: productId } }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
