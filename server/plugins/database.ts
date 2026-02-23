import { prisma } from '../utils/db'

export default defineNitroPlugin(async () => {
  console.log('[logify] Connecting to Neon PostgreSQL...')

  // Verify database connection on startup
  try {
    await prisma.$queryRaw`SELECT 1`
    console.log('[logify] Database connection established.')
  } catch (error) {
    console.error('[logify] Failed to connect to database:', error)
    throw error
  }
})
