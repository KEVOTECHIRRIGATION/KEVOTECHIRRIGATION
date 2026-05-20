import { db } from '../../../lib/db';
import AdminClient from '../AdminClient';
import type { Product } from '../../../types';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Products | Kevotech Admin',
};

export const revalidate = 0;

export default async function AdminProductsPage() {
  let products: Product[] = [];
  try {
    const { rows } = await db.query<Product>('SELECT * FROM products ORDER BY id DESC');
    products = rows;
  } catch (err) {
    console.error('Admin products: failed to load:', err);
  }

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Products</h1>
        <p style={{ color: '#64748b', marginTop: '0.25rem', fontSize: '0.9rem' }}>Add, edit, and manage your product catalogue.</p>
      </div>
      <AdminClient initialProducts={products} />
    </div>
  );
}
