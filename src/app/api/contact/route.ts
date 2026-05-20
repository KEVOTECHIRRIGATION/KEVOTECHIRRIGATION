import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { name, email, phone, subject, message } = await request.json();

    if (!name?.trim() || !message?.trim()) {
      return NextResponse.json({ success: false, error: 'Name and message are required' }, { status: 400 });
    }

    const botToken = process.env.BOT_TOKEN;
    const chatId = process.env.CHAT_ID;

    if (!botToken || !chatId) {
      return NextResponse.json({ success: false, error: 'Notification service not configured' }, { status: 500 });
    }

    const text = [
      '📬 *New Website Enquiry — Kevotech*',
      '',
      `👤 *Name:* ${name}`,
      email   ? `📧 *Email:* ${email}`   : null,
      phone   ? `📞 *Phone:* ${phone}`   : null,
      subject ? `📌 *Subject:* ${subject}` : null,
      '',
      `💬 *Message:*\n${message}`,
      '',
      `🕐 ${new Date().toLocaleString('en-KE', { timeZone: 'Africa/Nairobi' })}`,
    ].filter((l) => l !== null).join('\n');

    const res = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'Markdown' }),
      }
    );

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.description ?? 'Telegram error');
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error('Contact form error:', msg);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
