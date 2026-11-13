import { NextResponse } from 'next/server';
import { query, execute, queryOne } from '@/lib/db';
import { logAudit, diffFields } from '@/lib/audit';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const cat = await queryOne('SELECT * FROM categories WHERE id = ?', [Number(id)]);
    if (!cat) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ category: cat });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await req.json();
    const before = await queryOne('SELECT * FROM categories WHERE id = ?', [Number(id)]);
    await execute(
      'UPDATE categories SET name=?, slug=?, description=?, image=?, parentId=?, sortOrder=?, isActive=?, updatedAt=NOW() WHERE id=?',
      [body.name, body.slug, body.description, body.image, body.parentId || null, body.sortOrder, body.isActive ? 1 : 0, Number(id)]
    );
    const changes = diffFields(before, body, ['name', 'slug', 'description', 'image', 'parentId', 'sortOrder', 'isActive']);
    if (Object.keys(changes).length) await logAudit(req, { action: 'update', entity: 'category', entityId: id, summary: `แก้ไขหมวดหมู่ ${before?.name}: ${Object.keys(changes).join(', ')}`, changes });
    return NextResponse.json({ category: { id: Number(id), ...body } });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const before = await queryOne('SELECT * FROM categories WHERE id = ?', [Number(id)]);
    await execute('DELETE FROM categories WHERE id = ?', [Number(id)]);
    await logAudit(_req, { action: 'delete', entity: 'category', entityId: id, summary: `ลบหมวดหมู่ ${before?.name || id}`, changes: before });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
