/**
 * Auth plugin with centralized fetch interceptor
 * Automatically handles authentication headers and token refresh
 * Includes background timer to refresh tokens before expiration
 *
 * Note: Refresh token is stored as HttpOnly cookie by server,
 * not accessible via JavaScript. We just send credentials: 'include'
 */

import type { FetchContext } from 'ofetch'

// Type for fetch options
type FetchOptions = Parameters<typeof $fetch>[1]

// Request queue for handling concurrent requests during token refresh
interface QueuedRequest {
  resolve: (value: unknown) => void
  reject: (error: unknown) => void
  request: string
  options: FetchOptions
}

/**
 * Safely add authorization header to fetch options
 */
function addAuthHeader(options: FetchContext['options'], token: string): void {
  // Convert existing headers to a plain object
  const existingHeaders: Record<string, string> = {}

  if (options.headers) {
    if (options.headers instanceof Headers) {
      options.headers.forEach((value: string, key: string) => {
        existingHeaders[key] = value
      })
    } else if (Array.isArray(options.headers)) {
      (options.headers as [string, string][]).forEach(([key, value]: [string, string]) => {
        existingHeaders[key] = value
      })
    } else {
      Object.assign(existingHeaders, options.headers)
    }
  }

  // Add Authorization header
  existingHeaders.Authorization = `Bearer ${token}`

  // Assign back to options as HeadersInit (plain object is valid HeadersInit)
  ;(options as unknown as { headers: Record<string, string> }).headers = existingHeaders
}

export default defineNuxtPlugin(() => {
  const { getAccessToken, getTokenExpiresAt, isTokenExpiringSoon, refreshTokens, clearTokens } = useAuth()
  const config = useRuntimeConfig()
  const apiBase = config.public.apiBase as string || '/api'

  // Queue for requests waiting during token refresh
  let isRefreshing = false
  let requestQueue: QueuedRequest[] = []

  // Timer for automatic token refresh
  let refreshTimer: ReturnType<typeof setTimeout> | null = null

  /**
   * Buffer time before token expiration to trigger refresh (2 minutes)
   * This ensures we refresh well before the token actually expires
   */
  const REFRESH_BUFFER_MS = 2 * 60 * 1000

  /**
   * Minimum interval between refresh attempts (30 seconds)
   * Prevents rapid refresh loops if something goes wrong
   */
  const MIN_REFRESH_INTERVAL_MS = 30 * 1000

  /**
   * Schedule automatic token refresh before expiration
   * Note: We can't check for refresh token existence (HttpOnly cookie),
   * so we schedule based on access token expiration and let the server
   * handle cookie validation
   */
  const scheduleTokenRefresh = () => {
    // Clear existing timer
    if (refreshTimer) {
      clearTimeout(refreshTimer)
      refreshTimer = null
    }

    const expiresAt = getTokenExpiresAt()

    // Don't schedule if no access token expiration
    if (!expiresAt) {
      return
    }

    // Calculate when to refresh (2 minutes before expiration)
    const now = Date.now()
    const refreshAt = expiresAt - REFRESH_BUFFER_MS
    let delay = refreshAt - now

    // Token expired or within buffer — refresh as soon as possible
    if (delay < 0) {
      delay = 0
    }

    // Safety cap: don't set timers longer than 24 hours
    const MAX_DELAY_MS = 24 * 60 * 60 * 1000
    if (delay > MAX_DELAY_MS) {
      delay = MAX_DELAY_MS
    }

    refreshTimer = setTimeout(async () => {
      if (!isRefreshing) {
        isRefreshing = true
        try {
          const success = await refreshTokens()
          if (success) {
            // Reschedule for next refresh
            scheduleTokenRefresh()
          }
          // If refresh failed, clearTokens() is called in refreshTokens()
          // and the user will need to log in again
        } finally {
          isRefreshing = false
        }
      }
    }, delay)
  }

  // Start refresh timer, or refresh immediately if access token already expired
  const bootstrapSessionRefresh = async () => {
    if (!getAccessToken()) {
      return
    }
    if (isTokenExpiringSoon(120)) {
      const success = await refreshTokens()
      if (success) {
        scheduleTokenRefresh()
      }
      return
    }
    scheduleTokenRefresh()
  }

  void bootstrapSessionRefresh()

  // Watch for auth state changes to manage timer
  // This handles login/logout events
  const { authUser } = useAuth()
  watch(authUser, (newUser) => {
    if (newUser) {
      // User logged in, start refresh timer
      scheduleTokenRefresh()
    } else {
      // User logged out, clear timer
      if (refreshTimer) {
        clearTimeout(refreshTimer)
        refreshTimer = null
      }
    }
  })

  /**
   * Process queued requests after token refresh
   */
  const processQueue = (success: boolean) => {
    requestQueue.forEach(({ resolve, reject, request, options }) => {
      if (success) {
        // Retry with new token
        const token = getAccessToken()
        const headers: Record<string, string> = { ...(options?.headers as Record<string, string> || {}) }
        if (token) {
          headers.Authorization = `Bearer ${token}`
        }
        resolve($fetch(request, { ...options, headers, credentials: 'include' }))
      } else {
        reject(new Error('Token refresh failed'))
      }
    })
    requestQueue = []
  }

  /**
   * Check if URL requires authentication
   */
  const requiresAuth = (url: string): boolean => {
    // Skip auth for public endpoints
    const publicPaths = [
      '/auth/login',
      '/auth/register',
      '/auth/refresh',
      '/auth/captcha',
      '/articles/published',
      '/articles/tags'
    ]

    return !publicPaths.some(path => url.includes(path))
  }

  /**
   * Check if this is an API request
   */
  const isApiRequest = (url: string): boolean => {
    return url.startsWith('/api') || url.startsWith(apiBase)
  }

  /**
   * Create authenticated fetch wrapper
   * All API requests include credentials for cookie handling
   */
  const authFetch = $fetch.create({
    /**
     * Request interceptor - add auth headers and credentials
     */
    async onRequest({ options, request }: FetchContext) {
      const url = typeof request === 'string' ? request : request.toString()

      // Always include credentials for API requests (for HttpOnly cookie)
      if (isApiRequest(url)) {
        options.credentials = 'include'
      }

      // Only add auth headers for endpoints that require auth
      if (!isApiRequest(url) || !requiresAuth(url)) {
        return
      }

      // Check if token needs proactive refresh (expiring within 60 seconds)
      if (isTokenExpiringSoon(60) && !isRefreshing) {
        isRefreshing = true
        try {
          const success = await refreshTokens()
          if (success) {
            // Reschedule refresh timer with new expiration
            scheduleTokenRefresh()
          }
        } finally {
          isRefreshing = false
        }
      }

      // Add authorization header
      const token = getAccessToken()
      if (token) {
        addAuthHeader(options, token)
      }
    },

    /**
     * Response error interceptor - handle 401
     */
    async onResponseError({ request, options, response }: FetchContext & { response: Response }) {
      const url = typeof request === 'string' ? request : request.toString()

      // Only handle 401 for API requests
      if (response.status !== 401 || !isApiRequest(url)) {
        return
      }

      // Don't retry auth endpoints
      if (url.includes('/auth/')) {
        clearTokens()
        return
      }

      // If already refreshing, queue this request
      if (isRefreshing) {
        return new Promise<void>((resolve, reject) => {
          requestQueue.push({
            resolve: resolve as (value: unknown) => void,
            reject,
            request: url,
            options: options as FetchOptions
          })
        })
      }

      isRefreshing = true

      try {
        const success = await refreshTokens()

        if (success) {
          // Reschedule refresh timer with new expiration
          scheduleTokenRefresh()

          // Process queued requests
          processQueue(true)

          // Retry original request with new token
          const newToken = getAccessToken()
          if (newToken) {
            addAuthHeader(options, newToken)
          }

          // Return retried request (credentials already set in onRequest)
          return $fetch(url, options as FetchOptions)
        } else {
          processQueue(false)
          clearTokens()
        }
      } catch {
        processQueue(false)
        clearTokens()
      } finally {
        isRefreshing = false
      }
    }
  })

  return {
    provide: {
      authFetch
    }
  }
})

// Type augmentation for Nuxt
declare module '#app' {
  interface NuxtApp {
    $authFetch: typeof $fetch
  }
}

declare module 'vue' {
  interface ComponentCustomProperties {
    $authFetch: typeof $fetch
  }
}
