import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About Us | Kevotech Irrigation',
  description: 'Learn about Kevotech Irrigation — Kenya\'s trusted supplier of premium agricultural irrigation solutions built to international standards.',
};

const STATS = [
  { value: '500+', label: 'Products in Catalog' },
  { value: '1,200+', label: 'Farmers Served' },
  { value: '47', label: 'Counties Reached' },
  { value: '5★', label: 'Customer Rating' },
];

const VALUES = [
  { icon: '🛡️', title: 'Quality First', desc: 'Every product we stock is sourced from certified manufacturers and tested to meet ISO standards. We never compromise on quality.' },
  { icon: '🌍', title: 'Built for Africa', desc: 'Our solutions are specifically selected for East African soil types, climate zones, and water pressure conditions.' },
  { icon: '🤝', title: 'Expert Consultation', desc: 'Our agronomic team offers free farm layout planning and system design to help you maximise your investment.' },
  { icon: '🚚', title: 'Nationwide Delivery', desc: 'We deliver to all 47 counties in Kenya. Orders placed before 2 PM are dispatched same day.' },
];

export default function AboutPage() {
  return (
    <div style={{ minHeight: '80vh' }}>
      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)', color: 'white', padding: '6rem 0', textAlign: 'center' }}>
        <div className="container">
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💧</div>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 800, marginBottom: '1.25rem', lineHeight: 1.2 }}>
            Irrigating Kenya's Future
          </h1>
          <p style={{ fontSize: '1.15rem', color: '#94a3b8', maxWidth: '600px', margin: '0 auto', lineHeight: 1.75 }}>
            Kevotech Irrigation is a Nairobi-based supplier of international-grade irrigation equipment, dedicated to helping Kenyan farmers achieve maximum crop yield through efficient water management.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div style={{ backgroundColor: 'var(--primary-color)', padding: '3rem 0' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '2rem', textAlign: 'center' }}>
            {STATS.map((s) => (
              <div key={s.label} style={{ color: 'white' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: 800, lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: '0.9rem', opacity: 0.85, marginTop: '0.4rem' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mission */}
      <section className="section container" style={{ maxWidth: '800px' }}>
        <h2 className="section-title" style={{ textAlign: 'left' }}>Our <span>Mission</span></h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: 1.85, marginBottom: '1.5rem' }}>
          At Kevotech, we believe that access to quality irrigation infrastructure should not be a luxury. Small-scale and commercial farmers alike deserve the same internationally-certified equipment that large agribusinesses use — at fair, transparent prices.
        </p>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: 1.85 }}>
          We import directly from certified manufacturers across Asia, Europe, and the Middle East, removing middlemen and passing the savings directly to farmers. Every product carries a quality guarantee, and our team provides end-to-end support from system design through to after-sales service.
        </p>
      </section>

      {/* Values */}
      <section style={{ backgroundColor: '#f8fafc', padding: '5rem 0' }}>
        <div className="container">
          <h2 className="section-title">What We <span>Stand For</span></h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
            {VALUES.map((v) => (
              <div key={v.title} style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '2rem', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>{v.icon}</div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>{v.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', lineHeight: 1.7 }}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section container" style={{ textAlign: 'center' }}>
        <h2 className="section-title">Ready to <span>Get Started</span>?</h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '480px', margin: '0 auto 2.5rem', fontSize: '1rem', lineHeight: 1.7 }}>
          Browse our full product catalog or reach out to our team for a free farm irrigation consultation.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/shop" className="btn btn-primary" style={{ padding: '0.875rem 2rem', fontSize: '1rem' }}>Browse Products</Link>
          <Link href="/contact" className="btn btn-outline" style={{ padding: '0.875rem 2rem', fontSize: '1rem' }}>Contact Us</Link>
        </div>
      </section>
    </div>
  );
}
