import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createEvent } from 'h3'
import { IncomingMessage, ServerResponse } from 'http'
import { Socket } from 'net'

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock('nanoid', () => ({
  nanoid: vi.fn(() => 'mock-key-id'),
}))

vi.mock('../../server/utils/db', () => ({
  prisma: {
    apiKey: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn().mockResolvedValue({}),
      update: vi.fn().mockResolvedValue({}),
    },
    project: {
      findFirst: vi.fn(),
    },
  },
}))

vi.mock('../../server/utils/auth', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../server/utils/auth')>()
  return {
    ...actual,
    requireAuth: vi.fn(),
  }
})

import { prisma } from '../../server/utils/db'
import { requireAuth } from '../../server/utils/auth'

const mockPrisma = vi.mocked(prisma)
const mockRequireAuth = vi.mocked(requireAuth)

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

function createTestEvent(options: {
  method?: string
  body?: unknown
  params?: Record<string, string>
  query?: Record<string, string>
} = {}) {
  const { method = 'GET', body, params = {} } = options

  const socket = new Socket()
  const req = new IncomingMessage(socket)
  req.method = method
  req.url = '/'

  if (body !== undefined) {
    req.headers['content-type'] = 'application/json'
  }

  const res = new ServerResponse(req)
  const event = createEvent(req, res)

  if (body !== undefined) {
    ;(event as any)._requestBody = body
  }

  // Set route params for [id] routes
  if (Object.keys(params).length > 0) {
    event.context.params = params
  }

  return event
}

const mockUser = {
  id: 'user-1',
  email: 'user@test.com',
  name: 'Test User',
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-02'),
}

// ---------------------------------------------------------------------------
// GET /api/keys
// ---------------------------------------------------------------------------

describe('GET /api/keys', () => {
  let handler: Function

  beforeEach(async () => {
    vi.clearAllMocks()
    mockRequireAuth.mockResolvedValue(mockUser)
    const mod = await import('../../server/api/keys/index.get')
    handler = mod.default
  })

  it('should return 401 when not authenticated', async () => {
    mockRequireAuth.mockRejectedValue(
      Object.assign(new Error('Unauthorized'), { statusCode: 401 }),
    )

    const event = createTestEvent()
    await expect(handler(event)).rejects.toMatchObject({ statusCode: 401 })
  })

  it('should return an empty list when user has no keys', async () => {
    mockPrisma.apiKey.findMany.mockResolvedValue([])

    const event = createTestEvent()
    const result = await handler(event)

    expect(result).toEqual({ keys: [] })
    expect(mockPrisma.apiKey.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: 'user-1' },
      }),
    )
  })

  it('should return formatted key list with isActive flag', async () => {
    const now = new Date('2025-06-01')
    const mockKeys = [
      {
        id: 'key-1',
        projectId: 'proj-1',
        name: 'Production',
        keyPrefix: 'lgfy_abc',
        lastUsedAt: now,
        createdAt: new Date('2025-01-01'),
        revokedAt: null,
      },
      {
        id: 'key-2',
        projectId: 'proj-1',
        name: 'Staging',
        keyPrefix: 'lgfy_def',
        lastUsedAt: null,
        createdAt: new Date('2025-02-01'),
        revokedAt: new Date('2025-03-01'),
      },
    ]

    mockPrisma.apiKey.findMany.mockResolvedValue(mockKeys as any)

    const event = createTestEvent()
    const result = await handler(event)

    expect(result.keys).toHaveLength(2)

    // Active key
    expect(result.keys[0]).toEqual({
      id: 'key-1',
      projectId: 'proj-1',
      name: 'Production',
      keyPrefix: 'lgfy_abc',
      lastUsedAt: now.toISOString(),
      createdAt: '2025-01-01T00:00:00.000Z',
      revokedAt: null,
      isActive: true,
    })

    // Revoked key
    expect(result.keys[1].isActive).toBe(false)
    expect(result.keys[1].revokedAt).toBe('2025-03-01T00:00:00.000Z')
  })

  it('should set lastUsedAt to null when key has never been used', async () => {
    mockPrisma.apiKey.findMany.mockResolvedValue([
      {
        id: 'key-1',
        projectId: 'proj-1',
        name: 'Unused',
        keyPrefix: 'lgfy_xxx',
        lastUsedAt: null,
        createdAt: new Date(),
        revokedAt: null,
      },
    ] as any)

    const event = createTestEvent()
    const result = await handler(event)

    expect(result.keys[0].lastUsedAt).toBeNull()
  })
})

// ---------------------------------------------------------------------------
// POST /api/keys
// ---------------------------------------------------------------------------

describe('POST /api/keys', () => {
  let handler: Function

  beforeEach(async () => {
    vi.clearAllMocks()
    mockRequireAuth.mockResolvedValue(mockUser)
    const mod = await import('../../server/api/keys/index.post')
    handler = mod.default
  })

  it('should return 401 when not authenticated', async () => {
    mockRequireAuth.mockRejectedValue(
      Object.assign(new Error('Unauthorized'), { statusCode: 401 }),
    )

    const event = createTestEvent({ method: 'POST', body: { name: 'Test', projectId: 'p-1' } })
    await expect(handler(event)).rejects.toMatchObject({ statusCode: 401 })
  })

  it('should reject when body is not a JSON object', async () => {
    const event = createTestEvent({ method: 'POST', body: null })

    await expect(handler(event)).rejects.toMatchObject({
      statusCode: 400,
      message: expect.stringContaining('JSON object'),
    })
  })

  it('should reject when name is missing', async () => {
    const event = createTestEvent({
      method: 'POST',
      body: { projectId: 'proj-1' },
    })

    await expect(handler(event)).rejects.toMatchObject({
      statusCode: 400,
      message: expect.stringContaining('name'),
    })
  })

  it('should reject when name is empty after trimming', async () => {
    const event = createTestEvent({
      method: 'POST',
      body: { name: '   ', projectId: 'proj-1' },
    })

    await expect(handler(event)).rejects.toMatchObject({
      statusCode: 400,
      message: expect.stringContaining('1 and 100'),
    })
  })

  it('should reject when name exceeds 100 characters', async () => {
    const event = createTestEvent({
      method: 'POST',
      body: { name: 'A'.repeat(101), projectId: 'proj-1' },
    })

    await expect(handler(event)).rejects.toMatchObject({
      statusCode: 400,
      message: expect.stringContaining('1 and 100'),
    })
  })

  it('should reject when projectId is missing', async () => {
    const event = createTestEvent({
      method: 'POST',
      body: { name: 'My Key' },
    })

    await expect(handler(event)).rejects.toMatchObject({
      statusCode: 400,
      message: expect.stringContaining('projectId'),
    })
  })

  it('should return 404 when project does not exist or user lacks access', async () => {
    mockPrisma.project.findFirst.mockResolvedValue(null)

    const event = createTestEvent({
      method: 'POST',
      body: { name: 'My Key', projectId: 'nonexistent' },
    })

    await expect(handler(event)).rejects.toMatchObject({
      statusCode: 404,
      message: expect.stringContaining('not found'),
    })
  })

  it('should verify project ownership with user id', async () => {
    mockPrisma.project.findFirst.mockResolvedValue(null)

    const event = createTestEvent({
      method: 'POST',
      body: { name: 'My Key', projectId: 'proj-1' },
    })

    try {
      await handler(event)
    } catch {
      // Expected
    }

    expect(mockPrisma.project.findFirst).toHaveBeenCalledWith({
      where: {
        id: 'proj-1',
        userId: 'user-1',
      },
      select: { id: true },
    })
  })

  it('should create an API key and return it with the full key on success', async () => {
    mockPrisma.project.findFirst.mockResolvedValue({ id: 'proj-1' } as any)
    mockPrisma.apiKey.create.mockResolvedValue({} as any)

    const event = createTestEvent({
      method: 'POST',
      body: { name: 'Production Key', projectId: 'proj-1' },
    })

    const result = await handler(event)

    expect(result).toHaveProperty('apiKey')
    expect(result.apiKey.name).toBe('Production Key')
    expect(result.apiKey.projectId).toBe('proj-1')
    expect(result.apiKey.key).toMatch(/^lgfy_/)
    expect(result.apiKey.prefix.length).toBe(12)
    expect(result.apiKey.createdAt).toBeDefined()

    // Verify prisma.apiKey.create was called
    expect(mockPrisma.apiKey.create).toHaveBeenCalledTimes(1)
    const createArg = mockPrisma.apiKey.create.mock.calls[0][0]
    expect(createArg.data.projectId).toBe('proj-1')
    expect(createArg.data.userId).toBe('user-1')
    expect(createArg.data.name).toBe('Production Key')
    expect(createArg.data.keyHash).toBeDefined()
    expect(typeof createArg.data.keyHash).toBe('string')
    expect(createArg.data.keyHash.length).toBe(64) // SHA-256 hex
  })

  it('should trim the name before storing', async () => {
    mockPrisma.project.findFirst.mockResolvedValue({ id: 'proj-1' } as any)

    const event = createTestEvent({
      method: 'POST',
      body: { name: '  Padded Name  ', projectId: 'proj-1' },
    })

    const result = await handler(event)

    expect(result.apiKey.name).toBe('Padded Name')
  })
})

// ---------------------------------------------------------------------------
// DELETE /api/keys/:id
// ---------------------------------------------------------------------------

describe('DELETE /api/keys/:id', () => {
  let handler: Function

  beforeEach(async () => {
    vi.clearAllMocks()
    mockRequireAuth.mockResolvedValue(mockUser)
    const mod = await import('../../server/api/keys/[id].delete')
    handler = mod.default
  })

  it('should return 401 when not authenticated', async () => {
    mockRequireAuth.mockRejectedValue(
      Object.assign(new Error('Unauthorized'), { statusCode: 401 }),
    )

    const event = createTestEvent({ method: 'DELETE', params: { id: 'key-1' } })
    await expect(handler(event)).rejects.toMatchObject({ statusCode: 401 })
  })

  it('should return 404 when key does not exist or user lacks access', async () => {
    mockPrisma.apiKey.findFirst.mockResolvedValue(null)

    const event = createTestEvent({ method: 'DELETE', params: { id: 'nonexistent' } })
    await expect(handler(event)).rejects.toMatchObject({
      statusCode: 404,
      message: expect.stringContaining('not found'),
    })
  })

  it('should verify ownership using both keyId and userId', async () => {
    mockPrisma.apiKey.findFirst.mockResolvedValue(null)

    const event = createTestEvent({ method: 'DELETE', params: { id: 'key-123' } })

    try {
      await handler(event)
    } catch {
      // Expected
    }

    expect(mockPrisma.apiKey.findFirst).toHaveBeenCalledWith({
      where: {
        id: 'key-123',
        userId: 'user-1',
      },
      select: {
        id: true,
        revokedAt: true,
      },
    })
  })

  it('should return 400 when key is already revoked', async () => {
    mockPrisma.apiKey.findFirst.mockResolvedValue({
      id: 'key-1',
      revokedAt: new Date('2025-01-01'),
    } as any)

    const event = createTestEvent({ method: 'DELETE', params: { id: 'key-1' } })

    await expect(handler(event)).rejects.toMatchObject({
      statusCode: 400,
      message: expect.stringContaining('already revoked'),
    })
  })

  it('should soft-delete (set revokedAt) and return success', async () => {
    mockPrisma.apiKey.findFirst.mockResolvedValue({
      id: 'key-1',
      revokedAt: null,
    } as any)
    mockPrisma.apiKey.update.mockResolvedValue({} as any)

    const event = createTestEvent({ method: 'DELETE', params: { id: 'key-1' } })
    const result = await handler(event)

    expect(result.success).toBe(true)
    expect(result.revokedAt).toBeDefined()

    expect(mockPrisma.apiKey.update).toHaveBeenCalledWith({
      where: { id: 'key-1' },
      data: { revokedAt: expect.any(Date) },
    })
  })

  it('should return the revokedAt timestamp as an ISO string', async () => {
    mockPrisma.apiKey.findFirst.mockResolvedValue({
      id: 'key-1',
      revokedAt: null,
    } as any)

    const event = createTestEvent({ method: 'DELETE', params: { id: 'key-1' } })
    const result = await handler(event)

    // Should be a valid ISO string
    const parsed = new Date(result.revokedAt)
    expect(isNaN(parsed.getTime())).toBe(false)
  })
})
