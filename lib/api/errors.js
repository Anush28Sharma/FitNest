import { errorResponse, serverErrorResponse } from './responses';

/**
 * Custom API error classes
 */

export class APIError extends Error {
  constructor(message, statusCode = 500, details = null) {
    super(message);
    this.name = 'APIError';
    this.statusCode = statusCode;
    this.details = details;
  }
}


/**
 * Error handler wrapper for API routes
 */
export function withErrorHandler(handler) {
  return async (request, context) => {
    try {
      return await handler(request, context);
    } catch (error) {
      console.error('API Error:', error);
      if (error.stack) {
        console.error('Stack:', error.stack);
      }

      if (error instanceof APIError) {
        return errorResponse(error.message, error.statusCode, error.details);
      }

      // Handle unexpected errors
      return serverErrorResponse();
    }
  };
}
