import { NextResponse } from 'next/server';
import { query, execute } from '@/lib/db';

export async function GET() {
  try {
    const categories = await query(
      `SELECT c.*, (SELECT COUNT(*) FROM products p WHERE p.categoryId = c.id) as productCount 
       FROM categories c ORDER BY c.sortOrder ASC`
    );
    return NextResponse.json({
      categories: categories.map((c: any) => {
        const { productCount, ...rest } = c;
        return { ...rest, _count: { products: Number(productCount) } };
      }),
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await execute(
      'INSERT INTO categories (name, slug, description, image, parentId, sortOrder, isActive, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())',
      [body.name, body.slug, body.description || null, body.image || null, body.parentId || null, body.sortOrder || 0, body.isActive !== false ? 1 : 0]
    );
    return NextResponse.json({ category: { id: Number(result.insertId), ...body } }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
