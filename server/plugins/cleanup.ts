import { prisma } from '../utils/db'
import { FREE_TIER } from '../utils/free-tier'

const CLEANUP_INTERVAL_MS = 60 * 60 * 1000 // 1 hour

export default defineNitroPlugin(() => {
  console.log('[logify] Cleanup plugin started — running every hour')

  async function runCleanup() {
    try {
      // Delete logs older than retention period
      const retentionCutoff = new Date(
        Date.now() - FREE_TIER.LOG_RETENTION_DAYS * 24 * 60 * 60 * 1000,
      )

      const deletedLogs = await prisma.log.deleteMany({
        where: { createdAt: { lt: retentionCutoff } },
      })

      // Delete expired sessions
      const deletedSessions = await prisma.session.deleteMany({
        where: { expiresAt: { lt: new Date() } },
      })

      if (deletedLogs.count > 0 || deletedSessions.count > 0) {
        console.log(
          `[logify] Cleanup: removed ${deletedLogs.count} old logs, ${deletedSessions.count} expired sessions`,
        )
      }
    }
    catch (error) {
      console.error('[logify] Cleanup error:', error)
    }
  }

  // Run once on startup (after a short delay to let DB connect)
  setTimeout(runCleanup, 10_000)

  // Then run periodically
  const timer = setInterval(runCleanup, CLEANUP_INTERVAL_MS)

  // Allow process to exit cleanly
  if (timer && typeof timer === 'object' && 'unref' in timer) {
    timer.unref()
  }
})
