import { NextResponse } from 'next/server';
import { queryOne, execute } from '@/lib/db';
import { logAudit, diffFields } from '@/lib/audit';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const order = await queryOne(
      `SELECT o.*, c.firstName, c.lastName, c.email, c.phone 
       FROM orders o LEFT JOIN customers c ON o.customerId=c.id WHERE o.id=?`, [Number(id)]
    );
    if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ order });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await req.json();
    const before = await queryOne('SELECT orderNumber, status, paymentStatus, note FROM orders WHERE id=?', [Number(id)]);
    const sets: string[] = []; const vals: any[] = [];
    if (body.status !== undefined) { sets.push('status=?'); vals.push(body.status); }
    if (body.paymentStatus !== undefined) { sets.push('paymentStatus=?'); vals.push(body.paymentStatus); }
    if (body.note !== undefined) { sets.push('note=?'); vals.push(body.note); }
    sets.push('updatedAt=NOW()');
    vals.push(Number(id));
    await execute(`UPDATE orders SET ${sets.join(',')} WHERE id=?`, vals);
    const changes = diffFields(before, body, ['status', 'paymentStatus', 'note']);
    if (Object.keys(changes).length) await logAudit(req, { action: 'update', entity: 'order', entityId: id, summary: `แก้ไขคำสั่งซื้อ ${before?.orderNumber || id}: ${Object.keys(changes).join(', ')}`, changes });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
