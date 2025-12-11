/**
 * User information composable
 * Manages user profile data fetched from the backend
 */

export interface UserTeam {
  id: number
  name: string
  memberCount: number
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
  nickname: string
  avatar?: string
  bio?: string
  points: number
  rank: number
  solvedCount: number
  /** User's team, null if not in a team */
  team?: UserTeam | null
  /** Solve statistics by category */
  solveStats: SolveStats
  /** Activity data for heatmap (last 365 days) */
  activityData: ActivityData[]
  joinedAt: string
}

export function useUser() {
  const user = useState<UserProfile | null>('user', () => null)
  const isLoading = useState('user-loading', () => false)
  const error = useState<string | null>('user-error', () => null)

  /**
   * Fetch user profile from the backend
   * TODO: Replace with actual API call when backend is ready
   */
  const fetchUser = async () => {
    isLoading.value = true
    error.value = null

    try {
      // TODO: Replace with actual API endpoint
      // const response = await $fetch<UserProfile>('/api/user/profile')

      // Mock data for demonstration
      await new Promise(resolve => setTimeout(resolve, 300))
      user.value = {
        id: 1,
        nickname: 'Hacker_001',
        avatar: undefined,
        bio: '热爱网络安全，专注 Web 和 Pwn 方向。Keep hacking, keep learning! 🚀',
        points: 1250,
        rank: 42,
        solvedCount: 28,
        team: {
          id: 1,
          name: 'NKSec',
          memberCount: 5
        },
        solveStats: {
          web: 12,
          pwn: 6,
          crypto: 4,
          reverse: 3,
          misc: 2,
          blockchain: 1
        },
        activityData: generateMockActivityData(),
        joinedAt: '2023-09-01'
      }
    }
    catch (e) {
      error.value = e instanceof Error ? e.message : '获取用户信息失败'
      user.value = null
    }
    finally {
      isLoading.value = false
    }
  }

  /**
   * Clear user data (logout)
   * TODO: Replace with actual logout API call
   */
  const logout = async () => {
    try {
      // TODO: Call logout API
      // await $fetch('/api/auth/logout', { method: 'POST' })

      user.value = null
      // Redirect to login page
      await navigateTo('/login')
    }
    catch (e) {
      console.error('Logout failed:', e)
    }
  }

  /**
   * Create a new team
   * TODO: Replace with actual API call when backend is ready
   */
  const createTeam = async (teamName: string) => {
    try {
      // TODO: Replace with actual API endpoint
      // const response = await $fetch('/api/teams', {
      //   method: 'POST',
      //   body: { name: teamName }
      // })

      await new Promise(resolve => setTimeout(resolve, 500))

      // Update user's team info
      if (user.value) {
        user.value.team = {
          id: Date.now(),
          name: teamName,
          memberCount: 1
        }
      }

      return { success: true }
    }
    catch (e) {
      return { success: false, error: e instanceof Error ? e.message : '创建战队失败' }
    }
  }

  /**
   * Join an existing team
   * TODO: Replace with actual API call when backend is ready
   */
  const joinTeam = async (teamId: number, teamName: string) => {
    try {
      // TODO: Replace with actual API endpoint
      // await $fetch(`/api/teams/${teamId}/join`, { method: 'POST' })

      await new Promise(resolve => setTimeout(resolve, 500))

      // Update user's team info
      if (user.value) {
        user.value.team = {
          id: teamId,
          name: teamName,
          memberCount: 1
        }
      }

      return { success: true }
    }
    catch (e) {
      return { success: false, error: e instanceof Error ? e.message : '加入战队失败' }
    }
  }

  /**
   * Leave current team
   * TODO: Replace with actual API call when backend is ready
   */
  const leaveTeam = async () => {
    try {
      // TODO: Replace with actual API endpoint
      // await $fetch(`/api/teams/${user.value?.team?.id}/leave`, { method: 'POST' })

      await new Promise(resolve => setTimeout(resolve, 500))

      // Clear user's team info
      if (user.value) {
        user.value.team = null
      }

      return { success: true }
    }
    catch (e) {
      return { success: false, error: e instanceof Error ? e.message : '退出战队失败' }
    }
  }

  /**
   * Update user bio
   * TODO: Replace with actual API call when backend is ready
   */
  const updateBio = async (bio: string) => {
    try {
      // TODO: Replace with actual API endpoint
      // await $fetch('/api/user/profile', {
      //   method: 'PATCH',
      //   body: { bio }
      // })

      await new Promise(resolve => setTimeout(resolve, 300))

      if (user.value) {
        user.value.bio = bio
      }

      return { success: true }
    }
    catch (e) {
      return { success: false, error: e instanceof Error ? e.message : '更新失败' }
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

  return {
    user,
    isLoading,
    error,
    fetchUser,
    logout,
    createTeam,
    joinTeam,
    leaveTeam,
    updateBio,
    formattedPoints,
    formattedRank,
    hasTeam
  }
}

/**
 * Generate mock activity data for the last 365 days
 * TODO: Remove this function when backend is ready
 */
function generateMockActivityData(): ActivityData[] {
  const data: ActivityData[] = []
  const today = new Date()

  for (let i = 364; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)

    const dateStr = date.toISOString().split('T')[0]

    // Generate random activity count (0-5)
    // More likely to have activity on weekends
    const dayOfWeek = date.getDay()
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
    const baseChance = isWeekend ? 0.4 : 0.25
    const hasActivity = Math.random() < baseChance

    data.push({
      date: dateStr,
      count: hasActivity ? Math.floor(Math.random() * 5) + 1 : 0
    })
  }

  return data
}
