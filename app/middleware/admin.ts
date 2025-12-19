/**
 * Admin middleware
 * Protects routes that require ADMIN role
 *
 * Usage in page:
 * definePageMeta({
 *   middleware: 'admin'
 * })
 */
export default defineNuxtRouteMiddleware(async () => {
  // Only run on client side
  if (import.meta.server) {
    return
  }

  const { isLoggedIn, storedUser } = useUser()

  // Initialize user state from localStorage if needed
  const { initUser } = useUser()
  initUser()

  // Check authentication
  if (!isLoggedIn.value) {
    return navigateTo('/login')
  }

  // Check admin role
  if (storedUser.value?.role !== 'ADMIN') {
    return navigateTo('/')
  }
})
