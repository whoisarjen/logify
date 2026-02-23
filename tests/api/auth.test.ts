import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createEvent } from 'h3'
import { IncomingMessage, ServerResponse } from 'http'
import { Socket } from 'net'

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

// Mock nanoid so IDs are predictable
vi.mock('nanoid', () => ({
  nanoid: vi.fn(() => 'mock-nanoid-id'),
}))

// Mock the Prisma client
vi.mock('../../server/utils/db', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn().mockResolvedValue({}),
    },
    project: {
      create: vi.fn().mockResolvedValue({}),
    },
    apiKey: {
      create: vi.fn().mockResolvedValue({}),
    },
    session: {
      create: vi.fn().mockResolvedValue({}),
      findUnique: vi.fn(),
      delete: vi.fn(),
    },
  },
}))

// Mock auth utils partially -- keep real implementations for pure functions,
// mock DB-dependent ones
vi.mock('../../server/utils/auth', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../server/utils/auth')>()
  return {
    ...actual,
    createSession: vi.fn().mockResolvedValue('mock-session-token'),
    setSessionCookie: vi.fn(),
    requireAuth: vi.fn(),
    getSessionUser: vi.fn(),
  }
})

import { requireAuth } from '../../server/utils/auth'

const mockRequireAuth = vi.mocked(requireAuth)

// ---------------------------------------------------------------------------
// Helper: create a minimal H3-compatible event with a JSON body
// ---------------------------------------------------------------------------

function createTestEvent(options: {
  method?: string
  body?: unknown
  headers?: Record<string, string>
  cookies?: Record<string, string>
} = {}) {
  const { method = 'POST', body, headers = {}, cookies = {} } = options

  const socket = new Socket()
  const req = new IncomingMessage(socket)
  req.method = method
  req.url = '/'

  // Set headers
  for (const [key, value] of Object.entries(headers)) {
    req.headers[key.toLowerCase()] = value
  }

  // Build cookie header
  if (Object.keys(cookies).length > 0) {
    req.headers.cookie = Object.entries(cookies)
      .map(([k, v]) => `${k}=${v}`)
      .join('; ')
  }

  if (body !== undefined) {
    req.headers['content-type'] = 'application/json'
  }

  const res = new ServerResponse(req)
  const event = createEvent(req, res)

  // Patch _body so readBody() returns our object
  // h3's readBody reads from the internal _requestBody or the raw stream.
  // For testing we attach the parsed body directly.
  ;(event as any)._requestBody = body

  return event
}

// ---------------------------------------------------------------------------
// GET /api/auth/me
// ---------------------------------------------------------------------------

describe('GET /api/auth/me', () => {
  let handler: Function

  beforeEach(async () => {
    vi.clearAllMocks()
    const mod = await import('../../server/api/auth/me.get')
    handler = mod.default
  })

  it('should return 401 when not authenticated', async () => {
    mockRequireAuth.mockRejectedValue(
      Object.assign(new Error('Unauthorized'), {
        statusCode: 401,
        statusMessage: 'Unauthorized',
      }),
    )

    const event = createTestEvent({ method: 'GET' })

    await expect(handler(event)).rejects.toMatchObject({
      statusCode: 401,
    })
  })

  it('should return user data with avatar when authenticated', async () => {
    const mockUser = {
      id: 'user-1',
      email: 'user@test.com',
      name: 'Test User',
      avatar: 'https://lh3.googleusercontent.com/photo.jpg',
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-02'),
    }

    mockRequireAuth.mockResolvedValue(mockUser)

    const event = createTestEvent({ method: 'GET' })
    const result = await handler(event)

    expect(result).toEqual({
      user: {
        id: 'user-1',
        email: 'user@test.com',
        name: 'Test User',
        avatar: 'https://lh3.googleusercontent.com/photo.jpg',
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-02T00:00:00.000Z',
      },
    })
  })

  it('should return null avatar when user has no avatar', async () => {
    const mockUser = {
      id: 'user-2',
      email: 'noavatar@test.com',
      name: 'No Avatar User',
      avatar: null,
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-02'),
    }

    mockRequireAuth.mockResolvedValue(mockUser)

    const event = createTestEvent({ method: 'GET' })
    const result = await handler(event)

    expect(result.user.avatar).toBeNull()
  })

  it('should format dates as ISO strings', async () => {
    const now = new Date()
    mockRequireAuth.mockResolvedValue({
      id: 'u',
      email: 'e@e.com',
      name: 'N',
      avatar: null,
      createdAt: now,
      updatedAt: now,
    })

    const event = createTestEvent({ method: 'GET' })
    const result = await handler(event)

    expect(result.user.createdAt).toBe(now.toISOString())
    expect(result.user.updatedAt).toBe(now.toISOString())
  })
})
