<template>
  <NuxtLayout name="dashboard">
    <template #header-left>
      <div class="flex items-center gap-3">
        <UButton
          icon="i-lucide-arrow-left"
          color="neutral"
          variant="ghost"
          size="sm"
          aria-label="返回"
          @click="navigateTo(`/contests/${contestId}/challenges`)"
        />
        <UIcon
          name="i-lucide-trophy"
          class="w-6 h-6 text-primary-500"
        />
        <h1 class="text-xl font-semibold text-gray-900 dark:text-white">
          排行榜
        </h1>
        <UBadge
          v-if="currentContest"
          :label="currentContest.isTeamCompetition ? '团队赛' : '个人赛'"
          :color="currentContest.isTeamCompetition ? 'info' : 'success'"
          variant="subtle"
        />
      </div>
    </template>

    <template #header-right>
      <div class="flex items-center gap-3">
        <span
          v-if="currentContest"
          class="text-sm text-gray-500 dark:text-gray-400"
        >
          {{ currentContest.title }}
        </span>
        <UButton
          icon="i-lucide-refresh-cw"
          color="neutral"
          variant="ghost"
          aria-label="刷新"
          :loading="isLoadingLeaderboard"
          @click="refreshLeaderboard"
        />
      </div>
    </template>

    <div class="flex flex-col h-full">
      <!-- Main Content Area -->
      <div class="flex-1 p-6">
        <!-- Loading State -->
        <div
          v-if="isLoadingLeaderboard && entries.length === 0"
          class="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden"
        >
          <table class="w-full">
            <thead class="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
              <tr class="text-sm font-medium text-gray-500 dark:text-gray-400">
                <th class="px-4 py-3 text-left w-24">
                  排名
                </th>
                <th class="px-4 py-3 text-left">
                  {{ currentContest?.isTeamCompetition ? '战队' : '用户' }}
                </th>
                <th class="px-4 py-3 text-left w-28">
                  分数
                </th>
                <th class="px-4 py-3 text-left w-24">
                  解题数
                </th>
                <th class="px-4 py-3 text-left w-44">
                  最后提交
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
              <tr
                v-for="i in 10"
                :key="i"
              >
                <td class="px-4 py-3">
                  <USkeleton class="h-5 w-12" />
                </td>
                <td class="px-4 py-3">
                  <USkeleton class="h-5 w-32" />
                </td>
                <td class="px-4 py-3">
                  <USkeleton class="h-5 w-16" />
                </td>
                <td class="px-4 py-3">
                  <USkeleton class="h-5 w-8" />
                </td>
                <td class="px-4 py-3">
                  <USkeleton class="h-5 w-32" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Leaderboard Table -->
        <div
          v-else
          class="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden"
        >
          <table class="w-full">
            <!-- Table Header -->
            <thead class="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
              <tr class="text-sm font-medium text-gray-500 dark:text-gray-400">
                <th class="px-4 py-3 text-left w-24">
                  排名
                </th>
                <th class="px-4 py-3 text-left">
                  <!-- TODO: Display '战队' or '用户' based on isTeamCompetition from backend -->
                  {{ currentContest?.isTeamCompetition ? '战队' : '用户' }}
                </th>
                <th class="px-4 py-3 text-left w-28">
                  分数
                </th>
                <th class="px-4 py-3 text-left w-24">
                  解题数
                </th>
                <th class="px-4 py-3 text-left w-44">
                  最后提交
                </th>
              </tr>
            </thead>

            <!-- Table Body -->
            <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
              <tr
                v-for="entry in entries"
                :key="entry.id"
                class="leaderboard-row hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors"
                :class="getRankRowClass(entry.rank)"
              >
                <!-- Rank -->
                <td class="px-4 py-3">
                  <div class="flex items-center gap-2">
                    <span
                      class="font-medium"
                      :class="getRankTextClass(entry.rank)"
                    >
                      #{{ entry.rank }}
                    </span>
                    <UIcon
                      v-if="entry.rank <= 3"
                      name="i-lucide-trophy"
                      class="w-4 h-4"
                      :class="getRankIconClass(entry.rank)"
                    />
                  </div>
                </td>

                <!-- Name (User or Team based on isTeamCompetition) -->
                <!-- TODO: Display team name when isTeamCompetition is true, user nickname otherwise -->
                <td class="px-4 py-3 font-medium text-gray-900 dark:text-white">
                  {{ entry.name }}
                </td>

                <!-- Points -->
                <td class="px-4 py-3 font-semibold text-primary-600 dark:text-primary-400">
                  {{ entry.points.toLocaleString() }}
                </td>

                <!-- Solved Count -->
                <td class="px-4 py-3 text-gray-600 dark:text-gray-400">
                  {{ entry.solvedCount }}
                </td>

                <!-- Last Submit Time -->
                <td class="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                  {{ entry.lastSubmitTime }}
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Empty State -->
          <div
            v-if="entries.length === 0 && !isLoadingLeaderboard"
            class="flex flex-col items-center justify-center py-16"
          >
            <UIcon
              name="i-lucide-users"
              class="w-16 h-16 text-gray-300 dark:text-gray-700 mb-4"
            />
            <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
              暂无排名数据
            </h3>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              等待第一位选手提交 Flag
            </p>
          </div>
        </div>

        <!-- Pagination -->
        <div
          v-if="total > 0"
          class="flex items-center justify-between mt-6"
        >
          <p class="text-sm text-gray-500 dark:text-gray-400">
            显示 {{ (currentPage - 1) * pageSize + 1 }} - {{ Math.min(currentPage * pageSize, total) }} / {{ total }} {{ currentContest?.isTeamCompetition ? '支队伍' : '名选手' }}
          </p>
          <UPagination
            v-model="currentPage"
            :total="total"
            :page-count="pageSize"
          />
        </div>
      </div>

      <!-- Current User/Team Rank Bar (Sticky Bottom) -->
      <div
        v-if="currentUserRank"
        class="sticky bottom-0 z-10 bg-primary-50 dark:bg-primary-900/20 border-t border-primary-200 dark:border-primary-800"
      >
        <table class="w-full">
          <tbody>
            <tr>
              <!-- Rank -->
              <td class="px-4 py-4 w-24">
                <div class="flex items-center gap-2">
                  <span class="text-xs text-primary-500">{{ currentContest?.isTeamCompetition ? '我的战队' : '我的排名' }}</span>
                  <span class="font-bold text-primary-600 dark:text-primary-400">
                    #{{ currentUserRank.rank }}
                  </span>
                </div>
              </td>

              <!-- Name -->
              <td class="px-4 py-4 font-semibold text-gray-900 dark:text-white">
                {{ currentUserRank.name }}
              </td>

              <!-- Points -->
              <td class="px-4 py-4 w-28 font-bold text-primary-600 dark:text-primary-400">
                {{ currentUserRank.points.toLocaleString() }}
              </td>

              <!-- Solved Count -->
              <td class="px-4 py-4 w-24 font-medium text-gray-700 dark:text-gray-300">
                {{ currentUserRank.solvedCount }}
              </td>

              <!-- Last Submit Time -->
              <td class="px-4 py-4 w-44 text-sm text-gray-600 dark:text-gray-400">
                {{ currentUserRank.lastSubmitTime }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
interface ContestLeaderboardEntry {
  id: number
  rank: number
  /** User nickname for individual competition, team name for team competition */
  name: string
  points: number
  solvedCount: number
  lastSubmitTime: string
}

const route = useRoute()
const { currentContest, contests, isLoading, fetchContest, fetchContests } = useContests()

// Get contest ID from route
const contestId = computed(() => Number(route.params.id))

// Leaderboard state
const entries = ref<ContestLeaderboardEntry[]>([])
const total = ref(0)
const currentUserRank = ref<ContestLeaderboardEntry | null>(null)
const isLoadingLeaderboard = ref(false)
const currentPage = ref(1)
const pageSize = 50

/**
 * Fetch contest leaderboard from the backend
 * TODO: Replace with actual API call when backend is ready
 * TODO: API should return different data based on isTeamCompetition:
 *       - Individual: user nickname
 *       - Team: team name
 */
const fetchLeaderboard = async (page: number = 1) => {
  isLoadingLeaderboard.value = true

  try {
    // TODO: Replace with actual API endpoint
    // const response = await $fetch(`/api/contests/${contestId.value}/leaderboard`, {
    //   params: { page, pageSize }
    // })

    // Mock data for demonstration
    await new Promise(resolve => setTimeout(resolve, 300))

    const isTeam = currentContest.value?.isTeamCompetition ?? false
    const mockEntries = generateMockLeaderboardEntries(30, isTeam)
    const start = (page - 1) * pageSize
    const end = start + pageSize

    entries.value = mockEntries.slice(start, end)
    total.value = mockEntries.length

    // Mock current user/team rank
    currentUserRank.value = {
      id: 999,
      rank: 12,
      name: isTeam ? 'NKSec 战队' : 'Hacker_001',
      points: 850,
      solvedCount: 8,
      lastSubmitTime: '2024-02-10 15:30'
    }
  }
  catch (e) {
    console.error('获取排行榜失败:', e)
    entries.value = []
    total.value = 0
  }
  finally {
    isLoadingLeaderboard.value = false
  }
}

// Load contest and leaderboard data
const loadData = async () => {
  if (contests.value.length === 0) {
    await fetchContests()
  }
  await fetchContest(contestId.value)
  await fetchLeaderboard(currentPage.value)
}

// Refresh leaderboard
const refreshLeaderboard = () => {
  fetchLeaderboard(currentPage.value)
}

// Watch for page changes
watch(currentPage, (page) => {
  fetchLeaderboard(page)
})

// Helper functions
const getRankTextClass = (rank: number) => {
  switch (rank) {
    case 1:
      return 'text-yellow-600 dark:text-yellow-400'
    case 2:
      return 'text-gray-500 dark:text-gray-300'
    case 3:
      return 'text-orange-600 dark:text-orange-400'
    default:
      return 'text-gray-600 dark:text-gray-400'
  }
}

const getRankIconClass = (rank: number) => {
  switch (rank) {
    case 1:
      return 'text-yellow-500'
    case 2:
      return 'text-gray-400'
    case 3:
      return 'text-orange-500'
    default:
      return ''
  }
}

const getRankRowClass = (rank: number) => {
  switch (rank) {
    case 1:
      return 'bg-yellow-50/50 dark:bg-yellow-900/10'
    case 2:
      return 'bg-gray-50/50 dark:bg-gray-800/30'
    case 3:
      return 'bg-orange-50/50 dark:bg-orange-900/10'
    default:
      return ''
  }
}

/**
 * Generate mock leaderboard entries
 * TODO: Remove this function when backend is ready
 */
function generateMockLeaderboardEntries(count: number, isTeam: boolean): ContestLeaderboardEntry[] {
  const userNames = [
    'CyberNinja', 'H4ck3rM4n', 'SecMaster', 'BinaryWizard', 'CryptoKing',
    'PwnLord', 'ReverseGod', 'WebHunter', 'MiscMaster', 'FlagCatcher'
  ]

  const teamNames = [
    'NKSec', 'CyberForce', 'HackTeam', 'SecElite', 'ByteWarriors',
    'CodeBreakers', 'NetGuardians', 'DataMiners', 'ShellHunters', 'FlagHunters'
  ]

  const names = isTeam ? teamNames : userNames
  const entries: ContestLeaderboardEntry[] = []

  for (let i = 0; i < count; i++) {
    const basePoints = Math.max(1500 - i * 45, 100)
    const randomVariation = Math.floor(Math.random() * 30) - 15

    entries.push({
      id: i + 1,
      rank: i + 1,
      name: `${names[i % names.length]}${i >= names.length ? `_${Math.floor(i / names.length)}` : ''}`,
      points: basePoints + randomVariation,
      solvedCount: Math.max(Math.floor((basePoints + randomVariation) / 150), 1),
      lastSubmitTime: generateRandomTime()
    })
  }

  return entries
}

function generateRandomTime(): string {
  const hours = Math.floor(Math.random() * 24)
  const minutes = Math.floor(Math.random() * 60)
  const month = Math.floor(Math.random() * 2) + 1
  const day = Math.floor(Math.random() * 28) + 1
  return `2024-0${month}-${String(day).padStart(2, '0')} ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}

// SEO
useSeoMeta({
  title: () => currentContest.value ? `排行榜 - ${currentContest.value.title} - NKCTF` : '排行榜 - NKCTF',
  description: '查看比赛排行榜'
})

// Fetch data on mount
onMounted(() => {
  loadData()
})

// Watch for route changes
watch(() => route.params.id, () => {
  loadData()
})
</script>

<style scoped>
.leaderboard-row {
  transition: background-color 0.15s ease;
}
</style>
