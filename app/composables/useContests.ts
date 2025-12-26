/**
 * Contests composable
 * Manages contest data fetched from the backend
 */

export type ContestStatus = 'inactive' | 'active' | 'ending'

/**
 * Scoring type for challenges
 */
export type ScoringType = 'STATIC' | 'DYNAMIC'

/**
 * First blood entry for challenge
 */
export interface FirstBloodEntry {
  rank: number
  teamName: string
  solveTime: string
}

/**
 * Challenge info in competition list
 */
export interface CompetitionChallenge {
  id: number
  title: string
  description: string
  category: string
  difficulty: 'EASY' | 'MEDIUM' | 'HARD'
  /** Static points value (used in practice mode) */
  points: number
  /** Current calculated points (for dynamic scoring in competition) */
  currentPoints?: number
  /** Scoring type: STATIC or DYNAMIC */
  scoringType: ScoringType
  /** Maximum points for dynamic scoring */
  maxPoints?: number
  /** Minimum points for dynamic scoring */
  minPoints?: number
  /** Decay factor for dynamic scoring */
  decay?: number
  solves: number
  solved: boolean
}

/**
 * Hint info in challenge detail
 */
export interface ChallengeHint {
  id: number
  cost: number
  unlocked: boolean
  content: string | null
}

/**
 * Attachment info in challenge detail
 */
export interface ChallengeAttachment {
  name: string
  url: string
}

/**
 * Detailed challenge info in competition
 */
export interface CompetitionChallengeDetail {
  competitionId: number
  challengeId: number
  title: string
  description: string
  category: string
  difficulty: 'EASY' | 'MEDIUM' | 'HARD'
  /** Static points value (used in practice mode) */
  points: number
  /** Current calculated points (for dynamic scoring in competition) */
  currentPoints?: number
  /** Scoring type: STATIC or DYNAMIC */
  scoringType: ScoringType
  /** Maximum points for dynamic scoring */
  maxPoints?: number
  /** Minimum points for dynamic scoring */
  minPoints?: number
  /** Decay factor for dynamic scoring */
  decay?: number
  solves: number
  solved: boolean
  author: string
  content: string
  hints: ChallengeHint[] | null
  attachments: ChallengeAttachment[] | null
  hasDocker: boolean
  /** First blood entries (top 3 solvers) */
  firstBloods?: FirstBloodEntry[]
}

/**
 * Contest/Competition info
 */
export interface Contest {
  id: number
  /** API returns 'name', but we map it to 'title' for frontend consistency */
  title: string
  description: string
  startTime: string
  endTime: string
  status: ContestStatus
  participantCount: number
  isRegistered: boolean
  isTeamCompetition: boolean
  /** Challenges list (only available when registered and contest is active/ending) */
  challenges?: CompetitionChallenge[] | null
}

/**
 * API response for competition list
 */
interface ApiCompetition {
  id: number
  name: string
  description: string
  isTeamCompetition: boolean
  status: ContestStatus
  startTime: string
  endTime: string
  participantCount: number
  registered: boolean
}

/**
 * API response for competition detail
 */
interface ApiCompetitionDetail extends ApiCompetition {
  challenges: CompetitionChallenge[] | null
}

/**
 * Leaderboard entry
 */
export interface LeaderboardEntry {
  rank: number
  participantId: string
  name: string
  avatar: string | null
  score: number
  solvedCount: number
  lastSubmitTime: string
}

/**
 * Leaderboard response
 */
export interface CompetitionLeaderboard {
  competitionId: number
  competitionName: string
  isTeamCompetition: boolean
  entries: LeaderboardEntry[]
  currentRank: LeaderboardEntry | null
}

/**
 * Flag submit response
 */
export interface FlagSubmitResult {
  correct: boolean
  pointsAwarded: number | null
  message: string
  totalScore: number
  rank: number
  scored: boolean
}

/**
 * API response wrapper
 */
interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T
}

export function useContests() {
  const contests = useState<Contest[]>('contests', () => [])
  const currentContest = useState<Contest | null>('current-contest', () => null)
  const currentChallengeDetail = useState<CompetitionChallengeDetail | null>('current-competition-challenge', () => null)
  const competitionLeaderboard = useState<CompetitionLeaderboard | null>('competition-leaderboard', () => null)
  const isLoading = useState('contests-loading', () => false)
  const error = useState<string | null>('contests-error', () => null)

  const { isAuthenticated } = useAuth()
  const authFetch = useAuthFetch()

  /**
   * Map API competition to frontend Contest format
   */
  const mapApiCompetitionToContest = (api: ApiCompetition): Contest => ({
    id: api.id,
    title: api.name,
    description: api.description,
    startTime: api.startTime,
    endTime: api.endTime,
    status: api.status,
    participantCount: api.participantCount,
    isRegistered: api.registered,
    isTeamCompetition: api.isTeamCompetition
  })

  /**
   * Fetch contest list from the backend
   * GET /api/competitions
   */
  const fetchContests = async () => {
    isLoading.value = true
    error.value = null

    try {
      const response = await authFetch<ApiResponse<ApiCompetition[]>>('/api/competitions')

      if (response.code === 200 && response.data) {
        contests.value = response.data.map(mapApiCompetitionToContest)
      } else {
        error.value = response.message || '获取比赛列表失败'
        contests.value = []
      }
    } catch (e: unknown) {
      const fetchError = e as { data?: ApiResponse }
      error.value = fetchError?.data?.message || '获取比赛列表失败'
      contests.value = []
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Fetch single contest detail from the backend
   * GET /api/competitions/{competitionId}
   */
  const fetchContest = async (id: number) => {
    isLoading.value = true
    error.value = null

    try {
      const response = await authFetch<ApiResponse<ApiCompetitionDetail>>(`/api/competitions/${id}`)

      if (response.code === 200 && response.data) {
        const apiData = response.data
        currentContest.value = {
          ...mapApiCompetitionToContest(apiData),
          challenges: apiData.challenges
        }
      } else {
        error.value = response.message || '获取比赛详情失败'
        currentContest.value = null
      }
    } catch (e: unknown) {
      const fetchError = e as { data?: ApiResponse, status?: number }
      if (fetchError.status === 404) {
        error.value = '比赛不存在'
      } else {
        error.value = fetchError?.data?.message || '获取比赛详情失败'
      }
      currentContest.value = null
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Fetch competition challenge detail
   * GET /api/competitions/{competitionId}/challenges/{challengeId}
   */
  const fetchCompetitionChallengeDetail = async (competitionId: number, challengeId: number) => {
    if (!isAuthenticated.value) {
      return { success: false, error: '请先登录' }
    }

    try {
      const response = await authFetch<ApiResponse<CompetitionChallengeDetail>>(
        `/api/competitions/${competitionId}/challenges/${challengeId}`
      )

      if (response.code === 200 && response.data) {
        currentChallengeDetail.value = response.data
        return { success: true, data: response.data }
      } else {
        return { success: false, error: response.message || '获取题目详情失败' }
      }
    } catch (e: unknown) {
      const fetchError = e as { data?: ApiResponse, status?: number }
      if (fetchError.status === 403) {
        return { success: false, error: fetchError?.data?.message || '您无权访问此题目' }
      } else if (fetchError.status === 404) {
        return { success: false, error: '题目不存在' }
      }
      return { success: false, error: fetchError?.data?.message || '获取题目详情失败' }
    }
  }

  /**
   * Register for a contest
   * POST /api/competitions/{competitionId}/register
   */
  const registerContest = async (id: number) => {
    if (!isAuthenticated.value) {
      return { success: false, error: '请先登录' }
    }

    try {
      const response = await authFetch<ApiResponse>(`/api/competitions/${id}/register`, {
        method: 'POST'
      })

      if (response.code === 200) {
        // Update local state
        const contest = contests.value.find(c => c.id === id)
        if (contest) {
          contest.isRegistered = true
          contest.participantCount++
        }
        if (currentContest.value?.id === id) {
          currentContest.value.isRegistered = true
          currentContest.value.participantCount++
        }

        return { success: true }
      } else {
        return { success: false, error: response.message || '报名失败' }
      }
    } catch (e: unknown) {
      const fetchError = e as { data?: ApiResponse }
      return { success: false, error: fetchError?.data?.message || '报名失败' }
    }
  }

  /**
   * Fetch competition leaderboard
   * GET /api/competitions/{competitionId}/leaderboard
   */
  const fetchCompetitionLeaderboard = async (competitionId: number) => {
    if (!isAuthenticated.value) {
      return { success: false, error: '请先登录' }
    }

    try {
      const response = await authFetch<ApiResponse<CompetitionLeaderboard>>(
        `/api/competitions/${competitionId}/leaderboard`
      )

      if (response.code === 200 && response.data) {
        competitionLeaderboard.value = response.data
        return { success: true, data: response.data }
      } else {
        return { success: false, error: response.message || '获取排行榜失败' }
      }
    } catch (e: unknown) {
      const fetchError = e as { data?: ApiResponse, status?: number }
      if (fetchError.status === 403) {
        return { success: false, error: fetchError?.data?.message || '您无权查看此排行榜' }
      }
      return { success: false, error: fetchError?.data?.message || '获取排行榜失败' }
    }
  }

  /**
   * Submit flag for competition challenge
   * POST /api/competitions/submit
   */
  const submitCompetitionFlag = async (competitionId: number, challengeId: number, flag: string) => {
    if (!isAuthenticated.value) {
      return { success: false, error: '请先登录' }
    }

    try {
      const response = await authFetch<ApiResponse<FlagSubmitResult>>('/api/competitions/submit', {
        method: 'POST',
        body: { competitionId, challengeId, flag }
      })

      if (response.code === 200 && response.data) {
        const result = response.data

        // Update local challenge solved status if correct
        if (result.correct) {
          // Update in currentContest.challenges
          if (currentContest.value?.challenges) {
            const challenge = currentContest.value.challenges.find(c => c.id === challengeId)
            if (challenge) {
              challenge.solved = true
              challenge.solves++
            }
          }
          // Update in currentChallengeDetail
          if (currentChallengeDetail.value?.challengeId === challengeId) {
            currentChallengeDetail.value.solved = true
            currentChallengeDetail.value.solves++
          }
        }

        return { success: true, data: result }
      } else {
        return { success: false, error: response.message || '提交失败' }
      }
    } catch (e: unknown) {
      const fetchError = e as { data?: ApiResponse, status?: number }
      if (fetchError.status === 429) {
        return { success: false, error: '提交过于频繁，请稍后再试' }
      } else if (fetchError.status === 403) {
        return { success: false, error: fetchError?.data?.message || '您无权提交此题目' }
      }
      return { success: false, error: fetchError?.data?.message || '提交失败' }
    }
  }

  /**
   * Clear current challenge detail
   */
  const clearChallengeDetail = () => {
    currentChallengeDetail.value = null
  }

  /**
   * Get total contest count
   */
  const totalContests = computed(() => contests.value.length)

  /**
   * Get status display text
   */
  const getStatusText = (status: ContestStatus) => {
    const statusMap: Record<ContestStatus, string> = {
      inactive: '尚未开赛',
      active: '比赛中',
      ending: '已结束'
    }
    return statusMap[status]
  }

  /**
   * Get status color
   */
  const getStatusColor = (status: ContestStatus) => {
    const colorMap: Record<ContestStatus, 'warning' | 'success' | 'neutral'> = {
      inactive: 'warning',
      active: 'success',
      ending: 'neutral'
    }
    return colorMap[status]
  }

  return {
    contests,
    currentContest,
    currentChallengeDetail,
    competitionLeaderboard,
    isLoading,
    error,
    fetchContests,
    fetchContest,
    fetchCompetitionChallengeDetail,
    registerContest,
    fetchCompetitionLeaderboard,
    submitCompetitionFlag,
    clearChallengeDetail,
    totalContests,
    getStatusText,
    getStatusColor
  }
}
