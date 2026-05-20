import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{ minHeight: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '2rem' }}>
      <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>💧</div>
      <h1 style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>404</h1>
      <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', marginBottom: '2rem', maxWidth: '400px' }}>
        This page dried up. Let&apos;s get you back to fresh ground.
      </p>
      <Link href="/" className="btn btn-primary" style={{ padding: '0.875rem 2rem', fontSize: '1rem' }}>
        Back to Home
      </Link>
    </div>
  );
}
