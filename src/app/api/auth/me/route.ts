import { NextResponse } from 'next/server';
import { getCustomerFromToken, AUTH_COOKIE } from '../../../../lib/auth';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE)?.value;
    const customer = await getCustomerFromToken(token);

    if (!customer) {
      return NextResponse.json({ success: false, customer: null });
    }

    return NextResponse.json({ success: true, customer });
  } catch {
    return NextResponse.json({ success: false, customer: null });
  }
}
