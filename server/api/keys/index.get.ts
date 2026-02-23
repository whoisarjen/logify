import { prisma } from '../../utils/db'
import { requireAuth } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)

  const keys = await prisma.apiKey.findMany({
    where: { userId: user.id },
    select: {
      id: true,
      projectId: true,
      name: true,
      keyPrefix: true,
      lastUsedAt: true,
      createdAt: true,
      revokedAt: true,
    },
    orderBy: { createdAt: 'asc' },
  })

  return {
    keys: keys.map((k) => ({
      id: k.id,
      projectId: k.projectId,
      name: k.name,
      keyPrefix: k.keyPrefix,
      lastUsedAt: k.lastUsedAt?.toISOString() ?? null,
      createdAt: k.createdAt.toISOString(),
      revokedAt: k.revokedAt?.toISOString() ?? null,
      isActive: k.revokedAt === null,
    })),
  }
})
