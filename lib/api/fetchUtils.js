/**
 * Shared fetch utilities for client-side API services
 */

/**
 * Handle API response — throws on non-OK status
 */
export async function handleResponse(response) {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || 'Request failed');
  }
  return response.json();
}
