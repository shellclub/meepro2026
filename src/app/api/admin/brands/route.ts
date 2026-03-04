import { NextResponse } from 'next/server';
import { query, execute } from '@/lib/db';

export async function GET() {
  try {
    const brands = await query(
      `SELECT b.*, (SELECT COUNT(*) FROM products p WHERE p.brandId = b.id) as productCount 
       FROM brands b ORDER BY b.name ASC`
    );
    return NextResponse.json({
      brands: brands.map((b: any) => ({ ...b, _count: { products: Number(b.productCount) } })),
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await execute(
      'INSERT INTO brands (name, slug, logo, isActive, createdAt, updatedAt) VALUES (?, ?, ?, ?, NOW(), NOW())',
      [body.name, body.slug, body.logo || null, body.isActive !== false ? 1 : 0]
    );
    return NextResponse.json({ brand: { id: Number(result.insertId), ...body } }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
