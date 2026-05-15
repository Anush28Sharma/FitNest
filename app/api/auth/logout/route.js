import { clearAuthToken } from '@/lib/auth/session';
import { successResponse } from '@/lib/api/responses';
import { withErrorHandler } from '@/lib/api/errors';
import { NextResponse } from 'next/server';

async function logoutHandler() {
  await clearAuthToken();
  return successResponse({ message: 'Logged out successfully' });
}

// GET handler: used by the protected layout to clear stale cookies and redirect.
// When a JWT is valid but the user no longer exists in the DB, the Server Component
// layout can't modify cookies directly — so it redirects here instead.
async function logoutAndRedirect(request) {
  await clearAuthToken();
  return NextResponse.redirect(new URL('/login', request.url));
}

export const POST = withErrorHandler(logoutHandler);
export const GET = withErrorHandler(logoutAndRedirect);
