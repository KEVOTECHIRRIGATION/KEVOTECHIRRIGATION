import { NextResponse } from 'next/server';
import { db } from '../../../../lib/db';

export async function GET() {
  try {
    const { rows } = await db.query(
      'SELECT * FROM orders ORDER BY created_at DESC LIMIT 200'
    );
    return NextResponse.json({ success: true, orders: rows });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, status, mpesa_receipt_number } = await request.json();
    const allowed = ['PENDING', 'COMPLETED', 'FAILED', 'CANCELLED'];

    if (!id || !allowed.includes(status)) {
      return NextResponse.json({ success: false, error: 'Invalid payload' }, { status: 400 });
    }

    const { rows } = await db.query(
      `UPDATE orders SET status = $1, mpesa_receipt_number = COALESCE($2, mpesa_receipt_number)
       WHERE id = $3 RETURNING *`,
      [status, mpesa_receipt_number ?? null, id]
    );

    if (!rows.length) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true, order: rows[0] });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
