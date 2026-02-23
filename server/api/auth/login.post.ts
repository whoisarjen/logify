import { prisma } from '../../utils/db'
import {
  verifyPassword,
  createSession,
  setSessionCookie,
} from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  if (!body || typeof body !== 'object') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: 'Request body must be a JSON object.',
    })
  }

  const { email, password } = body

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

  if (!password || typeof password !== 'string') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: '"password" is required and must be a string.',
    })
  }

  // ---------------------------------------------------------------------------
  // Look up user
  // ---------------------------------------------------------------------------

  const normalizedEmail = email.toLowerCase().trim()

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  })

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
      message: 'Invalid email or password.',
    })
  }

  // ---------------------------------------------------------------------------
  // Verify password
  // ---------------------------------------------------------------------------

  const valid = await verifyPassword(password, user.passwordHash)

  if (!valid) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
      message: 'Invalid email or password.',
    })
  }

  // ---------------------------------------------------------------------------
  // Create session
  // ---------------------------------------------------------------------------

  const sessionToken = await createSession(user.id)
  setSessionCookie(event, sessionToken)

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    },
  }
})
