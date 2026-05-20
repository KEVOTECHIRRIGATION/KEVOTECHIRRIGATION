import { NextResponse } from 'next/server';
import { db } from '../../../../lib/db';

export async function GET() {
  try {
    const { rows } = await db.query('SELECT * FROM products ORDER BY id DESC');
    return NextResponse.json({ success: true, products: rows });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name, category, price, description, image } = await request.json();

    if (!name?.trim() || !category?.trim() || price == null) {
      return NextResponse.json(
        { success: false, error: 'name, category and price are required' },
        { status: 400 }
      );
    }

    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      return NextResponse.json({ success: false, error: 'Invalid price' }, { status: 400 });
    }

    const { rows } = await db.query(
      `INSERT INTO products (name, category, price, description, image, updated_at)
       VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING *`,
      [name.trim(), category.trim(), parsedPrice, description?.trim() ?? null, image ?? null]
    );

    return NextResponse.json({ success: true, product: rows[0] }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
