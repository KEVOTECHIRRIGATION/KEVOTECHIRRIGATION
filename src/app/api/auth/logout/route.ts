import { NextResponse } from 'next/server';
import { db } from '../../../../lib/db';
import { AUTH_COOKIE } from '../../../../lib/auth';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE)?.value;

    if (token) {
      await db.query('DELETE FROM customer_sessions WHERE token = $1', [token]).catch(() => {});
      cookieStore.delete(AUTH_COOKIE);
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
