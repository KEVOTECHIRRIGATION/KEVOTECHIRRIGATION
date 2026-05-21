import { MetadataRoute } from 'next';
import { db } from '../lib/db';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://kevotech-irrigation.com';

  // Get all active products for dynamic sitemap
  let products: { id: string, created_at?: string }[] = [];
  try {
    const { rows } = await db.query('SELECT id, created_at FROM products');
    products = rows;
  } catch (e) {
    console.error('Failed to fetch products for sitemap', e);
  }

  const productUrls = products.map((product) => ({
    url: `${baseUrl}/shop/${product.id}`,
    lastModified: product.created_at ? new Date(product.created_at) : new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/shop`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    ...productUrls,
  ];
}
