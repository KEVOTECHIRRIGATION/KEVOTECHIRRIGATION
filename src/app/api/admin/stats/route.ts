import { NextResponse } from 'next/server';
import { db } from '../../../../lib/db';

export async function GET() {
  try {
    const { rows } = await db.query(`
      SELECT
        (SELECT COUNT(*)                                    FROM orders)                           AS total_orders,
        (SELECT COALESCE(SUM(total_price), 0)              FROM orders WHERE status = 'COMPLETED') AS total_revenue,
        (SELECT COUNT(*)                                    FROM orders WHERE status = 'PENDING')   AS pending_orders,
        (SELECT COUNT(*)                                    FROM orders WHERE status = 'COMPLETED') AS completed_orders,
        (SELECT COUNT(*)                                    FROM products)                          AS total_products,
        (SELECT COUNT(*)                                    FROM customers)                         AS total_customers
    `);

    const { rows: recent } = await db.query(
      `SELECT id, phone_number, customer_name, total_price, status, created_at
       FROM orders ORDER BY created_at DESC LIMIT 10`
    );

    return NextResponse.json({ success: true, stats: rows[0], recentOrders: recent });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
