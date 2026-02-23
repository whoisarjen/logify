import { nanoid } from 'nanoid'
import { buildGoogleAuthUrl } from '../../../utils/google-oauth'

export default defineEventHandler(async (event) => {
  const state = nanoid(32)

  setCookie(event, 'oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600,
    path: '/',
  })

  const redirectUri = process.env.GOOGLE_REDIRECT_URI
    || `${getRequestURL(event).origin}/api/auth/google/callback`

  const url = buildGoogleAuthUrl(state, redirectUri)
  return sendRedirect(event, url)
})
