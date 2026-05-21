import { NextResponse } from 'next/server';
import { db } from '../../../lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('product_id');

    if (!productId) {
      return NextResponse.json({ success: false, error: 'product_id is required' }, { status: 400 });
    }

    const { rows } = await db.query(
      'SELECT id, customer_name, rating, comment, created_at FROM reviews WHERE product_id = $1 AND is_approved = true ORDER BY created_at DESC',
      [productId]
    );

    return NextResponse.json({ success: true, reviews: rows });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { product_id, customer_name, rating, comment } = await request.json();

    if (!product_id || !customer_name || !rating) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ success: false, error: 'Rating must be between 1 and 5' }, { status: 400 });
    }

    await db.query(
      'INSERT INTO reviews (product_id, customer_name, rating, comment) VALUES ($1, $2, $3, $4)',
      [product_id, customer_name, rating, comment]
    );

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
