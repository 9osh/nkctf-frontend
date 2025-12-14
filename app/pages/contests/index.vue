<template>
  <NuxtLayout name="dashboard">
    <template #header-left>
      <div class="flex items-center gap-3">
        <UIcon
          name="i-lucide-swords"
          class="w-6 h-6 text-primary-500"
        />
        <h1 class="text-xl font-semibold text-gray-900 dark:text-white">
          竞赛
        </h1>
        <UBadge
          :label="`${totalContests} 场`"
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
        @click="fetchContests"
      />
    </template>

    <div class="p-6">
      <!-- Filters -->
      <div class="flex flex-wrap items-center gap-4 mb-6">
        <!-- Status Filter -->
        <USelectMenu
          v-model="selectedStatus"
          :items="statusOptions"
          value-key="value"
          placeholder="所有状态"
          class="w-40"
        />

        <!-- Sort -->
        <USelectMenu
          v-model="sortBy"
          :items="sortOptions"
          value-key="value"
          class="w-40 ml-auto"
        />
      </div>

      <!-- Loading State -->
      <div
        v-if="isLoading"
        class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
      >
        <div
          v-for="i in 6"
          :key="i"
        >
          <UCard
            :ui="{
              root: 'h-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800',
              body: 'p-5'
            }"
          >
            <USkeleton class="h-5 w-16 mb-3" />
            <USkeleton class="h-6 w-full mb-2" />
            <USkeleton class="h-4 w-full mb-4" />
            <div class="flex items-center justify-between">
              <USkeleton class="h-4 w-32" />
              <USkeleton class="h-4 w-20" />
            </div>
          </UCard>
        </div>
      </div>

      <!-- Contest Grid -->
      <div
        v-else
        class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
      >
        <NuxtLink
          v-for="contest in filteredContests"
          :key="contest.id"
          :to="`/contests/${contest.id}`"
          class="contest-card group"
        >
          <UCard
            :ui="{
              root: 'h-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-primary-400 dark:hover:border-primary-600 transition-all duration-200 cursor-pointer',
              body: 'p-5'
            }"
          >
            <!-- Status Badge -->
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center gap-2">
                <UBadge
                  :label="getStatusText(contest.status)"
                  :color="getStatusColor(contest.status)"
                  variant="subtle"
                />
                <UBadge
                  :label="contest.isTeamCompetition ? '团队赛' : '个人赛'"
                  :color="contest.isTeamCompetition ? 'info' : 'neutral'"
                  variant="soft"
                  size="xs"
                />
              </div>
              <span
                v-if="contest.isRegistered"
                class="text-xs text-green-600 dark:text-green-400 flex items-center gap-1"
              >
                <UIcon
                  name="i-lucide-check-circle"
                  class="w-4 h-4"
                />
                已报名
              </span>
            </div>

            <!-- Title -->
            <h3 class="text-base font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
              {{ contest.title }}
            </h3>

            <!-- Description -->
            <p class="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4">
              {{ contest.description }}
            </p>

            <!-- Footer -->
            <div class="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <span class="flex items-center gap-1">
                <UIcon
                  name="i-lucide-calendar"
                  class="w-4 h-4"
                />
                {{ formatContestTime(contest) }}
              </span>
              <span class="flex items-center gap-1">
                <UIcon
                  name="i-lucide-users"
                  class="w-4 h-4"
                />
                {{ contest.participantCount }} 人
              </span>
            </div>
          </UCard>
        </NuxtLink>
      </div>

      <!-- Empty State -->
      <div
        v-if="!isLoading && filteredContests.length === 0"
        class="flex flex-col items-center justify-center py-16"
      >
        <UIcon
          name="i-lucide-calendar-x"
          class="w-16 h-16 text-gray-300 dark:text-gray-700 mb-4"
        />
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
          没有找到比赛
        </h3>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          尝试调整筛选条件
        </p>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import type { ContestStatus } from '~/composables/useContests'

useSeoMeta({
  title: '竞赛 - NKCTF',
  description: '参加 NKCTF 平台举办的各类网络安全竞赛'
})

const { contests, isLoading, fetchContests, totalContests, getStatusText, getStatusColor } = useContests()

// Filters
const selectedStatus = ref<ContestStatus | undefined>(undefined)
const sortBy = ref('newest')

// Filter options
const statusOptions = [
  { label: '所有状态', value: undefined },
  { label: '尚未开赛', value: 'inactive' },
  { label: '比赛中', value: 'active' },
  { label: '已结束', value: 'ending' }
]

const sortOptions = [
  { label: '最新发布', value: 'newest' },
  { label: '即将开始', value: 'upcoming' },
  { label: '参与人数', value: 'participants' }
]

// Computed
const filteredContests = computed(() => {
  let result = [...contests.value]

  // Status filter
  if (selectedStatus.value) {
    result = result.filter(c => c.status === selectedStatus.value)
  }

  // Sort
  switch (sortBy.value) {
    case 'newest':
      result.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
      break
    case 'upcoming':
      result.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
      break
    case 'participants':
      result.sort((a, b) => b.participantCount - a.participantCount)
      break
  }

  return result
})

// Helper functions
const formatContestTime = (contest: { startTime: string, endTime: string }) => {
  const start = new Date(contest.startTime)
  const end = new Date(contest.endTime)

  const formatDate = (date: Date) => {
    const month = date.getMonth() + 1
    const day = date.getDate()
    return `${month}/${day}`
  }

  return `${formatDate(start)} - ${formatDate(end)}`
}

// Fetch contests on mount
onMounted(() => {
  fetchContests()
})
</script>

<style scoped>
.contest-card {
  transition: transform 0.2s ease;
}

.contest-card:hover {
  transform: translateY(-2px);
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
