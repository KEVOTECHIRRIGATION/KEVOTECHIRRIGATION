import crypto from 'crypto';
import { db } from './db';

export function generateToken(bytes = 32): string {
  return crypto.randomBytes(bytes).toString('hex');
}

export interface Customer {
  id: number;
  name: string;
  email: string | null;
  phone: string;
  address: string | null;
  county: string | null;
}

export async function getCustomerFromToken(token: string | undefined): Promise<Customer | null> {
  if (!token) return null;
  try {
    const { rows } = await db.query<Customer>(
      `SELECT c.id, c.name, c.email, c.phone, c.address, c.county
       FROM customers c
       JOIN customer_sessions cs ON cs.customer_id = c.id
       WHERE cs.token = $1 AND cs.expires_at > NOW()`,
      [token]
    );
    return rows[0] ?? null;
  } catch {
    return null;
  }
}

export const AUTH_COOKIE = 'kevotech_auth';
export const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 7 * 24 * 60 * 60, // 7 days
};
