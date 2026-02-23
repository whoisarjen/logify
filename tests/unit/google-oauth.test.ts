import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

describe('Google OAuth utils', () => {
  const originalEnv = { ...process.env }

  beforeEach(() => {
    vi.resetModules()
    process.env.NUXT_OAUTH_GOOGLE_CLIENT_ID = 'test-client-id.apps.googleusercontent.com'
    process.env.NUXT_OAUTH_GOOGLE_CLIENT_SECRET = 'test-client-secret'
  })

  afterEach(() => {
    process.env = { ...originalEnv }
  })

  describe('buildGoogleAuthUrl', () => {
    it('should build a valid Google authorization URL', async () => {
      const { buildGoogleAuthUrl } = await import('../../server/utils/google-oauth')

      const url = buildGoogleAuthUrl('test-state-123', 'http://localhost:3000/api/auth/google/callback')

      expect(url).toContain('https://accounts.google.com/o/oauth2/v2/auth')
      expect(url).toContain('client_id=test-client-id.apps.googleusercontent.com')
      expect(url).toContain('redirect_uri=http')
      expect(url).toContain('response_type=code')
      expect(url).toContain('scope=openid+email+profile')
      expect(url).toContain('state=test-state-123')
      expect(url).toContain('prompt=select_account')
    })

    it('should throw when environment variables are missing', async () => {
      delete process.env.NUXT_OAUTH_GOOGLE_CLIENT_ID

      const { buildGoogleAuthUrl } = await import('../../server/utils/google-oauth')

      expect(() => buildGoogleAuthUrl('state', 'http://localhost:3000/callback')).toThrow('Missing Google OAuth environment variables')
    })
  })

  describe('exchangeCodeForUser', () => {
    it('should exchange code for user info', async () => {
      const mockTokenResponse = {
        access_token: 'mock-access-token',
        id_token: 'mock-id-token',
        expires_in: 3600,
        token_type: 'Bearer',
        scope: 'openid email profile',
      }

      const mockUserInfo = {
        id: '12345',
        email: 'user@gmail.com',
        name: 'Test User',
        picture: 'https://lh3.googleusercontent.com/photo.jpg',
        verified_email: true,
      }

      const mockFetch = vi.fn()
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockTokenResponse),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockUserInfo),
        })

      vi.stubGlobal('fetch', mockFetch)

      const { exchangeCodeForUser } = await import('../../server/utils/google-oauth')

      const user = await exchangeCodeForUser('auth-code-123', 'http://localhost:3000/api/auth/google/callback')

      expect(user).toEqual(mockUserInfo)
      expect(mockFetch).toHaveBeenCalledTimes(2)

      // Token exchange call
      expect(mockFetch.mock.calls[0][0]).toBe('https://oauth2.googleapis.com/token')

      // User info call
      expect(mockFetch.mock.calls[1][0]).toBe('https://www.googleapis.com/oauth2/v2/userinfo')
      expect(mockFetch.mock.calls[1][1].headers.Authorization).toBe('Bearer mock-access-token')

      vi.unstubAllGlobals()
    })

    it('should throw when token exchange fails', async () => {
      const mockFetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        text: () => Promise.resolve('invalid_grant'),
      })

      vi.stubGlobal('fetch', mockFetch)

      const { exchangeCodeForUser } = await import('../../server/utils/google-oauth')

      await expect(exchangeCodeForUser('bad-code', 'http://localhost:3000/callback')).rejects.toThrow('Google token exchange failed')

      vi.unstubAllGlobals()
    })

    it('should throw when user info fetch fails', async () => {
      const mockFetch = vi.fn()
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ access_token: 'token' }),
        })
        .mockResolvedValueOnce({
          ok: false,
        })

      vi.stubGlobal('fetch', mockFetch)

      const { exchangeCodeForUser } = await import('../../server/utils/google-oauth')

      await expect(exchangeCodeForUser('code', 'http://localhost:3000/callback')).rejects.toThrow('Failed to fetch Google user info')

      vi.unstubAllGlobals()
    })
  })
})
