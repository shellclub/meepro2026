import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const secretKey = process.env.JWT_SECRET || 'fallback_secret_key_meepro_2026';
const key = new TextEncoder().encode(secretKey);

// Maintenance-mode flag, cached briefly (middleware can't query the DB directly)
let maintenanceCache = { enabled: false, at: 0 };

async function isMaintenanceOn(): Promise<boolean> {
  if (Date.now() - maintenanceCache.at < 10_000) return maintenanceCache.enabled;
  try {
    const res = await fetch(`http://127.0.0.1:${process.env.PORT || 3000}/api/maintenance`, { cache: 'no-store' });
    const data = await res.json();
    maintenanceCache = { enabled: !!data.enabled, at: Date.now() };
  } catch {
    maintenanceCache = { enabled: false, at: Date.now() }; // fail open
  }
  return maintenanceCache.enabled;
}

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

  // Maintenance mode: public pages show /maintenance (logged-in admins can still browse)
  const isPublicPage =
    !requestPath.startsWith('/admin') &&
    !requestPath.startsWith('/api') &&
    !requestPath.startsWith('/maintenance') &&
    !requestPath.startsWith('/_next') &&
    !/\.[a-zA-Z0-9]+$/.test(requestPath);
  if (isPublicPage && !isValid && (await isMaintenanceOn())) {
    return NextResponse.rewrite(new URL('/maintenance', req.url), { status: 503 });
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
