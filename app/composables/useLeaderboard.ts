/**
 * Leaderboard composable
 * Manages leaderboard data fetched from the backend
 */

export interface LeaderboardEntry {
  rank: number
  userId: number
  nickname: string
  avatar?: string
  points: number
  solvedCount: number
  lastSubmitTime: string
}

export interface LeaderboardResponse {
  entries: LeaderboardEntry[]
  total: number
  currentUserRank?: LeaderboardEntry
}

export function useLeaderboard() {
  const entries = useState<LeaderboardEntry[]>('leaderboard-entries', () => [])
  const total = useState<number>('leaderboard-total', () => 0)
  const currentUserRank = useState<LeaderboardEntry | null>('leaderboard-current-user', () => null)
  const isLoading = useState('leaderboard-loading', () => false)
  const error = useState<string | null>('leaderboard-error', () => null)

  /**
   * Fetch leaderboard data from the backend
   * TODO: Replace with actual API call when backend is ready
   * @param page - Page number (1-indexed)
   * @param pageSize - Number of entries per page
   */
  const fetchLeaderboard = async (page: number = 1, pageSize: number = 50) => {
    isLoading.value = true
    error.value = null

    try {
      // TODO: Replace with actual API endpoint
      // const response = await $fetch<LeaderboardResponse>('/api/leaderboard', {
      //   params: { page, pageSize }
      // })

      // Mock data for demonstration
      await new Promise(resolve => setTimeout(resolve, 300))

      // Generate mock data
      const mockEntries = generateMockEntries(100)
      const start = (page - 1) * pageSize
      const end = start + pageSize

      entries.value = mockEntries.slice(start, end)
      total.value = mockEntries.length

      // Mock current user rank (假设当前用户在第 42 名)
      currentUserRank.value = {
        rank: 42,
        userId: 1,
        nickname: 'Hacker_001',
        avatar: undefined,
        points: 1250,
        solvedCount: 15,
        lastSubmitTime: '2024-02-10 14:30:00'
      }
    }
    catch (e) {
      error.value = e instanceof Error ? e.message : '获取排行榜失败'
      entries.value = []
      total.value = 0
    }
    finally {
      isLoading.value = false
    }
  }

  return {
    entries,
    total,
    currentUserRank,
    isLoading,
    error,
    fetchLeaderboard
  }
}

/**
 * Generate mock leaderboard entries for demonstration
 * TODO: Remove this function when backend is ready
 */
function generateMockEntries(count: number): LeaderboardEntry[] {
  const nicknames = [
    'CyberNinja', 'H4ck3rM4n', 'SecMaster', 'BinaryWizard', 'CryptoKing',
    'PwnLord', 'ReverseGod', 'WebHunter', 'MiscMaster', 'FlagCatcher',
    'ShellPopper', 'BufferOverflow', 'SQLInjector', 'XSSHero', 'CTFPro',
    'SecurityGeek', 'CodeBreaker', 'NetWatcher', 'DataMiner', 'ByteRunner', 'gosh', 'fuckyou'
  ]

  const entries: LeaderboardEntry[] = []

  for (let i = 0; i < count; i++) {
    const basePoints = Math.max(5000 - i * 45, 100)
    const randomVariation = Math.floor(Math.random() * 50) - 25

    entries.push({
      rank: i + 1,
      userId: i + 1,
      nickname: `${nicknames[i % nicknames.length]}${i >= nicknames.length ? `_${Math.floor(i / nicknames.length)}` : ''}`,
      avatar: undefined,
      points: basePoints + randomVariation,
      solvedCount: Math.max(Math.floor((basePoints + randomVariation) / 100), 1),
      lastSubmitTime: generateRandomDate()
    })
  }

  return entries
}

/**
 * Generate random date string within the last 30 days
 */
function generateRandomDate(): string {
  const now = new Date()
  const daysAgo = Math.floor(Math.random() * 30)
  const hoursAgo = Math.floor(Math.random() * 24)
  const minutesAgo = Math.floor(Math.random() * 60)

  const date = new Date(now)
  date.setDate(date.getDate() - daysAgo)
  date.setHours(date.getHours() - hoursAgo)
  date.setMinutes(date.getMinutes() - minutesAgo)

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')

  return `${year}-${month}-${day} ${hours}:${minutes}`
}
