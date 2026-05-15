import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { connectDB } from '../db';
import { JWT_CONFIG } from '../constants/validation';
import { serializeUser } from './serializeUser';
import User from '@/models/User';

/**
 * Server-side session management utilities
 * Uses `jose` for JWT operations (Edge-compatible, same lib as middleware).
 */

const getSecret = () => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is not set');
  }
  return new TextEncoder().encode(process.env.JWT_SECRET);
};

/**
 * Create a JWT token for a user
 */
export async function createToken(userId) {
  return new SignJWT({ userId: userId.toString() })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(JWT_CONFIG.EXPIRES_IN)
    .sign(getSecret());
}

/**
 * Verify and decode a JWT token
 */
export async function verifyToken(token) {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload;
  } catch {
    throw new Error('Invalid or expired token');
  }
}

/**
 * Get the auth token from cookies
 */
export async function getAuthToken() {
  const cookieStore = await cookies();
  return cookieStore.get(JWT_CONFIG.COOKIE_NAME)?.value;
}

/**
 * Set the auth token in cookies
 */
export async function setAuthToken(token) {
  const cookieStore = await cookies();
  cookieStore.set(JWT_CONFIG.COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: JWT_CONFIG.COOKIE_MAX_AGE,
    path: '/',
  });
}

/**
 * Clear the auth token from cookies
 */
export async function clearAuthToken() {
  const cookieStore = await cookies();
  cookieStore.set(JWT_CONFIG.COOKIE_NAME, '', {
    maxAge: 0,
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });
}

/**
 * Get the current user from the session
 */
export async function getCurrentUser() {
  try {
    const token = await getAuthToken();
    if (!token) return null;

    const { userId } = await verifyToken(token);

    await connectDB();
    const user = await User.findById(userId).select('-password');

    return user ? serializeUser(user) : null;
  } catch (error) {
    console.error('Session error:', error);
    return null;
  }
}
