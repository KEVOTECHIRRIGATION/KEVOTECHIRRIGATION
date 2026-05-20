import { NextResponse } from 'next/server';
import { db } from '../../../../lib/db';
import { generateToken, AUTH_COOKIE, COOKIE_OPTS } from '../../../../lib/auth';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email?.trim() || !password) {
      return NextResponse.json({ success: false, error: 'Email and password required' }, { status: 400 });
    }

    const { rows } = await db.query(
      'SELECT * FROM customers WHERE email = $1',
      [email.toLowerCase().trim()]
    );

    const customer = rows[0];
    if (!customer || !customer.password_hash) {
      return NextResponse.json({ success: false, error: 'Invalid email or password' }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, customer.password_hash);
    if (!valid) {
      return NextResponse.json({ success: false, error: 'Invalid email or password' }, { status: 401 });
    }

    const token = generateToken();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await db.query(
      'INSERT INTO customer_sessions (token, customer_id, expires_at) VALUES ($1,$2,$3)',
      [token, customer.id, expiresAt]
    );

    const cookieStore = await cookies();
    cookieStore.set(AUTH_COOKIE, token, COOKIE_OPTS);

    return NextResponse.json({
      success: true,
      customer: { id: customer.id, name: customer.name, email: customer.email, phone: customer.phone, address: customer.address, county: customer.county },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
