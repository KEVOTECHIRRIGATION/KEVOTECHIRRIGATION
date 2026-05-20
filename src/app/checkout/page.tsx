import { db } from '../../lib/db';
import { getCustomerFromToken, AUTH_COOKIE } from '../../lib/auth';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import CheckoutForm from './CheckoutForm';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Checkout | Kevotech Irrigation' };
export const dynamic = 'force-dynamic';

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ session?: string }>;
}) {
  const { session: token } = await searchParams;

  if (!token) redirect('/');

  // Validate session server-side
  let session: { cart_items: unknown; total_price: string; expires_at: Date } | null = null;
  try {
    const { rows } = await db.query(
      `SELECT cart_items, total_price, expires_at
       FROM checkout_sessions
       WHERE token = $1 AND used = FALSE`,
      [token]
    );
    session = rows[0] ?? null;
  } catch { /* DB unavailable */ }

  // Session not found or already used
  if (!session) {
    return (
      <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ textAlign: 'center', maxWidth: '420px' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏱️</div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>Session Not Found</h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: 1.7 }}>
            This checkout session has expired, been used, or is invalid. Please return to your cart and try again.
          </p>
          <Link href="/" className="btn btn-primary" style={{ padding: '0.875rem 2rem' }}>Back to Shop</Link>
        </div>
      </div>
    );
  }

  // Session expired
  if (new Date(session.expires_at) <= new Date()) {
    return (
      <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ textAlign: 'center', maxWidth: '420px' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⌛</div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>Session Expired</h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: 1.7 }}>
            Your 30-minute checkout window has passed. Your cart items are still saved — go back and try again.
          </p>
          <Link href="/" className="btn btn-primary" style={{ padding: '0.875rem 2rem' }}>Return to Cart</Link>
        </div>
      </div>
    );
  }

  // Get logged-in customer if any
  const cookieStore = await cookies();
  const authToken = cookieStore.get(AUTH_COOKIE)?.value;
  const customer = await getCustomerFromToken(authToken);

  return (
    <CheckoutForm
      token={token}
      items={session.cart_items as never}
      totalPrice={Number(session.total_price)}
      expiresAt={new Date(session.expires_at).toISOString()}
      customer={customer}
    />
  );
}
