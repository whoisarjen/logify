import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'

// We need to reset the internal store between tests.
// Since the store is module-scoped, we re-import a fresh copy for isolation
// by using vi.resetModules() and dynamic import.

describe('checkRateLimit', () => {
  let rateLimiter: typeof import('../../server/utils/rate-limit')

  beforeEach(async () => {
    vi.useFakeTimers()
    vi.resetModules()
    rateLimiter = await import('../../server/utils/rate-limit')
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should allow the first request and return correct remaining count', () => {
    const result = rateLimiter.checkRateLimit('test-key', 10, 60_000)

    expect(result.allowed).toBe(true)
    expect(result.remaining).toBe(9)
    expect(result.resetAt).toBeGreaterThan(Date.now())
  })

  it('should decrement remaining count with each request', () => {
    const limit = 5
    const windowMs = 60_000

    const r1 = rateLimiter.checkRateLimit('counter-key', limit, windowMs)
    expect(r1.remaining).toBe(4)

    const r2 = rateLimiter.checkRateLimit('counter-key', limit, windowMs)
    expect(r2.remaining).toBe(3)

    const r3 = rateLimiter.checkRateLimit('counter-key', limit, windowMs)
    expect(r3.remaining).toBe(2)
  })

  it('should deny requests once the limit is reached', () => {
    const limit = 3
    const windowMs = 60_000

    // Exhaust the limit
    rateLimiter.checkRateLimit('deny-key', limit, windowMs)
    rateLimiter.checkRateLimit('deny-key', limit, windowMs)
    rateLimiter.checkRateLimit('deny-key', limit, windowMs)

    // Fourth request should be denied
    const result = rateLimiter.checkRateLimit('deny-key', limit, windowMs)
    expect(result.allowed).toBe(false)
    expect(result.remaining).toBe(0)
  })

  it('should keep denying after limit is exceeded', () => {
    const limit = 2
    const windowMs = 60_000

    rateLimiter.checkRateLimit('persist-key', limit, windowMs)
    rateLimiter.checkRateLimit('persist-key', limit, windowMs)

    // Multiple requests past the limit should all be denied
    const r1 = rateLimiter.checkRateLimit('persist-key', limit, windowMs)
    const r2 = rateLimiter.checkRateLimit('persist-key', limit, windowMs)

    expect(r1.allowed).toBe(false)
    expect(r2.allowed).toBe(false)
    expect(r1.remaining).toBe(0)
    expect(r2.remaining).toBe(0)
  })

  it('should reset the window after it expires', () => {
    const limit = 2
    const windowMs = 60_000

    // Exhaust the limit
    rateLimiter.checkRateLimit('expire-key', limit, windowMs)
    rateLimiter.checkRateLimit('expire-key', limit, windowMs)

    const denied = rateLimiter.checkRateLimit('expire-key', limit, windowMs)
    expect(denied.allowed).toBe(false)

    // Advance time past the window
    vi.advanceTimersByTime(windowMs + 1)

    // Should be allowed again
    const result = rateLimiter.checkRateLimit('expire-key', limit, windowMs)
    expect(result.allowed).toBe(true)
    expect(result.remaining).toBe(1)
  })

  it('should track different identifiers independently', () => {
    const limit = 2
    const windowMs = 60_000

    // Exhaust limit for key-a
    rateLimiter.checkRateLimit('key-a', limit, windowMs)
    rateLimiter.checkRateLimit('key-a', limit, windowMs)
    const deniedA = rateLimiter.checkRateLimit('key-a', limit, windowMs)
    expect(deniedA.allowed).toBe(false)

    // key-b should still be allowed
    const resultB = rateLimiter.checkRateLimit('key-b', limit, windowMs)
    expect(resultB.allowed).toBe(true)
    expect(resultB.remaining).toBe(1)
  })

  it('should return a resetAt timestamp in the future', () => {
    const windowMs = 30_000
    const now = Date.now()

    const result = rateLimiter.checkRateLimit('reset-key', 10, windowMs)

    expect(result.resetAt).toBeGreaterThanOrEqual(now + windowMs)
  })

  it('should return consistent resetAt within the same window', () => {
    const limit = 10
    const windowMs = 60_000

    const r1 = rateLimiter.checkRateLimit('consistent-key', limit, windowMs)
    const r2 = rateLimiter.checkRateLimit('consistent-key', limit, windowMs)
    const r3 = rateLimiter.checkRateLimit('consistent-key', limit, windowMs)

    expect(r1.resetAt).toBe(r2.resetAt)
    expect(r2.resetAt).toBe(r3.resetAt)
  })

  it('should handle a limit of 1 correctly', () => {
    const result1 = rateLimiter.checkRateLimit('single-key', 1, 60_000)
    expect(result1.allowed).toBe(true)
    expect(result1.remaining).toBe(0)

    const result2 = rateLimiter.checkRateLimit('single-key', 1, 60_000)
    expect(result2.allowed).toBe(false)
    expect(result2.remaining).toBe(0)
  })

  it('should handle very short windows', () => {
    const limit = 5
    const windowMs = 100 // 100ms window

    // Use up the limit
    for (let i = 0; i < limit; i++) {
      rateLimiter.checkRateLimit('short-window', limit, windowMs)
    }

    const denied = rateLimiter.checkRateLimit('short-window', limit, windowMs)
    expect(denied.allowed).toBe(false)

    // Advance past the window
    vi.advanceTimersByTime(101)

    const allowed = rateLimiter.checkRateLimit('short-window', limit, windowMs)
    expect(allowed.allowed).toBe(true)
  })
})
