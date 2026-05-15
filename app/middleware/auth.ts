/**
 * Authentication middleware
 * Protects routes that require user to be logged in
 *
 * Usage in page:
 * definePageMeta({
 *   middleware: 'auth'
 * })
 */
export default defineNuxtRouteMiddleware(async (to) => {
  // Only run on client side
  if (import.meta.server) {
    return
  }

  const { isLoggedIn, ensureUserSession } = useUser()

  const sessionOk = await ensureUserSession()

  if (!sessionOk && !isLoggedIn.value) {
    // Store the intended destination for redirect after login
    const redirectPath = to.fullPath
    return navigateTo(`/login?redirect=${encodeURIComponent(redirectPath)}`)
  }
})
