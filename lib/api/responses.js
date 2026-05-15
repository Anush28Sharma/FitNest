/**
 * Standardized API response helpers
 */

/**
 * Create a success response
 */
export function successResponse(data, status = 200) {
  return new Response(
    JSON.stringify({
      success: true,
      ...data,
    }),
    {
      status,
      headers: { 'Content-Type': 'application/json' },
    }
  );
}

/**
 * Create an error response
 */
export function errorResponse(message, status = 400, details = null) {
  const body = {
    success: false,
    error: message,
  };

  if (details) {
    body.details = details;
  }

  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

/**
 * Create a validation error response
 */
export function validationError(message, field = null) {
  return errorResponse(
    message,
    400,
    field ? { field } : null
  );
}

/**
 * Create an unauthorized response
 */
export function unauthorizedResponse(message = 'Authentication required') {
  return errorResponse(message, 401);
}


/**
 * Create a conflict response
 */
export function conflictResponse(message) {
  return errorResponse(message, 409);
}

/**
 * Create an internal server error response
 */
export function serverErrorResponse(message = 'Internal server error') {
  return errorResponse(message, 500);
}
