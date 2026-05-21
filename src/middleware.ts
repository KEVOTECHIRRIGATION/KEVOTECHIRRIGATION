import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const ADMIN_SESSION_COOKIE = 'kevotech_admin';
const ADMIN_LOGIN_PATH     = '/admin/login';

// Basic in-memory rate limiting (Note: resets per serverless instance, but good for basic protection)
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 5; // 5 login attempts per minute per IP

function getClientIp(req: NextRequest): string {
  const xForwardedFor = req.headers.get('x-forwarded-for');
  if (xForwardedFor) return xForwardedFor.split(',')[0].trim();
  return 'unknown';
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now - record.lastReset > RATE_LIMIT_WINDOW_MS) {
    rateLimitMap.set(ip, { count: 1, lastReset: now });
    return true; // Allowed
  }

  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    return false; // Blocked
  }

  record.count += 1;
  return true; // Allowed
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Protect all /admin routes except the login page itself
  if (pathname.startsWith('/admin') && pathname !== ADMIN_LOGIN_PATH) {
    const adminCookie = req.cookies.get(ADMIN_SESSION_COOKIE)?.value;

    if (adminCookie !== 'admin_authenticated') {
      const loginUrl = req.nextUrl.clone();
      loginUrl.pathname = ADMIN_LOGIN_PATH;
      return NextResponse.redirect(loginUrl);
    }
  }

  // Rate Limiting for Login Endpoints
  if (pathname === '/api/admin/login' || pathname === '/api/auth/login') {
    const ip = getClientIp(req);
    if (!checkRateLimit(ip)) {
      return new NextResponse(
        JSON.stringify({ success: false, error: 'Too many login attempts. Please try again in a minute.' }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/login', '/api/auth/login'],
};
