import { prisma } from '../../utils/db'
import { FREE_TIER } from '../../utils/free-tier'

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

  const deletedLogs = await prisma.log.deleteMany({
    where: { createdAt: { lt: retentionCutoff } },
  })

  const deletedSessions = await prisma.session.deleteMany({
    where: { expiresAt: { lt: new Date() } },
  })

  return {
    success: true,
    deletedLogs: deletedLogs.count,
    deletedSessions: deletedSessions.count,
  }
})
