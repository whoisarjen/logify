import { prisma } from '../../utils/db'
import { requireAuth } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const keyId = getRouterParam(event, 'id')

  if (!keyId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: 'API key ID is required.',
    })
  }

  // ---------------------------------------------------------------------------
  // Look up the key and verify ownership
  // ---------------------------------------------------------------------------

  const apiKey = await prisma.apiKey.findFirst({
    where: {
      id: keyId,
      userId: user.id,
    },
    select: {
      id: true,
      revokedAt: true,
    },
  })

  if (!apiKey) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Not Found',
      message: 'API key not found or you do not have access.',
    })
  }

  if (apiKey.revokedAt !== null) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: 'API key is already revoked.',
    })
  }

  // ---------------------------------------------------------------------------
  // Soft-delete (set revokedAt)
  // ---------------------------------------------------------------------------

  const now = new Date()

  await prisma.apiKey.update({
    where: { id: keyId },
    data: { revokedAt: now },
  })

  return {
    success: true,
    revokedAt: now.toISOString(),
  }
})
