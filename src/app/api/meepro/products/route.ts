import { NextResponse } from 'next/server';
import { staticProducts } from '@/lib/static-data';

let prisma: any = null;
try {
  prisma = require('@/lib/prisma').default;
} catch (e) {}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const brand = searchParams.get('brand');
  const search = searchParams.get('search');
  const featured = searchParams.get('featured');
  const sort = searchParams.get('sort') || 'newest';
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '12');

  try {
    // Try database first
    if (prisma) {
      const where: any = { isActive: true };
      if (category) where.category = { slug: category };
      if (brand) where.brand = { slug: brand };
      if (featured === 'true') where.isFeatured = true;
      if (search) {
        where.OR = [
          { name: { contains: search } },
          { description: { contains: search } },
          { tags: { contains: search } },
        ];
      }

      let orderBy: any = { createdAt: 'desc' };
      switch (sort) {
        case 'price_asc': orderBy = { price: 'asc' }; break;
        case 'price_desc': orderBy = { price: 'desc' }; break;
        case 'name': orderBy = { name: 'asc' }; break;
        case 'popular': orderBy = { salesCount: 'desc' }; break;
        case 'rating': orderBy = { rating: 'desc' }; break;
      }

      const [products, total] = await Promise.all([
        prisma.product.findMany({
          where,
          include: {
            category: { select: { id: true, name: true, slug: true } },
            brand: { select: { id: true, name: true, slug: true } },
            images: { orderBy: { sortOrder: 'asc' }, take: 2 },
          },
          orderBy,
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.product.count({ where }),
      ]);

      return NextResponse.json({
        products,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      });
    }
  } catch (e) {
    // DB not available, fall through to static data
  }

  // Static fallback
  let filtered = [...staticProducts];
  if (category) filtered = filtered.filter(p => p.category?.slug === category);
  if (brand) filtered = filtered.filter(p => p.brand?.slug === brand);
  if (featured === 'true') filtered = filtered.filter(p => p.isFeatured);
  if (search) {
    const s = search.toLowerCase();
    filtered = filtered.filter(p =>
      p.name.toLowerCase().includes(s) ||
      (p.description || '').toLowerCase().includes(s) ||
      (p.tags || '').toLowerCase().includes(s)
    );
  }

  switch (sort) {
    case 'price_asc': filtered.sort((a, b) => parseFloat(a.price) - parseFloat(b.price)); break;
    case 'price_desc': filtered.sort((a, b) => parseFloat(b.price) - parseFloat(a.price)); break;
    case 'name': filtered.sort((a, b) => a.name.localeCompare(b.name)); break;
    case 'popular': filtered.sort((a, b) => b.salesCount - a.salesCount); break;
    case 'rating': filtered.sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating)); break;
  }

  const total = filtered.length;
  const paginated = filtered.slice((page - 1) * limit, page * limit);

  return NextResponse.json({
    products: paginated,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}
