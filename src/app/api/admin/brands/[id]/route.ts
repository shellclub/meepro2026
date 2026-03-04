import { NextResponse } from 'next/server';
import { execute } from '@/lib/db';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await req.json();
    await execute('UPDATE brands SET name=?, slug=?, logo=?, isActive=?, updatedAt=NOW() WHERE id=?',
      [body.name, body.slug, body.logo, body.isActive ? 1 : 0, Number(id)]);
    return NextResponse.json({ brand: { id: Number(id), ...body } });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await execute('DELETE FROM brands WHERE id = ?', [Number(id)]);
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
