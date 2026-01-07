/**
 * Competition Status composable
 * Handles real-time status updates via WebSocket
 * with fallback to HTTP polling
 */

import type { Contest, ContestStatus } from './useContests'

/**
 * Status change event from WebSocket
 */
export interface StatusChangeEvent {
  competitionId: number
  competitionName: string
  oldStatus: string
  newStatus: string
  changedAt: string
  manualOverride: boolean
}

export function useCompetitionStatus() {
  const { subscribe, isConnected, shouldUseFallback } = useWebSocket()
  const { contests, currentContest, fetchContests, fetchContest } = useContests()
  const toast = useToast()

  // Track active subscriptions for cleanup
  const activeUnsubscribes = useState<Map<string, () => void>>('status-unsubscribes', () => new Map())

  // Fallback polling state
  const pollingInterval = ref<ReturnType<typeof setInterval> | null>(null)
  const POLL_INTERVAL = 10000 // 10 seconds

  /**
   * Handle incoming status change from WebSocket
   */
  function handleStatusChange(event: StatusChangeEvent) {
    const newStatus = event.newStatus as ContestStatus

    // Update in contests list
    const contestIndex = contests.value.findIndex(c => c.id === event.competitionId)
    if (contestIndex !== -1) {
      contests.value[contestIndex].status = newStatus
    }

    // Update current contest if it matches
    if (currentContest.value?.id === event.competitionId) {
      currentContest.value.status = newStatus
    }

    // Show notification to user
    showStatusNotification(event)
  }

  /**
   * Display toast notification for status change
   */
  function showStatusNotification(event: StatusChangeEvent) {
    const messages: Record<string, { title: string; description: string; color: 'green' | 'blue' | 'orange' }> = {
      'inactive->active': {
        title: '比赛已开始',
        description: `${event.competitionName} 已开始，快去答题吧！`,
        color: 'green'
      },
      'active->ended': {
        title: '比赛已结束',
        description: `${event.competitionName} 已结束，排行榜已冻结`,
        color: 'blue'
      },
      'active->inactive': {
        title: '比赛已暂停',
        description: `${event.competitionName} 已被管理员暂停`,
        color: 'orange'
      },
      'ended->active': {
        title: '比赛已恢复',
        description: `${event.competitionName} 已被管理员恢复为进行中`,
        color: 'green'
      },
      'inactive->ended': {
        title: '比赛已结束',
        description: `${event.competitionName} 已被管理员设为已结束`,
        color: 'blue'
      }
    }

    const key = `${event.oldStatus}->${event.newStatus}`
    const config = messages[key] || {
      title: '状态已更新',
      description: `${event.competitionName} 状态: ${event.newStatus}`,
      color: 'blue' as const
    }

    toast.add({
      title: config.title,
      description: config.description,
      icon: event.manualOverride ? 'i-lucide-shield-alert' : 'i-lucide-bell',
      color: config.color
    })
  }

  /**
   * Subscribe to a specific competition's status updates
   * Returns unsubscribe function
   */
  function subscribeToCompetition(competitionId: number): () => void {
    const topic = `/topic/competition/${competitionId}/status`

    // Check if already subscribed
    if (activeUnsubscribes.value.has(topic)) {
      return activeUnsubscribes.value.get(topic)!
    }

    const unsubscribe = subscribe<StatusChangeEvent>(topic, handleStatusChange)

    activeUnsubscribes.value.set(topic, unsubscribe)

    return () => {
      unsubscribe()
      activeUnsubscribes.value.delete(topic)
    }
  }

  /**
   * Subscribe to global status updates (all competitions)
   * Returns unsubscribe function
   */
  function subscribeToGlobalStatus(): () => void {
    const topic = '/topic/competitions/status'

    // Check if already subscribed
    if (activeUnsubscribes.value.has(topic)) {
      return activeUnsubscribes.value.get(topic)!
    }

    const unsubscribe = subscribe<StatusChangeEvent>(topic, handleStatusChange)

    activeUnsubscribes.value.set(topic, unsubscribe)

    return () => {
      unsubscribe()
      activeUnsubscribes.value.delete(topic)
    }
  }

  /**
   * Compute status from timestamps (client-side calculation)
   * Used as backup when WebSocket is not available
   */
  function computeStatus(startTime: string, endTime: string): ContestStatus {
    const now = new Date()
    const start = new Date(startTime)
    const end = new Date(endTime)

    if (now < start) return 'inactive'
    if (now < end) return 'active'
    return 'ended'
  }

  /**
   * Calculate time remaining to next state transition
   * Returns null if no upcoming transition
   *
   * NOTE: This function is time-authoritative - it uses actual timestamps
   * rather than relying solely on the status field. This handles:
   * - Status update lag from the backend
   * - Manual admin overrides
   * - Server/client time synchronization issues
   */
  function getTimeToNextTransition(contest: Contest): { label: string; milliseconds: number } | null {
    const now = new Date()
    const start = new Date(contest.startTime)
    const end = new Date(contest.endTime)

    // If we haven't reached start time, show countdown to start
    if (now < start) {
      return {
        label: '距离开始',
        milliseconds: start.getTime() - now.getTime()
      }
    }

    // If we're between start and end, show countdown to end
    if (now >= start && now < end) {
      return {
        label: '距离结束',
        milliseconds: end.getTime() - now.getTime()
      }
    }

    // Past end time - no countdown needed
    return null
  }

  /**
   * Start fallback HTTP polling
   */
  function startPolling(competitionId?: number) {
    if (pollingInterval.value) return

    pollingInterval.value = setInterval(async () => {
      try {
        if (competitionId) {
          await fetchContest(competitionId)
        } else {
          await fetchContests()
        }
      } catch {
        // Silently fail polling - don't spam errors
      }
    }, POLL_INTERVAL)

    console.log('[CompetitionStatus] Started fallback polling')
  }

  /**
   * Stop fallback HTTP polling
   */
  function stopPolling() {
    if (pollingInterval.value) {
      clearInterval(pollingInterval.value)
      pollingInterval.value = null
      console.log('[CompetitionStatus] Stopped fallback polling')
    }
  }

  /**
   * Check if submissions are allowed for this contest
   */
  function canSubmitFlag(contest: Contest): boolean {
    return contest.status === 'active' || contest.status === 'ended'
  }

  /**
   * Check if submissions will affect scoring
   */
  function willScoreSubmission(contest: Contest): boolean {
    return contest.status === 'active'
  }

  /**
   * Check if challenges should be visible
   */
  function areChallengesVisible(contest: Contest): boolean {
    return (contest.status === 'active' || contest.status === 'ended') && contest.isRegistered
  }

  /**
   * Check if leaderboard is frozen
   */
  function isLeaderboardFrozen(contest: Contest): boolean {
    return contest.status === 'ended'
  }

  // Auto-switch between WebSocket and polling
  watch(
    [isConnected, shouldUseFallback],
    ([connected, fallback]) => {
      if (!connected && fallback) {
        // WebSocket failed completely, start polling
        if (currentContest.value) {
          startPolling(currentContest.value.id)
        } else {
          startPolling()
        }
      } else if (connected) {
        // WebSocket connected, stop polling
        stopPolling()
      }
    },
    { immediate: true }
  )

  // Cleanup subscriptions on unmount
  onUnmounted(() => {
    activeUnsubscribes.value.forEach(unsubscribe => unsubscribe())
    activeUnsubscribes.value.clear()
    stopPolling()
  })

  return {
    // Subscription methods
    subscribeToCompetition,
    subscribeToGlobalStatus,

    // Status computation
    computeStatus,
    getTimeToNextTransition,

    // Polling fallback
    startPolling,
    stopPolling,

    // Status checks
    canSubmitFlag,
    willScoreSubmission,
    areChallengesVisible,
    isLeaderboardFrozen
  }
}
