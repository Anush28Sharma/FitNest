/**
 * Centralized route constants for the application
 */

export const AUTH_ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
};

export const PROTECTED_ROUTES = {
  DASHBOARD: '/dashboard',
  BMI: '/bmi',
  HEALTH: '/health',
  PROFILE: '/me',
};

// Arrays for easy checking in middleware
export const AUTH_ROUTE_PATHS = Object.values(AUTH_ROUTES);
export const PROTECTED_ROUTE_PATHS = Object.values(PROTECTED_ROUTES);
