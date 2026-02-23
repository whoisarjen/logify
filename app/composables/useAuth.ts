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

export function useAuth() {
  const authState = useState<AuthState>('auth', () => ({
    user: null,
    loading: false,
    error: null,
  }))

  const isAuthenticated = computed(() => !!authState.value.user)

  function signIn() {
    authState.value.loading = true
    authState.value.error = null
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
      authState.value.user = null
      await useRouter().push('/login')
    }
  }

  async function fetchUser() {
    try {
      const headers = import.meta.server ? useRequestHeaders(['cookie']) : {}
      const data = await $fetch<{ user: User }>('/api/auth/me', { headers })
      authState.value.user = data.user
    }
    catch {
      authState.value.user = null
    }
  }

  function checkOAuthError() {
    const error = useRoute().query.error as string | undefined
    if (error) {
      const messages: Record<string, string> = {
        access_denied: 'Sign-in was cancelled.',
        oauth_failed: 'Google sign-in failed. Please try again.',
        invalid_state: 'Sign-in session expired. Please try again.',
        missing_params: 'Something went wrong. Please try again.',
      }
      authState.value.error = messages[error] || 'An unexpected error occurred.'
    }
  }

  function clearError() {
    authState.value.error = null
  }

  return {
    user: computed(() => authState.value.user),
    loading: computed(() => authState.value.loading),
    error: computed(() => authState.value.error),
    isAuthenticated,
    signIn,
    logout,
    fetchUser,
    checkOAuthError,
    clearError,
  }
}
