import { NextResponse } from 'next/server';
import { execute, queryOne } from '@/lib/db';
import { logAudit, diffFields } from '@/lib/audit';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await req.json();
    const before = await queryOne('SELECT * FROM brands WHERE id = ?', [Number(id)]);
    await execute('UPDATE brands SET name=?, slug=?, logo=?, isActive=?, updatedAt=NOW() WHERE id=?',
      [body.name, body.slug, body.logo, body.isActive ? 1 : 0, Number(id)]);
    const changes = diffFields(before, body, ['name', 'slug', 'logo', 'isActive']);
    if (Object.keys(changes).length) await logAudit(req, { action: 'update', entity: 'brand', entityId: id, summary: `แก้ไขแบรนด์ ${before?.name}: ${Object.keys(changes).join(', ')}`, changes });
    return NextResponse.json({ brand: { id: Number(id), ...body } });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const before = await queryOne('SELECT * FROM brands WHERE id = ?', [Number(id)]);
    await execute('DELETE FROM brands WHERE id = ?', [Number(id)]);
    await logAudit(_req, { action: 'delete', entity: 'brand', entityId: id, summary: `ลบแบรนด์ ${before?.name || id}`, changes: before });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
