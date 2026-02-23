import { nanoid } from 'nanoid'
import { prisma } from '../../utils/db'
import { requireAuth, generateApiKey, hashApiKey } from '../../utils/auth'
import { FREE_TIER, getActiveApiKeyCount } from '../../utils/free-tier'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const body = await readBody(event)

  if (!body || typeof body !== 'object') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: 'Request body must be a JSON object.',
    })
  }

  const { name, projectId } = body

  // ---------------------------------------------------------------------------
  // Validation
  // ---------------------------------------------------------------------------

  if (!name || typeof name !== 'string') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: '"name" is required and must be a string.',
    })
  }

  const trimmedName = name.trim()
  if (trimmedName.length === 0 || trimmedName.length > 100) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: '"name" must be between 1 and 100 characters.',
    })
  }

  if (!projectId || typeof projectId !== 'string') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: '"projectId" is required and must be a string.',
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
  // Check free tier API key limit
  // ---------------------------------------------------------------------------

  const activeKeyCount = await getActiveApiKeyCount(user.id)

  if (activeKeyCount >= FREE_TIER.MAX_API_KEYS) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden',
      message: `Free tier allows ${FREE_TIER.MAX_API_KEYS} active API key${FREE_TIER.MAX_API_KEYS > 1 ? 's' : ''}. Revoke an existing key or upgrade your plan.`,
    })
  }

  // ---------------------------------------------------------------------------
  // Generate and store key
  // ---------------------------------------------------------------------------

  const { key, prefix } = generateApiKey()
  const keyHash = hashApiKey(key)
  const apiKeyId = nanoid()
  const now = new Date()

  await prisma.apiKey.create({
    data: {
      id: apiKeyId,
      projectId,
      userId: user.id,
      name: trimmedName,
      keyHash,
      keyPrefix: prefix,
      createdAt: now,
    },
  })

  setResponseStatus(event, 201)

  return {
    apiKey: {
      id: apiKeyId,
      projectId,
      name: trimmedName,
      key, // Full key -- shown only once at creation time
      prefix,
      createdAt: now.toISOString(),
    },
  }
})
