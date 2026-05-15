import { AUTH_ROUTE_PATHS, PROTECTED_ROUTE_PATHS } from '@/lib/constants/routes';
import { JWT_CONFIG } from '@/lib/constants/validation';
import { jwtVerify } from 'jose';
import { NextResponse } from 'next/server';

async function isTokenValid(token) {
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    await jwtVerify(token, secret);
    return true;
  } catch {
    return false;
  }
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Never interfere with API routes — let them handle auth themselves
  if (pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  const token = request.cookies.get(JWT_CONFIG.COOKIE_NAME)?.value;
  let isAuthenticated = false;

  if (token) {
    isAuthenticated = await isTokenValid(token);

    // Token exists but is invalid/expired — delete it and treat as unauthenticated.
    // This is the ONLY place we can modify cookies (not in Server Components).
    if (!isAuthenticated) {
      const isAuthPage = AUTH_ROUTE_PATHS.includes(pathname) || pathname === '/';
      const response = isAuthPage
        ? NextResponse.next()
        : NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete(JWT_CONFIG.COOKIE_NAME);
      return response;
    }
  }

  // Redirect authenticated users away from auth pages to dashboard
  // NEW: Don't redirect from Home (/) if authenticated, let the page handle it (but actually, 
  // usually we want home to be the landing page even for auth users, 
  // OR we redirect them to dashboard. Let's keep redirect to dashboard for home if auth'd 
  // to maintain the "App" feel for paid users.)
  if (isAuthenticated && (AUTH_ROUTE_PATHS.includes(pathname) || pathname === '/')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Redirect unauthenticated users to login for protected routes
  // REMOVED: pathname === '/' check here to allow landing page access
  if (!isAuthenticated && !AUTH_ROUTE_PATHS.includes(pathname)) {
    const isProtectedRoute = PROTECTED_ROUTE_PATHS.some(route =>
      pathname.startsWith(route)
    );

    if (isProtectedRoute) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
