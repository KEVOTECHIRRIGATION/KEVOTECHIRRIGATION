import { db } from '../../../lib/db';
import { getCategoryBySlug, CATEGORIES } from '../../../lib/categories';
import ProductCard from '../../../components/ProductCard';
import type { Product } from '../../../types';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export const revalidate = 60;

const PAGE_SIZE = 24;

type Params = { params: Promise<{ category: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { category } = await params;
  const cat = getCategoryBySlug(category);
  if (!cat) return { title: 'Not Found' };
  return {
    title: `${cat.label} | Kevotech Irrigation`,
    description: `Shop premium ${cat.label.toLowerCase()} from Kevotech — built for Kenyan farming conditions.`,
  };
}

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ category: c.slug }));
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { category: slug } = await params;
  const { page: pageStr = '1' } = await searchParams;
  const page = Math.max(1, parseInt(pageStr) || 1);

  const cat = getCategoryBySlug(slug);
  if (!cat) notFound();

  const offset = (page - 1) * PAGE_SIZE;

  let products: Product[] = [];
  let total = 0;
  try {
    const { rows } = await db.query<Product>(
      'SELECT * FROM products WHERE category ILIKE $1 ORDER BY id DESC LIMIT $2 OFFSET $3',
      [`%${cat.pattern}%`, PAGE_SIZE, offset]
    );
    const { rows: cnt } = await db.query<{ total: string }>(
      'SELECT COUNT(*) AS total FROM products WHERE category ILIKE $1',
      [`%${cat.pattern}%`]
    );
    products = rows;
    total = parseInt(cnt[0]?.total ?? '0');
  } catch { /* returns empty */ }

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div style={{ minHeight: '80vh' }}>
      {/* Category Hero */}
      <div style={{ background: 'linear-gradient(135deg, var(--primary-dark), var(--secondary-color))', color: 'white', padding: '4rem 0' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>{cat.icon}</div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, margin: '0 0 0.75rem' }}>{cat.label}</h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.05rem', maxWidth: '500px', margin: '0 auto' }}>
            International-grade {cat.label.toLowerCase()} for modern Kenyan agriculture.
          </p>
        </div>
      </div>

      {/* Breadcrumb */}
      <div style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: '#f8fafc' }}>
        <div className="container" style={{ padding: '0.75rem 1.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
          <Link href="/" style={{ color: 'var(--primary-color)' }}>Home</Link>
          <span>/</span>
          <Link href="/shop" style={{ color: 'var(--primary-color)' }}>Shop</Link>
          <span>/</span>
          <span>{cat.label}</span>
        </div>
      </div>

      <div className="container" style={{ padding: '2.5rem 1.5rem 5rem' }}>
        {/* Other categories */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
          <Link href="/shop" style={{ padding: '0.4rem 0.875rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 600, backgroundColor: '#f1f5f9', color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}>All Products</Link>
          {CATEGORIES.filter((c) => c.slug !== slug).map((c) => (
            <Link key={c.slug} href={`/shop/${c.slug}`} style={{ padding: '0.4rem 0.875rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 600, backgroundColor: '#f1f5f9', color: 'var(--text-secondary)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              {c.icon} {c.label}
            </Link>
          ))}
        </div>

        {total > 0 && <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>{total} product{total !== 1 ? 's' : ''}</p>}

        {products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '5rem 1rem', color: 'var(--text-secondary)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{cat.icon}</div>
            <p style={{ fontSize: '1.1rem', marginBottom: '1.5rem' }}>No products in this category yet.</p>
            <Link href="/shop" className="btn btn-primary">Browse All Products</Link>
          </div>
        ) : (
          <>
            <div className="products-grid">
              {products.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
            {totalPages > 1 && (
              <nav style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '3rem', flexWrap: 'wrap' }}>
                {page > 1 && <Link href={`/shop/${slug}?page=${page - 1}`} className="btn btn-outline" style={{ padding: '0.5rem 1rem' }}>← Prev</Link>}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <Link key={p} href={`/shop/${slug}?page=${p}`} className="btn" style={{ padding: '0.5rem 1rem', backgroundColor: p === page ? 'var(--primary-color)' : 'white', color: p === page ? 'white' : 'var(--text-primary)', border: '1px solid var(--border-color)' }}>{p}</Link>
                ))}
                {page < totalPages && <Link href={`/shop/${slug}?page=${page + 1}`} className="btn btn-outline" style={{ padding: '0.5rem 1rem' }}>Next →</Link>}
              </nav>
            )}
          </>
        )}
      </div>
    </div>
  );
}
