import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const categories = await query(
      `SELECT c.*, (SELECT COUNT(*) FROM products p WHERE (p.categoryId = c.id OR (c.slug = 'no-category' AND p.categoryId IS NULL)) AND p.isActive = 1 AND p.status <> 'discontinued') as productCount 
       FROM categories c WHERE c.isActive = 1 ORDER BY c.sortOrder ASC`
    );
    return NextResponse.json({
      categories: categories.map((c: any) => {
        const { productCount, ...rest } = c;
        return { ...rest, _count: { products: Number(productCount) } };
      }),
    });
  } catch (e) {
    console.error('GET /api/meepro/categories failed', e);
    return NextResponse.json({ error: 'Failed to load categories', categories: [] }, { status: 500 });
  }
}
