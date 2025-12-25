/**
 * Session management for privacy and security.
 * Generates and stores a unique session ID for each user.
 */

const SESSION_ID_KEY = 'image_colorizer_session_id';
const SESSION_ID_LENGTH = 32;

/**
 * Generate a secure random session ID.
 */
function generateSessionId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const array = new Uint8Array(SESSION_ID_LENGTH);
  crypto.getRandomValues(array);
  for (let i = 0; i < SESSION_ID_LENGTH; i++) {
    result += chars[array[i] % chars.length];
  }
  return result;
}

/**
 * Get or create session ID.
 * Stores in localStorage for persistence across page reloads.
 * Session ID is generated client-side for privacy (no server round-trip needed).
 */
export function getSessionId(): string {
  if (typeof window === 'undefined') {
    // Server-side rendering - return empty (will be set on client)
    return '';
  }

  let sessionId = localStorage.getItem(SESSION_ID_KEY);
  
  if (!sessionId || sessionId.length !== SESSION_ID_LENGTH) {
    // Generate new session ID client-side
    // This ensures privacy - server never knows who is requesting a session
    sessionId = generateSessionId();
    localStorage.setItem(SESSION_ID_KEY, sessionId);
  }
  
  return sessionId;
}

/**
 * Clear session ID (for logout or privacy reset).
 */
export function clearSession(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(SESSION_ID_KEY);
  }
}

/**
 * Get session ID for API requests.
 * Always returns a valid session ID.
 */
export function getApiSessionId(): string {
  return getSessionId();
}

