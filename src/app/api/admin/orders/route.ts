import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const status = searchParams.get('status');
  const offset = (page - 1) * limit;

  try {
    let where = 'WHERE 1=1';
    const params: any[] = [];
    if (status) { where += ' AND o.status = ?'; params.push(status); }

    const [countRow] = await query(`SELECT COUNT(*) as c FROM orders o ${where}`, params);
    const total = Number(countRow.c);

    const orders = await query(
      `SELECT o.*, c.firstName, c.lastName, c.phone,
       (SELECT COUNT(*) FROM order_items oi WHERE oi.orderId = o.id) as itemCount
       FROM orders o LEFT JOIN customers c ON o.customerId = c.id
       ${where} ORDER BY o.createdAt DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    return NextResponse.json({
      orders: orders.map((o: any) => ({
        ...o,
        customer: { firstName: o.firstName, lastName: o.lastName, phone: o.phone },
        items: { length: Number(o.itemCount) },
      })),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
