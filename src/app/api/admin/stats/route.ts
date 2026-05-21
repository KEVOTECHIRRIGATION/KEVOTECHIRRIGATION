import { NextResponse } from 'next/server';
import { db } from '../../../../lib/db';

export async function GET() {
  try {
    const { rows } = await db.query(`
      SELECT
        (SELECT COUNT(*)                                    FROM orders)                           AS total_orders,
        (SELECT COALESCE(SUM(total_price), 0)               FROM orders WHERE status = 'COMPLETED') AS total_revenue,
        (SELECT COUNT(*)                                    FROM orders WHERE status = 'PENDING')   AS pending_orders,
        (SELECT COUNT(*)                                    FROM orders WHERE status = 'COMPLETED') AS completed_orders,
        (SELECT COUNT(*)                                    FROM products)                          AS total_products,
        (SELECT COUNT(*)                                    FROM customers)                         AS total_customers,
        (SELECT COUNT(*)                                    FROM leads)                             AS total_leads
    `);

    const { rows: recent } = await db.query(
      `SELECT id, phone_number, customer_name, total_price, status, created_at
       FROM orders ORDER BY created_at DESC LIMIT 10`
    );

    // Revenue by Month for Chart
    const { rows: revenueTrend } = await db.query(`
      SELECT 
        TO_CHAR(created_at, 'Mon') as month,
        SUM(total_price) as revenue
      FROM orders 
      WHERE status = 'COMPLETED'
      GROUP BY TO_CHAR(created_at, 'Mon'), DATE_TRUNC('month', created_at)
      ORDER BY DATE_TRUNC('month', created_at) DESC
      LIMIT 6
    `);

    // Category Distribution for Chart
    const { rows: categoryDist } = await db.query(`
      SELECT category as name, COUNT(*) as value
      FROM products
      GROUP BY category
    `);

    return NextResponse.json({ 
      success: true, 
      stats: rows[0], 
      recentOrders: recent,
      revenueTrend: revenueTrend.reverse(),
      categoryDist
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
