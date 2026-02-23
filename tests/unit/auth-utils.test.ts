import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock the prisma client before importing auth utils
vi.mock('../../server/utils/db', () => ({
  prisma: {
    session: {
      create: vi.fn().mockResolvedValue({}),
      findUnique: vi.fn(),
      delete: vi.fn(),
    },
    apiKey: {
      findFirst: vi.fn(),
      update: vi.fn().mockResolvedValue({}),
    },
  },
}))

import {
  generateSessionToken,
  generateApiKey,
  hashApiKey,
  validateApiKey,
  createSession,
} from '../../server/utils/auth'
import { prisma } from '../../server/utils/db'

const mockPrisma = vi.mocked(prisma)

describe('Session token generation', () => {
  it('should generate a string token', () => {
    const token = generateSessionToken()

    expect(typeof token).toBe('string')
    expect(token.length).toBeGreaterThan(0)
  })

  it('should generate a token of 48 characters (nanoid length)', () => {
    const token = generateSessionToken()

    expect(token.length).toBe(48)
  })

  it('should generate unique tokens on each call', () => {
    const tokens = new Set<string>()
    for (let i = 0; i < 100; i++) {
      tokens.add(generateSessionToken())
    }

    expect(tokens.size).toBe(100)
  })
})

describe('API key generation', () => {
  it('should return an object with key and prefix', () => {
    const result = generateApiKey()

    expect(result).toHaveProperty('key')
    expect(result).toHaveProperty('prefix')
    expect(typeof result.key).toBe('string')
    expect(typeof result.prefix).toBe('string')
  })

  it('should generate a key starting with "lgfy_"', () => {
    const { key } = generateApiKey()

    expect(key.startsWith('lgfy_')).toBe(true)
  })

  it('should generate a key of expected length (lgfy_ + 40 chars = 45)', () => {
    const { key } = generateApiKey()

    expect(key.length).toBe(45) // "lgfy_" (5) + nanoid(40) = 45
  })

  it('should generate a prefix that is the first 12 characters of the key', () => {
    const { key, prefix } = generateApiKey()

    expect(prefix).toBe(key.slice(0, 12))
    expect(prefix.length).toBe(12)
  })

  it('should generate unique keys each time', () => {
    const keys = new Set<string>()
    for (let i = 0; i < 50; i++) {
      keys.add(generateApiKey().key)
    }

    expect(keys.size).toBe(50)
  })
})

describe('API key hashing', () => {
  it('should return a SHA-256 hex digest', () => {
    const hash = hashApiKey('lgfy_testkey123')

    expect(typeof hash).toBe('string')
    // SHA-256 hex is 64 characters
    expect(hash.length).toBe(64)
    expect(hash).toMatch(/^[0-9a-f]{64}$/)
  })

  it('should produce the same hash for the same input', () => {
    const key = 'lgfy_consistentkey'
    const hash1 = hashApiKey(key)
    const hash2 = hashApiKey(key)

    expect(hash1).toBe(hash2)
  })

  it('should produce different hashes for different keys', () => {
    const hash1 = hashApiKey('lgfy_key1')
    const hash2 = hashApiKey('lgfy_key2')

    expect(hash1).not.toBe(hash2)
  })
})

describe('createSession', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should create a session in the database and return the token', async () => {
    const userId = 'user-123'
    const token = await createSession(userId)

    expect(typeof token).toBe('string')
    expect(token.length).toBe(48)
    expect(mockPrisma.session.create).toHaveBeenCalledTimes(1)

    const createCall = mockPrisma.session.create.mock.calls[0][0]
    expect(createCall.data.userId).toBe(userId)
    expect(createCall.data.token).toBe(token)
    expect(createCall.data.expiresAt).toBeInstanceOf(Date)
    expect(createCall.data.createdAt).toBeInstanceOf(Date)
  })

  it('should set expiration 7 days in the future', async () => {
    const userId = 'user-456'
    const before = Date.now()
    await createSession(userId)
    const after = Date.now()

    const createCall = mockPrisma.session.create.mock.calls[0][0]
    const expiresAt = createCall.data.expiresAt as Date
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000

    expect(expiresAt.getTime()).toBeGreaterThanOrEqual(before + sevenDaysMs)
    expect(expiresAt.getTime()).toBeLessThanOrEqual(after + sevenDaysMs)
  })
})

describe('validateApiKey', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return null for a key that does not start with "lgfy_"', async () => {
    const result = await validateApiKey('invalid_key_format')

    expect(result).toBeNull()
    expect(mockPrisma.apiKey.findFirst).not.toHaveBeenCalled()
  })

  it('should return null for an empty string', async () => {
    const result = await validateApiKey('')

    expect(result).toBeNull()
  })

  it('should return null when no matching key is found in the database', async () => {
    mockPrisma.apiKey.findFirst.mockResolvedValue(null)

    const result = await validateApiKey('lgfy_unknownkey12345678901234567890')

    expect(result).toBeNull()
    expect(mockPrisma.apiKey.findFirst).toHaveBeenCalledTimes(1)
  })

  it('should return key info when a valid, non-revoked key is found', async () => {
    const mockApiKey = {
      id: 'key-id-1',
      projectId: 'project-1',
      userId: 'user-1',
    }
    mockPrisma.apiKey.findFirst.mockResolvedValue(mockApiKey as any)
    mockPrisma.apiKey.update.mockResolvedValue({} as any)

    const result = await validateApiKey('lgfy_validkey12345678901234567890123')

    expect(result).toEqual({
      projectId: 'project-1',
      userId: 'user-1',
      keyId: 'key-id-1',
    })
  })

  it('should query using the SHA-256 hash of the key', async () => {
    const key = 'lgfy_specifickey123456789012345678901'
    const expectedHash = hashApiKey(key)

    mockPrisma.apiKey.findFirst.mockResolvedValue(null)

    await validateApiKey(key)

    expect(mockPrisma.apiKey.findFirst).toHaveBeenCalledWith({
      where: {
        keyHash: expectedHash,
        revokedAt: null,
      },
      select: {
        id: true,
        projectId: true,
        userId: true,
      },
    })
  })

  it('should fire-and-forget update lastUsedAt on successful validation', async () => {
    const mockApiKey = {
      id: 'key-update-test',
      projectId: 'project-1',
      userId: 'user-1',
    }
    mockPrisma.apiKey.findFirst.mockResolvedValue(mockApiKey as any)
    mockPrisma.apiKey.update.mockResolvedValue({} as any)

    await validateApiKey('lgfy_updatetest12345678901234567890')

    // The update is fire-and-forget, so it may be called asynchronously
    // We can at least check the mock was set up to be called
    expect(mockPrisma.apiKey.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'key-update-test' },
        data: { lastUsedAt: expect.any(Date) },
      }),
    )
  })
})
