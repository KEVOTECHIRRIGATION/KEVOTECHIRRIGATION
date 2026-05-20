import { NextResponse } from 'next/server';
import { db } from '../../../../lib/db';
import { generateToken, AUTH_COOKIE, COOKIE_OPTS } from '../../../../lib/auth';
import { normalizePhone } from '../../../../lib/mpesa';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { name, email, phone, password, address, county } = await request.json();

    if (!name?.trim() || !phone?.trim() || !password) {
      return NextResponse.json({ success: false, error: 'Name, phone and password are required' }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ success: false, error: 'Password must be at least 8 characters' }, { status: 400 });
    }

    let normalizedPhone: string;
    try {
      normalizedPhone = normalizePhone(phone);
    } catch {
      return NextResponse.json({ success: false, error: 'Invalid phone number' }, { status: 400 });
    }

    if (email) {
      const { rows } = await db.query('SELECT id FROM customers WHERE email = $1', [email.toLowerCase()]);
      if (rows.length) {
        return NextResponse.json({ success: false, error: 'An account with this email already exists' }, { status: 409 });
      }
    }

    const hash = await bcrypt.hash(password, 12);

    const { rows } = await db.query(
      `INSERT INTO customers (name, email, phone, address, county, password_hash)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING id, name, email, phone, address, county`,
      [name.trim(), email?.toLowerCase() ?? null, normalizedPhone, address?.trim() ?? null, county ?? null, hash]
    );

    const customer = rows[0];
    const token = generateToken();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await db.query(
      'INSERT INTO customer_sessions (token, customer_id, expires_at) VALUES ($1,$2,$3)',
      [token, customer.id, expiresAt]
    );

    const cookieStore = await cookies();
    cookieStore.set(AUTH_COOKIE, token, COOKIE_OPTS);

    return NextResponse.json({ success: true, customer }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
