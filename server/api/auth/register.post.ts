import { nanoid } from 'nanoid'
import { prisma } from '../../utils/db'
import {
  hashPassword,
  generateApiKey,
  hashApiKey,
  createSession,
  setSessionCookie,
} from '../../utils/auth'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  if (!body || typeof body !== 'object') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: 'Request body must be a JSON object.',
    })
  }

  const { email, password, name } = body

  // ---------------------------------------------------------------------------
  // Validation
  // ---------------------------------------------------------------------------

  if (!email || typeof email !== 'string') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: '"email" is required and must be a string.',
    })
  }

  const normalizedEmail = email.toLowerCase().trim()

  if (!EMAIL_REGEX.test(normalizedEmail)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: 'Invalid email address format.',
    })
  }

  if (!password || typeof password !== 'string') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: '"password" is required and must be a string.',
    })
  }

  if (password.length < 8) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: 'Password must be at least 8 characters long.',
    })
  }

  if (!name || typeof name !== 'string') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: '"name" is required and must be a string.',
    })
  }

  const trimmedName = name.trim()
  if (trimmedName.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: '"name" cannot be empty.',
    })
  }

  // ---------------------------------------------------------------------------
  // Check uniqueness
  // ---------------------------------------------------------------------------

  const existing = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: { id: true },
  })

  if (existing) {
    throw createError({
      statusCode: 409,
      statusMessage: 'Conflict',
      message: 'A user with this email already exists.',
    })
  }

  // ---------------------------------------------------------------------------
  // Create user
  // ---------------------------------------------------------------------------

  const now = new Date()
  const userId = nanoid()
  const passwordHash = await hashPassword(password)

  await prisma.user.create({
    data: {
      id: userId,
      email: normalizedEmail,
      name: trimmedName,
      passwordHash,
      createdAt: now,
      updatedAt: now,
    },
  })

  // ---------------------------------------------------------------------------
  // Create default project
  // ---------------------------------------------------------------------------

  const projectId = nanoid()

  await prisma.project.create({
    data: {
      id: projectId,
      userId,
      name: 'My Project',
      createdAt: now,
    },
  })

  // ---------------------------------------------------------------------------
  // Generate first API key
  // ---------------------------------------------------------------------------

  const { key, prefix } = generateApiKey()
  const keyHash = hashApiKey(key)
  const apiKeyId = nanoid()

  await prisma.apiKey.create({
    data: {
      id: apiKeyId,
      projectId,
      userId,
      name: 'Default',
      keyHash,
      keyPrefix: prefix,
      createdAt: now,
    },
  })

  // ---------------------------------------------------------------------------
  // Create session
  // ---------------------------------------------------------------------------

  const sessionToken = await createSession(userId)
  setSessionCookie(event, sessionToken)

  setResponseStatus(event, 201)

  return {
    user: {
      id: userId,
      email: normalizedEmail,
      name: trimmedName,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    },
    project: {
      id: projectId,
      name: 'My Project',
    },
    apiKey: {
      id: apiKeyId,
      key, // Full key shown only on creation
      prefix,
      name: 'Default',
    },
  }
})
