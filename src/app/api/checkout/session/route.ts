import { NextResponse } from 'next/server';
import { db } from '../../../../lib/db';
import { generateToken } from '../../../../lib/auth';
import type { CartItem } from '../../../../types';

const SESSION_MINUTES = 30;

export async function POST(request: Request) {
  try {
    const { items, totalPrice } = (await request.json()) as {
      items: CartItem[];
      totalPrice: number;
    };

    if (!items?.length || !totalPrice) {
      return NextResponse.json({ success: false, error: 'Cart is empty' }, { status: 400 });
    }

    // Clean up expired sessions older than 1 hour (housekeeping)
    await db.query(`DELETE FROM checkout_sessions WHERE expires_at < NOW() - INTERVAL '1 hour'`).catch(() => {});

    const token = generateToken();
    const expiresAt = new Date(Date.now() + SESSION_MINUTES * 60 * 1000);

    await db.query(
      `INSERT INTO checkout_sessions (token, cart_items, total_price, expires_at)
       VALUES ($1, $2, $3, $4)`,
      [token, JSON.stringify(items), totalPrice, expiresAt]
    );

    return NextResponse.json({ success: true, token, expiresAt: expiresAt.toISOString() });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
