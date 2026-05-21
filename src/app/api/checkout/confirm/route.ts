import { NextResponse } from 'next/server';
import { db } from '../../../../lib/db';
import { initiateStkPush, normalizePhone } from '../../../../lib/mpesa';
import { generateToken, AUTH_COOKIE, COOKIE_OPTS } from '../../../../lib/auth';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  const client = await db.connect();
  try {
    const {
      token,
      name,
      phone,
      email,
      address,
      county,
      notes,
      saveAccount,
      password,
    } = await request.json();

    if (!token || !name?.trim() || !phone?.trim() || !address?.trim() || !county?.trim()) {
      return NextResponse.json({ success: false, error: 'All required fields must be filled' }, { status: 400 });
    }

    let normalizedPhone: string;
    try {
      normalizedPhone = normalizePhone(phone);
    } catch {
      return NextResponse.json({ success: false, error: 'Invalid M-Pesa phone number' }, { status: 400 });
    }

    await client.query('BEGIN');

    // Atomically claim the session (FOR UPDATE prevents double-submit race condition)
    const { rows: sessionRows } = await client.query(
      `SELECT * FROM checkout_sessions
       WHERE token = $1 AND expires_at > NOW() AND used = FALSE
       FOR UPDATE`,
      [token]
    );

    if (!sessionRows.length) {
      await client.query('ROLLBACK');
      return NextResponse.json(
        { success: false, error: 'Checkout session expired or already used. Please start over.' },
        { status: 410 }
      );
    }

    const session = sessionRows[0];

    // Mark session as used immediately
    await client.query('UPDATE checkout_sessions SET used = TRUE WHERE token = $1', [token]);

    // Handle optional account creation
    let customerId: number | null = null;
    const cookieStore = await cookies();
    const existingAuthToken = cookieStore.get(AUTH_COOKIE)?.value;

    if (existingAuthToken) {
      // Already logged in — get their ID
      const { rows } = await client.query(
        `SELECT c.id FROM customers c
         JOIN customer_sessions cs ON cs.customer_id = c.id
         WHERE cs.token = $1 AND cs.expires_at > NOW()`,
        [existingAuthToken]
      );
      customerId = rows[0]?.id ?? null;
    } else if (saveAccount && password?.length >= 8) {
      // Create new account
      const hash = await bcrypt.hash(password, 12);
      const { rows: existing } = await client.query(
        'SELECT id FROM customers WHERE email = $1',
        [email?.toLowerCase()]
      );

      if (existing.length) {
        customerId = existing[0].id;
        // Update their details
        await client.query(
          `UPDATE customers SET name=$1, phone=$2, address=$3, county=$4 WHERE id=$5`,
          [name.trim(), normalizedPhone, address.trim(), county, customerId]
        );
      } else {
        const { rows: newCustomer } = await client.query(
          `INSERT INTO customers (name, email, phone, address, county, password_hash)
           VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`,
          [name.trim(), email?.toLowerCase() ?? null, normalizedPhone, address.trim(), county, hash]
        );
        customerId = newCustomer[0].id;
      }

      // Create customer session and set cookie
      if (customerId) {
        const authToken = generateToken();
        const authExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        await client.query(
          `INSERT INTO customer_sessions (token, customer_id, expires_at) VALUES ($1,$2,$3)`,
          [authToken, customerId, authExpiry]
        );
        cookieStore.set(AUTH_COOKIE, authToken, COOKIE_OPTS);
      }
    }

    // Create order
    const { rows: orderRows } = await client.query(
      `INSERT INTO orders
         (phone_number, items, total_price, status, customer_id, customer_name, customer_email, delivery_address, county, notes)
       VALUES ($1,$2,$3,'PENDING',$4,$5,$6,$7,$8,$9)
       RETURNING id`,
      [
        normalizedPhone,
        JSON.stringify(session.cart_items),
        session.total_price,
        customerId,
        name.trim(),
        email?.toLowerCase() ?? null,
        address.trim(),
        county,
        notes?.trim() ?? null,
      ]
    );

    const orderId: number = orderRows[0].id;

    // Trigger M-Pesa STK push
    const stkResult = await initiateStkPush(normalizedPhone, Number(session.total_price), orderId);
    await client.query(
      'UPDATE orders SET checkout_request_id = $1 WHERE id = $2',
      [stkResult.CheckoutRequestID, orderId]
    );

    await client.query('COMMIT');

    return NextResponse.json({ success: true, orderId });
  } catch (error: unknown) {
    await client.query('ROLLBACK').catch(() => {});
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Checkout confirm error:', message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  } finally {
    client.release();
  }
}
