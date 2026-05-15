/**
 * User information composable
 * Manages user profile data fetched from the backend
 */
import type { AuthResponse, StoredAuthUser } from './useAuth'

export interface TeamMember {
  id: number
  username: string
  nickname: string
  avatar: string | null
  role: 'CAPTAIN' | 'MEMBER'
}

export interface UserTeam {
  id: string
  name: string
  description?: string
  inviteToken?: string | null
  captain?: TeamMember
  members?: TeamMember[]
  memberCount?: number
  createTime?: string
  /** User's role in team (from user profile API) */
  role?: 'CAPTAIN' | 'MEMBER'
}

export interface SolveStats {
  web: number
  pwn: number
  crypto: number
  reverse: number
  misc: number
  blockchain: number
}

export interface ActivityData {
  date: string
  count: number
}

export interface UserProfile {
  id: number
  username: string
  nickname: string
  avatar?: string
  bio?: string
  points: number
  rank: number
  solvedCount: number
  /** User's team, null if not in a team */
  team?: UserTeam | null
  /** Solve statistics by category (user's solved count) */
  solveStats: SolveStats
  /** Total challenges count by category (platform totals) */
  categoryTotals?: SolveStats
  /** Activity data for heatmap (last 365 days) */
  activityData: ActivityData[]
  joinedAt: string
}

/**
 * Basic user info stored in localStorage after login
 * @deprecated Use StoredAuthUser from useAuth instead
 */
export interface StoredUser {
  userId: number
  username: string
  nickname: string
  role: 'USER' | 'ADMIN'
}

export function useUser() {
  const { isAuthenticated, authUser, setTokens, logout: authLogout, initAuth, ensureSession } = useAuth()
  const authFetch = useAuthFetch()

  const user = useState<UserProfile | null>('user', () => null)
  const storedUser = useState<StoredUser | null>('stored-user', () => null)
  const isLoading = useState('user-loading', () => false)
  const error = useState<string | null>('user-error', () => null)

  /**
   * Check if user is logged in (has valid token)
   */
  const isLoggedIn = computed(() => isAuthenticated.value)

  /**
   * Initialize user state from localStorage
   * Should be called on app mount
   */
  const initUser = () => {
    initAuth()
    // Sync authUser to storedUser for backward compatibility
    if (authUser.value) {
      storedUser.value = authUser.value
    }
  }

  /**
   * Restore session from localStorage and refresh access token if expired.
   */
  const ensureUserSession = async (): Promise<boolean> => {
    initUser()
    const ok = await ensureSession()
    if (ok && authUser.value) {
      storedUser.value = authUser.value
    }
    return ok
  }

  /**
   * Set user after login/register
   * @param authResponse - The response from login/register API
   */
  const setStoredUser = (authResponse: AuthResponse) => {
    setTokens(authResponse)
    // Sync to storedUser for backward compatibility
    storedUser.value = {
      userId: authResponse.userId,
      username: authResponse.username,
      nickname: authResponse.nickname,
      role: authResponse.role
    }
  }

  /**
   * API response interface
   */
  interface ApiResponse<T = unknown> {
    code: number
    message: string
    data: T
  }

  /**
   * Fetch user profile from the backend
   */
  const fetchUser = async () => {
    if (!isAuthenticated.value) {
      error.value = '请先登录'
      return
    }

    isLoading.value = true
    error.value = null

    try {
      const response = await authFetch<ApiResponse<UserProfile>>('/api/user/profile')

      if (response.code === 200 && response.data) {
        user.value = response.data
      } else {
        error.value = response.message || '获取用户信息失败'
        user.value = null
      }
    } catch (e: unknown) {
      const fetchError = e as { data?: ApiResponse, status?: number }

      // Token expired or invalid
      if (fetchError.status === 401) {
        error.value = '登录已过期，请重新登录'
        storedUser.value = null
        await navigateTo('/login')
      } else {
        error.value = fetchError?.data?.message || '获取用户信息失败'
      }
      user.value = null
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Clear user data (logout)
   * Calls backend logout API to invalidate token
   * @param allDevices - If true, logs out from all devices
   */
  const logout = async (allDevices = false) => {
    user.value = null
    storedUser.value = null
    await authLogout(allDevices)
  }

  /**
   * Create a new team
   * POST /api/teams
   */
  const createTeam = async (teamName: string, description?: string) => {
    if (!isAuthenticated.value) {
      return { success: false, error: '请先登录' }
    }

    try {
      const response = await authFetch<ApiResponse<UserTeam>>('/api/teams', {
        method: 'POST',
        body: { name: teamName, description: description || '' }
      })

      if (response.code === 200 && response.data) {
        // Update user's team info
        if (user.value) {
          user.value.team = response.data
        }
        return { success: true, team: response.data }
      } else {
        return { success: false, error: response.message || '创建战队失败' }
      }
    } catch (e: unknown) {
      const fetchError = e as { data?: ApiResponse }
      return { success: false, error: fetchError?.data?.message || '创建战队失败' }
    }
  }

  /**
   * Get my team details
   * GET /api/teams/my
   */
  const getMyTeam = async () => {
    if (!isAuthenticated.value) {
      return { success: false, error: '请先登录' }
    }

    try {
      const response = await authFetch<ApiResponse<UserTeam>>('/api/teams/my')

      if (response.code === 200 && response.data) {
        if (user.value) {
          user.value.team = response.data
        }
        return { success: true, team: response.data }
      } else {
        return { success: false, error: response.message || '获取队伍信息失败' }
      }
    } catch (e: unknown) {
      const fetchError = e as { data?: ApiResponse, status?: number }
      if (fetchError.status === 404) {
        // User is not in a team
        if (user.value) {
          user.value.team = null
        }
        return { success: true, team: null }
      }
      return { success: false, error: fetchError?.data?.message || '获取队伍信息失败' }
    }
  }

  /**
   * Join an existing team via invite token
   * POST /api/teams/join
   */
  const joinTeam = async (inviteToken: string) => {
    if (!isAuthenticated.value) {
      return { success: false, error: '请先登录' }
    }

    try {
      const response = await authFetch<ApiResponse<UserTeam>>('/api/teams/join', {
        method: 'POST',
        body: { inviteToken }
      })

      if (response.code === 200 && response.data) {
        // Update user's team info
        if (user.value) {
          user.value.team = response.data
        }
        return { success: true, team: response.data }
      } else {
        return { success: false, error: response.message || '加入战队失败' }
      }
    } catch (e: unknown) {
      const fetchError = e as { data?: ApiResponse }
      return { success: false, error: fetchError?.data?.message || '加入战队失败' }
    }
  }

  /**
   * Leave current team
   * POST /api/teams/leave
   */
  const leaveTeam = async () => {
    if (!isAuthenticated.value) {
      return { success: false, error: '请先登录' }
    }

    try {
      const response = await authFetch<ApiResponse>('/api/teams/leave', {
        method: 'POST'
      })

      if (response.code === 200) {
        // Clear user's team info
        if (user.value) {
          user.value.team = null
        }
        return { success: true }
      } else {
        return { success: false, error: response.message || '退出战队失败' }
      }
    } catch (e: unknown) {
      const fetchError = e as { data?: ApiResponse }
      return { success: false, error: fetchError?.data?.message || '退出战队失败' }
    }
  }

  /**
   * Refresh team invite token (captain only)
   * POST /api/teams/refresh-token
   */
  const refreshTeamInviteToken = async () => {
    if (!isAuthenticated.value) {
      return { success: false, error: '请先登录' }
    }

    try {
      const response = await authFetch<ApiResponse<{ teamId: string, newInviteToken: string, message: string }>>('/api/teams/refresh-token', {
        method: 'POST'
      })

      if (response.code === 200 && response.data) {
        // Update team invite token
        if (user.value?.team) {
          user.value.team.inviteToken = response.data.newInviteToken
        }
        return { success: true, newInviteToken: response.data.newInviteToken }
      } else {
        return { success: false, error: response.message || '刷新邀请令牌失败' }
      }
    } catch (e: unknown) {
      const fetchError = e as { data?: ApiResponse }
      return { success: false, error: fetchError?.data?.message || '刷新邀请令牌失败' }
    }
  }

  /**
   * Dissolve team (captain only)
   * DELETE /api/teams
   */
  const dissolveTeam = async () => {
    if (!isAuthenticated.value) {
      return { success: false, error: '请先登录' }
    }

    try {
      const response = await authFetch<ApiResponse>('/api/teams', {
        method: 'DELETE'
      })

      if (response.code === 200) {
        // Clear user's team info
        if (user.value) {
          user.value.team = null
        }
        return { success: true }
      } else {
        return { success: false, error: response.message || '解散战队失败' }
      }
    } catch (e: unknown) {
      const fetchError = e as { data?: ApiResponse }
      return { success: false, error: fetchError?.data?.message || '解散战队失败' }
    }
  }

  /**
   * Get invite token (captain only)
   * GET /api/teams/invite-token
   */
  const getInviteToken = async () => {
    if (!isAuthenticated.value) {
      return { success: false, error: '请先登录' }
    }

    try {
      const response = await authFetch<ApiResponse<{ inviteToken: string }>>('/api/teams/invite-token')

      if (response.code === 200 && response.data) {
        // Update team invite token
        if (user.value?.team) {
          user.value.team.inviteToken = response.data.inviteToken
        }
        return { success: true, inviteToken: response.data.inviteToken }
      } else {
        return { success: false, error: response.message || '获取邀请令牌失败' }
      }
    } catch (e: unknown) {
      const fetchError = e as { data?: ApiResponse }
      return { success: false, error: fetchError?.data?.message || '获取邀请令牌失败' }
    }
  }

  /**
   * Remove a member from the team (captain only)
   * DELETE /api/teams/members/{userId}
   */
  const removeMember = async (userId: number) => {
    if (!isAuthenticated.value) {
      return { success: false, error: '请先登录' }
    }

    try {
      const response = await authFetch<ApiResponse>(`/api/teams/members/${userId}`, {
        method: 'DELETE'
      })

      if (response.code === 200) {
        // Update local team members list
        if (user.value?.team?.members) {
          user.value.team.members = user.value.team.members.filter(m => m.id !== userId)
          if (user.value.team.memberCount) {
            user.value.team.memberCount--
          }
        }
        return { success: true }
      } else {
        return { success: false, error: response.message || '移除成员失败' }
      }
    } catch (e: unknown) {
      const fetchError = e as { data?: ApiResponse }
      return { success: false, error: fetchError?.data?.message || '移除成员失败' }
    }
  }

  /**
   * Transfer captain role to another member (captain only)
   * POST /api/teams/transfer-captain
   */
  const transferCaptain = async (newCaptainId: number) => {
    if (!isAuthenticated.value) {
      return { success: false, error: '请先登录' }
    }

    try {
      const response = await authFetch<ApiResponse>('/api/teams/transfer-captain', {
        method: 'POST',
        body: { newCaptainId }
      })

      if (response.code === 200) {
        // Update local team captain info
        if (user.value?.team?.members) {
          const newCaptain = user.value.team.members.find(m => m.id === newCaptainId)
          if (newCaptain) {
            // Update roles
            user.value.team.members = user.value.team.members.map(m => ({
              ...m,
              role: m.id === newCaptainId ? 'CAPTAIN' : 'MEMBER'
            }))
            user.value.team.captain = { ...newCaptain, role: 'CAPTAIN' }
          }
        }
        return { success: true }
      } else {
        return { success: false, error: response.message || '转让队长失败' }
      }
    } catch (e: unknown) {
      const fetchError = e as { data?: ApiResponse }
      return { success: false, error: fetchError?.data?.message || '转让队长失败' }
    }
  }

  /**
   * Fetch another user's public profile
   * GET /api/user/profile/{userId}
   */
  const fetchUserById = async (userId: number) => {
    try {
      // authFetch will include auth header if user is logged in
      const response = await authFetch<ApiResponse<UserProfile>>(`/api/user/profile/${userId}`)

      if (response.code === 200 && response.data) {
        return { success: true, user: response.data }
      } else {
        return { success: false, error: response.message || '获取用户信息失败' }
      }
    } catch (e: unknown) {
      // Handle ofetch error structure
      const fetchError = e as { data?: ApiResponse, statusCode?: number, status?: number, message?: string }
      const statusCode = fetchError.statusCode || fetchError.status
      if (statusCode === 404) {
        return { success: false, error: '用户不存在' }
      }
      return { success: false, error: fetchError?.data?.message || fetchError?.message || '获取用户信息失败' }
    }
  }

  /**
   * Update user bio
   */
  const updateBio = async (bio: string) => {
    if (!isAuthenticated.value) {
      return { success: false, error: '请先登录' }
    }

    try {
      const response = await authFetch<ApiResponse>('/api/user/bio', {
        method: 'PUT',
        body: { bio }
      })

      if (response.code === 200) {
        if (user.value) {
          user.value.bio = bio
        }
        return { success: true }
      } else {
        return { success: false, error: response.message || '更新失败' }
      }
    } catch (e: unknown) {
      const fetchError = e as { data?: ApiResponse }
      return { success: false, error: fetchError?.data?.message || '更新失败' }
    }
  }

  /**
   * Formatted display string for points
   */
  const formattedPoints = computed(() => {
    if (!user.value) return '0'
    return user.value.points.toLocaleString()
  })

  /**
   * Formatted display string for rank
   */
  const formattedRank = computed(() => {
    if (!user.value) return '-'
    return `#${user.value.rank}`
  })

  /**
   * Check if user has a team
   */
  const hasTeam = computed(() => !!user.value?.team)

  /**
   * Check if user is the team captain
   * Checks team.role from user profile API, or falls back to comparing captain.id
   */
  const isCaptain = computed(() => {
    if (!user.value?.team) return false
    // First check role from user profile API
    if (user.value.team.role) {
      return user.value.team.role === 'CAPTAIN'
    }
    // Fallback: check captain.id from full team data
    if (user.value.team.captain) {
      return user.value.team.captain.id === user.value.id
    }
    return false
  })

  return {
    user,
    storedUser,
    isLoading,
    error,
    isLoggedIn,
    initUser,
    ensureUserSession,
    setStoredUser,
    fetchUser,
    fetchUserById,
    logout,
    createTeam,
    getMyTeam,
    joinTeam,
    leaveTeam,
    refreshTeamInviteToken,
    getInviteToken,
    removeMember,
    transferCaptain,
    dissolveTeam,
    updateBio,
    formattedPoints,
    formattedRank,
    hasTeam,
    isCaptain
  }
}
