/**
 * Leaderboard composable
 * Manages leaderboard data fetched from the backend API
 */

/**
 * API response interface
 */
interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T
}

/**
 * Leaderboard entry from API
 */
export interface LeaderboardEntry {
  rank: number
  userId: number
  nickname: string
  avatar: string | null
  points: number
  solvedCount: number
  lastSubmitTime: string | null
}

/**
 * Paginated leaderboard response from API
 */
export interface LeaderboardResponse {
  entries: LeaderboardEntry[]
  total: number
  page: number
  pages: number
  hasNext: boolean
  hasPrevious: boolean
  currentUserRank: LeaderboardEntry | null
}

export function useLeaderboard() {
  const entries = useState<LeaderboardEntry[]>('leaderboard-entries', () => [])
  const total = useState<number>('leaderboard-total', () => 0)
  const pages = useState<number>('leaderboard-pages', () => 0)
  const hasNext = useState<boolean>('leaderboard-has-next', () => false)
  const hasPrevious = useState<boolean>('leaderboard-has-previous', () => false)
  const currentUserRank = useState<LeaderboardEntry | null>('leaderboard-current-user', () => null)
  const isLoading = useState('leaderboard-loading', () => false)
  const error = useState<string | null>('leaderboard-error', () => null)

  const { isAuthenticated } = useAuth()
  const authFetch = useAuthFetch()

  /**
   * Fetch leaderboard data from the backend API
   * @param page - Page number (1-indexed)
   */
  const fetchLeaderboard = async (page: number = 1) => {
    if (!isAuthenticated.value) {
      error.value = '请先登录'
      return
    }

    isLoading.value = true
    error.value = null

    try {
      const response = await authFetch<ApiResponse<LeaderboardResponse>>(`/api/leaderboard?page=${page}`)

      if (response.code === 200 && response.data) {
        entries.value = response.data.entries
        total.value = response.data.total
        pages.value = response.data.pages
        hasNext.value = response.data.hasNext
        hasPrevious.value = response.data.hasPrevious
        currentUserRank.value = response.data.currentUserRank
      } else {
        error.value = response.message || '获取排行榜失败'
        entries.value = []
        total.value = 0
      }
    } catch (e: unknown) {
      const fetchError = e as { data?: ApiResponse, status?: number }
      if (fetchError.status === 401) {
        error.value = '登录已过期，请重新登录'
      } else {
        error.value = fetchError?.data?.message || '获取排行榜失败'
      }
      entries.value = []
      total.value = 0
    } finally {
      isLoading.value = false
    }
  }

  return {
    entries,
    total,
    pages,
    hasNext,
    hasPrevious,
    currentUserRank,
    isLoading,
    error,
    fetchLeaderboard
  }
}
