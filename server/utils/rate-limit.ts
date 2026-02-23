// NOTE: On Vercel serverless, this in-memory store only persists within a
// single warm function instance. It provides basic burst protection but won't
// prevent distributed abuse across cold starts. Acceptable for free tier.

interface RateLimitEntry {
  count: number
  resetAt: number
}

const store = new Map<string, RateLimitEntry>()

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetAt: number
}

/**
 * Check whether a request from `identifier` is allowed under the given limits.
 *
 * @param identifier  Unique key (e.g. IP address, API key hash)
 * @param limit       Maximum number of requests in the window
 * @param windowMs    Window duration in milliseconds
 */
export function checkRateLimit(
  identifier: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now()
  const entry = store.get(identifier)

  // First request or window expired -> reset
  if (!entry || entry.resetAt <= now) {
    const resetAt = now + windowMs
    store.set(identifier, { count: 1, resetAt })
    return { allowed: true, remaining: limit - 1, resetAt }
  }

  // Within window
  if (entry.count < limit) {
    entry.count++
    return { allowed: true, remaining: limit - entry.count, resetAt: entry.resetAt }
  }

  // Over limit
  return { allowed: false, remaining: 0, resetAt: entry.resetAt }
}
