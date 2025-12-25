/**
 * User admin composable
 * Manages admin operations for user management
 */

// API Response wrapper
interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

// User roles
export type UserRole = 'USER' | 'ADMIN'

// Admin user interface
export interface AdminUser {
  id: number
  username: string
  nickname: string
  email: string
  bio?: string
  role: UserRole
  enabled: boolean
  points: number
  teamId?: number
  teamName?: string
  createTime: string
  updateTime?: string
}

// User list response
export interface AdminUserListResponse {
  records: AdminUser[]
  total: number
  page: number
  size: number
  pages: number
  hasNext: boolean
  hasPrevious: boolean
}

// Admin user filter parameters
export interface AdminUserParams {
  role?: UserRole
  enabled?: boolean
  keyword?: string
  page?: number
}

// Update user data
export interface UpdateUserData {
  nickname?: string
  bio?: string
  role?: UserRole
  enabled?: boolean
}

/**
 * Admin composable for user management
 */
export function useUserAdmin() {
  const config = useRuntimeConfig()
  const apiBase = config.public.apiBase as string || '/api'

  // Get auth headers from useAuth
  const authFetch = useAuthFetch()

  // State
  const adminUsers = useState<AdminUser[]>('admin-users', () => [])
  const adminUserPagination = useState<Omit<AdminUserListResponse, 'records'>>('admin-user-pagination', () => ({
    total: 0,
    page: 1,
    size: 30,
    pages: 0,
    hasNext: false,
    hasPrevious: false
  }))
  const isLoading = useState('admin-users-loading', () => false)
  const error = useState<string | null>('admin-users-error', () => null)

  /**
   * Fetch all users (admin)
   */
  const fetchUsers = async (params: AdminUserParams = {}) => {
    isLoading.value = true
    error.value = null

    try {
      const query = new URLSearchParams()
      if (params.role) query.append('role', params.role)
      if (params.enabled !== undefined) query.append('enabled', String(params.enabled))
      if (params.keyword) query.append('keyword', params.keyword)
      query.append('page', String(params.page || 1))

      const response = await authFetch<ApiResponse<AdminUserListResponse>>(
        `${apiBase}/admin/users?${query.toString()}`,
        {  }
      )

      if (response.code === 200) {
        adminUsers.value = response.data.records
        adminUserPagination.value = {
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
      error.value = e instanceof Error ? e.message : '获取用户列表失败'
      adminUsers.value = []
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Get user detail (admin)
   */
  const fetchUserDetail = async (id: number): Promise<AdminUser | null> => {
    try {
      const response = await authFetch<ApiResponse<AdminUser>>(
        `${apiBase}/admin/users/${id}`,
        {  }
      )

      if (response.code === 200) {
        return response.data
      } else {
        throw new Error(response.message)
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : '获取用户详情失败'
      return null
    }
  }

  /**
   * Update user info (admin)
   */
  const updateUser = async (id: number, data: UpdateUserData): Promise<AdminUser | null> => {
    isLoading.value = true
    error.value = null

    try {
      const response = await authFetch<ApiResponse<AdminUser>>(
        `${apiBase}/admin/users/${id}`,
        {
          method: 'PUT',
          body: data,
        }
      )

      if (response.code === 200) {
        // Update local state
        const index = adminUsers.value.findIndex(u => u.id === id)
        if (index !== -1) {
          adminUsers.value[index] = response.data
        }
        return response.data
      } else {
        throw new Error(response.message)
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : '更新用户失败'
      return null
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Delete user (admin)
   */
  const deleteUser = async (id: number): Promise<boolean> => {
    isLoading.value = true
    error.value = null

    try {
      const response = await authFetch<ApiResponse<null>>(
        `${apiBase}/admin/users/${id}`,
        {
          method: 'DELETE',
        }
      )

      if (response.code === 200) {
        adminUsers.value = adminUsers.value.filter(u => u.id !== id)
        return true
      } else {
        throw new Error(response.message)
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : '删除用户失败'
      return false
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Toggle user enabled status
   */
  const toggleUserEnabled = async (id: number, enabled: boolean): Promise<boolean> => {
    error.value = null

    try {
      const response = await authFetch<ApiResponse<null>>(
        `${apiBase}/admin/users/${id}/enabled`,
        {
          method: 'PATCH',
          body: { enabled },
        }
      )

      if (response.code === 200) {
        // Update local state
        const user = adminUsers.value.find(u => u.id === id)
        if (user) {
          user.enabled = enabled
        }
        return true
      } else {
        throw new Error(response.message)
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : '切换用户状态失败'
      return false
    }
  }

  /**
   * Change user role
   */
  const changeUserRole = async (id: number, role: UserRole): Promise<boolean> => {
    error.value = null

    try {
      const response = await authFetch<ApiResponse<null>>(
        `${apiBase}/admin/users/${id}/role`,
        {
          method: 'PATCH',
          body: { role },
        }
      )

      if (response.code === 200) {
        // Update local state
        const user = adminUsers.value.find(u => u.id === id)
        if (user) {
          user.role = role
        }
        return true
      } else {
        throw new Error(response.message)
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : '更改用户角色失败'
      return false
    }
  }

  return {
    // State
    adminUsers,
    adminUserPagination,
    isLoading,
    error,
    // Operations
    fetchUsers,
    fetchUserDetail,
    updateUser,
    deleteUser,
    toggleUserEnabled,
    changeUserRole
  }
}
