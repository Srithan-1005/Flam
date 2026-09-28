/**
 * Frontend API client for the LearnFlow AI backend.
 *
 * Error handling strategy:
 *  • Network errors (offline, DNS) → friendly message
 *  • Timeout/abort → specific message
 *  • HTTP error codes → categorized messages based on status + errorType
 *  • Never exposes stack traces or API keys
 */

/** User-friendly error messages by category */
const ERROR_MESSAGES = {
  network: 'Network error — please check your internet connection and try again.',
  timeout: 'The request timed out. Please try again.',
  rate_limit: 'Too many requests. Please wait a moment and try again.',
  config: 'The AI service is not properly configured. Please contact the developer.',
  ai_invalid: "Couldn't generate a valid study set. The AI returned an unexpected response.",
  ai_empty: 'The AI returned an empty response. Please try again with more detail.',
  server: 'Something went wrong on the server. Please try again.',
  unknown: 'An unexpected error occurred. Please try again.',
};

/**
 * Calls the backend /api/generate endpoint.
 * Accepts an AbortSignal for stale-request protection.
 *
 * Returns the parsed JSON response on success.
 * Throws a descriptive Error on any failure.
 */
export async function generateStudySet(input, signal) {
  let res;

  try {
    res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input }),
      signal,
    });
  } catch (fetchErr) {
    // AbortError should propagate for stale-request handling
    if (fetchErr.name === 'AbortError') {
      throw fetchErr;
    }

    // Network-level failures (offline, DNS, CORS)
    throw new Error(ERROR_MESSAGES.network);
  }

  // ── HTTP error handling ─────────────────────────────────────────────
  if (!res.ok) {
    let serverError = {};
    try {
      serverError = await res.json();
    } catch {
      // Non-JSON error body — use status-based fallback
    }

    const errorType = serverError.errorType || '';
    const serverMessage = serverError.error || '';

    // Use errorType from server if available, otherwise map by status code
    if (errorType && ERROR_MESSAGES[errorType]) {
      throw new Error(ERROR_MESSAGES[errorType]);
    }

    // Fallback: map by HTTP status code
    switch (res.status) {
      case 400:
        throw new Error(serverMessage || 'Invalid input. Please check your study material.');
      case 401:
        throw new Error(ERROR_MESSAGES.config);
      case 429:
        throw new Error(ERROR_MESSAGES.rate_limit);
      case 502:
        throw new Error(ERROR_MESSAGES.ai_invalid);
      case 504:
        throw new Error(ERROR_MESSAGES.timeout);
      default:
        throw new Error(serverMessage || ERROR_MESSAGES.server);
    }
  }

  // ── Parse successful response ───────────────────────────────────────
  let data;
  try {
    data = await res.json();
  } catch {
    throw new Error('Server returned a response that could not be read. Please try again.');
  }

  return data;
}
