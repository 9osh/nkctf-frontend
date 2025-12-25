/**
 * Permission management composable
 * Provides unified permission checking for the application
 */

import type { ArticleStatus } from './useLearn'

/**
 * User roles in the system
 */
export type UserRole = 'USER' | 'ADMIN'

/**
 * Permission types for the application
 */
export type Permission
  = | 'article:create' // Create new articles
    | 'article:edit:own' // Edit own articles (DRAFT/REJECTED)
    | 'article:delete:own' // Delete own draft articles
    | 'article:submit' // Submit articles for review
    | 'article:view:own' // View own articles (any status)
    | 'article:review' // Review pending articles (ADMIN)
    | 'article:publish' // Publish articles directly (ADMIN)
    | 'article:delete:any' // Delete any article (ADMIN)
    | 'tag:manage' // Manage tags (CRUD) (ADMIN)
    | 'user:manage' // Manage users (CRUD) (ADMIN)
    | 'challenge:manage' // Manage challenges (CRUD) (ADMIN)
    | 'competition:manage' // Manage competitions (CRUD) (ADMIN)
    | 'admin:access' // Access admin panel (ADMIN)

/**
 * Permission matrix defining which roles have which permissions
 */
const PERMISSION_MATRIX: Record<Permission, UserRole[]> = {
  'article:create': ['USER', 'ADMIN'],
  'article:edit:own': ['USER', 'ADMIN'],
  'article:delete:own': ['USER', 'ADMIN'],
  'article:submit': ['USER', 'ADMIN'],
  'article:view:own': ['USER', 'ADMIN'],
  'article:review': ['ADMIN'],
  'article:publish': ['ADMIN'],
  'article:delete:any': ['ADMIN'],
  'tag:manage': ['ADMIN'],
  'user:manage': ['ADMIN'],
  'challenge:manage': ['ADMIN'],
  'competition:manage': ['ADMIN'],
  'admin:access': ['ADMIN']
}

/**
 * Route permission configuration
 * Maps route patterns to required permissions or authentication level
 */
export interface RoutePermission {
  pattern: RegExp | string
  requireAuth: boolean
  permission?: Permission
  redirect?: string
}

const ROUTE_PERMISSIONS: RoutePermission[] = [
  // Admin routes - require ADMIN role
  { pattern: /^\/admin/, requireAuth: true, permission: 'admin:access', redirect: '/' },
  // User article routes - require authentication
  { pattern: '/learn/write', requireAuth: true, redirect: '/login' },
  { pattern: /^\/learn\/edit\//, requireAuth: true, redirect: '/login' },
  { pattern: '/learn/my', requireAuth: true, redirect: '/login' }
]

/**
 * Main permission composable
 */
export function usePermission() {
  const { isLoggedIn, storedUser } = useUser()

  /**
   * Get current user's role
   */
  const currentRole = computed((): UserRole | null => {
    if (!isLoggedIn.value || !storedUser.value) {
      return null
    }
    return storedUser.value.role
  })

  /**
   * Check if current user is admin
   */
  const isAdmin = computed(() => currentRole.value === 'ADMIN')

  /**
   * Check if current user is regular user
   */
  const isUser = computed(() => currentRole.value === 'USER')

  /**
   * Check if user has a specific permission
   */
  const hasPermission = (permission: Permission): boolean => {
    if (!currentRole.value) {
      return false
    }
    return PERMISSION_MATRIX[permission].includes(currentRole.value)
  }

  /**
   * Check if user can edit a specific article
   * Users can only edit their own DRAFT or REJECTED articles
   */
  const canEditArticle = (articleStatus: ArticleStatus, articleAuthorId: number): boolean => {
    if (!isLoggedIn.value || !storedUser.value) {
      return false
    }

    // Only DRAFT and REJECTED can be edited
    if (articleStatus !== 'DRAFT' && articleStatus !== 'REJECTED') {
      return false
    }

    // Admin can edit any editable article
    if (isAdmin.value) {
      return true
    }

    // Regular users can only edit their own articles
    return storedUser.value.userId === articleAuthorId
  }

  /**
   * Check if user can delete a specific article
   * Regular users can only delete their own DRAFT articles
   * Admins can delete any article
   */
  const canDeleteArticle = (articleStatus: ArticleStatus, articleAuthorId: number): boolean => {
    if (!isLoggedIn.value || !storedUser.value) {
      return false
    }

    // Admin can delete any article
    if (isAdmin.value) {
      return true
    }

    // Regular users can only delete their own DRAFT articles
    return articleStatus === 'DRAFT' && storedUser.value.userId === articleAuthorId
  }

  /**
   * Check if user can submit an article for review
   * Only DRAFT articles can be submitted
   */
  const canSubmitForReview = (articleStatus: ArticleStatus, articleAuthorId: number): boolean => {
    if (!isLoggedIn.value || !storedUser.value) {
      return false
    }

    if (articleStatus !== 'DRAFT') {
      return false
    }

    // Admin can submit any draft
    if (isAdmin.value) {
      return true
    }

    // Regular users can only submit their own drafts
    return storedUser.value.userId === articleAuthorId
  }

  /**
   * Check if user can review articles (approve/reject)
   */
  const canReviewArticle = (): boolean => {
    return hasPermission('article:review')
  }

  /**
   * Check if user can publish articles directly
   */
  const canPublishDirectly = (): boolean => {
    return hasPermission('article:publish')
  }

  /**
   * Check if user can manage tags
   */
  const canManageTags = (): boolean => {
    return hasPermission('tag:manage')
  }

  /**
   * Check if user can access admin panel
   */
  const canAccessAdmin = (): boolean => {
    return hasPermission('admin:access')
  }

  /**
   * Check route permission and return redirect path if needed
   */
  const checkRoutePermission = (path: string): { allowed: boolean, redirect?: string } => {
    for (const config of ROUTE_PERMISSIONS) {
      const matches = typeof config.pattern === 'string'
        ? path === config.pattern
        : config.pattern.test(path)

      if (matches) {
        // Check authentication
        if (config.requireAuth && !isLoggedIn.value) {
          return { allowed: false, redirect: config.redirect || '/login' }
        }

        // Check permission
        if (config.permission && !hasPermission(config.permission)) {
          return { allowed: false, redirect: config.redirect || '/' }
        }

        return { allowed: true }
      }
    }

    // No specific permission required
    return { allowed: true }
  }

  /**
   * Require authentication - redirects to login if not authenticated
   * Returns true if authenticated, false if redirect was triggered
   */
  const requireAuth = async (redirectPath = '/login'): Promise<boolean> => {
    if (!isLoggedIn.value) {
      await navigateTo(redirectPath)
      return false
    }
    return true
  }

  /**
   * Require specific role - redirects if not authorized
   * Returns true if authorized, false if redirect was triggered
   */
  const requireRole = async (role: UserRole, redirectPath = '/'): Promise<boolean> => {
    if (!isLoggedIn.value) {
      await navigateTo('/login')
      return false
    }
    if (currentRole.value !== role && !(role === 'USER' && currentRole.value === 'ADMIN')) {
      await navigateTo(redirectPath)
      return false
    }
    return true
  }

  /**
   * Require admin role - redirects if not admin
   * Returns true if admin, false if redirect was triggered
   */
  const requireAdmin = async (redirectPath = '/'): Promise<boolean> => {
    if (!isLoggedIn.value) {
      await navigateTo('/login')
      return false
    }
    if (!isAdmin.value) {
      await navigateTo(redirectPath)
      return false
    }
    return true
  }

  /**
   * Require specific permission - redirects if not authorized
   * Returns true if authorized, false if redirect was triggered
   */
  const requirePermission = async (permission: Permission, redirectPath = '/'): Promise<boolean> => {
    if (!isLoggedIn.value) {
      await navigateTo('/login')
      return false
    }
    if (!hasPermission(permission)) {
      await navigateTo(redirectPath)
      return false
    }
    return true
  }

  return {
    // Computed
    currentRole,
    isAdmin,
    isUser,
    // Permission checks
    hasPermission,
    canEditArticle,
    canDeleteArticle,
    canSubmitForReview,
    canReviewArticle,
    canPublishDirectly,
    canManageTags,
    canAccessAdmin,
    checkRoutePermission,
    // Guards
    requireAuth,
    requireRole,
    requireAdmin,
    requirePermission
  }
}
