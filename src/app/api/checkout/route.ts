import { NextResponse } from 'next/server';
import { db } from '../../../lib/db';
import { initiateStkPush, normalizePhone } from '../../../lib/mpesa';
import type { CartItem } from '../../../types';

export async function POST(request: Request) {
  try {
    const { phoneNumber, items, totalPrice } = (await request.json()) as {
      phoneNumber: string;
      items: CartItem[];
      totalPrice: number;
    };

    if (!phoneNumber || !items?.length || !totalPrice) {
      return NextResponse.json({ success: false, error: 'Invalid checkout data' }, { status: 400 });
    }

    let normalizedPhone: string;
    try {
      normalizedPhone = normalizePhone(phoneNumber);
    } catch {
      return NextResponse.json({ success: false, error: 'Invalid phone number format' }, { status: 400 });
    }

    const { rows } = await db.query(
      `INSERT INTO orders (phone_number, items, total_price, status)
       VALUES ($1, $2, $3, 'PENDING') RETURNING id`,
      [normalizedPhone, JSON.stringify(items), totalPrice]
    );

    const orderId: number = rows[0].id;

    const stkResult = await initiateStkPush(normalizedPhone, totalPrice, orderId);

    await db.query(
      'UPDATE orders SET checkout_request_id = $1 WHERE id = $2',
      [stkResult.CheckoutRequestID, orderId]
    );

    return NextResponse.json({
      success: true,
      orderId,
      message: 'STK Push sent. Check your phone and enter your M-Pesa PIN.',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unexpected error';
    console.error('Checkout error:', message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
