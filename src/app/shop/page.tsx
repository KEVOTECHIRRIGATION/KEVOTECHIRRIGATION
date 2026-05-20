import { db } from '../../lib/db';
import { CATEGORIES } from '../../lib/categories';
import ProductCard from '../../components/ProductCard';
import type { Product } from '../../types';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Shop All Products | Kevotech Irrigation',
  description: 'Browse our full range of irrigation supplies — PVC, HDPE, sprinklers, drip tapes, valves and pumps.',
};

export const revalidate = 0;

const PAGE_SIZE = 24;

async function getProducts(search: string, category: string, page: number) {
  const offset = (page - 1) * PAGE_SIZE;
  const conditions: string[] = [];
  const values: (string | number)[] = [];
  let i = 1;

  if (search) {
    conditions.push(`(name ILIKE $${i} OR description ILIKE $${i})`);
    values.push(`%${search}%`);
    i++;
  }
  if (category) {
    conditions.push(`category ILIKE $${i}`);
    values.push(`%${category}%`);
    i++;
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  try {
    const { rows } = await db.query<Product>(
      `SELECT * FROM products ${where} ORDER BY id DESC LIMIT $${i} OFFSET $${i + 1}`,
      [...values, PAGE_SIZE, offset]
    );
    const { rows: cnt } = await db.query<{ total: string }>(
      `SELECT COUNT(*) AS total FROM products ${where}`,
      values
    );
    return { products: rows, total: parseInt(cnt[0]?.total ?? '0') };
  } catch {
    return { products: [], total: 0 };
  }
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; category?: string; page?: string }>;
}) {
  const { search = '', category = '', page: pageStr = '1' } = await searchParams;
  const page = Math.max(1, parseInt(pageStr) || 1);
  const { products, total } = await getProducts(search, category, page);
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const buildHref = (overrides: Record<string, string | number>) => {
    const p = { search, category, page, ...overrides };
    const q = new URLSearchParams();
    if (p.search) q.set('search', String(p.search));
    if (p.category) q.set('category', String(p.category));
    if (Number(p.page) > 1) q.set('page', String(p.page));
    return `/shop${q.toString() ? `?${q}` : ''}`;
  };

  const activeCategory = CATEGORIES.find((c) => c.pattern === category);

  return (
    <div style={{ minHeight: '80vh' }}>
      {/* Page Header */}
      <div style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid var(--border-color)', padding: '2.5rem 0' }}>
        <div className="container">
          <nav style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.75rem', display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
            <Link href="/" style={{ color: 'var(--primary-color)' }}>Home</Link>
            <span>/</span>
            <span>Shop</span>
            {activeCategory && <><span>/</span><span>{activeCategory.label}</span></>}
          </nav>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            {activeCategory ? activeCategory.label : search ? `Results for "${search}"` : 'All Products'}
          </h1>
          {total > 0 && <p style={{ color: 'var(--text-secondary)', marginTop: '0.4rem', fontSize: '0.9rem' }}>{total} product{total !== 1 ? 's' : ''}</p>}
        </div>
      </div>

      <div className="container" style={{ padding: '2rem 1.5rem 5rem' }}>
        {/* Category Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
          <Link
            href={buildHref({ category: '', page: 1 })}
            style={{ padding: '0.45rem 1rem', borderRadius: '999px', fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none', backgroundColor: !category ? 'var(--primary-color)' : '#f1f5f9', color: !category ? 'white' : 'var(--text-secondary)', border: !category ? 'none' : '1px solid var(--border-color)', transition: 'all 0.15s' }}
          >
            All
          </Link>
          {CATEGORIES.map((cat) => {
            const active = category === cat.pattern;
            return (
              <Link
                key={cat.slug}
                href={buildHref({ category: cat.pattern, page: 1 })}
                style={{ padding: '0.45rem 1rem', borderRadius: '999px', fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none', backgroundColor: active ? 'var(--primary-color)' : '#f1f5f9', color: active ? 'white' : 'var(--text-secondary)', border: active ? 'none' : '1px solid var(--border-color)', transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
              >
                <span>{cat.icon}</span> {cat.label}
              </Link>
            );
          })}
        </div>

        {/* Search bar */}
        <form method="GET" action="/shop" style={{ marginBottom: '2rem', display: 'flex', gap: '0.75rem', maxWidth: '480px' }}>
          {category && <input type="hidden" name="category" value={category} />}
          <input
            name="search"
            defaultValue={search}
            placeholder="Search products…"
            style={{ flex: 1, padding: '0.65rem 1rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', fontFamily: 'inherit', fontSize: '0.95rem', outline: 'none' }}
          />
          <button type="submit" className="btn btn-primary" style={{ padding: '0.65rem 1.25rem' }}>Search</button>
          {(search || category) && (
            <Link href="/shop" className="btn btn-outline" style={{ padding: '0.65rem 1rem', whiteSpace: 'nowrap' }}>Clear</Link>
          )}
        </form>

        {/* Grid */}
        {products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '5rem 1rem', color: 'var(--text-secondary)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
            <p style={{ fontSize: '1.1rem', marginBottom: '1.5rem' }}>No products found.</p>
            <Link href="/shop" className="btn btn-outline">Clear filters</Link>
          </div>
        ) : (
          <>
            <div className="products-grid">
              {products.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>

            {totalPages > 1 && (
              <nav style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '3rem', flexWrap: 'wrap' }}>
                {page > 1 && <Link href={buildHref({ page: page - 1 })} className="btn btn-outline" style={{ padding: '0.5rem 1rem' }}>← Prev</Link>}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <Link key={p} href={buildHref({ page: p })} className="btn" style={{ padding: '0.5rem 1rem', backgroundColor: p === page ? 'var(--primary-color)' : 'white', color: p === page ? 'white' : 'var(--text-primary)', border: '1px solid var(--border-color)' }}>{p}</Link>
                ))}
                {page < totalPages && <Link href={buildHref({ page: page + 1 })} className="btn btn-outline" style={{ padding: '0.5rem 1rem' }}>Next →</Link>}
              </nav>
            )}
          </>
        )}
      </div>
    </div>
  );
}
