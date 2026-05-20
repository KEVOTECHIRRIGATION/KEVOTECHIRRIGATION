import { NextResponse } from 'next/server';
import { db } from '../../../lib/db';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

export async function POST(request: Request) {
  try {
    const { id, name, category } = (await request.json()) as {
      id: number;
      name: string;
      category: string;
    };

    if (!id || !name) {
      return NextResponse.json({ success: false, error: 'Missing product details' }, { status: 400 });
    }

    const res = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 256,
        messages: [
          {
            role: 'user',
            content: `Write a professional, SEO-optimized product description (3 sentences max) for an agricultural irrigation product sold in Kenya.
Product name: "${name}"
Category: "${category}"

Requirements:
- Highlight durability and crop yield benefits
- Mention suitability for Kenyan/East African farming conditions
- End with a call to action
- Do NOT include pricing or brand names other than the product name
- Plain text only, no markdown`,
          },
        ],
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Grok API error ${res.status}: ${err}`);
    }

    const data = await res.json();
    const description: string = data.choices?.[0]?.message?.content?.trim() ?? '';

    if (!description) throw new Error('Empty response from Grok');

    await db.query('UPDATE products SET description = $1 WHERE id = $2', [description, id]);

    return NextResponse.json({ success: true, description });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Groq description error:', message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
