import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const [products] = await query('SELECT COUNT(*) as c FROM products');
    const [categories] = await query('SELECT COUNT(*) as c FROM categories');
    const [orders] = await query('SELECT COUNT(*) as c FROM orders');
    const [brands] = await query('SELECT COUNT(*) as c FROM brands');
    const [pending] = await query("SELECT COUNT(*) as c FROM orders WHERE status = 'pending'");
    const [revenue] = await query("SELECT COALESCE(SUM(total), 0) as total FROM orders WHERE paymentStatus = 'paid'");

    const recentOrders = await query(
      `SELECT o.*, c.firstName, c.lastName FROM orders o 
       LEFT JOIN customers c ON o.customerId = c.id 
       ORDER BY o.createdAt DESC LIMIT 5`
    );

    const topProducts = await query(
      `SELECT p.*, pi.url as imageUrl FROM products p 
       LEFT JOIN product_images pi ON pi.productId = p.id AND pi.isMain = 1 
       ORDER BY p.salesCount DESC LIMIT 5`
    );

    return NextResponse.json({
      stats: {
        totalProducts: Number(products.c),
        totalCategories: Number(categories.c),
        totalOrders: Number(orders.c),
        totalBrands: Number(brands.c),
        pendingOrders: Number(pending.c),
        totalRevenue: Number(revenue.total),
      },
      recentOrders: recentOrders.map((o: any) => ({
        ...o,
        customer: { firstName: o.firstName, lastName: o.lastName },
      })),
      topProducts,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
