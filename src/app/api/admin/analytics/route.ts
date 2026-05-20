import { NextResponse } from 'next/server';
import { db } from '../../../../lib/db';

export async function GET() {
  try {
    const [revenueRes, statusRes, categoryRes] = await Promise.all([
      db.query(`
        SELECT
          TO_CHAR(DATE_TRUNC('month', created_at), 'Mon YYYY') AS month,
          DATE_TRUNC('month', created_at)                       AS month_date,
          COALESCE(SUM(total_price), 0)::numeric                AS revenue,
          COUNT(*)::int                                          AS order_count
        FROM orders
        WHERE status = 'COMPLETED'
          AND created_at >= DATE_TRUNC('month', NOW()) - INTERVAL '5 months'
        GROUP BY DATE_TRUNC('month', created_at)
        ORDER BY month_date
      `),
      db.query(`
        SELECT status, COUNT(*)::int AS count
        FROM orders
        GROUP BY status
        ORDER BY count DESC
      `),
      db.query(`
        SELECT category, COUNT(*)::int AS count
        FROM products
        GROUP BY category
        ORDER BY count DESC
      `),
    ]);

    return NextResponse.json({
      success: true,
      revenueByMonth: revenueRes.rows,
      ordersByStatus: statusRes.rows,
      productsByCategory: categoryRes.rows,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
