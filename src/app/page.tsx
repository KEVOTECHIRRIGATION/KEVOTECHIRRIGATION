import { db } from '../lib/db';
import { CATEGORIES } from '../lib/categories';
import ProductCard from '../components/ProductCard';
import type { Product } from '../types';
import Link from 'next/link';

export const revalidate = 60;

async function getFeaturedProducts(): Promise<Product[]> {
  try {
    const { rows } = await db.query<Product>('SELECT * FROM products ORDER BY id DESC LIMIT 8');
    return rows;
  } catch {
    return [];
  }
}

export default async function Home() {
  const featured = await getFeaturedProducts();

  return (
    <>
      {/* ── Hero ── */}
      <section className="hero animate-fade-in">
        <div className="container hero-content">
          <h1 className="hero-title">Precision Irrigation Solutions for Modern Agriculture</h1>
          <p className="hero-subtitle">Elevate your crop yield with international-standard drip tapes, pipes, and fittings engineered for durability and efficiency.</p>
          <div className="hero-actions">
            <Link href="/shop" className="btn btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.125rem' }}>Shop Now</Link>
            <Link href="/contact" className="btn" style={{ padding: '1rem 2rem', fontSize: '1.125rem', backgroundColor: 'rgba(255,255,255,0.15)', color: 'white', border: '2px solid rgba(255,255,255,0.4)' }}>
              Free Consultation
            </Link>
          </div>
        </div>
      </section>

      {/* ── Categories ── */}
      <section className="section container">
        <h2 className="section-title">Shop by <span>Category</span></h2>
        <div className="categories-grid">
          {CATEGORIES.map((cat) => (
            <Link href={`/shop/${cat.slug}`} key={cat.slug} className="category-card">
              <div className="category-icon">{cat.icon}</div>
              <h3 className="category-title">{cat.label}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.5rem' }}>Explore range →</p>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Featured Products ── */}
      <section style={{ backgroundColor: '#f1f5f9', borderRadius: '1rem', padding: '4rem 2rem', margin: '0 1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            Featured <span style={{ color: 'var(--primary-color)' }}>Products</span>
          </h2>
          <Link href="/shop" className="btn btn-outline">View All Products →</Link>
        </div>

        {featured.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
            <p>No products yet. <Link href="/admin" style={{ color: 'var(--primary-color)' }}>Add some in the admin panel.</Link></p>
          </div>
        ) : (
          <div className="products-grid">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {featured.length > 0 && (
          <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
            <Link href="/shop" className="btn btn-primary" style={{ padding: '0.875rem 2.5rem', fontSize: '1rem' }}>Browse Full Catalog</Link>
          </div>
        )}
      </section>

      {/* ── Why Kevotech ── */}
      <section className="section container" style={{ padding: '6rem 0' }}>
        <h2 className="section-title" style={{ marginBottom: '1rem' }}>Why Choose <span>Kevotech</span>?</h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto 3rem', textAlign: 'center', fontSize: '1rem', lineHeight: 1.7 }}>
          We don't just sell products — we deliver comprehensive agricultural water management solutions built to international standards.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2rem' }}>
          {[
            { icon: '🛡️', bg: '#e0f2fe', color: '#0284c7', title: 'Quality Assured', desc: 'ISO-grade materials built to withstand harsh conditions.' },
            { icon: '🌍', bg: '#dcfce7', color: '#16a34a', title: 'Global Standards', desc: 'Imported and locally sourced premium-grade equipment.' },
            { icon: '🤝', bg: '#fef3c7', color: '#d97706', title: 'Expert Support', desc: 'Free consultation and farm layout planning services.' },
            { icon: '🚚', bg: '#f3e8ff', color: '#7c3aed', title: 'Nationwide Delivery', desc: 'Fast, reliable shipping to all 47 counties.' },
          ].map((item) => (
            <div key={item.title} style={{ textAlign: 'center', padding: '2rem 1.5rem', backgroundColor: 'white', borderRadius: '1rem', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ width: '64px', height: '64px', backgroundColor: item.bg, color: item.color, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem', fontSize: '1.5rem' }}>{item.icon}</div>
              <h4 style={{ fontWeight: 700, marginBottom: '0.5rem', fontSize: '1rem' }}>{item.title}</h4>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section style={{ background: 'linear-gradient(135deg, var(--primary-dark), var(--secondary-color))', color: 'white', padding: '5rem 0', textAlign: 'center' }}>
        <div className="container">
          <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, marginBottom: '1rem' }}>Need Help Choosing the Right System?</h2>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '1.05rem', maxWidth: '500px', margin: '0 auto 2.5rem', lineHeight: 1.7 }}>
            Our team offers free farm layout planning and irrigation system design. Tell us your farm size and we'll handle the rest.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/contact" className="btn" style={{ padding: '0.875rem 2rem', backgroundColor: 'white', color: 'var(--primary-dark)', fontWeight: 700, fontSize: '1rem' }}>Get Free Consultation</Link>
            <Link href="/shop" className="btn" style={{ padding: '0.875rem 2rem', backgroundColor: 'transparent', color: 'white', border: '2px solid rgba(255,255,255,0.5)', fontSize: '1rem' }}>Browse Products</Link>
          </div>
        </div>
      </section>
    </>
  );
}
