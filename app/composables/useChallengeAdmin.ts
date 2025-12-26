/**
 * Challenge admin composable
 * Manages admin operations for challenge management including hints and attachments
 */

// API Response wrapper
interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

// Challenge category
export type ChallengeCategory = 'WEB' | 'PWN' | 'CRYPTO' | 'REVERSE' | 'MISC' | 'BLOCKCHAIN'

// Challenge difficulty
export type ChallengeDifficulty = 'EASY' | 'MEDIUM' | 'HARD'

// Scoring type for challenges
export type ScoringType = 'STATIC' | 'DYNAMIC'

// Admin hint interface
export interface AdminHint {
  id: number
  content: string
  cost: number
  sortOrder: number
}

// Admin challenge interface
export interface AdminChallenge {
  id: number
  title: string
  description: string
  content?: string
  category: ChallengeCategory
  difficulty: ChallengeDifficulty
  /** Static points value (used in practice mode) */
  points: number
  /** Scoring type: STATIC or DYNAMIC */
  scoringType: ScoringType
  /** Maximum points for dynamic scoring */
  maxPoints?: number
  /** Minimum points for dynamic scoring */
  minPoints?: number
  /** Decay factor for dynamic scoring (solves needed to reach minPoints) */
  decay?: number
  flag: string
  author?: string
  isDynamic: boolean
  dockerImage?: string
  attachmentUrl?: string
  enabled: boolean
  solveCount: number
  hints: AdminHint[]
  createTime: string
  updateTime?: string
}

// Challenge list item (for list view without full details)
export interface AdminChallengeListItem {
  id: number
  title: string
  category: ChallengeCategory
  difficulty: ChallengeDifficulty
  points: number
  /** Scoring type: STATIC or DYNAMIC */
  scoringType: ScoringType
  /** Maximum points for dynamic scoring */
  maxPoints?: number
  /** Minimum points for dynamic scoring */
  minPoints?: number
  enabled: boolean
  isDynamic: boolean
  solveCount: number
  createTime: string
}

// Challenge list response
export interface AdminChallengeListResponse {
  records: AdminChallengeListItem[]
  total: number
  page: number
  size: number
  pages: number
  hasNext: boolean
  hasPrevious: boolean
}

// Admin challenge filter parameters
export interface AdminChallengeParams {
  category?: ChallengeCategory
  difficulty?: ChallengeDifficulty
  enabled?: boolean
  keyword?: string
  page?: number
}

// Challenge form data for create/update
export interface ChallengeFormData {
  title: string
  description: string
  content?: string
  category: ChallengeCategory
  difficulty: ChallengeDifficulty
  /** Static points value (required, used in practice mode) */
  points: number
  /** Scoring type: STATIC or DYNAMIC (default: STATIC) */
  scoringType?: ScoringType
  /** Maximum points for dynamic scoring (required if scoringType=DYNAMIC) */
  maxPoints?: number
  /** Minimum points for dynamic scoring (required if scoringType=DYNAMIC) */
  minPoints?: number
  /** Decay factor for dynamic scoring (default: 20) */
  decay?: number
  /** Flag value (required if isDynamic=false) */
  flag?: string
  author?: string
  /** Whether challenge uses dynamic container */
  isDynamic: boolean
  /** Docker image (required if isDynamic=true) */
  dockerImage?: string
  /** Whether visible in practice mode */
  enabled?: boolean
}

// Hint form data
export interface HintFormData {
  content: string
  cost: number
}

// Attachment response
export interface AttachmentResponse {
  url: string
  filename: string
  size: number
}

/**
 * Admin composable for challenge management
 */
export function useChallengeAdmin() {
  const config = useRuntimeConfig()
  const apiBase = config.public.apiBase as string || '/api'

  // Get auth headers from useAuth
  const authFetch = useAuthFetch()

  // State
  const adminChallenges = useState<AdminChallengeListItem[]>('admin-challenges', () => [])
  const adminChallengePagination = useState<Omit<AdminChallengeListResponse, 'records'>>('admin-challenge-pagination', () => ({
    total: 0,
    page: 1,
    size: 30,
    pages: 0,
    hasNext: false,
    hasPrevious: false
  }))
  const isLoading = useState('admin-challenges-loading', () => false)
  const error = useState<string | null>('admin-challenges-error', () => null)

  /**
   * Fetch all challenges (admin)
   */
  const fetchChallenges = async (params: AdminChallengeParams = {}) => {
    isLoading.value = true
    error.value = null

    try {
      const query = new URLSearchParams()
      if (params.category) query.append('category', params.category)
      if (params.difficulty) query.append('difficulty', params.difficulty)
      if (params.enabled !== undefined) query.append('enabled', String(params.enabled))
      if (params.keyword) query.append('keyword', params.keyword)
      query.append('page', String(params.page || 1))

      const response = await authFetch<ApiResponse<AdminChallengeListResponse>>(
        `${apiBase}/admin/challenges?${query.toString()}`,
        {  }
      )

      if (response.code === 200) {
        adminChallenges.value = response.data.records
        adminChallengePagination.value = {
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
      error.value = e instanceof Error ? e.message : '获取题目列表失败'
      adminChallenges.value = []
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Get challenge detail (admin) - includes flag and hints
   */
  const fetchChallengeDetail = async (id: number): Promise<AdminChallenge | null> => {
    try {
      const response = await authFetch<ApiResponse<AdminChallenge>>(
        `${apiBase}/admin/challenges/${id}`,
        {  }
      )

      if (response.code === 200) {
        return response.data
      } else {
        throw new Error(response.message)
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : '获取题目详情失败'
      return null
    }
  }

  /**
   * Create challenge
   */
  const createChallenge = async (data: ChallengeFormData): Promise<AdminChallenge | null> => {
    isLoading.value = true
    error.value = null

    try {
      const response = await authFetch<ApiResponse<AdminChallenge>>(
        `${apiBase}/admin/challenges`,
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
      error.value = e instanceof Error ? e.message : '创建题目失败'
      return null
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Update challenge
   */
  const updateChallenge = async (id: number, data: Partial<ChallengeFormData>): Promise<AdminChallenge | null> => {
    isLoading.value = true
    error.value = null

    try {
      const response = await authFetch<ApiResponse<AdminChallenge>>(
        `${apiBase}/admin/challenges/${id}`,
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
      error.value = e instanceof Error ? e.message : '更新题目失败'
      return null
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Delete challenge
   */
  const deleteChallenge = async (id: number): Promise<boolean> => {
    isLoading.value = true
    error.value = null

    try {
      const response = await authFetch<ApiResponse<null>>(
        `${apiBase}/admin/challenges/${id}`,
        {
          method: 'DELETE',
          
        }
      )

      if (response.code === 200) {
        adminChallenges.value = adminChallenges.value.filter(c => c.id !== id)
        return true
      } else {
        throw new Error(response.message)
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : '删除题目失败'
      return false
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Toggle challenge enabled status
   */
  const toggleChallengeEnabled = async (id: number, enabled: boolean): Promise<boolean> => {
    error.value = null

    try {
      const response = await authFetch<ApiResponse<null>>(
        `${apiBase}/admin/challenges/${id}/enabled`,
        {
          method: 'PATCH',
          body: { enabled },
          
        }
      )

      if (response.code === 200) {
        // Update local state
        const challenge = adminChallenges.value.find(c => c.id === id)
        if (challenge) {
          challenge.enabled = enabled
        }
        return true
      } else {
        throw new Error(response.message)
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : '切换题目状态失败'
      return false
    }
  }

  // ================== Attachment Operations ==================

  /**
   * Upload attachment
   */
  const uploadAttachment = async (challengeId: number, file: File): Promise<AttachmentResponse | null> => {
    error.value = null

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await authFetch<ApiResponse<AttachmentResponse>>(
        `${apiBase}/admin/challenges/${challengeId}/attachment`,
        {
          method: 'POST',
          body: formData,
          
        }
      )

      if (response.code === 200) {
        return response.data
      } else {
        throw new Error(response.message)
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : '上传附件失败'
      return null
    }
  }

  /**
   * Delete attachment
   */
  const deleteAttachment = async (challengeId: number): Promise<boolean> => {
    error.value = null

    try {
      const response = await authFetch<ApiResponse<null>>(
        `${apiBase}/admin/challenges/${challengeId}/attachment`,
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
      error.value = e instanceof Error ? e.message : '删除附件失败'
      return false
    }
  }

  // ================== Hint Operations ==================

  /**
   * Fetch hints for a challenge
   */
  const fetchHints = async (challengeId: number): Promise<AdminHint[]> => {
    try {
      const response = await authFetch<ApiResponse<AdminHint[]>>(
        `${apiBase}/admin/challenges/${challengeId}/hints`,
        {  }
      )

      if (response.code === 200) {
        return response.data
      } else {
        throw new Error(response.message)
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : '获取提示列表失败'
      return []
    }
  }

  /**
   * Create hint
   */
  const createHint = async (challengeId: number, data: HintFormData): Promise<AdminHint | null> => {
    error.value = null

    try {
      const response = await authFetch<ApiResponse<AdminHint>>(
        `${apiBase}/admin/challenges/${challengeId}/hints`,
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
      error.value = e instanceof Error ? e.message : '创建提示失败'
      return null
    }
  }

  /**
   * Update hint
   */
  const updateHint = async (challengeId: number, hintId: number, data: HintFormData): Promise<AdminHint | null> => {
    error.value = null

    try {
      const response = await authFetch<ApiResponse<AdminHint>>(
        `${apiBase}/admin/challenges/${challengeId}/hints/${hintId}`,
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
      error.value = e instanceof Error ? e.message : '更新提示失败'
      return null
    }
  }

  /**
   * Delete hint
   */
  const deleteHint = async (challengeId: number, hintId: number): Promise<boolean> => {
    error.value = null

    try {
      const response = await authFetch<ApiResponse<null>>(
        `${apiBase}/admin/challenges/${challengeId}/hints/${hintId}`,
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
      error.value = e instanceof Error ? e.message : '删除提示失败'
      return false
    }
  }

  /**
   * Reorder hints
   */
  const reorderHints = async (challengeId: number, hintIds: number[]): Promise<AdminHint[] | null> => {
    error.value = null

    try {
      const response = await authFetch<ApiResponse<AdminHint[]>>(
        `${apiBase}/admin/challenges/${challengeId}/hints/reorder`,
        {
          method: 'PUT',
          body: { hintIds },
          
        }
      )

      if (response.code === 200) {
        return response.data
      } else {
        throw new Error(response.message)
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : '重排序提示失败'
      return null
    }
  }

  return {
    // State
    adminChallenges,
    adminChallengePagination,
    isLoading,
    error,
    // Challenge operations
    fetchChallenges,
    fetchChallengeDetail,
    createChallenge,
    updateChallenge,
    deleteChallenge,
    toggleChallengeEnabled,
    // Attachment operations
    uploadAttachment,
    deleteAttachment,
    // Hint operations
    fetchHints,
    createHint,
    updateHint,
    deleteHint,
    reorderHints
  }
}
