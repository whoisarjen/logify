export default defineNuxtRouteMiddleware(async (to) => {
  const { isAuthenticated, fetchUser } = useAuth()

  // Try to restore session if not authenticated
  if (!isAuthenticated.value) {
    await fetchUser()
  }

  // Redirect to login if still not authenticated
  if (!isAuthenticated.value) {
    return navigateTo('/login')
  }
})
