import { prisma } from '../../utils/db'
import { requireAuth } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const query = getQuery(event)

  const projectId = query.projectId as string | undefined

  if (!projectId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: '"projectId" query parameter is required.',
    })
  }

  // ---------------------------------------------------------------------------
  // Verify project ownership
  // ---------------------------------------------------------------------------

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
  // Gather statistics
  // ---------------------------------------------------------------------------

  // Total count
  const total = await prisma.log.count({ where: { projectId } })

  // Counts by level
  const byLevelResult = await prisma.log.groupBy({
    by: ['level'],
    where: { projectId },
    _count: { _all: true },
  })

  // Counts by service
  const byServiceResult = await prisma.log.groupBy({
    by: ['service'],
    where: { projectId },
    _count: { _all: true },
    orderBy: { _count: { service: 'desc' } },
    take: 20,
  })

  // Counts by environment
  const byEnvironmentResult = await prisma.log.groupBy({
    by: ['environment'],
    where: { projectId },
    _count: { _all: true },
  })

  // Recent activity: log counts per hour for the last 24 hours
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)

  const recentActivity = await prisma.$queryRaw<Array<{ hour: string; count: bigint }>>`
    SELECT
      to_char(date_trunc('hour', "timestamp"), 'YYYY-MM-DD"T"HH24:00:00"Z"') AS hour,
      count(*) AS count
    FROM logs
    WHERE project_id = ${projectId}
      AND "timestamp" >= ${twentyFourHoursAgo}
    GROUP BY date_trunc('hour', "timestamp")
    ORDER BY date_trunc('hour', "timestamp")
  `

  return {
    total,
    byLevel: Object.fromEntries(byLevelResult.map((r) => [r.level, r._count._all])),
    byService: byServiceResult.map((r) => ({
      service: r.service ?? '(none)',
      count: r._count._all,
    })),
    byEnvironment: byEnvironmentResult.map((r) => ({
      environment: r.environment ?? '(none)',
      count: r._count._all,
    })),
    recentActivity: recentActivity.map((r) => ({
      hour: r.hour,
      count: Number(r.count),
    })),
  }
})
