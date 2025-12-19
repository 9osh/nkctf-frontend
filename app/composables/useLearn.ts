/**
 * Learning articles composable
 * Manages article data fetched from the backend
 */

// API Response wrapper
interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

// Author information
export interface Author {
  id: number
  username: string
  nickname: string
  avatar: string | null
}

// Tag definition
export interface Tag {
  id: number
  name: string
  color: string
  description?: string
  articleCount?: number
}

// Article status type
export type ArticleStatus = 'DRAFT' | 'PENDING' | 'PUBLISHED' | 'REJECTED'

// Article list item (from API response)
export interface Article {
  id: number
  title: string
  summary: string
  content?: string
  author: Author
  status: ArticleStatus
  tags: Tag[]
  viewCount: number
  reviewComment?: string | null
  reviewer?: Author | null
  reviewTime?: string | null
  publishTime?: string | null
  createTime: string
  updateTime: string
}

// Paginated response
export interface ArticleListResponse {
  records: Article[]
  total: number
  page: number
  size: number
  pages: number
  hasNext: boolean
  hasPrevious: boolean
}

// Filter parameters for published articles
export interface PublishedArticleParams {
  tagId?: number
  keyword?: string
  sortBy?: 'newest' | 'most_views'
  page?: number
}

// Filter parameters for my articles
export interface MyArticleParams {
  status?: ArticleStatus
  page?: number
}

// Article form data for create/update
export interface ArticleFormData {
  id?: number
  title: string
  summary?: string
  content: string
  tagIds?: number[]
}

/**
 * Main composable for learning guide functionality
 */
export function useLearn() {
  const config = useRuntimeConfig()
  const apiBase = config.public.apiBase as string || '/api'

  // State
  const articles = useState<Article[]>('articles', () => [])
  const currentArticle = useState<Article | null>('current-article', () => null)
  const tags = useState<Tag[]>('article-tags', () => [])
  const pagination = useState<Omit<ArticleListResponse, 'records'>>('article-pagination', () => ({
    total: 0,
    page: 1,
    size: 10,
    pages: 0,
    hasNext: false,
    hasPrevious: false
  }))
  const isLoading = useState('articles-loading', () => false)
  const error = useState<string | null>('articles-error', () => null)

  /**
   * Get auth headers for authenticated requests
   */
  const getAuthHeaders = (): Record<string, string> => {
    if (import.meta.client) {
      const token = localStorage.getItem('token')
      if (token) {
        return { Authorization: `Bearer ${token}` }
      }
    }
    return {}
  }

  /**
   * Fetch all tags (public)
   */
  const fetchTags = async (): Promise<Tag[]> => {
    try {
      const response = await $fetch<ApiResponse<Tag[]>>(`${apiBase}/articles/tags`)
      if (response.code === 200) {
        tags.value = response.data
        return response.data
      }
      throw new Error(response.message)
    } catch (e) {
      console.error('Failed to fetch tags:', e)
      return []
    }
  }

  /**
   * Fetch published articles list (public)
   */
  const fetchPublishedArticles = async (params: PublishedArticleParams = {}) => {
    isLoading.value = true
    error.value = null

    try {
      const query = new URLSearchParams()
      if (params.tagId) query.append('tagId', String(params.tagId))
      if (params.keyword) query.append('keyword', params.keyword)
      if (params.sortBy) query.append('sortBy', params.sortBy)
      query.append('page', String(params.page || 1))

      const response = await $fetch<ApiResponse<ArticleListResponse>>(
        `${apiBase}/articles/published?${query.toString()}`
      )

      if (response.code === 200) {
        articles.value = response.data.records
        pagination.value = {
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
      error.value = e instanceof Error ? e.message : '获取文章列表失败'
      articles.value = []
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Fetch single published article detail (public)
   */
  const fetchPublishedArticle = async (id: number) => {
    isLoading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<Article>>(
        `${apiBase}/articles/published/${id}`
      )

      if (response.code === 200) {
        currentArticle.value = response.data
        return response.data
      } else {
        throw new Error(response.message)
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : '获取文章详情失败'
      currentArticle.value = null
      return null
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Fetch my articles (authenticated)
   */
  const fetchMyArticles = async (params: MyArticleParams = {}) => {
    isLoading.value = true
    error.value = null

    try {
      const query = new URLSearchParams()
      if (params.status) query.append('status', params.status)
      query.append('page', String(params.page || 1))

      const response = await $fetch<ApiResponse<ArticleListResponse>>(
        `${apiBase}/articles/my?${query.toString()}`,
        { headers: getAuthHeaders() }
      )

      if (response.code === 200) {
        articles.value = response.data.records
        pagination.value = {
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
      error.value = e instanceof Error ? e.message : '获取我的文章失败'
      articles.value = []
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Fetch my single article detail (authenticated)
   */
  const fetchMyArticle = async (id: number) => {
    isLoading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<Article>>(
        `${apiBase}/articles/my/${id}`,
        { headers: getAuthHeaders() }
      )

      if (response.code === 200) {
        currentArticle.value = response.data
        return response.data
      } else {
        throw new Error(response.message)
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : '获取文章详情失败'
      currentArticle.value = null
      return null
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Create a new article draft (authenticated)
   */
  const createArticle = async (data: ArticleFormData): Promise<Article | null> => {
    isLoading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<Article>>(
        `${apiBase}/articles`,
        {
          method: 'POST',
          body: data,
          headers: getAuthHeaders()
        }
      )

      if (response.code === 200) {
        return response.data
      } else {
        throw new Error(response.message)
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : '创建文章失败'
      return null
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Update an existing article (authenticated)
   */
  const updateArticle = async (data: ArticleFormData & { id: number }): Promise<Article | null> => {
    isLoading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<Article>>(
        `${apiBase}/articles`,
        {
          method: 'PUT',
          body: data,
          headers: getAuthHeaders()
        }
      )

      if (response.code === 200) {
        return response.data
      } else {
        throw new Error(response.message)
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : '更新文章失败'
      return null
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Delete an article (authenticated)
   */
  const deleteArticle = async (id: number): Promise<boolean> => {
    isLoading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<null>>(
        `${apiBase}/articles/${id}`,
        {
          method: 'DELETE',
          headers: getAuthHeaders()
        }
      )

      if (response.code === 200) {
        // Remove from local state
        articles.value = articles.value.filter(a => a.id !== id)
        return true
      } else {
        throw new Error(response.message)
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : '删除文章失败'
      return false
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Submit article for review (authenticated)
   */
  const submitForReview = async (id: number): Promise<boolean> => {
    isLoading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<null>>(
        `${apiBase}/articles/${id}/submit`,
        {
          method: 'POST',
          headers: getAuthHeaders()
        }
      )

      if (response.code === 200) {
        // Update local state
        const article = articles.value.find(a => a.id === id)
        if (article) {
          article.status = 'PENDING'
        }
        return true
      } else {
        throw new Error(response.message)
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : '提交审核失败'
      return false
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Get total article count
   */
  const totalArticles = computed(() => pagination.value.total)

  /**
   * Clear current article state
   */
  const clearCurrentArticle = () => {
    currentArticle.value = null
  }

  /**
   * Clear error state
   */
  const clearError = () => {
    error.value = null
  }

  return {
    // State
    articles,
    currentArticle,
    tags,
    pagination,
    isLoading,
    error,
    // Public API
    fetchTags,
    fetchPublishedArticles,
    fetchPublishedArticle,
    // User API
    fetchMyArticles,
    fetchMyArticle,
    createArticle,
    updateArticle,
    deleteArticle,
    submitForReview,
    // Computed
    totalArticles,
    // Utils
    clearCurrentArticle,
    clearError
  }
}
