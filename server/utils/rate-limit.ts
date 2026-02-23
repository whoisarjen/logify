import { prisma } from './db'

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetAt: number
}

/**
 * Check and increment the rate limit counter for `identifier`.
 *
 * Uses a fixed-window algorithm backed by PostgreSQL. The check+increment
 * is performed in a single atomic INSERT ... ON CONFLICT DO UPDATE query
 * so there are no race conditions across serverless invocations.
 */
export async function checkRateLimit(
  identifier: string,
  limit: number,
  windowMs: number,
): Promise<RateLimitResult> {
  const now = Date.now()
  const windowStartMs = Math.floor(now / windowMs) * windowMs
  const windowStart = new Date(windowStartMs)
  const resetAt = windowStartMs + windowMs

  const result = await prisma.$queryRaw<Array<{ count: number }>>`
    INSERT INTO rate_limits (identifier, count, window_start)
    VALUES (${identifier}, 1, ${windowStart})
    ON CONFLICT (identifier) DO UPDATE SET
      count = CASE
        WHEN rate_limits.window_start = ${windowStart}
        THEN rate_limits.count + 1
        ELSE 1
      END,
      window_start = ${windowStart}
    RETURNING count
  `

  const count = result[0].count
  const allowed = count <= limit
  const remaining = Math.max(0, limit - count)

  return { allowed, remaining, resetAt }
}

/**
 * Remove stale rate limit entries older than maxAgeMs.
 */
export async function cleanupRateLimits(maxAgeMs: number = 5 * 60 * 1000): Promise<number> {
  const cutoff = new Date(Date.now() - maxAgeMs)
  return prisma.$executeRaw`
    DELETE FROM rate_limits WHERE window_start < ${cutoff}
  `
}
