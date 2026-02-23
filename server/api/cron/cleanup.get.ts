import { prisma } from '../../utils/db'
import { FREE_TIER } from '../../utils/free-tier'

const BATCH_SIZE = 5000

export default defineEventHandler(async (event) => {
  // Verify the request is from Vercel Cron
  const authHeader = getHeader(event, 'authorization')
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    })
  }

  const retentionCutoff = new Date(
    Date.now() - FREE_TIER.LOG_RETENTION_DAYS * 24 * 60 * 60 * 1000,
  )

  // Batch delete old logs to stay within Hobby plan's 60s function timeout
  let totalDeletedLogs = 0
  let deleted: number

  do {
    const batch = await prisma.log.findMany({
      where: { createdAt: { lt: retentionCutoff } },
      select: { id: true },
      take: BATCH_SIZE,
    })

    if (batch.length === 0) break

    const result = await prisma.log.deleteMany({
      where: { id: { in: batch.map(l => l.id) } },
    })

    deleted = result.count
    totalDeletedLogs += deleted
  } while (deleted === BATCH_SIZE)

  const deletedSessions = await prisma.session.deleteMany({
    where: { expiresAt: { lt: new Date() } },
  })

  return {
    success: true,
    deletedLogs: totalDeletedLogs,
    deletedSessions: deletedSessions.count,
  }
})
