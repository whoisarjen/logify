import { prisma } from './db'

// ---------------------------------------------------------------------------
// Free tier limits
// ---------------------------------------------------------------------------

export const FREE_TIER = {
  MONTHLY_LOG_LIMIT: 10_000,
  MAX_PROJECTS: 1,
  MAX_API_KEYS: 1,
  LOG_RETENTION_DAYS: 7,
} as const

/**
 * Count logs created in the current calendar month for a project.
 */
export async function getMonthlyLogCount(projectId: string): Promise<number> {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  return prisma.log.count({
    where: {
      projectId,
      createdAt: { gte: startOfMonth },
    },
  })
}

/**
 * Count active (non-revoked) API keys for a user.
 */
export async function getActiveApiKeyCount(userId: string): Promise<number> {
  return prisma.apiKey.count({
    where: {
      userId,
      revokedAt: null,
    },
  })
}
