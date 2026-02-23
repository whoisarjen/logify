interface User {
  id: string
  name: string
  email: string
  avatar?: string | null
}

interface AuthState {
  user: User | null
  loading: boolean
  error: string | null
}

const authState = reactive<AuthState>({
  user: null,
  loading: false,
  error: null,
})

export function useAuth() {
  const router = useRouter()
  const route = useRoute()

  const isAuthenticated = computed(() => !!authState.user)

  function signIn() {
    authState.loading = true
    authState.error = null
    window.location.href = '/api/auth/google'
  }

  async function logout() {
    try {
      await $fetch('/api/auth/logout', { method: 'POST' })
    }
    catch {
      // Ignore logout errors
    }
    finally {
      authState.user = null
      await router.push('/login')
    }
  }

  async function fetchUser() {
    try {
      const data = await $fetch<{ user: User }>('/api/auth/me')
      authState.user = data.user
    }
    catch {
      authState.user = null
    }
  }

  function checkOAuthError() {
    const error = route.query.error as string | undefined
    if (error) {
      const messages: Record<string, string> = {
        access_denied: 'Sign-in was cancelled.',
        oauth_failed: 'Google sign-in failed. Please try again.',
        invalid_state: 'Sign-in session expired. Please try again.',
        missing_params: 'Something went wrong. Please try again.',
      }
      authState.error = messages[error] || 'An unexpected error occurred.'
    }
  }

  function clearError() {
    authState.error = null
  }

  return {
    user: computed(() => authState.user),
    loading: computed(() => authState.loading),
    error: computed(() => authState.error),
    isAuthenticated,
    signIn,
    logout,
    fetchUser,
    checkOAuthError,
    clearError,
  }
}
