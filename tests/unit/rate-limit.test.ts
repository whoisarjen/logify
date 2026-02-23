import { describe, it, expect } from 'vitest'

// The rate limiter now uses PostgreSQL (atomic INSERT ... ON CONFLICT DO UPDATE).
// Unit tests require a database connection. Integration tests in tests/api/
// cover the full rate limiting flow via the logs endpoint.

describe('checkRateLimit', () => {
  it('exports the expected interface', async () => {
    const mod = await import('../../server/utils/rate-limit')
    expect(typeof mod.checkRateLimit).toBe('function')
    expect(typeof mod.cleanupRateLimits).toBe('function')
  })
})
