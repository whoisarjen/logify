import { prisma } from '../../utils/db'
import { requireAuth } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)

  const projects = await prisma.project.findMany({
    where: { userId: user.id },
    select: {
      id: true,
      name: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'asc' },
  })

  return {
    projects: projects.map((p) => ({
      id: p.id,
      name: p.name,
      createdAt: p.createdAt.toISOString(),
    })),
  }
})
