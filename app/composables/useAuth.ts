/**
 * Authentication composable
 * Manages dual-token authentication:
 * - Access Token: stored in localStorage, sent via Authorization header
 * - Refresh Token: stored in HttpOnly cookie by server, sent automatically by browser
 */

// API Response wrapper
interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

/**
 * Authentication response from login/register/refresh
 * Note: refreshToken is no longer in response body, it's set as HttpOnly cookie by server
 */
export interface AuthResponse {
  accessToken: string
  expiresIn: number
  userId: number
  username: string
  nickname: string
  role: 'USER' | 'ADMIN'
}

/**
 * Stored user info (without tokens)
 */
export interface StoredAuthUser {
  userId: number
  username: string
  nickname: string
  role: 'USER' | 'ADMIN'
}

// Storage keys (Refresh token is no longer stored in localStorage)
const STORAGE_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  EXPIRES_AT: 'tokenExpiresAt',
  USER: 'user',
  // Legacy keys for migration cleanup
  LEGACY_TOKEN: 'token',
  LEGACY_REFRESH_TOKEN: 'refreshToken'
} as const

export function useAuth() {
  const config = useRuntimeConfig()
  const apiBase = config.public.apiBase as string || '/api'

  // Reactive state
  const authUser = useState<StoredAuthUser | null>('auth-user', () => null)
  const isRefreshing = useState('auth-refreshing', () => false)
  const refreshPromise = useState<Promise<boolean> | null>('auth-refresh-promise', () => null)

  /**
   * Get access token from localStorage
   */
  const getAccessToken = (): string | null => {
    if (import.meta.client) {
      return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
    }
    return null
  }

  /**
   * Get token expiration timestamp
   */
  const getTokenExpiresAt = (): number | null => {
    if (import.meta.client) {
      const expiresAt = localStorage.getItem(STORAGE_KEYS.EXPIRES_AT)
      return expiresAt ? parseInt(expiresAt, 10) : null
    }
    return null
  }

  /**
   * Check if access token is expired
   */
  const isTokenExpired = (): boolean => {
    const expiresAt = getTokenExpiresAt()
    if (!expiresAt) return true
    return Date.now() >= expiresAt
  }

  /**
   * Check if token is expiring soon (within buffer seconds)
   */
  const isTokenExpiringSoon = (bufferSeconds = 60): boolean => {
    const expiresAt = getTokenExpiresAt()
    if (!expiresAt) return true
    return Date.now() >= (expiresAt - bufferSeconds * 1000)
  }

  /**
   * Check if user is authenticated (has valid non-expired token)
   * Uses authUser for reactivity, localStorage for source of truth
   */
  const isAuthenticated = computed(() => {
    // authUser provides reactivity when setTokens/clearTokens is called
    // We still verify localStorage has the actual token
    const hasAuthUser = !!authUser.value
    const token = getAccessToken()
    const notExpired = !isTokenExpired()

    // Both reactive state and localStorage must be valid
    return hasAuthUser && !!token && notExpired
  })

  /**
   * Store tokens and user info after login/register/refresh
   * Note: Refresh token is stored as HttpOnly cookie by server, not in localStorage
   */
  const setTokens = (response: AuthResponse): void => {
    if (import.meta.client) {
      const expiresAt = Date.now() + (response.expiresIn * 1000)

      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, response.accessToken)
      localStorage.setItem(STORAGE_KEYS.EXPIRES_AT, String(expiresAt))
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify({
        userId: response.userId,
        username: response.username,
        nickname: response.nickname,
        role: response.role
      }))

      // Update reactive state
      authUser.value = {
        userId: response.userId,
        username: response.username,
        nickname: response.nickname,
        role: response.role
      }
    }
  }

  /**
   * Clear all tokens and user info
   * Note: HttpOnly cookie is cleared by server on logout
   */
  const clearTokens = (): void => {
    if (import.meta.client) {
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN)
      localStorage.removeItem(STORAGE_KEYS.EXPIRES_AT)
      localStorage.removeItem(STORAGE_KEYS.USER)
      // Clean up legacy keys if they exist
      localStorage.removeItem(STORAGE_KEYS.LEGACY_TOKEN)
      localStorage.removeItem(STORAGE_KEYS.LEGACY_REFRESH_TOKEN)
    }
    authUser.value = null
  }

  /**
   * Refresh tokens using HttpOnly cookie
   * Cookie is sent automatically by browser with credentials: 'include'
   * Implements concurrency control to prevent multiple simultaneous refreshes
   */
  const refreshTokens = async (): Promise<boolean> => {
    // Prevent multiple simultaneous refresh attempts
    if (isRefreshing.value && refreshPromise.value) {
      return refreshPromise.value
    }

    isRefreshing.value = true

    refreshPromise.value = (async () => {
      try {
        const response = await $fetch<ApiResponse<AuthResponse>>(
          `${apiBase}/auth/refresh`,
          {
            method: 'POST',
            credentials: 'include' // Send HttpOnly cookie
            // No body needed - refresh token is in cookie
          }
        )

        if (response.code === 200 && response.data) {
          setTokens(response.data)
          return true
        }

        clearTokens()
        return false
      } catch {
        clearTokens()
        return false
      } finally {
        isRefreshing.value = false
        refreshPromise.value = null
      }
    })()

    return refreshPromise.value
  }

  /**
   * Get authorization headers for API requests
   * Automatically refreshes token if expiring soon
   */
  const getAuthHeaders = async (): Promise<Record<string, string>> => {
    // Check if token needs refresh (expired or expiring within 60 seconds)
    if (isTokenExpiringSoon(60)) {
      const refreshed = await refreshTokens()
      if (!refreshed) {
        return {}
      }
    }

    const token = getAccessToken()
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  /**
   * Logout user
   * @param allDevices - If true, logs out from all devices
   */
  const logout = async (allDevices = false): Promise<void> => {
    try {
      const accessToken = getAccessToken()

      if (accessToken) {
        const endpoint = allDevices
          ? `${apiBase}/auth/logout-all`
          : `${apiBase}/auth/logout`

        await $fetch(endpoint, {
          method: 'POST',
          headers: { Authorization: `Bearer ${accessToken}` },
          credentials: 'include' // Send cookie to be cleared by server
        }).catch(() => {
          // Ignore errors, proceed with local logout
        })
      }
    } finally {
      clearTokens()
      await navigateTo('/')
    }
  }

  /**
   * Initialize auth state from localStorage
   * Also handles migration from old formats (forces re-login)
   */
  const initAuth = (): void => {
    if (import.meta.client) {
      // Check for legacy tokens and clean up (force re-login)
      const legacyToken = localStorage.getItem(STORAGE_KEYS.LEGACY_TOKEN)
      const legacyRefreshToken = localStorage.getItem(STORAGE_KEYS.LEGACY_REFRESH_TOKEN)

      if (legacyToken || legacyRefreshToken) {
        // Old format detected - clear everything and force re-login
        localStorage.removeItem(STORAGE_KEYS.LEGACY_TOKEN)
        localStorage.removeItem(STORAGE_KEYS.LEGACY_REFRESH_TOKEN)
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN)
        localStorage.removeItem(STORAGE_KEYS.EXPIRES_AT)
        localStorage.removeItem(STORAGE_KEYS.USER)
        console.info('[Auth] Legacy token format detected, please log in again')
        return
      }

      // Load current format
      const accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
      const userStr = localStorage.getItem(STORAGE_KEYS.USER)

      if (accessToken && userStr) {
        try {
          authUser.value = JSON.parse(userStr)
        } catch {
          clearTokens()
        }
      }
    }
  }

  return {
    // State
    authUser,
    isAuthenticated,
    isRefreshing,

    // Token management
    getAccessToken,
    getTokenExpiresAt,
    setTokens,
    clearTokens,

    // Token validation
    isTokenExpired,
    isTokenExpiringSoon,

    // API helpers
    getAuthHeaders,
    refreshTokens,

    // Auth actions
    logout,
    initAuth,

    // Constants
    STORAGE_KEYS
  }
}

/**
 * Get the authenticated fetch instance
 * Use this in composables for automatic auth handling
 *
 * Falls back to regular $fetch during SSR (plugin is client-only)
 * The plugin handles auth headers and token refresh automatically on client
 */
export function useAuthFetch(): typeof $fetch {
  if (import.meta.server) {
    // During SSR, use regular $fetch (no auth)
    return $fetch
  }

  const nuxtApp = useNuxtApp()

  // Return plugin-provided authFetch, or fallback to regular $fetch
  // This handles the edge case where the plugin hasn't initialized yet
  return (nuxtApp.$authFetch as typeof $fetch) || $fetch
}
