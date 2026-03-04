import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { staticCategories } from '@/lib/static-data';

export async function GET() {
  try {
    const categories = await query(
      `SELECT c.*, (SELECT COUNT(*) FROM products p WHERE p.categoryId = c.id AND p.isActive = 1) as productCount 
       FROM categories c WHERE c.isActive = 1 ORDER BY c.sortOrder ASC`
    );
    if (categories.length > 0) {
      return NextResponse.json({
        categories: categories.map((c: any) => {
          const { productCount, ...rest } = c;
          return { ...rest, _count: { products: Number(productCount) } };
        }),
      });
    }
  } catch (e) {
    // DB not available, fall through
  }

  return NextResponse.json({ categories: staticCategories });
}
