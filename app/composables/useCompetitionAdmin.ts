/**
 * Competition admin composable
 * Manages admin operations for competition management including challenge assignment and participants
 */

import type { ChallengeCategory, ChallengeDifficulty } from './useChallengeAdmin'

// API Response wrapper
interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

// Competition status
export type CompetitionStatus = 'inactive' | 'active' | 'ending'

// Admin competition interface
export interface AdminCompetition {
  id: number
  name: string
  description: string
  rules?: string
  status: CompetitionStatus
  isTeamCompetition: boolean
  maxTeamSize?: number
  startTime: string
  endTime: string
  participantCount: number
  challengeCount: number
  createTime: string
  updateTime?: string
}

// Competition list response
export interface AdminCompetitionListResponse {
  records: AdminCompetition[]
  total: number
  page: number
  size: number
  pages: number
  hasNext: boolean
  hasPrevious: boolean
}

// Admin competition filter parameters
export interface AdminCompetitionParams {
  status?: CompetitionStatus
  keyword?: string
  page?: number
}

// Competition form data for create/update
export interface CompetitionFormData {
  name: string
  description: string
  rules?: string
  isTeamCompetition: boolean
  maxTeamSize?: number
  startTime: string
  endTime: string
}

// Competition challenge item
export interface AdminCompetitionChallenge {
  id: number
  challengeId: number
  title: string
  category: ChallengeCategory
  difficulty: ChallengeDifficulty
  points: number
  /** Whether the challenge is enabled for practice mode */
  enabled: boolean
  /** Scoring type: STATIC or DYNAMIC */
  scoringType?: 'STATIC' | 'DYNAMIC'
  /** Maximum points for dynamic scoring */
  maxPoints?: number
  /** Minimum points for dynamic scoring */
  minPoints?: number
  sortOrder: number
}

// Participant item
export interface AdminParticipant {
  id: number
  userId?: number
  teamId?: number
  username?: string
  nickname?: string
  teamName?: string
  score: number
  solveCount: number
  joinTime: string
}

// Participant list response
export interface AdminParticipantListResponse {
  records: AdminParticipant[]
  total: number
  page: number
  size: number
  pages: number
  hasNext: boolean
  hasPrevious: boolean
}

/**
 * Admin composable for competition management
 */
export function useCompetitionAdmin() {
  const config = useRuntimeConfig()
  const apiBase = config.public.apiBase as string || '/api'

  // Get auth headers from useAuth
  const authFetch = useAuthFetch()

  // State
  const adminCompetitions = useState<AdminCompetition[]>('admin-competitions', () => [])
  const adminCompetitionPagination = useState<Omit<AdminCompetitionListResponse, 'records'>>('admin-competition-pagination', () => ({
    total: 0,
    page: 1,
    size: 30,
    pages: 0,
    hasNext: false,
    hasPrevious: false
  }))
  const isLoading = useState('admin-competitions-loading', () => false)
  const error = useState<string | null>('admin-competitions-error', () => null)

  /**
   * Fetch all competitions (admin)
   */
  const fetchCompetitions = async (params: AdminCompetitionParams = {}) => {
    isLoading.value = true
    error.value = null

    try {
      const query = new URLSearchParams()
      if (params.status) query.append('status', params.status)
      if (params.keyword) query.append('keyword', params.keyword)
      query.append('page', String(params.page || 1))

      const response = await authFetch<ApiResponse<AdminCompetitionListResponse>>(
        `${apiBase}/admin/competitions?${query.toString()}`,
        {  }
      )

      if (response.code === 200) {
        adminCompetitions.value = response.data.records
        adminCompetitionPagination.value = {
          total: response.data.total,
          page: response.data.page,
          size: response.data.size,
          pages: response.data.pages,
          hasNext: response.data.hasNext,
          hasPrevious: response.data.hasPrevious
        }
      } else {
        throw new Error(response.message)
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : '获取竞赛列表失败'
      adminCompetitions.value = []
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Get competition detail (admin)
   */
  const fetchCompetitionDetail = async (id: number): Promise<AdminCompetition | null> => {
    try {
      const response = await authFetch<ApiResponse<AdminCompetition>>(
        `${apiBase}/admin/competitions/${id}`,
        {  }
      )

      if (response.code === 200) {
        return response.data
      } else {
        throw new Error(response.message)
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : '获取竞赛详情失败'
      return null
    }
  }

  /**
   * Create competition
   */
  const createCompetition = async (data: CompetitionFormData): Promise<AdminCompetition | null> => {
    isLoading.value = true
    error.value = null

    try {
      const response = await authFetch<ApiResponse<AdminCompetition>>(
        `${apiBase}/admin/competitions`,
        {
          method: 'POST',
          body: data,
        }
      )

      if (response.code === 200) {
        return response.data
      } else {
        throw new Error(response.message)
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : '创建竞赛失败'
      return null
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Update competition
   */
  const updateCompetition = async (id: number, data: Partial<CompetitionFormData>): Promise<AdminCompetition | null> => {
    isLoading.value = true
    error.value = null

    try {
      const response = await authFetch<ApiResponse<AdminCompetition>>(
        `${apiBase}/admin/competitions/${id}`,
        {
          method: 'PUT',
          body: data,
        }
      )

      if (response.code === 200) {
        return response.data
      } else {
        throw new Error(response.message)
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : '更新竞赛失败'
      return null
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Delete competition
   */
  const deleteCompetition = async (id: number): Promise<boolean> => {
    isLoading.value = true
    error.value = null

    try {
      const response = await authFetch<ApiResponse<null>>(
        `${apiBase}/admin/competitions/${id}`,
        {
          method: 'DELETE',
        }
      )

      if (response.code === 200) {
        adminCompetitions.value = adminCompetitions.value.filter(c => c.id !== id)
        return true
      } else {
        throw new Error(response.message)
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : '删除竞赛失败'
      return false
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Change competition status
   */
  const changeCompetitionStatus = async (id: number, status: CompetitionStatus): Promise<boolean> => {
    error.value = null

    try {
      const response = await authFetch<ApiResponse<null>>(
        `${apiBase}/admin/competitions/${id}/status`,
        {
          method: 'PATCH',
          body: { status },
        }
      )

      if (response.code === 200) {
        // Update local state
        const competition = adminCompetitions.value.find(c => c.id === id)
        if (competition) {
          competition.status = status
        }
        return true
      } else {
        throw new Error(response.message)
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : '更改竞赛状态失败'
      return false
    }
  }

  // ================== Challenge Operations ==================

  /**
   * Fetch competition challenges
   */
  const fetchCompetitionChallenges = async (competitionId: number): Promise<AdminCompetitionChallenge[]> => {
    try {
      const response = await authFetch<ApiResponse<AdminCompetitionChallenge[]>>(
        `${apiBase}/admin/competitions/${competitionId}/challenges`,
        {  }
      )

      if (response.code === 200) {
        return response.data
      } else {
        throw new Error(response.message)
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : '获取竞赛题目失败'
      return []
    }
  }

  /**
   * Add challenges to competition (bulk)
   */
  const addChallengesToCompetition = async (competitionId: number, challengeIds: number[]): Promise<AdminCompetitionChallenge[] | null> => {
    error.value = null

    try {
      const response = await authFetch<ApiResponse<AdminCompetitionChallenge[]>>(
        `${apiBase}/admin/competitions/${competitionId}/challenges`,
        {
          method: 'POST',
          body: { challengeIds },
        }
      )

      if (response.code === 200) {
        return response.data
      } else {
        throw new Error(response.message)
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : '添加题目失败'
      return null
    }
  }

  /**
   * Remove challenge from competition
   */
  const removeChallengeFromCompetition = async (competitionId: number, challengeId: number): Promise<boolean> => {
    error.value = null

    try {
      const response = await authFetch<ApiResponse<null>>(
        `${apiBase}/admin/competitions/${competitionId}/challenges/${challengeId}`,
        {
          method: 'DELETE',
        }
      )

      if (response.code === 200) {
        return true
      } else {
        throw new Error(response.message)
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : '移除题目失败'
      return false
    }
  }

  /**
   * Reorder competition challenges
   */
  const reorderCompetitionChallenges = async (competitionId: number, challengeIds: number[]): Promise<AdminCompetitionChallenge[] | null> => {
    error.value = null

    try {
      const response = await authFetch<ApiResponse<AdminCompetitionChallenge[]>>(
        `${apiBase}/admin/competitions/${competitionId}/challenges/reorder`,
        {
          method: 'PUT',
          body: { challengeIds },
        }
      )

      if (response.code === 200) {
        return response.data
      } else {
        throw new Error(response.message)
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : '重排序题目失败'
      return null
    }
  }

  // ================== Participant Operations ==================

  /**
   * Fetch competition participants
   */
  const fetchParticipants = async (competitionId: number, params: { keyword?: string, page?: number } = {}): Promise<AdminParticipantListResponse | null> => {
    try {
      const query = new URLSearchParams()
      if (params.keyword) query.append('keyword', params.keyword)
      query.append('page', String(params.page || 1))

      const response = await authFetch<ApiResponse<AdminParticipantListResponse>>(
        `${apiBase}/admin/competitions/${competitionId}/participants?${query.toString()}`,
        {  }
      )

      if (response.code === 200) {
        return response.data
      } else {
        throw new Error(response.message)
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : '获取参赛者列表失败'
      return null
    }
  }

  // ================== Status Override Operations ==================

  /**
   * Set status override (admin manually forces a status)
   */
  const setStatusOverride = async (id: number, status: CompetitionStatus): Promise<boolean> => {
    error.value = null

    try {
      const response = await authFetch<ApiResponse<null>>(
        `${apiBase}/admin/competitions/${id}/status-override`,
        {
          method: 'PUT',
          body: { status }
        }
      )

      if (response.code === 200) {
        // Update local state
        const competition = adminCompetitions.value.find(c => c.id === id)
        if (competition) {
          competition.status = status
        }
        return true
      } else {
        throw new Error(response.message)
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : '设置状态覆盖失败'
      return false
    }
  }

  /**
   * Clear status override (return to time-based computation)
   */
  const clearStatusOverride = async (id: number): Promise<boolean> => {
    error.value = null

    try {
      const response = await authFetch<ApiResponse<null>>(
        `${apiBase}/admin/competitions/${id}/status-override`,
        {
          method: 'DELETE'
        }
      )

      if (response.code === 200) {
        return true
      } else {
        throw new Error(response.message)
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : '清除状态覆盖失败'
      return false
    }
  }

  return {
    // State
    adminCompetitions,
    adminCompetitionPagination,
    isLoading,
    error,
    // Competition operations
    fetchCompetitions,
    fetchCompetitionDetail,
    createCompetition,
    updateCompetition,
    deleteCompetition,
    changeCompetitionStatus,
    // Challenge operations
    fetchCompetitionChallenges,
    addChallengesToCompetition,
    removeChallengeFromCompetition,
    reorderCompetitionChallenges,
    // Participant operations
    fetchParticipants,
    // Status override operations
    setStatusOverride,
    clearStatusOverride
  }
}
