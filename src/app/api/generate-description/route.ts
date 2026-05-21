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
        max_tokens: 600,
        messages: [
          {
            role: 'user',
            content: `Write a high-converting, professional e-commerce product description for an agricultural irrigation product sold in Kenya, similar to the high-quality descriptions found on Jumia or Amazon.
Product name: "${name}"
Category: "${category}"

Format Requirements:
1. Start with a catchy, 1-2 sentence hook highlighting the main benefit.
2. Provide a "Key Features & Benefits" section with 3-5 bullet points (use the • symbol).
3. Keep the tone professional, persuasive, and tailored for Kenyan farming conditions.
4. Plain text only (no markdown like asterisks or hashtags), but use line breaks to separate paragraphs and bullet points.`,
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
