import { prisma } from '../../utils/db'
import { clearSessionCookie } from '../../utils/auth'

const SESSION_COOKIE_NAME = 'logify_session'

export default defineEventHandler(async (event) => {
  const token = getCookie(event, SESSION_COOKIE_NAME)

  if (token) {
    // Delete the session from the database
    await prisma.session.deleteMany({ where: { token } })
  }

  clearSessionCookie(event)

  return { success: true }
})
