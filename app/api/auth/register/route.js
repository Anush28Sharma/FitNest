import { connectDB } from '@/lib/db';
import User from '@/models/User';
import { hashPassword } from '@/lib/auth/password';
import { createToken, setAuthToken } from '@/lib/auth/session';
import { serializeUser } from '@/lib/auth/serializeUser';
import { validateRegistration } from '@/lib/auth/validators';
import { successResponse, validationError, conflictResponse } from '@/lib/api/responses';
import { withErrorHandler } from '@/lib/api/errors';
import { VALIDATION_RULES } from '@/lib/constants/validation';

async function registerHandler(request) {
  await connectDB();

  const { username, name, mobile, email, password, confirmPassword } = await request.json();

  try {
    validateRegistration({ username, name, mobile, email, password, confirmPassword });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return validationError(error.message, error.field);
    }
    throw error;
  }

  if (await User.findOne({ username })) {
    return conflictResponse(VALIDATION_RULES.USERNAME.ERROR_MESSAGES.TAKEN);
  }

  if (await User.findOne({ email: email.toLowerCase() })) {
    return conflictResponse(VALIDATION_RULES.EMAIL.ERROR_MESSAGES.TAKEN);
  }

  const hashedPassword = await hashPassword(password);
  const user = await User.create({
    username,
    name,
    mobile,
    email: email.toLowerCase(),
    password: hashedPassword,
  });

  const token = await createToken(user._id);
  await setAuthToken(token);

  return successResponse({ user: serializeUser(user) }, 201);
}

export const POST = withErrorHandler(registerHandler);
