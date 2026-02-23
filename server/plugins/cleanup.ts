import { prisma } from '../utils/db'
import { FREE_TIER } from '../utils/free-tier'

export default defineNitroPlugin(async () => {
  // Run cleanup once on startup
  // On Vercel, the /api/cron/cleanup endpoint handles periodic cleanup via cron
  try {
    const retentionCutoff = new Date(
      Date.now() - FREE_TIER.LOG_RETENTION_DAYS * 24 * 60 * 60 * 1000,
    )

    const deletedLogs = await prisma.log.deleteMany({
      where: { createdAt: { lt: retentionCutoff } },
    })

    const deletedSessions = await prisma.session.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    })

    if (deletedLogs.count > 0 || deletedSessions.count > 0) {
      console.log(
        `[logify] Startup cleanup: removed ${deletedLogs.count} old logs, ${deletedSessions.count} expired sessions`,
      )
    }
  }
  catch (error) {
    console.error('[logify] Startup cleanup error:', error)
  }
})
