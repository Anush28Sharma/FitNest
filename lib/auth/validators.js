import { VALIDATION_RULES } from '../constants/validation';

/**
 * Validation utilities for user inputs
 */

export class ValidationError extends Error {
  constructor(message, field = null) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
  }
}

/**
 * Validate username
 */
export function validateUsername(username) {
  if (!username) {
    throw new ValidationError(
      VALIDATION_RULES.USERNAME.ERROR_MESSAGES.REQUIRED,
      'username'
    );
  }

  if (username.length < VALIDATION_RULES.USERNAME.MIN_LENGTH) {
    throw new ValidationError(
      VALIDATION_RULES.USERNAME.ERROR_MESSAGES.MIN_LENGTH,
      'username'
    );
  }

  if (username.length > VALIDATION_RULES.USERNAME.MAX_LENGTH) {
    throw new ValidationError(
      VALIDATION_RULES.USERNAME.ERROR_MESSAGES.MAX_LENGTH,
      'username'
    );
  }

  if (!VALIDATION_RULES.USERNAME.PATTERN.test(username)) {
    throw new ValidationError(
      VALIDATION_RULES.USERNAME.ERROR_MESSAGES.PATTERN,
      'username'
    );
  }

  return true;
}

/**
 * Validate email
 */
export function validateEmail(email) {
  if (!email) {
    throw new ValidationError(
      VALIDATION_RULES.EMAIL.ERROR_MESSAGES.REQUIRED,
      'email'
    );
  }

  if (!VALIDATION_RULES.EMAIL.PATTERN.test(email)) {
    throw new ValidationError(
      VALIDATION_RULES.EMAIL.ERROR_MESSAGES.INVALID,
      'email'
    );
  }

  return true;
}

/**
 * Validate password
 */
export function validatePassword(password) {
  if (!password) {
    throw new ValidationError(
      VALIDATION_RULES.PASSWORD.ERROR_MESSAGES.REQUIRED,
      'password'
    );
  }

  if (password.length < VALIDATION_RULES.PASSWORD.MIN_LENGTH) {
    throw new ValidationError(
      VALIDATION_RULES.PASSWORD.ERROR_MESSAGES.MIN_LENGTH,
      'password'
    );
  }

  if (password.length > VALIDATION_RULES.PASSWORD.MAX_LENGTH) {
    throw new ValidationError(
      VALIDATION_RULES.PASSWORD.ERROR_MESSAGES.MAX_LENGTH,
      'password'
    );
  }

  return true;
}

/**
 * Validate password confirmation
 */
export function validatePasswordMatch(password, confirmPassword) {
  if (password !== confirmPassword) {
    throw new ValidationError(
      VALIDATION_RULES.PASSWORD.ERROR_MESSAGES.MISMATCH,
      'confirmPassword'
    );
  }

  return true;
}

/**
 * Validate name
 */
export function validateName(name) {
  if (!name) {
    throw new ValidationError(
      VALIDATION_RULES.NAME.ERROR_MESSAGES.REQUIRED,
      'name'
    );
  }

  if (name.length < VALIDATION_RULES.NAME.MIN_LENGTH) {
    throw new ValidationError(
      VALIDATION_RULES.NAME.ERROR_MESSAGES.MIN_LENGTH,
      'name'
    );
  }

  if (name.length > VALIDATION_RULES.NAME.MAX_LENGTH) {
    throw new ValidationError(
      VALIDATION_RULES.NAME.ERROR_MESSAGES.MAX_LENGTH,
      'name'
    );
  }

  return true;
}

/**
 * Validate mobile number
 */
export function validateMobile(mobile) {
  if (!mobile) {
    throw new ValidationError(
      VALIDATION_RULES.MOBILE.ERROR_MESSAGES.REQUIRED,
      'mobile'
    );
  }

  if (!VALIDATION_RULES.MOBILE.PATTERN.test(mobile)) {
    throw new ValidationError(
      VALIDATION_RULES.MOBILE.ERROR_MESSAGES.INVALID,
      'mobile'
    );
  }

  const digitsOnly = mobile.replace(/\D/g, '');
  if (
    digitsOnly.length < VALIDATION_RULES.MOBILE.MIN_LENGTH ||
    digitsOnly.length > VALIDATION_RULES.MOBILE.MAX_LENGTH
  ) {
    throw new ValidationError(
      VALIDATION_RULES.MOBILE.ERROR_MESSAGES.INVALID,
      'mobile'
    );
  }

  return true;
}

/**
 * Validate all registration fields
 */
export function validateRegistration(data) {
  const { username, name, email, mobile, password, confirmPassword } = data;

  validateUsername(username);
  validateName(name);
  validateEmail(email);
  validateMobile(mobile);
  validatePassword(password);
  validatePasswordMatch(password, confirmPassword);

  return true;
}

/**
 * Validate login fields
 */
export function validateLogin(identifier, password, loginBy = 'username') {
  if (!identifier) {
    const field = loginBy === 'email' ? 'email' : 'username';
    const message = loginBy === 'email' 
      ? VALIDATION_RULES.EMAIL.ERROR_MESSAGES.REQUIRED 
      : VALIDATION_RULES.USERNAME.ERROR_MESSAGES.REQUIRED;
    throw new ValidationError(message, field);
  }

  if (loginBy === 'email') {
    validateEmail(identifier);
  }

  validatePassword(password);

  return true;
}
