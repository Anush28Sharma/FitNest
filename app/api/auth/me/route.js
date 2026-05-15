import { getCurrentUser, clearAuthToken } from '@/lib/auth/session';
import { successResponse, unauthorizedResponse } from '@/lib/api/responses';
import { withErrorHandler } from '@/lib/api/errors';

async function meHandler() {
  const user = await getCurrentUser();

  if (!user) {
    // Clear stale cookie to prevent redirect loops between middleware and layout.
    await clearAuthToken();
    return unauthorizedResponse('Not authenticated');
  }

  // user is already serialized by getCurrentUser()
  return successResponse({ user });
}

export const GET = withErrorHandler(meHandler);
