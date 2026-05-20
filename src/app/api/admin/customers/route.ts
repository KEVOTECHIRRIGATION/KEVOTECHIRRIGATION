import { NextResponse } from 'next/server';
import { db } from '../../../../lib/db';

export async function GET() {
  try {
    const { rows } = await db.query(`
      SELECT
        c.id,
        c.name,
        c.email,
        c.phone,
        c.address,
        c.county,
        c.created_at,
        COUNT(o.id)::int                       AS order_count,
        COALESCE(SUM(o.total_price), 0)        AS total_spent,
        MAX(o.created_at)                      AS last_order_at
      FROM customers c
      LEFT JOIN orders o ON o.customer_id = c.id
      GROUP BY c.id
      ORDER BY c.created_at DESC
      LIMIT 500
    `);

    return NextResponse.json({ success: true, customers: rows });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
