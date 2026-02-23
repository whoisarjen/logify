import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createEvent } from 'h3'
import { IncomingMessage, ServerResponse } from 'http'
import { Socket } from 'net'

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock('nanoid', () => ({
  nanoid: vi.fn(() => 'mock-log-id'),
}))

vi.mock('../../server/utils/db', () => ({
  prisma: {
    log: {
      create: vi.fn().mockResolvedValue({}),
      findMany: vi.fn(),
      count: vi.fn(),
      groupBy: vi.fn(),
    },
    project: {
      findFirst: vi.fn(),
    },
    apiKey: {
      findFirst: vi.fn(),
      update: vi.fn().mockResolvedValue({}),
    },
    $queryRaw: vi.fn(),
  },
}))

vi.mock('../../server/utils/auth', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../server/utils/auth')>()
  return {
    ...actual,
    requireAuth: vi.fn(),
    validateApiKey: vi.fn(),
  }
})

vi.mock('../../server/utils/rate-limit', () => ({
  checkRateLimit: vi.fn().mockReturnValue({
    allowed: true,
    remaining: 99,
    resetAt: Date.now() + 60_000,
  }),
}))

import { prisma } from '../../server/utils/db'
import { requireAuth, validateApiKey } from '../../server/utils/auth'
import { checkRateLimit } from '../../server/utils/rate-limit'

const mockPrisma = vi.mocked(prisma)
const mockRequireAuth = vi.mocked(requireAuth)
const mockValidateApiKey = vi.mocked(validateApiKey)
const mockCheckRateLimit = vi.mocked(checkRateLimit)

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

function createTestEvent(options: {
  method?: string
  body?: unknown
  headers?: Record<string, string>
  query?: Record<string, string>
} = {}) {
  const { method = 'GET', body, headers = {}, query = {} } = options

  const socket = new Socket()
  const req = new IncomingMessage(socket)
  req.method = method

  // Build URL with query parameters
  const params = new URLSearchParams(query)
  const qs = params.toString()
  req.url = qs ? `/?${qs}` : '/'

  for (const [key, value] of Object.entries(headers)) {
    req.headers[key.toLowerCase()] = value
  }

  if (body !== undefined) {
    req.headers['content-type'] = 'application/json'
  }

  const res = new ServerResponse(req)
  const event = createEvent(req, res)

  if (body !== undefined) {
    ;(event as any)._requestBody = body
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
// POST /api/v1/logs (log ingestion)
// ---------------------------------------------------------------------------

describe('POST /api/v1/logs', () => {
  let handler: Function

  beforeEach(async () => {
    vi.clearAllMocks()
    mockCheckRateLimit.mockReturnValue({
      allowed: true,
      remaining: 99,
      resetAt: Date.now() + 60_000,
    })
    const mod = await import('../../server/api/v1/logs.post')
    handler = mod.default
  })

  it('should return 401 when X-API-Key header is missing', async () => {
    const event = createTestEvent({ method: 'POST', body: {} })

    await expect(handler(event)).rejects.toMatchObject({
      statusCode: 401,
      message: expect.stringContaining('X-API-Key'),
    })
  })

  it('should return 401 when API key is invalid', async () => {
    mockValidateApiKey.mockResolvedValue(null)

    const event = createTestEvent({
      method: 'POST',
      headers: { 'x-api-key': 'lgfy_invalid' },
      body: {},
    })

    await expect(handler(event)).rejects.toMatchObject({
      statusCode: 401,
      message: expect.stringContaining('Invalid'),
    })
  })

  it('should return 429 when rate limit is exceeded', async () => {
    mockValidateApiKey.mockResolvedValue({
      projectId: 'proj-1',
      userId: 'user-1',
      keyId: 'key-1',
    })
    mockCheckRateLimit.mockReturnValue({
      allowed: false,
      remaining: 0,
      resetAt: Date.now() + 30_000,
    })

    const event = createTestEvent({
      method: 'POST',
      headers: { 'x-api-key': 'lgfy_validkey' },
      body: { level: 'info', message: 'test' },
    })

    await expect(handler(event)).rejects.toMatchObject({
      statusCode: 429,
    })
  })

  it('should reject when body is not a JSON object', async () => {
    mockValidateApiKey.mockResolvedValue({
      projectId: 'proj-1',
      userId: 'user-1',
      keyId: 'key-1',
    })

    const event = createTestEvent({
      method: 'POST',
      headers: { 'x-api-key': 'lgfy_validkey' },
      body: null,
    })

    await expect(handler(event)).rejects.toMatchObject({
      statusCode: 400,
      message: expect.stringContaining('JSON object'),
    })
  })

  it('should reject when level is missing', async () => {
    mockValidateApiKey.mockResolvedValue({
      projectId: 'proj-1',
      userId: 'user-1',
      keyId: 'key-1',
    })

    const event = createTestEvent({
      method: 'POST',
      headers: { 'x-api-key': 'lgfy_validkey' },
      body: { message: 'test' },
    })

    await expect(handler(event)).rejects.toMatchObject({
      statusCode: 400,
      message: expect.stringContaining('level'),
    })
  })

  it('should reject an invalid level', async () => {
    mockValidateApiKey.mockResolvedValue({
      projectId: 'proj-1',
      userId: 'user-1',
      keyId: 'key-1',
    })

    const event = createTestEvent({
      method: 'POST',
      headers: { 'x-api-key': 'lgfy_validkey' },
      body: { level: 'critical', message: 'test' },
    })

    await expect(handler(event)).rejects.toMatchObject({
      statusCode: 400,
      message: expect.stringContaining('level'),
    })
  })

  it('should accept all valid levels', async () => {
    const validLevels = ['debug', 'info', 'warn', 'error', 'fatal']

    for (const level of validLevels) {
      vi.clearAllMocks()
      mockValidateApiKey.mockResolvedValue({
        projectId: 'proj-1',
        userId: 'user-1',
        keyId: 'key-1',
      })
      mockCheckRateLimit.mockReturnValue({
        allowed: true,
        remaining: 99,
        resetAt: Date.now() + 60_000,
      })

      const event = createTestEvent({
        method: 'POST',
        headers: { 'x-api-key': 'lgfy_validkey' },
        body: { level, message: `Test ${level} message` },
      })

      const result = await handler(event)
      expect(result.success).toBe(true)
    }
  })

  it('should reject when message is missing', async () => {
    mockValidateApiKey.mockResolvedValue({
      projectId: 'proj-1',
      userId: 'user-1',
      keyId: 'key-1',
    })

    const event = createTestEvent({
      method: 'POST',
      headers: { 'x-api-key': 'lgfy_validkey' },
      body: { level: 'info' },
    })

    await expect(handler(event)).rejects.toMatchObject({
      statusCode: 400,
      message: expect.stringContaining('message'),
    })
  })

  it('should reject when an optional string field has a non-string value', async () => {
    mockValidateApiKey.mockResolvedValue({
      projectId: 'proj-1',
      userId: 'user-1',
      keyId: 'key-1',
    })

    const event = createTestEvent({
      method: 'POST',
      headers: { 'x-api-key': 'lgfy_validkey' },
      body: { level: 'info', message: 'test', service: 123 },
    })

    await expect(handler(event)).rejects.toMatchObject({
      statusCode: 400,
      message: expect.stringContaining('service'),
    })
  })

  it('should reject an invalid timestamp', async () => {
    mockValidateApiKey.mockResolvedValue({
      projectId: 'proj-1',
      userId: 'user-1',
      keyId: 'key-1',
    })

    const event = createTestEvent({
      method: 'POST',
      headers: { 'x-api-key': 'lgfy_validkey' },
      body: { level: 'info', message: 'test', timestamp: 'not-a-date' },
    })

    await expect(handler(event)).rejects.toMatchObject({
      statusCode: 400,
      message: expect.stringContaining('timestamp'),
    })
  })

  it('should reject when meta is not an object', async () => {
    mockValidateApiKey.mockResolvedValue({
      projectId: 'proj-1',
      userId: 'user-1',
      keyId: 'key-1',
    })

    const event = createTestEvent({
      method: 'POST',
      headers: { 'x-api-key': 'lgfy_validkey' },
      body: { level: 'info', message: 'test', meta: 'string-meta' },
    })

    await expect(handler(event)).rejects.toMatchObject({
      statusCode: 400,
      message: expect.stringContaining('meta'),
    })
  })

  it('should reject when tags is not an array of strings', async () => {
    mockValidateApiKey.mockResolvedValue({
      projectId: 'proj-1',
      userId: 'user-1',
      keyId: 'key-1',
    })

    const event = createTestEvent({
      method: 'POST',
      headers: { 'x-api-key': 'lgfy_validkey' },
      body: { level: 'info', message: 'test', tags: [1, 2, 3] },
    })

    await expect(handler(event)).rejects.toMatchObject({
      statusCode: 400,
      message: expect.stringContaining('tags'),
    })
  })

  it('should create a log entry on valid input and return logId', async () => {
    mockValidateApiKey.mockResolvedValue({
      projectId: 'proj-1',
      userId: 'user-1',
      keyId: 'key-1',
    })

    const event = createTestEvent({
      method: 'POST',
      headers: { 'x-api-key': 'lgfy_validkey' },
      body: {
        level: 'error',
        message: 'Something went wrong',
        service: 'auth-service',
        environment: 'production',
        meta: { statusCode: 500 },
        tags: ['backend', 'critical'],
      },
    })

    const result = await handler(event)

    expect(result.success).toBe(true)
    expect(result.logId).toBeDefined()

    expect(mockPrisma.log.create).toHaveBeenCalledTimes(1)
    const createArg = mockPrisma.log.create.mock.calls[0][0]
    expect(createArg.data.projectId).toBe('proj-1')
    expect(createArg.data.level).toBe('error')
    expect(createArg.data.message).toBe('Something went wrong')
    expect(createArg.data.service).toBe('auth-service')
    expect(createArg.data.environment).toBe('production')
    expect(createArg.data.meta).toEqual({ statusCode: 500 })
    expect(createArg.data.tags).toEqual(['backend', 'critical'])
  })

  it('should use provided timestamp when given a valid ISO string', async () => {
    mockValidateApiKey.mockResolvedValue({
      projectId: 'proj-1',
      userId: 'user-1',
      keyId: 'key-1',
    })

    const customTimestamp = '2025-06-15T10:30:00.000Z'

    const event = createTestEvent({
      method: 'POST',
      headers: { 'x-api-key': 'lgfy_validkey' },
      body: { level: 'info', message: 'test', timestamp: customTimestamp },
    })

    await handler(event)

    const createArg = mockPrisma.log.create.mock.calls[0][0]
    expect(createArg.data.timestamp).toEqual(new Date(customTimestamp))
  })

  it('should generate a timestamp when none is provided', async () => {
    mockValidateApiKey.mockResolvedValue({
      projectId: 'proj-1',
      userId: 'user-1',
      keyId: 'key-1',
    })

    const before = new Date()

    const event = createTestEvent({
      method: 'POST',
      headers: { 'x-api-key': 'lgfy_validkey' },
      body: { level: 'info', message: 'test' },
    })

    await handler(event)
    const after = new Date()

    const createArg = mockPrisma.log.create.mock.calls[0][0]
    const ts = createArg.data.timestamp as Date
    expect(ts.getTime()).toBeGreaterThanOrEqual(before.getTime())
    expect(ts.getTime()).toBeLessThanOrEqual(after.getTime())
  })

  it('should set optional fields to null when not provided', async () => {
    mockValidateApiKey.mockResolvedValue({
      projectId: 'proj-1',
      userId: 'user-1',
      keyId: 'key-1',
    })

    const event = createTestEvent({
      method: 'POST',
      headers: { 'x-api-key': 'lgfy_validkey' },
      body: { level: 'info', message: 'minimal log' },
    })

    await handler(event)

    const createArg = mockPrisma.log.create.mock.calls[0][0]
    expect(createArg.data.service).toBeNull()
    expect(createArg.data.environment).toBeNull()
    expect(createArg.data.traceId).toBeNull()
    expect(createArg.data.spanId).toBeNull()
    expect(createArg.data.requestId).toBeNull()
    expect(createArg.data.host).toBeNull()
  })

  it('should extract client IP from x-forwarded-for header', async () => {
    mockValidateApiKey.mockResolvedValue({
      projectId: 'proj-1',
      userId: 'user-1',
      keyId: 'key-1',
    })

    const event = createTestEvent({
      method: 'POST',
      headers: {
        'x-api-key': 'lgfy_validkey',
        'x-forwarded-for': '192.168.1.100, 10.0.0.1',
      },
      body: { level: 'info', message: 'test' },
    })

    await handler(event)

    const createArg = mockPrisma.log.create.mock.calls[0][0]
    expect(createArg.data.ip).toBe('192.168.1.100')
  })

  it('should pass rate limit identifier based on keyId', async () => {
    mockValidateApiKey.mockResolvedValue({
      projectId: 'proj-1',
      userId: 'user-1',
      keyId: 'key-abc',
    })

    const event = createTestEvent({
      method: 'POST',
      headers: { 'x-api-key': 'lgfy_validkey' },
      body: { level: 'info', message: 'test' },
    })

    await handler(event)

    expect(mockCheckRateLimit).toHaveBeenCalledWith('apikey:key-abc', 100, 60_000)
  })
})

// ---------------------------------------------------------------------------
// GET /api/logs
// ---------------------------------------------------------------------------

describe('GET /api/logs', () => {
  let handler: Function

  beforeEach(async () => {
    vi.clearAllMocks()
    mockRequireAuth.mockResolvedValue(mockUser)
    const mod = await import('../../server/api/logs/index.get')
    handler = mod.default
  })

  it('should return 401 when not authenticated', async () => {
    mockRequireAuth.mockRejectedValue(
      Object.assign(new Error('Unauthorized'), { statusCode: 401 }),
    )

    const event = createTestEvent({ query: { projectId: 'p-1' } })
    await expect(handler(event)).rejects.toMatchObject({ statusCode: 401 })
  })

  it('should require projectId query parameter', async () => {
    const event = createTestEvent()

    await expect(handler(event)).rejects.toMatchObject({
      statusCode: 400,
      message: expect.stringContaining('projectId'),
    })
  })

  it('should return 404 when project not found or user lacks access', async () => {
    mockPrisma.project.findFirst.mockResolvedValue(null)

    const event = createTestEvent({ query: { projectId: 'nonexistent' } })

    await expect(handler(event)).rejects.toMatchObject({
      statusCode: 404,
      message: expect.stringContaining('not found'),
    })
  })

  it('should return logs with pagination info', async () => {
    mockPrisma.project.findFirst.mockResolvedValue({ id: 'proj-1' } as any)

    const now = new Date()
    const mockLogs = [
      {
        id: 'log-1',
        projectId: 'proj-1',
        level: 'error',
        message: 'Error occurred',
        service: 'api',
        environment: 'production',
        timestamp: now,
        meta: { code: 500 },
        traceId: 'trace-1',
        spanId: 'span-1',
        userIdField: 'uid-1',
        requestId: 'req-1',
        host: 'server-1',
        tags: ['critical'],
        ip: '10.0.0.1',
        createdAt: now,
      },
    ]

    mockPrisma.log.findMany.mockResolvedValue(mockLogs as any)
    mockPrisma.log.count.mockResolvedValue(1)

    const event = createTestEvent({ query: { projectId: 'proj-1' } })
    const result = await handler(event)

    expect(result.logs).toHaveLength(1)
    expect(result.logs[0].id).toBe('log-1')
    expect(result.logs[0].level).toBe('error')
    expect(result.logs[0].timestamp).toBe(now.toISOString())
    expect(result.logs[0].meta).toEqual({ code: 500 })
    expect(result.logs[0].userId).toBe('uid-1') // mapped from userIdField

    expect(result.pagination).toEqual({
      total: 1,
      limit: 50,
      offset: 0,
      hasMore: false,
    })
  })

  it('should respect limit and offset parameters', async () => {
    mockPrisma.project.findFirst.mockResolvedValue({ id: 'proj-1' } as any)
    mockPrisma.log.findMany.mockResolvedValue([])
    mockPrisma.log.count.mockResolvedValue(100)

    const event = createTestEvent({
      query: { projectId: 'proj-1', limit: '10', offset: '20' },
    })

    const result = await handler(event)

    expect(mockPrisma.log.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        take: 10,
        skip: 20,
      }),
    )

    expect(result.pagination).toEqual({
      total: 100,
      limit: 10,
      offset: 20,
      hasMore: true,
    })
  })

  it('should cap limit at 200', async () => {
    mockPrisma.project.findFirst.mockResolvedValue({ id: 'proj-1' } as any)
    mockPrisma.log.findMany.mockResolvedValue([])
    mockPrisma.log.count.mockResolvedValue(0)

    const event = createTestEvent({
      query: { projectId: 'proj-1', limit: '500' },
    })

    await handler(event)

    expect(mockPrisma.log.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        take: 200,
      }),
    )
  })

  it('should reject invalid limit (non-positive)', async () => {
    mockPrisma.project.findFirst.mockResolvedValue({ id: 'proj-1' } as any)

    const event = createTestEvent({
      query: { projectId: 'proj-1', limit: '-1' },
    })

    await expect(handler(event)).rejects.toMatchObject({
      statusCode: 400,
      message: expect.stringContaining('limit'),
    })
  })

  it('should reject invalid offset (negative)', async () => {
    mockPrisma.project.findFirst.mockResolvedValue({ id: 'proj-1' } as any)

    const event = createTestEvent({
      query: { projectId: 'proj-1', offset: '-5' },
    })

    await expect(handler(event)).rejects.toMatchObject({
      statusCode: 400,
      message: expect.stringContaining('offset'),
    })
  })

  it('should filter by level (single)', async () => {
    mockPrisma.project.findFirst.mockResolvedValue({ id: 'proj-1' } as any)
    mockPrisma.log.findMany.mockResolvedValue([])
    mockPrisma.log.count.mockResolvedValue(0)

    const event = createTestEvent({
      query: { projectId: 'proj-1', level: 'error' },
    })

    await handler(event)

    expect(mockPrisma.log.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          level: 'error',
        }),
      }),
    )
  })

  it('should filter by multiple comma-separated levels', async () => {
    mockPrisma.project.findFirst.mockResolvedValue({ id: 'proj-1' } as any)
    mockPrisma.log.findMany.mockResolvedValue([])
    mockPrisma.log.count.mockResolvedValue(0)

    const event = createTestEvent({
      query: { projectId: 'proj-1', level: 'error,fatal' },
    })

    await handler(event)

    expect(mockPrisma.log.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          level: { in: ['error', 'fatal'] },
        }),
      }),
    )
  })

  it('should reject invalid level values', async () => {
    mockPrisma.project.findFirst.mockResolvedValue({ id: 'proj-1' } as any)

    const event = createTestEvent({
      query: { projectId: 'proj-1', level: 'invalid_level' },
    })

    await expect(handler(event)).rejects.toMatchObject({
      statusCode: 400,
      message: expect.stringContaining('Invalid level'),
    })
  })

  it('should filter by service', async () => {
    mockPrisma.project.findFirst.mockResolvedValue({ id: 'proj-1' } as any)
    mockPrisma.log.findMany.mockResolvedValue([])
    mockPrisma.log.count.mockResolvedValue(0)

    const event = createTestEvent({
      query: { projectId: 'proj-1', service: 'auth-service' },
    })

    await handler(event)

    expect(mockPrisma.log.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          service: 'auth-service',
        }),
      }),
    )
  })

  it('should filter by search (case-insensitive message contains)', async () => {
    mockPrisma.project.findFirst.mockResolvedValue({ id: 'proj-1' } as any)
    mockPrisma.log.findMany.mockResolvedValue([])
    mockPrisma.log.count.mockResolvedValue(0)

    const event = createTestEvent({
      query: { projectId: 'proj-1', search: 'connection timeout' },
    })

    await handler(event)

    expect(mockPrisma.log.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          message: { contains: 'connection timeout', mode: 'insensitive' },
        }),
      }),
    )
  })

  it('should filter by date range (from and to)', async () => {
    mockPrisma.project.findFirst.mockResolvedValue({ id: 'proj-1' } as any)
    mockPrisma.log.findMany.mockResolvedValue([])
    mockPrisma.log.count.mockResolvedValue(0)

    const from = '2025-01-01T00:00:00Z'
    const to = '2025-01-31T23:59:59Z'

    const event = createTestEvent({
      query: { projectId: 'proj-1', from, to },
    })

    await handler(event)

    expect(mockPrisma.log.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          timestamp: {
            gte: new Date(from),
            lte: new Date(to),
          },
        }),
      }),
    )
  })

  it('should reject invalid from date', async () => {
    mockPrisma.project.findFirst.mockResolvedValue({ id: 'proj-1' } as any)

    const event = createTestEvent({
      query: { projectId: 'proj-1', from: 'not-a-date' },
    })

    await expect(handler(event)).rejects.toMatchObject({
      statusCode: 400,
      message: expect.stringContaining('from'),
    })
  })

  it('should reject invalid to date', async () => {
    mockPrisma.project.findFirst.mockResolvedValue({ id: 'proj-1' } as any)

    const event = createTestEvent({
      query: { projectId: 'proj-1', to: 'not-a-date' },
    })

    await expect(handler(event)).rejects.toMatchObject({
      statusCode: 400,
      message: expect.stringContaining('to'),
    })
  })

  it('should order logs by timestamp descending', async () => {
    mockPrisma.project.findFirst.mockResolvedValue({ id: 'proj-1' } as any)
    mockPrisma.log.findMany.mockResolvedValue([])
    mockPrisma.log.count.mockResolvedValue(0)

    const event = createTestEvent({ query: { projectId: 'proj-1' } })
    await handler(event)

    expect(mockPrisma.log.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { timestamp: 'desc' },
      }),
    )
  })

  it('should set hasMore to false when all results are shown', async () => {
    mockPrisma.project.findFirst.mockResolvedValue({ id: 'proj-1' } as any)
    mockPrisma.log.findMany.mockResolvedValue([])
    mockPrisma.log.count.mockResolvedValue(10)

    const event = createTestEvent({
      query: { projectId: 'proj-1', limit: '50', offset: '0' },
    })

    const result = await handler(event)
    expect(result.pagination.hasMore).toBe(false)
  })

  it('should set hasMore to true when there are more results', async () => {
    mockPrisma.project.findFirst.mockResolvedValue({ id: 'proj-1' } as any)
    mockPrisma.log.findMany.mockResolvedValue([])
    mockPrisma.log.count.mockResolvedValue(100)

    const event = createTestEvent({
      query: { projectId: 'proj-1', limit: '10', offset: '0' },
    })

    const result = await handler(event)
    expect(result.pagination.hasMore).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// GET /api/logs/stats
// ---------------------------------------------------------------------------

describe('GET /api/logs/stats', () => {
  let handler: Function

  beforeEach(async () => {
    vi.clearAllMocks()
    mockRequireAuth.mockResolvedValue(mockUser)
    const mod = await import('../../server/api/logs/stats.get')
    handler = mod.default
  })

  it('should return 401 when not authenticated', async () => {
    mockRequireAuth.mockRejectedValue(
      Object.assign(new Error('Unauthorized'), { statusCode: 401 }),
    )

    const event = createTestEvent({ query: { projectId: 'p-1' } })
    await expect(handler(event)).rejects.toMatchObject({ statusCode: 401 })
  })

  it('should require projectId query parameter', async () => {
    const event = createTestEvent()

    await expect(handler(event)).rejects.toMatchObject({
      statusCode: 400,
      message: expect.stringContaining('projectId'),
    })
  })

  it('should return 404 when project not found', async () => {
    mockPrisma.project.findFirst.mockResolvedValue(null)

    const event = createTestEvent({ query: { projectId: 'nonexistent' } })

    await expect(handler(event)).rejects.toMatchObject({
      statusCode: 404,
    })
  })

  it('should return aggregated statistics', async () => {
    mockPrisma.project.findFirst.mockResolvedValue({ id: 'proj-1' } as any)
    mockPrisma.log.count.mockResolvedValue(150)

    mockPrisma.log.groupBy
      // byLevel
      .mockResolvedValueOnce([
        { level: 'info', _count: { _all: 100 } },
        { level: 'error', _count: { _all: 30 } },
        { level: 'warn', _count: { _all: 20 } },
      ] as any)
      // byService
      .mockResolvedValueOnce([
        { service: 'api', _count: { _all: 80 } },
        { service: 'worker', _count: { _all: 70 } },
      ] as any)
      // byEnvironment
      .mockResolvedValueOnce([
        { environment: 'production', _count: { _all: 120 } },
        { environment: 'staging', _count: { _all: 30 } },
      ] as any)

    mockPrisma.$queryRaw.mockResolvedValue([
      { hour: '2025-06-15T10:00:00Z', count: BigInt(25) },
      { hour: '2025-06-15T11:00:00Z', count: BigInt(30) },
    ] as any)

    const event = createTestEvent({ query: { projectId: 'proj-1' } })
    const result = await handler(event)

    expect(result.total).toBe(150)

    expect(result.byLevel).toEqual({
      info: 100,
      error: 30,
      warn: 20,
    })

    expect(result.byService).toEqual([
      { service: 'api', count: 80 },
      { service: 'worker', count: 70 },
    ])

    expect(result.byEnvironment).toEqual([
      { environment: 'production', count: 120 },
      { environment: 'staging', count: 30 },
    ])

    expect(result.recentActivity).toEqual([
      { hour: '2025-06-15T10:00:00Z', count: 25 },
      { hour: '2025-06-15T11:00:00Z', count: 30 },
    ])
  })

  it('should handle services with null names as "(none)"', async () => {
    mockPrisma.project.findFirst.mockResolvedValue({ id: 'proj-1' } as any)
    mockPrisma.log.count.mockResolvedValue(10)
    mockPrisma.log.groupBy
      .mockResolvedValueOnce([]) // byLevel
      .mockResolvedValueOnce([
        { service: null, _count: { _all: 10 } },
      ] as any)
      .mockResolvedValueOnce([]) // byEnvironment
    mockPrisma.$queryRaw.mockResolvedValue([])

    const event = createTestEvent({ query: { projectId: 'proj-1' } })
    const result = await handler(event)

    expect(result.byService).toEqual([
      { service: '(none)', count: 10 },
    ])
  })

  it('should handle environments with null names as "(none)"', async () => {
    mockPrisma.project.findFirst.mockResolvedValue({ id: 'proj-1' } as any)
    mockPrisma.log.count.mockResolvedValue(5)
    mockPrisma.log.groupBy
      .mockResolvedValueOnce([]) // byLevel
      .mockResolvedValueOnce([]) // byService
      .mockResolvedValueOnce([
        { environment: null, _count: { _all: 5 } },
      ] as any)
    mockPrisma.$queryRaw.mockResolvedValue([])

    const event = createTestEvent({ query: { projectId: 'proj-1' } })
    const result = await handler(event)

    expect(result.byEnvironment).toEqual([
      { environment: '(none)', count: 5 },
    ])
  })

  it('should convert BigInt counts from recentActivity to numbers', async () => {
    mockPrisma.project.findFirst.mockResolvedValue({ id: 'proj-1' } as any)
    mockPrisma.log.count.mockResolvedValue(0)
    mockPrisma.log.groupBy
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
    mockPrisma.$queryRaw.mockResolvedValue([
      { hour: '2025-06-15T12:00:00Z', count: BigInt(42) },
    ])

    const event = createTestEvent({ query: { projectId: 'proj-1' } })
    const result = await handler(event)

    expect(result.recentActivity[0].count).toBe(42)
    expect(typeof result.recentActivity[0].count).toBe('number')
  })

  it('should verify project ownership', async () => {
    mockPrisma.project.findFirst.mockResolvedValue(null)

    const event = createTestEvent({ query: { projectId: 'proj-999' } })

    try {
      await handler(event)
    } catch {
      // Expected
    }

    expect(mockPrisma.project.findFirst).toHaveBeenCalledWith({
      where: {
        id: 'proj-999',
        userId: 'user-1',
      },
      select: { id: true },
    })
  })
})
