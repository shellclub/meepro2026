import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const secretKey = process.env.JWT_SECRET || 'fallback_secret_key_meepro_2026';
const key = new TextEncoder().encode(secretKey);

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ============ SECURITY: Block CVE-2025-29927 middleware bypass ============
  // Strip/block the x-middleware-subrequest header from external requests
  // to prevent attackers from bypassing middleware auth
  if (req.headers.get('x-middleware-subrequest')) {
    return NextResponse.json(
      { error: 'Forbidden' },
      { status: 403 }
    );
  }
  // =========================================================================

  const response = NextResponse.next();

  // Allow all origins (you can specify your origin for more security in production)
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight OPTIONS requests
  if (req.method === 'OPTIONS') {
    return response;
  }

  // Admin Auth Logic
  const requestPath = pathname.replace(/\/$/, '');
  const isAdminRoute = requestPath.startsWith('/admin') && requestPath !== '/admin/login';
  const isAdminApi = requestPath.startsWith('/api/admin');
  const isLoginRoute = requestPath === '/admin/login';

  const token = req.cookies.get('admin_token')?.value;
  let isValid = false;

  if (token) {
    try {
      await jwtVerify(token, key);
      isValid = true;
    } catch (e) {
      isValid = false;
    }
  }

  if (isAdminRoute || isAdminApi) {
    if (!isValid) {
      if (isAdminApi) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      return NextResponse.redirect(new URL('/admin/login', req.url));
    }
  }

  if (isLoginRoute && isValid) {
    return NextResponse.redirect(new URL('/admin', req.url));
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
