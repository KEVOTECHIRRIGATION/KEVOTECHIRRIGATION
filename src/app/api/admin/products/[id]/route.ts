import { NextResponse } from 'next/server';
import { db } from '../../../../../lib/db';

type Params = { params: Promise<{ id: string }> };

export async function GET(_: Request, { params }: Params) {
  const { id } = await params;
  try {
    const { rows } = await db.query('SELECT * FROM products WHERE id = $1', [id]);
    if (!rows.length) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true, product: rows[0] });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: Params) {
  const { id } = await params;
  try {
    const { name, category, price, description, image, min_order_quantity } = await request.json();

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
    
    const parsedMinQty = parseInt(min_order_quantity, 10) || 1;

    const { rows } = await db.query(
      `UPDATE products
       SET name = $1, category = $2, price = $3, description = $4, image = $5, min_order_quantity = $6, updated_at = NOW()
       WHERE id = $7 RETURNING *`,
      [name.trim(), category.trim(), parsedPrice, description?.trim() ?? null, image ?? null, parsedMinQty, id]
    );

    if (!rows.length) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true, product: rows[0] });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: Params) {
  const { id } = await params;
  try {
    const { rowCount } = await db.query('DELETE FROM products WHERE id = $1', [id]);
    if (!rowCount) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
