/**
 * Validation constants and rules
 */

export const VALIDATION_RULES = {
  USERNAME: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 30,
    PATTERN: /^[a-zA-Z0-9_]+$/,
    ERROR_MESSAGES: {
      REQUIRED: 'Username is required',
      MIN_LENGTH: 'Username must be at least 3 characters',
      MAX_LENGTH: 'Username must be at most 30 characters',
      PATTERN: 'Username can only contain letters, numbers, and underscores',
      TAKEN: 'Username already taken',
    },
  },
  PASSWORD: {
    MIN_LENGTH: 6,
    MAX_LENGTH: 128,
    ERROR_MESSAGES: {
      REQUIRED: 'Password is required',
      MIN_LENGTH: 'Password must be at least 6 characters',
      MAX_LENGTH: 'Password must be at most 128 characters',
      MISMATCH: 'Passwords do not match',
    },
  },
  EMAIL: {
    PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    ERROR_MESSAGES: {
      REQUIRED: 'Email is required',
      INVALID: 'Invalid email address',
      TAKEN: 'Email already registered',
    },
  },
  NAME: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 100,
    ERROR_MESSAGES: {
      REQUIRED: 'Name is required',
      MIN_LENGTH: 'Name must be at least 1 character',
      MAX_LENGTH: 'Name must be at most 100 characters',
    },
  },
  MOBILE: {
    PATTERN: /^[0-9+\-() ]+$/,
    MIN_LENGTH: 10,
    MAX_LENGTH: 15,
    ERROR_MESSAGES: {
      REQUIRED: 'Mobile number is required',
      INVALID: 'Invalid mobile number format',
    },
  },
};

export const JWT_CONFIG = {
  EXPIRES_IN: '7d',
  COOKIE_NAME: 'auth-token',
  COOKIE_MAX_AGE: 60 * 60 * 24 * 7, // 7 days in seconds
};
