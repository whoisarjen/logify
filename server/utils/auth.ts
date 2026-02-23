import { nanoid } from 'nanoid'
import { createHash } from 'crypto'
import type { H3Event } from 'h3'
import { prisma } from './db'

const SESSION_COOKIE_NAME = 'logify_session'
const SESSION_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

// ---------------------------------------------------------------------------
// Session tokens
// ---------------------------------------------------------------------------

export function generateSessionToken(): string {
  return nanoid(48)
}

// ---------------------------------------------------------------------------
// API key generation & hashing
// ---------------------------------------------------------------------------

export function generateApiKey(): { key: string; prefix: string } {
  const raw = nanoid(40)
  const key = `lgfy_${raw}`
  const prefix = key.slice(0, 12) // "lgfy_" + first 7 chars of raw
  return { key, prefix }
}

export function hashApiKey(key: string): string {
  return createHash('sha256').update(key).digest('hex')
}

// ---------------------------------------------------------------------------
// API key validation (for log ingestion)
// ---------------------------------------------------------------------------

export async function validateApiKey(key: string): Promise<{
  projectId: string
  userId: string
  keyId: string
} | null> {
  if (!key || !key.startsWith('lgfy_')) {
    return null
  }

  const keyHash = hashApiKey(key)

  const apiKey = await prisma.apiKey.findFirst({
    where: {
      keyHash,
      revokedAt: null,
    },
    select: {
      id: true,
      projectId: true,
      userId: true,
    },
  })

  if (!apiKey) {
    return null
  }

  // Update lastUsedAt in the background (fire-and-forget)
  prisma.apiKey.update({
    where: { id: apiKey.id },
    data: { lastUsedAt: new Date() },
  }).then(() => {})

  return {
    projectId: apiKey.projectId,
    userId: apiKey.userId,
    keyId: apiKey.id,
  }
}

// ---------------------------------------------------------------------------
// Session management
// ---------------------------------------------------------------------------

export async function createSession(userId: string): Promise<string> {
  const token = generateSessionToken()
  const now = new Date()
  const expiresAt = new Date(now.getTime() + SESSION_MAX_AGE_MS)

  await prisma.session.create({
    data: {
      id: nanoid(),
      userId,
      token,
      expiresAt,
      createdAt: now,
    },
  })

  return token
}

export async function getSessionUser(event: H3Event): Promise<{
  id: string
  email: string
  name: string
  avatar: string | null
  createdAt: Date
  updatedAt: Date
} | null> {
  const token = getCookie(event, SESSION_COOKIE_NAME)

  if (!token) {
    return null
  }

  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  })

  if (!session) {
    return null
  }

  // Check expiration
  if (session.expiresAt < new Date()) {
    // Clean up expired session
    await prisma.session.delete({ where: { id: session.id } })
    return null
  }

  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    avatar: session.user.avatar,
    createdAt: session.user.createdAt,
    updatedAt: session.user.updatedAt,
  }
}

export function setSessionCookie(event: H3Event, token: string): void {
  setCookie(event, SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE_MS / 1000, // seconds
    path: '/',
  })
}

export function clearSessionCookie(event: H3Event): void {
  deleteCookie(event, SESSION_COOKIE_NAME, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  })
}

// ---------------------------------------------------------------------------
// Auth guard helper
// ---------------------------------------------------------------------------

export async function requireAuth(event: H3Event) {
  const user = await getSessionUser(event)

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
      message: 'You must be logged in to access this resource.',
    })
  }

  return user
}
