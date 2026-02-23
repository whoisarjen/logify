import { prisma } from '../../utils/db'
import { requireAuth } from '../../utils/auth'
import type { Prisma } from '../../../generated/prisma/client'

const VALID_LEVELS = ['debug', 'info', 'warn', 'error', 'fatal']
const MAX_LIMIT = 200
const DEFAULT_LIMIT = 50

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const query = getQuery(event)

  // ---------------------------------------------------------------------------
  // Parse query parameters
  // ---------------------------------------------------------------------------

  const projectId = query.projectId as string | undefined
  const level = query.level as string | undefined
  const service = query.service as string | undefined
  const environment = query.environment as string | undefined
  const search = query.search as string | undefined
  const from = query.from as string | undefined
  const to = query.to as string | undefined
  const limitParam = query.limit as string | undefined
  const offsetParam = query.offset as string | undefined

  // ---------------------------------------------------------------------------
  // Validate project ownership
  // ---------------------------------------------------------------------------

  if (!projectId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: '"projectId" query parameter is required.',
    })
  }

  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      userId: user.id,
    },
    select: { id: true },
  })

  if (!project) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Not Found',
      message: 'Project not found or you do not have access.',
    })
  }

  // ---------------------------------------------------------------------------
  // Build filter conditions
  // ---------------------------------------------------------------------------

  const where: Prisma.LogWhereInput = { projectId }

  if (level) {
    // Support comma-separated levels (e.g. "error,fatal")
    const levels = level.split(',').map((l) => l.trim().toLowerCase())
    const invalid = levels.filter((l) => !VALID_LEVELS.includes(l))
    if (invalid.length > 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Bad Request',
        message: `Invalid level(s): ${invalid.join(', ')}. Must be one of: ${VALID_LEVELS.join(', ')}.`,
      })
    }
    where.level = levels.length === 1 ? levels[0] : { in: levels }
  }

  if (service) {
    where.service = service
  }

  if (environment) {
    where.environment = environment
  }

  if (search) {
    where.message = { contains: search, mode: 'insensitive' }
  }

  if (from) {
    const fromDate = new Date(from)
    if (isNaN(fromDate.getTime())) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Bad Request',
        message: '"from" must be a valid ISO 8601 date string.',
      })
    }
    where.timestamp = { ...((where.timestamp as object) || {}), gte: fromDate }
  }

  if (to) {
    const toDate = new Date(to)
    if (isNaN(toDate.getTime())) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Bad Request',
        message: '"to" must be a valid ISO 8601 date string.',
      })
    }
    where.timestamp = { ...((where.timestamp as object) || {}), lte: toDate }
  }

  // ---------------------------------------------------------------------------
  // Pagination
  // ---------------------------------------------------------------------------

  let limit = DEFAULT_LIMIT
  if (limitParam) {
    const parsed = parseInt(limitParam, 10)
    if (isNaN(parsed) || parsed < 1) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Bad Request',
        message: '"limit" must be a positive integer.',
      })
    }
    limit = Math.min(parsed, MAX_LIMIT)
  }

  let offset = 0
  if (offsetParam) {
    const parsed = parseInt(offsetParam, 10)
    if (isNaN(parsed) || parsed < 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Bad Request',
        message: '"offset" must be a non-negative integer.',
      })
    }
    offset = parsed
  }

  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const [logsResult, total] = await Promise.all([
    prisma.log.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: limit,
      skip: offset,
    }),
    prisma.log.count({ where }),
  ])

  return {
    logs: logsResult.map((log) => ({
      id: log.id,
      projectId: log.projectId,
      level: log.level,
      message: log.message,
      service: log.service,
      environment: log.environment,
      timestamp: log.timestamp.toISOString(),
      meta: log.meta ?? null,
      traceId: log.traceId,
      spanId: log.spanId,
      userId: log.userIdField,
      requestId: log.requestId,
      host: log.host,
      tags: log.tags ?? null,
      ip: log.ip,
      createdAt: log.createdAt.toISOString(),
    })),
    pagination: {
      total,
      limit,
      offset,
      hasMore: offset + limit < total,
    },
  }
})
