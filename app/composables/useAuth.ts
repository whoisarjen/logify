interface User {
  id: string
  name: string
  email: string
  avatar?: string
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

  const isAuthenticated = computed(() => !!authState.user)

  async function login(email: string, password: string) {
    authState.loading = true
    authState.error = null

    try {
      const data = await $fetch<{ user: User }>('/api/auth/login', {
        method: 'POST',
        body: { email, password },
      })

      authState.user = data.user
      await router.push('/dashboard')
    }
    catch (err: any) {
      authState.error = err?.data?.message || 'Invalid email or password'
      throw err
    }
    finally {
      authState.loading = false
    }
  }

  async function register(name: string, email: string, password: string) {
    authState.loading = true
    authState.error = null

    try {
      const data = await $fetch<{ user: User }>('/api/auth/register', {
        method: 'POST',
        body: { name, email, password },
      })

      authState.user = data.user
      await router.push('/dashboard')
    }
    catch (err: any) {
      authState.error = err?.data?.message || 'Registration failed'
      throw err
    }
    finally {
      authState.loading = false
    }
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

  function clearError() {
    authState.error = null
  }

  return {
    user: computed(() => authState.user),
    loading: computed(() => authState.loading),
    error: computed(() => authState.error),
    isAuthenticated,
    login,
    register,
    logout,
    fetchUser,
    clearError,
  }
}
