/**
 * Containers composable
 * Manages Docker container operations for dynamic challenges
 */

/**
 * Container info returned from API
 */
export interface Container {
  containerId: string
  challengeId: number
  challengeTitle: string
  host: string
  port: number
  createTime: number
  expireTime: number
  remainingSeconds: number
}

/**
 * Container start response (includes flag)
 */
export interface ContainerStartResponse extends Container {
  flag: string
}

/**
 * API response wrapper
 */
interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T
}

/** Container lifetime in seconds (1 hour) */
const CONTAINER_LIFETIME = 3600

/** Map to track countdown intervals */
const countdownIntervals = new Map<string, ReturnType<typeof setInterval>>()

export function useContainers() {
  const containers = useState<Container[]>('user-containers', () => [])
  const isLoading = useState('containers-loading', () => false)

  const { storedUser } = useUser()

  /**
   * Start countdown timer for a container
   * Updates remainingSeconds every second without API calls
   */
  const startCountdown = (containerId: string) => {
    // Clear existing timer if any
    stopCountdown(containerId)

    const interval = setInterval(() => {
      const container = containers.value.find(c => c.containerId === containerId)
      if (container && container.remainingSeconds > 0) {
        container.remainingSeconds--
      } else {
        stopCountdown(containerId)
      }
    }, 1000)

    countdownIntervals.set(containerId, interval)
  }

  /**
   * Stop countdown timer for a container
   */
  const stopCountdown = (containerId: string) => {
    const interval = countdownIntervals.get(containerId)
    if (interval) {
      clearInterval(interval)
      countdownIntervals.delete(containerId)
    }
  }

  /**
   * Stop all countdown timers
   */
  const stopAllCountdowns = () => {
    countdownIntervals.forEach((interval, containerId) => {
      clearInterval(interval)
      countdownIntervals.delete(containerId)
    })
  }

  /**
   * Get progress percentage for a container (0-100)
   */
  const getProgressPercentage = (remainingSeconds: number) => {
    if (remainingSeconds <= 0) return 0
    return Math.min(100, (remainingSeconds / CONTAINER_LIFETIME) * 100)
  }

  /**
   * Start a container for a challenge
   * POST /api/containers/start
   */
  const startContainer = async (challengeId: number, competitionId?: number | null) => {
    const token = storedUser.value?.token
    if (!token) {
      return { success: false, error: '请先登录' }
    }

    isLoading.value = true

    try {
      const body: { challengeId: number, competitionId?: number } = { challengeId }
      if (competitionId) {
        body.competitionId = competitionId
      }

      const response = await $fetch<ApiResponse<ContainerStartResponse>>('/api/containers/start', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body
      })

      if (response.code === 200 && response.data) {
        // Add to local containers list (without flag)
        const { flag: _flag, ...containerInfo } = response.data
        containers.value.push(containerInfo)
        return { success: true, data: response.data }
      } else {
        return { success: false, error: response.message || '启动容器失败' }
      }
    } catch (e: unknown) {
      const fetchError = e as { data?: ApiResponse, status?: number }
      if (fetchError.status === 429) {
        return { success: false, error: '启动容器过于频繁，请稍后再试' }
      } else if (fetchError.status === 400) {
        return { success: false, error: fetchError?.data?.message || '启动容器失败' }
      } else if (fetchError.status === 403) {
        return { success: false, error: fetchError?.data?.message || '您无权启动此容器' }
      } else if (fetchError.status === 404) {
        return { success: false, error: '题目不存在' }
      }
      return { success: false, error: fetchError?.data?.message || '启动容器失败' }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Stop/destroy a container
   * POST /api/containers/stop
   */
  const stopContainer = async (containerId: string) => {
    const token = storedUser.value?.token
    if (!token) {
      return { success: false, error: '请先登录' }
    }

    try {
      const response = await $fetch<ApiResponse>('/api/containers/stop', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: { containerId }
      })

      if (response.code === 200) {
        // Remove from local containers list
        containers.value = containers.value.filter(c => c.containerId !== containerId)
        return { success: true }
      } else {
        return { success: false, error: response.message || '销毁容器失败' }
      }
    } catch (e: unknown) {
      const fetchError = e as { data?: ApiResponse, status?: number }
      if (fetchError.status === 403) {
        return { success: false, error: '无权操作此容器' }
      } else if (fetchError.status === 404) {
        return { success: false, error: '容器不存在或已过期' }
      }
      return { success: false, error: fetchError?.data?.message || '销毁容器失败' }
    }
  }

  /**
   * Extend container lifetime
   * POST /api/containers/extend
   */
  const extendContainer = async (containerId: string) => {
    const token = storedUser.value?.token
    if (!token) {
      return { success: false, error: '请先登录' }
    }

    try {
      const response = await $fetch<ApiResponse<Container>>('/api/containers/extend', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: { containerId }
      })

      if (response.code === 200 && response.data) {
        // Update local container info
        const index = containers.value.findIndex(c => c.containerId === containerId)
        if (index !== -1) {
          containers.value[index] = response.data
        }
        return { success: true, data: response.data }
      } else {
        return { success: false, error: response.message || '延长时间失败' }
      }
    } catch (e: unknown) {
      const fetchError = e as { data?: ApiResponse, status?: number }
      if (fetchError.status === 400) {
        return { success: false, error: fetchError?.data?.message || '延时次数已达上限' }
      } else if (fetchError.status === 403) {
        return { success: false, error: '无权操作此容器' }
      } else if (fetchError.status === 404) {
        return { success: false, error: '容器不存在或已过期' }
      }
      return { success: false, error: fetchError?.data?.message || '延长时间失败' }
    }
  }

  /**
   * Fetch user's containers
   * GET /api/containers
   */
  const fetchContainers = async () => {
    const token = storedUser.value?.token
    if (!token) {
      return { success: false, error: '请先登录' }
    }

    isLoading.value = true

    try {
      const response = await $fetch<ApiResponse<Container[]>>('/api/containers', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (response.code === 200 && response.data) {
        containers.value = response.data
        return { success: true, data: response.data }
      } else {
        return { success: false, error: response.message || '获取容器列表失败' }
      }
    } catch (e: unknown) {
      const fetchError = e as { data?: ApiResponse }
      return { success: false, error: fetchError?.data?.message || '获取容器列表失败' }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Get container for a specific challenge
   */
  const getContainerForChallenge = (challengeId: number) => {
    return computed(() => containers.value.find(c => c.challengeId === challengeId))
  }

  /**
   * Format remaining time
   */
  const formatRemainingTime = (seconds: number) => {
    if (seconds <= 0) return '已过期'
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60)
      const remainingMinutes = minutes % 60
      return `${hours}小时${remainingMinutes}分钟`
    }
    return `${minutes}分${remainingSeconds}秒`
  }

  return {
    containers,
    isLoading,
    startContainer,
    stopContainer,
    extendContainer,
    fetchContainers,
    getContainerForChallenge,
    formatRemainingTime,
    startCountdown,
    stopCountdown,
    stopAllCountdowns,
    getProgressPercentage
  }
}
