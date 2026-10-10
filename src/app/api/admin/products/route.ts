import { NextResponse } from 'next/server';
import { query, execute } from '@/lib/db';

// Whitelisted sort columns (never interpolate user input into ORDER BY directly).
// Thai names/categories sort with the DB collation; NULL categories always go last.
const SORT_SQL: Record<string, string> = {
  name: 'p.name',
  category: 'c.name IS NULL, c.name',
  status: 'p.isActive',
  price: 'p.price',
  stock: 'p.stock',
  createdAt: 'p.createdAt',
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get('page') || '1') || 1);
  const limit = Math.min(200, Math.max(1, parseInt(searchParams.get('limit') || '20') || 20));
  const search = searchParams.get('search') || '';
  const categoryId = searchParams.get('categoryId') || '';
  const status = searchParams.get('status') || '';
  const sortKey = SORT_SQL[searchParams.get('sort') || ''] ? (searchParams.get('sort') as string) : 'createdAt';
  const dir = searchParams.get('dir') === 'asc' ? 'ASC' : 'DESC';
  const offset = (page - 1) * limit;

  try {
    let where = 'WHERE 1=1';
    const params: any[] = [];
    if (search) { where += ' AND (p.name LIKE ? OR p.sku LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
    if (categoryId === 'none') where += ' AND p.categoryId IS NULL';
    else if (categoryId) { where += ' AND p.categoryId = ?'; params.push(Number(categoryId)); }
    if (status === 'active') where += ' AND p.isActive = 1';
    else if (status === 'inactive') where += ' AND p.isActive = 0';

    const [countRow] = await query(`SELECT COUNT(*) as c FROM products p ${where}`, params);
    const total = Number(countRow.c);
    const [statRow] = await query('SELECT COUNT(*) as total, COALESCE(SUM(isActive), 0) as active FROM products');
    const stats = { total: Number(statRow.total), active: Number(statRow.active), inactive: Number(statRow.total) - Number(statRow.active) };

    // Secondary key keeps pagination stable when the primary key has ties (e.g. many equal prices)
    const orderBy = sortKey === 'name'
      ? `p.name ${dir}, p.id ASC`
      : `${SORT_SQL[sortKey].split(',').map((c) => (c.includes('IS NULL') ? c : `${c.trim()} ${dir}`)).join(', ')}, p.name ASC, p.id ASC`;

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
