/**
 * Article admin composable
 * Manages admin operations for articles
 */

import type { Article, ArticleListResponse, ArticleStatus, Tag } from './useLearn'

// API Response wrapper
interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

// Admin article filter parameters
export interface AdminArticleParams {
  status?: ArticleStatus
  authorId?: number
  keyword?: string
  page?: number
}

// Review request data
export interface ReviewData {
  articleId: number
  approved: boolean
  comment?: string
}

// Tag form data
export interface TagFormData {
  id?: number
  name: string
  description?: string
  color?: string
}

/**
 * Admin composable for article management
 */
export function useArticleAdmin() {
  const config = useRuntimeConfig()
  const apiBase = config.public.apiBase as string || '/api'

  // State
  const adminArticles = useState<Article[]>('admin-articles', () => [])
  const adminPagination = useState<Omit<ArticleListResponse, 'records'>>('admin-article-pagination', () => ({
    total: 0,
    page: 1,
    size: 10,
    pages: 0,
    hasNext: false,
    hasPrevious: false
  }))
  const isLoading = useState('admin-articles-loading', () => false)
  const error = useState<string | null>('admin-articles-error', () => null)

  /**
   * Get auth headers
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
   * Fetch all articles (admin)
   */
  const fetchAllArticles = async (params: AdminArticleParams = {}) => {
    isLoading.value = true
    error.value = null

    try {
      const query = new URLSearchParams()
      if (params.status) query.append('status', params.status)
      if (params.authorId) query.append('authorId', String(params.authorId))
      if (params.keyword) query.append('keyword', params.keyword)
      query.append('page', String(params.page || 1))

      const response = await $fetch<ApiResponse<ArticleListResponse>>(
        `${apiBase}/admin/articles?${query.toString()}`,
        { headers: getAuthHeaders() }
      )

      if (response.code === 200) {
        adminArticles.value = response.data.records
        adminPagination.value = {
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
      adminArticles.value = []
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Get article detail (admin)
   */
  const fetchArticleDetail = async (id: number): Promise<Article | null> => {
    try {
      const response = await $fetch<ApiResponse<Article>>(
        `${apiBase}/admin/articles/${id}`,
        { headers: getAuthHeaders() }
      )

      if (response.code === 200) {
        return response.data
      } else {
        throw new Error(response.message)
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : '获取文章详情失败'
      return null
    }
  }

  /**
   * Review article (approve/reject)
   */
  const reviewArticle = async (data: ReviewData): Promise<boolean> => {
    isLoading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<null>>(
        `${apiBase}/admin/articles/review`,
        {
          method: 'POST',
          body: data,
          headers: getAuthHeaders()
        }
      )

      if (response.code === 200) {
        // Update local state
        const article = adminArticles.value.find(a => a.id === data.articleId)
        if (article) {
          article.status = data.approved ? 'PUBLISHED' : 'REJECTED'
          article.reviewComment = data.comment || null
        }
        return true
      } else {
        throw new Error(response.message)
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : '审核失败'
      return false
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Publish article directly (admin)
   */
  const publishDirectly = async (data: {
    title: string
    summary?: string
    content: string
    tagIds?: number[]
  }): Promise<Article | null> => {
    isLoading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<Article>>(
        `${apiBase}/admin/articles/publish`,
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
      error.value = e instanceof Error ? e.message : '发布失败'
      return null
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Delete article (admin)
   */
  const deleteArticle = async (id: number): Promise<boolean> => {
    isLoading.value = true
    error.value = null

    try {
      const response = await $fetch<ApiResponse<null>>(
        `${apiBase}/admin/articles/${id}`,
        {
          method: 'DELETE',
          headers: getAuthHeaders()
        }
      )

      if (response.code === 200) {
        adminArticles.value = adminArticles.value.filter(a => a.id !== id)
        return true
      } else {
        throw new Error(response.message)
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : '删除失败'
      return false
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Create tag
   */
  const createTag = async (data: TagFormData): Promise<Tag | null> => {
    try {
      const response = await $fetch<ApiResponse<Tag>>(
        `${apiBase}/admin/articles/tags`,
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
      error.value = e instanceof Error ? e.message : '创建标签失败'
      return null
    }
  }

  /**
   * Update tag
   */
  const updateTag = async (data: TagFormData & { id: number }): Promise<Tag | null> => {
    try {
      const response = await $fetch<ApiResponse<Tag>>(
        `${apiBase}/admin/articles/tags`,
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
      error.value = e instanceof Error ? e.message : '更新标签失败'
      return null
    }
  }

  /**
   * Delete tag
   */
  const deleteTag = async (id: number): Promise<boolean> => {
    try {
      const response = await $fetch<ApiResponse<null>>(
        `${apiBase}/admin/articles/tags/${id}`,
        {
          method: 'DELETE',
          headers: getAuthHeaders()
        }
      )

      if (response.code === 200) {
        return true
      } else {
        throw new Error(response.message)
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : '删除标签失败'
      return false
    }
  }

  return {
    // State
    adminArticles,
    adminPagination,
    isLoading,
    error,
    // Article operations
    fetchAllArticles,
    fetchArticleDetail,
    reviewArticle,
    publishDirectly,
    deleteArticle,
    // Tag operations
    createTag,
    updateTag,
    deleteTag
  }
}
