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

import { prisma } from '../../server/utils/db'
import { requireAuth, createSession, setSessionCookie } from '../../server/utils/auth'

const mockPrisma = vi.mocked(prisma)
const mockRequireAuth = vi.mocked(requireAuth)
const mockCreateSession = vi.mocked(createSession)
const mockSetSessionCookie = vi.mocked(setSessionCookie)

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
// POST /api/auth/register
// ---------------------------------------------------------------------------

describe('POST /api/auth/register', () => {
  let handler: Function

  beforeEach(async () => {
    vi.clearAllMocks()
    // Dynamic import to get the default export (the defineEventHandler callback)
    const mod = await import('../../server/api/auth/register.post')
    handler = mod.default
  })

  it('should reject a request with no body', async () => {
    const event = createTestEvent({ body: null })

    await expect(handler(event)).rejects.toMatchObject({
      statusCode: 400,
      message: expect.stringContaining('JSON object'),
    })
  })

  it('should reject when email is missing', async () => {
    const event = createTestEvent({
      body: { password: 'securepass', name: 'Test' },
    })

    await expect(handler(event)).rejects.toMatchObject({
      statusCode: 400,
      message: expect.stringContaining('email'),
    })
  })

  it('should reject an invalid email format', async () => {
    const event = createTestEvent({
      body: { email: 'not-an-email', password: 'securepass', name: 'Test' },
    })

    await expect(handler(event)).rejects.toMatchObject({
      statusCode: 400,
      message: expect.stringContaining('Invalid email'),
    })
  })

  it('should reject when password is missing', async () => {
    const event = createTestEvent({
      body: { email: 'user@test.com', name: 'Test' },
    })

    await expect(handler(event)).rejects.toMatchObject({
      statusCode: 400,
      message: expect.stringContaining('password'),
    })
  })

  it('should reject a password shorter than 8 characters', async () => {
    const event = createTestEvent({
      body: { email: 'user@test.com', password: 'short', name: 'Test' },
    })

    await expect(handler(event)).rejects.toMatchObject({
      statusCode: 400,
      message: expect.stringContaining('8 characters'),
    })
  })

  it('should reject when name is missing', async () => {
    const event = createTestEvent({
      body: { email: 'user@test.com', password: 'securepass' },
    })

    await expect(handler(event)).rejects.toMatchObject({
      statusCode: 400,
      message: expect.stringContaining('name'),
    })
  })

  it('should reject an empty/whitespace-only name', async () => {
    const event = createTestEvent({
      body: { email: 'user@test.com', password: 'securepass', name: '   ' },
    })

    await expect(handler(event)).rejects.toMatchObject({
      statusCode: 400,
      message: expect.stringContaining('name'),
    })
  })

  it('should reject when a user with the same email already exists', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({ id: 'existing' } as any)

    const event = createTestEvent({
      body: { email: 'existing@test.com', password: 'securepass', name: 'Test' },
    })

    await expect(handler(event)).rejects.toMatchObject({
      statusCode: 409,
      message: expect.stringContaining('already exists'),
    })
  })

  it('should create user, project, API key, and session on valid registration', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null)
    mockPrisma.user.create.mockResolvedValue({} as any)
    mockPrisma.project.create.mockResolvedValue({} as any)
    mockPrisma.apiKey.create.mockResolvedValue({} as any)
    mockCreateSession.mockResolvedValue('session-token-abc')

    const event = createTestEvent({
      body: {
        email: 'NewUser@Test.COM',
        password: 'securepassword',
        name: 'Test User',
      },
    })

    const result = await handler(event)

    // Email should be normalized to lowercase
    expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: 'newuser@test.com' },
      select: { id: true },
    })

    // User created
    expect(mockPrisma.user.create).toHaveBeenCalledTimes(1)
    const userCreateArg = mockPrisma.user.create.mock.calls[0][0]
    expect(userCreateArg.data.email).toBe('newuser@test.com')
    expect(userCreateArg.data.name).toBe('Test User')

    // Project created
    expect(mockPrisma.project.create).toHaveBeenCalledTimes(1)
    const projectArg = mockPrisma.project.create.mock.calls[0][0]
    expect(projectArg.data.name).toBe('My Project')

    // API key created
    expect(mockPrisma.apiKey.create).toHaveBeenCalledTimes(1)

    // Session created and cookie set
    expect(mockCreateSession).toHaveBeenCalledTimes(1)
    expect(mockSetSessionCookie).toHaveBeenCalledTimes(1)

    // Response shape
    expect(result).toHaveProperty('user')
    expect(result).toHaveProperty('project')
    expect(result).toHaveProperty('apiKey')
    expect(result.user.email).toBe('newuser@test.com')
    expect(result.project.name).toBe('My Project')
    expect(result.apiKey).toHaveProperty('key')
    expect(result.apiKey).toHaveProperty('prefix')
  })

  it('should normalize email to lowercase and trim', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null)

    const event = createTestEvent({
      body: {
        email: '  UPPER@CASE.COM  ',
        password: 'securepassword',
        name: 'Test',
      },
    })

    await handler(event)

    expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: 'upper@case.com' },
      select: { id: true },
    })
  })
})

// ---------------------------------------------------------------------------
// POST /api/auth/login
// ---------------------------------------------------------------------------

describe('POST /api/auth/login', () => {
  let handler: Function

  beforeEach(async () => {
    vi.clearAllMocks()
    const mod = await import('../../server/api/auth/login.post')
    handler = mod.default
  })

  it('should reject a request with no body', async () => {
    const event = createTestEvent({ body: null })

    await expect(handler(event)).rejects.toMatchObject({
      statusCode: 400,
    })
  })

  it('should reject when email is missing', async () => {
    const event = createTestEvent({
      body: { password: 'securepass' },
    })

    await expect(handler(event)).rejects.toMatchObject({
      statusCode: 400,
      message: expect.stringContaining('email'),
    })
  })

  it('should reject when password is missing', async () => {
    const event = createTestEvent({
      body: { email: 'user@test.com' },
    })

    await expect(handler(event)).rejects.toMatchObject({
      statusCode: 400,
      message: expect.stringContaining('password'),
    })
  })

  it('should return 401 when user is not found', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null)

    const event = createTestEvent({
      body: { email: 'unknown@test.com', password: 'securepass' },
    })

    await expect(handler(event)).rejects.toMatchObject({
      statusCode: 401,
      message: expect.stringContaining('Invalid'),
    })
  })

  it('should return 401 when password is incorrect', async () => {
    // Hash a different password so that verifyPassword returns false
    const { hashPassword } = await import('../../server/utils/auth')
    const hashOfDifferentPassword = await hashPassword('differentpassword')

    mockPrisma.user.findUnique.mockResolvedValue({
      id: 'user-1',
      email: 'user@test.com',
      name: 'Test User',
      passwordHash: hashOfDifferentPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any)

    const event = createTestEvent({
      body: { email: 'user@test.com', password: 'wrongpassword' },
    })

    await expect(handler(event)).rejects.toMatchObject({
      statusCode: 401,
      message: expect.stringContaining('Invalid'),
    })
  })

  it('should return user info and set cookie on successful login', async () => {
    // Use real bcrypt to create a valid hash for the test
    const { hashPassword } = await import('../../server/utils/auth')
    const validHash = await hashPassword('correctpassword')

    const mockUser = {
      id: 'user-1',
      email: 'user@test.com',
      name: 'Test User',
      passwordHash: validHash,
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-02'),
    }

    mockPrisma.user.findUnique.mockResolvedValue(mockUser as any)
    mockCreateSession.mockResolvedValue('new-session-token')

    const event = createTestEvent({
      body: { email: 'user@test.com', password: 'correctpassword' },
    })

    const result = await handler(event)

    expect(result).toHaveProperty('user')
    expect(result.user.id).toBe('user-1')
    expect(result.user.email).toBe('user@test.com')
    expect(result.user.name).toBe('Test User')

    expect(mockCreateSession).toHaveBeenCalledWith('user-1')
    expect(mockSetSessionCookie).toHaveBeenCalledWith(event, 'new-session-token')
  })

  it('should normalize email for lookup', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null)

    const event = createTestEvent({
      body: { email: 'USER@Test.Com', password: 'securepass' },
    })

    try {
      await handler(event)
    } catch {
      // Expected 401
    }

    expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: 'user@test.com' },
    })
  })
})

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

  it('should return user data when authenticated', async () => {
    const mockUser = {
      id: 'user-1',
      email: 'user@test.com',
      name: 'Test User',
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
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-02T00:00:00.000Z',
      },
    })
  })

  it('should format dates as ISO strings', async () => {
    const now = new Date()
    mockRequireAuth.mockResolvedValue({
      id: 'u',
      email: 'e@e.com',
      name: 'N',
      createdAt: now,
      updatedAt: now,
    })

    const event = createTestEvent({ method: 'GET' })
    const result = await handler(event)

    expect(result.user.createdAt).toBe(now.toISOString())
    expect(result.user.updatedAt).toBe(now.toISOString())
  })
})
