/**
 * WebSocket client plugin
 * Initializes WebSocket connection on app mount
 * Only runs on client side (.client.ts suffix)
 */

export default defineNuxtPlugin(() => {
  const { connect, disconnect } = useWebSocket()
  const { isAuthenticated } = useAuth()

  // Auto-connect when authenticated user is present
  // Use onNuxtReady to ensure app is fully initialized
  onNuxtReady(() => {
    // Connect WebSocket if user is already authenticated
    if (isAuthenticated.value) {
      connect()
    }
  })

  // Watch for auth state changes
  watch(isAuthenticated, (authenticated) => {
    if (authenticated) {
      connect()
    } else {
      disconnect()
    }
  })

  // Cleanup on unmount (e.g., page navigation away from app)
  if (import.meta.client) {
    window.addEventListener('beforeunload', () => {
      disconnect()
    })
  }
})
