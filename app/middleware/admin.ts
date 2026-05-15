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

  const { isLoggedIn, storedUser, ensureUserSession } = useUser()

  const sessionOk = await ensureUserSession()

  // Check authentication
  if (!sessionOk && !isLoggedIn.value) {
    return navigateTo('/login')
  }

  // Check admin role
  if (storedUser.value?.role !== 'ADMIN') {
    return navigateTo('/')
  }
})
