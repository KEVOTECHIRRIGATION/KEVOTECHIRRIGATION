import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const ADMIN_SESSION_COOKIE = 'kevotech_admin';
const ADMIN_LOGIN_PATH     = '/admin/login';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Protect all /admin routes except the login page itself
  if (pathname.startsWith('/admin') && pathname !== ADMIN_LOGIN_PATH) {
    const adminCookie = req.cookies.get(ADMIN_SESSION_COOKIE)?.value;

    if (adminCookie !== 'admin_authenticated') {
      // Redirect to the proper login page
      const loginUrl = req.nextUrl.clone();
      loginUrl.pathname = ADMIN_LOGIN_PATH;
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
