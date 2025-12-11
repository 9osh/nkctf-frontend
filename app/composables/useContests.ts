/**
 * Contests composable
 * Manages contest data fetched from the backend
 */

export type ContestStatus = 'inactive' | 'active' | 'ending'

export interface Contest {
  id: number
  title: string
  description: string
  startTime: string
  endTime: string
  status: ContestStatus
  participantCount: number
  isRegistered: boolean
  /**
   * Whether this is a team competition
   * TODO: This field should come from the backend API
   */
  isTeamCompetition: boolean
}

export function useContests() {
  const contests = useState<Contest[]>('contests', () => [])
  const currentContest = useState<Contest | null>('current-contest', () => null)
  const isLoading = useState('contests-loading', () => false)
  const error = useState<string | null>('contests-error', () => null)

  /**
   * Fetch contest list from the backend
   * TODO: Replace with actual API call when backend is ready
   */
  const fetchContests = async () => {
    isLoading.value = true
    error.value = null

    try {
      // TODO: Replace with actual API endpoint
      // const response = await $fetch<Contest[]>('/api/contests')

      // Mock data for demonstration
      await new Promise(resolve => setTimeout(resolve, 300))
      contests.value = generateMockContests()
    }
    catch (e) {
      error.value = e instanceof Error ? e.message : '获取比赛列表失败'
      contests.value = []
    }
    finally {
      isLoading.value = false
    }
  }

  /**
   * Fetch single contest detail from the backend
   * TODO: Replace with actual API call when backend is ready
   */
  const fetchContest = async (id: number) => {
    isLoading.value = true
    error.value = null

    try {
      // TODO: Replace with actual API endpoint
      // const response = await $fetch<Contest>(`/api/contests/${id}`)

      // Mock data for demonstration
      await new Promise(resolve => setTimeout(resolve, 300))

      const contest = contests.value.find(c => c.id === id)
      if (!contest) {
        throw new Error('比赛不存在')
      }

      currentContest.value = contest
    }
    catch (e) {
      error.value = e instanceof Error ? e.message : '获取比赛详情失败'
      currentContest.value = null
    }
    finally {
      isLoading.value = false
    }
  }

  /**
   * Register for a contest
   * TODO: Replace with actual API call when backend is ready
   */
  const registerContest = async (id: number) => {
    try {
      // TODO: Replace with actual API endpoint
      // await $fetch(`/api/contests/${id}/register`, { method: 'POST' })

      // Mock registration
      await new Promise(resolve => setTimeout(resolve, 500))

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
    }
    catch (e) {
      return { success: false, error: e instanceof Error ? e.message : '报名失败' }
    }
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
    isLoading,
    error,
    fetchContests,
    fetchContest,
    registerContest,
    totalContests,
    getStatusText,
    getStatusColor
  }
}

/**
 * Generate mock contests for demonstration
 * TODO: Remove this function when backend is ready
 */
function generateMockContests(): Contest[] {
  return [
    {
      id: 1,
      title: 'NKCTF 2024 春季赛',
      description: '2024年春季网络安全技能竞赛，涵盖 Web、Pwn、Crypto、Reverse、Misc 等多个方向，欢迎各位选手踊跃参加！',
      startTime: '2024-03-15 09:00:00',
      endTime: '2024-03-17 18:00:00',
      status: 'ending',
      participantCount: 256,
      isRegistered: true,
      isTeamCompetition: true
    },
    {
      id: 2,
      title: 'NKCTF 新生赛',
      description: '面向2024级新生的入门级CTF比赛，题目难度较低，适合初学者参与，旨在激发同学们对网络安全的兴趣。',
      startTime: '2024-04-01 14:00:00',
      endTime: '2024-04-02 14:00:00',
      status: 'active',
      participantCount: 128,
      isRegistered: true,
      isTeamCompetition: false
    },
    {
      id: 3,
      title: 'NKCTF 2024 夏季赛',
      description: '2024年夏季大型网络安全竞赛，设有丰厚奖品，欢迎校内外选手报名参赛！',
      startTime: '2024-07-01 09:00:00',
      endTime: '2024-07-03 18:00:00',
      status: 'inactive',
      participantCount: 45,
      isRegistered: false,
      isTeamCompetition: true
    },
    {
      id: 4,
      title: 'NKCTF Mini 周赛 #12',
      description: '每周举办的小型练习赛，保持手感，提升技能。本周主题：Web 安全基础。',
      startTime: '2024-06-15 19:00:00',
      endTime: '2024-06-15 22:00:00',
      status: 'inactive',
      participantCount: 32,
      isRegistered: false,
      isTeamCompetition: false
    },
    {
      id: 5,
      title: 'NKCTF 2023 冬季赛',
      description: '2023年度收官之战，难度较高，适合有一定基础的选手挑战。',
      startTime: '2023-12-20 09:00:00',
      endTime: '2023-12-22 18:00:00',
      status: 'ending',
      participantCount: 189,
      isRegistered: true,
      isTeamCompetition: true
    }
  ]
}
