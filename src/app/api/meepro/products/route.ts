import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const brand = searchParams.get('brand');
  const search = searchParams.get('search');
  const featured = searchParams.get('featured');
  const sort = searchParams.get('sort') || 'newest';
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '12');
  const offset = (page - 1) * limit;

  try {
    let where = "WHERE p.isActive = 1 AND p.status <> 'discontinued'";
    const params: any[] = [];
    if (category === 'no-category') { where += ' AND (c.slug = ? OR p.categoryId IS NULL)'; params.push(category); }
    else if (category) { where += ' AND c.slug = ?'; params.push(category); }
    if (brand) { where += ' AND b.slug = ?'; params.push(brand); }
    if (featured === 'true') { where += ' AND p.isFeatured = 1'; }
    if (search) {
      where += ' AND (p.name LIKE ? OR p.description LIKE ? OR p.tags LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    // In-stock products first, then the requested order
    let orderBy = 'p.createdAt DESC';
    switch (sort) {
      case 'price_asc': orderBy = 'p.price ASC'; break;
      case 'price_desc': orderBy = 'p.price DESC'; break;
      case 'name': orderBy = 'p.name ASC'; break;
      case 'popular': orderBy = 'p.salesCount DESC'; break;
      case 'rating': orderBy = 'p.rating DESC'; break;
    }

    const [countRow] = await query(`SELECT COUNT(*) as c FROM products p LEFT JOIN categories c ON p.categoryId=c.id LEFT JOIN brands b ON p.brandId=b.id ${where}`, params);
    const total = Number(countRow.c);

    const products = await query(
      `SELECT p.*, c.id as catId, c.name as categoryName, c.slug as categorySlug,
       b.id as brId, b.name as brandName, b.slug as brandSlug,
       pi.url as imageUrl, pi.alt as imageAlt
       FROM products p 
       LEFT JOIN categories c ON p.categoryId = c.id 
       LEFT JOIN brands b ON p.brandId = b.id 
       LEFT JOIN product_images pi ON pi.productId = p.id AND pi.isMain = 1
       ${where}
       ORDER BY (p.stock > 0 AND p.status = 'available') DESC, ${orderBy} LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    const formatted = products.map((p: any) => ({
      id: p.id, name: p.name, slug: p.slug, description: p.description, shortDesc: p.shortDesc,
      sku: p.sku, price: p.price, comparePrice: p.comparePrice, stock: Number(p.stock), weight: p.weight,
      isFeatured: p.isFeatured, isActive: p.isActive, status: Number(p.stock) > 0 ? p.status : 'out_of_stock', rating: p.rating,
      reviewCount: p.reviewCount, salesCount: p.salesCount, tags: p.tags,
      category: p.catId ? { id: p.catId, name: p.categoryName, slug: p.categorySlug } : null,
      brand: p.brId ? { id: p.brId, name: p.brandName, slug: p.brandSlug } : null,
      images: p.imageUrl ? [{ url: p.imageUrl, alt: p.imageAlt }] : [],
    }));

    return NextResponse.json({ products: formatted, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (e) {
    console.error('GET /api/meepro/products failed', e);
    return NextResponse.json(
      { error: 'Failed to load products', products: [], pagination: { page, limit, total: 0, totalPages: 0 } },
      { status: 500 }
    );
  }
}
