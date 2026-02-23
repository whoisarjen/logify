import { nanoid } from 'nanoid'
import { validateApiKey } from '../../utils/auth'
import { checkRateLimit } from '../../utils/rate-limit'
import { prisma } from '../../utils/db'
import { FREE_TIER, getMonthlyLogCount } from '../../utils/free-tier'

const VALID_LEVELS = ['debug', 'info', 'warn', 'error', 'fatal'] as const

const RATE_LIMIT = 500 // requests
const RATE_WINDOW_MS = 86_400_000 // 24 hours

export default defineEventHandler(async (event) => {
  // ---------------------------------------------------------------------------
  // 1. Authenticate via X-API-Key header
  // ---------------------------------------------------------------------------
  const apiKey = getHeader(event, 'x-api-key')

  if (!apiKey) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
      message: 'Missing X-API-Key header.',
    })
  }

  const keyInfo = await validateApiKey(apiKey)

  if (!keyInfo) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
      message: 'Invalid or revoked API key.',
    })
  }

  // ---------------------------------------------------------------------------
  // 2. Rate limiting (per API key)
  // ---------------------------------------------------------------------------
  const rateLimitResult = await checkRateLimit(`apikey:${keyInfo.keyId}`, RATE_LIMIT, RATE_WINDOW_MS)

  setHeader(event, 'X-RateLimit-Limit', String(RATE_LIMIT))
  setHeader(event, 'X-RateLimit-Remaining', String(rateLimitResult.remaining))
  setHeader(event, 'X-RateLimit-Reset', String(Math.ceil(rateLimitResult.resetAt / 1000)))

  if (!rateLimitResult.allowed) {
    throw createError({
      statusCode: 429,
      statusMessage: 'Too Many Requests',
      message: `Rate limit exceeded. Try again after ${new Date(rateLimitResult.resetAt).toISOString()}.`,
    })
  }

  // ---------------------------------------------------------------------------
  // 3. Free tier log limit
  // ---------------------------------------------------------------------------
  const monthlyCount = await getMonthlyLogCount(keyInfo.projectId)

  setHeader(event, 'X-Logify-Monthly-Limit', String(FREE_TIER.MONTHLY_LOG_LIMIT))
  setHeader(event, 'X-Logify-Monthly-Used', String(monthlyCount))

  if (monthlyCount >= FREE_TIER.MONTHLY_LOG_LIMIT) {
    throw createError({
      statusCode: 429,
      statusMessage: 'Too Many Requests',
      message: `Monthly log limit reached (${FREE_TIER.MONTHLY_LOG_LIMIT.toLocaleString()}). Upgrade your plan for higher limits.`,
    })
  }

  // ---------------------------------------------------------------------------
  // 4. Parse and validate request body
  // ---------------------------------------------------------------------------
  const body = await readBody(event)

  if (!body || typeof body !== 'object') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: 'Request body must be a JSON object.',
    })
  }

  const { level, message, service, environment, timestamp, meta, traceId, spanId, userId, requestId, host, tags } = body

  // level - required, must be a valid enum
  if (!level || !VALID_LEVELS.includes(level)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: `"level" is required and must be one of: ${VALID_LEVELS.join(', ')}.`,
    })
  }

  // message - required, must be a string
  if (!message || typeof message !== 'string') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: '"message" is required and must be a string.',
    })
  }

  // Validate optional string fields
  const optionalStrings: Record<string, unknown> = { service, environment, traceId, spanId, userId, requestId, host }
  for (const [fieldName, value] of Object.entries(optionalStrings)) {
    if (value !== undefined && value !== null && typeof value !== 'string') {
      throw createError({
        statusCode: 400,
        statusMessage: 'Bad Request',
        message: `"${fieldName}" must be a string if provided.`,
      })
    }
  }

  // Validate timestamp (if provided)
  let logTimestamp: Date
  if (timestamp !== undefined && timestamp !== null) {
    const parsed = new Date(timestamp)
    if (isNaN(parsed.getTime())) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Bad Request',
        message: '"timestamp" must be a valid ISO 8601 date string or Unix timestamp.',
      })
    }
    logTimestamp = parsed
  } else {
    logTimestamp = new Date()
  }

  // Validate meta (if provided, must be an object)
  if (meta !== undefined && meta !== null && typeof meta !== 'object') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: '"meta" must be an object if provided.',
    })
  }

  // Validate tags (if provided, must be an array of strings)
  if (tags !== undefined && tags !== null) {
    if (!Array.isArray(tags) || !tags.every((t: unknown) => typeof t === 'string')) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Bad Request',
        message: '"tags" must be an array of strings if provided.',
      })
    }
  }

  // ---------------------------------------------------------------------------
  // 5. Insert log entry
  // ---------------------------------------------------------------------------
  const logId = nanoid()
  const now = new Date()

  // Resolve client IP for the log record
  const clientIp = getHeader(event, 'x-forwarded-for')?.split(',')[0]?.trim()
    || getHeader(event, 'x-real-ip')
    || null

  await prisma.log.create({
    data: {
      id: logId,
      projectId: keyInfo.projectId,
      level,
      message,
      service: service ?? null,
      environment: environment ?? null,
      timestamp: logTimestamp,
      meta: meta ?? undefined,
      traceId: traceId ?? null,
      spanId: spanId ?? null,
      userIdField: userId ?? null,
      requestId: requestId ?? null,
      host: host ?? null,
      tags: tags ?? undefined,
      ip: clientIp,
      createdAt: now,
    },
  })

  setResponseStatus(event, 201)

  return {
    success: true,
    logId,
  }
})
