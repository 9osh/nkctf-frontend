<template>
  <NuxtLayout name="dashboard">
    <template #header-left>
      <div class="flex items-center gap-3">
        <UIcon
          name="i-lucide-trophy"
          class="w-6 h-6 text-primary-500"
        />
        <h1 class="text-xl font-semibold text-gray-900 dark:text-white">
          排行榜
        </h1>
        <UBadge
          :label="`${total} 名选手`"
          color="primary"
          variant="subtle"
        />
      </div>
    </template>

    <template #header-right>
      <UButton
        icon="i-lucide-refresh-cw"
        color="neutral"
        variant="ghost"
        aria-label="刷新"
        :loading="isLoading"
        @click="refreshLeaderboard"
      />
    </template>

    <div class="flex flex-col h-full">
      <!-- Main Content Area -->
      <div class="flex-1 p-6">
        <!-- Loading State -->
        <div
          v-if="isLoading && entries.length === 0"
          class="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden"
        >
          <table class="w-full">
            <thead class="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
              <tr class="text-sm font-medium text-gray-500 dark:text-gray-400">
                <th class="px-4 py-3 text-left w-24">
                  排名
                </th>
                <th class="px-4 py-3 text-left">
                  用户
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
                  用户
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
                :key="entry.userId"
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

                <!-- User -->
                <td class="px-4 py-3 font-medium text-gray-900 dark:text-white">
                  {{ entry.nickname }}
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
            v-if="entries.length === 0 && !isLoading"
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
            显示 {{ (currentPage - 1) * pageSize + 1 }} - {{ Math.min(currentPage * pageSize, total) }} / {{ total }} 名
          </p>
          <UPagination
            v-model="currentPage"
            :total="total"
            :page-count="pageSize"
          />
        </div>
      </div>

      <!-- Current User Rank Bar (Sticky Bottom) -->
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
                  <span class="text-xs text-primary-500">我的排名</span>
                  <span class="font-bold text-primary-600 dark:text-primary-400">
                    #{{ currentUserRank.rank }}
                  </span>
                </div>
              </td>

              <!-- User -->
              <td class="px-4 py-4 font-semibold text-gray-900 dark:text-white">
                {{ currentUserRank.nickname }}
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
useSeoMeta({
  title: '排行榜 - NKCTF',
  description: '查看 NKCTF 平台选手排名，了解最新竞赛排行情况'
})

const { entries, total, currentUserRank, isLoading, fetchLeaderboard } = useLeaderboard()

// Pagination
const currentPage = ref(1)
const pageSize = 50

// Fetch leaderboard on page change
watch(currentPage, (page) => {
  fetchLeaderboard(page, pageSize)
})

// Initial fetch
onMounted(() => {
  fetchLeaderboard(currentPage.value, pageSize)
})

// Refresh function
const refreshLeaderboard = () => {
  fetchLeaderboard(currentPage.value, pageSize)
}

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
</script>

<style scoped>
.leaderboard-row {
  transition: background-color 0.15s ease;
}
</style>
