import { NextResponse } from 'next/server';
import { queryOne, execute } from '@/lib/db';

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
    const sets: string[] = []; const vals: any[] = [];
    if (body.status !== undefined) { sets.push('status=?'); vals.push(body.status); }
    if (body.paymentStatus !== undefined) { sets.push('paymentStatus=?'); vals.push(body.paymentStatus); }
    if (body.note !== undefined) { sets.push('note=?'); vals.push(body.note); }
    sets.push('updatedAt=NOW()');
    vals.push(Number(id));
    await execute(`UPDATE orders SET ${sets.join(',')} WHERE id=?`, vals);
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
