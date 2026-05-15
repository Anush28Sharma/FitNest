import { connectDB } from '@/lib/db';
import User from '@/models/User';
import { comparePassword } from '@/lib/auth/password';
import { createToken, setAuthToken } from '@/lib/auth/session';
import { serializeUser } from '@/lib/auth/serializeUser';
import { validateLogin } from '@/lib/auth/validators';
import { successResponse, validationError, unauthorizedResponse } from '@/lib/api/responses';
import { withErrorHandler } from '@/lib/api/errors';

async function loginHandler(request) {
  await connectDB();

  const { identifier, password, loginBy } = await request.json();

  try {
    validateLogin(identifier, password, loginBy);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return validationError(error.message, error.field);
    }
    throw error;
  }

  const query = loginBy === 'email'
    ? { email: identifier.toLowerCase() }
    : { username: identifier };

  const user = await User.findOne(query);
  if (!user) return unauthorizedResponse('Invalid credentials');

  const isValid = await comparePassword(password, user.password);
  if (!isValid) return unauthorizedResponse('Invalid credentials');

  const token = await createToken(user._id);
  await setAuthToken(token);

  return successResponse({ user: serializeUser(user) });
}

export const POST = withErrorHandler(loginHandler);
