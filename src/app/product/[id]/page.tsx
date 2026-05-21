import { db } from '../../../lib/db';
import { notFound } from 'next/navigation';
import AddToCartBtn from '../../../components/AddToCartBtn';
import Image from 'next/image';
import { TruckIcon, ShieldIcon, PhoneIcon } from '../../../components/Icons';
import ProductReviews from '../../../components/ProductReviews';
import Link from 'next/link';
import type { Metadata } from 'next';
import type { Product } from '../../../types';
import { formatPrice } from '../../../lib/utils';

export const revalidate = 60;

type Params = { params: Promise<{ id: string }> };

async function getProduct(id: string): Promise<Product | null> {
  try {
    const { rows } = await db.query<Product>('SELECT * FROM products WHERE id = $1', [id]);
    return rows[0] ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) return { title: 'Product Not Found | Kevotech Irrigation' };

  return {
    title: `${product.name} | Kevotech Irrigation`,
    description: product.description ?? `Buy ${product.name} — premium ${product.category} irrigation equipment from Kevotech.`,
    openGraph: {
      title: product.name,
      description: product.description ?? '',
      images: product.image ? [{ url: product.image, width: 800, height: 800, alt: product.name }] : [],
    },
  };
}

export default async function ProductPage({ params }: Params) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) notFound();

  return (
    <div className="container" style={{ padding: '2rem 1.5rem 5rem' }}>
      <nav style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '2rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <Link href="/" style={{ color: 'var(--primary-color)' }}>Home</Link>
        <span>/</span>
        <Link href={`/?search=${encodeURIComponent(product.category.split(' ')[0])}`} style={{ color: 'var(--primary-color)' }}>{product.category}</Link>
        <span>/</span>
        <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{product.name}</span>
      </nav>

      <div style={{ display: 'flex', gap: '4rem', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 380px', backgroundColor: '#f8fafc', borderRadius: '1rem', padding: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '380px' }}>
          {product.image ? (
            <div style={{ position: 'relative', width: '100%', aspectRatio: '1/1' }}>
              <Image
                src={product.image}
                alt={product.name}
                fill
                style={{ objectFit: 'contain' }}
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            </div>
          ) : (
            <div style={{ width: '100%', aspectRatio: '1/1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', gap: '1rem' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
              <p>No image available</p>
            </div>
          )}
        </div>

        <div style={{ flex: '1 1 380px', display: 'flex', flexDirection: 'column' }}>
          <span style={{ textTransform: 'uppercase', color: 'var(--primary-color)', fontWeight: 600, letterSpacing: '1px', fontSize: '0.8rem', marginBottom: '0.75rem', display: 'block' }}>
            {product.category}
          </span>
          <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, marginBottom: '1rem', lineHeight: 1.2, color: 'var(--text-primary)' }}>
            {product.name}
          </h1>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary-dark)', marginBottom: '2rem' }}>
            {formatPrice(product.price)}
          </div>

          <div style={{ padding: '1.5rem', backgroundColor: '#f1f5f9', borderRadius: '0.75rem', marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem' }}>Product Description</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75, fontSize: '0.95rem' }}>
              {product.description ?? 'Premium agricultural equipment designed to meet international standards for efficiency and durability. Ensure optimal crop yield with Kevotech\'s reliable irrigation solutions.'}
            </p>
          </div>

          <AddToCartBtn product={product} />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '2.5rem', paddingTop: '2rem', borderTop: '1px solid #e2e8f0' }}>
            {([
              { Icon: TruckIcon,  label: 'Nationwide Delivery',  color: '#7c3aed' },
              { Icon: ShieldIcon, label: 'Quality Guaranteed',   color: '#0284c7' },
              { Icon: PhoneIcon,  label: 'Expert Consultation',  color: '#16a34a' },
            ] as const).map(({ Icon, label, color }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span style={{ color, flexShrink: 0 }}><Icon size={20} color={color} /></span>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <ProductReviews productId={String(product.id)} />
    </div>
  );
}
