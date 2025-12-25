<template>
  <NuxtLayout name="dashboard">
    <template #header-left>
      <div class="flex items-center gap-3">
        <UIcon
          name="i-lucide-trophy"
          class="w-6 h-6 text-primary-500"
        />
        <h1 class="text-xl font-semibold text-gray-900 dark:text-white">
          竞赛管理
        </h1>
        <UBadge
          :label="`${adminCompetitionPagination.total} 场`"
          color="primary"
          variant="subtle"
        />
      </div>
    </template>

    <template #header-right>
      <UButton
        icon="i-lucide-plus"
        @click="router.push('/admin/competitions/new')"
      >
        创建竞赛
      </UButton>
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
          class="w-36"
          @update:model-value="handleFilterChange"
        />

        <!-- Search -->
        <UInput
          v-model="searchQuery"
          placeholder="搜索竞赛名称..."
          icon="i-lucide-search"
          size="sm"
          class="w-64"
          @keyup.enter="handleSearch"
        />
      </div>

      <!-- Loading State -->
      <div
        v-if="isLoading"
        class="space-y-4"
      >
        <div
          v-for="i in 5"
          :key="i"
        >
          <UCard
            :ui="{
              root: 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800',
              body: 'p-5'
            }"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <USkeleton class="h-6 w-1/3 mb-3" />
                <USkeleton class="h-4 w-2/3 mb-2" />
                <USkeleton class="h-4 w-1/2" />
              </div>
              <USkeleton class="h-8 w-24" />
            </div>
          </UCard>
        </div>
      </div>

      <!-- Competition List -->
      <div
        v-else
        class="space-y-4"
      >
        <UCard
          v-for="competition in adminCompetitions"
          :key="competition.id"
          :ui="{
            root: 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800',
            body: 'p-5'
          }"
        >
          <div class="flex items-start justify-between gap-4">
            <!-- Competition Info -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-2 flex-wrap">
                <UBadge
                  :label="getStatusLabel(competition.status)"
                  :color="getStatusColor(competition.status)"
                  variant="subtle"
                  size="xs"
                />
                <UBadge
                  :label="competition.isTeamCompetition ? '团队赛' : '个人赛'"
                  :color="competition.isTeamCompetition ? 'info' : 'neutral'"
                  variant="subtle"
                  size="xs"
                />
              </div>

              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {{ competition.name }}
              </h3>

              <div class="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-2">
                <span class="flex items-center gap-1">
                  <UIcon
                    name="i-lucide-calendar"
                    class="w-4 h-4"
                  />
                  {{ formatDateTime(competition.startTime) }} - {{ formatDateTime(competition.endTime) }}
                </span>
              </div>

              <div class="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                <span class="flex items-center gap-1">
                  <UIcon
                    name="i-lucide-users"
                    class="w-3.5 h-3.5"
                  />
                  {{ competition.participantCount }} 参赛
                </span>
                <span class="flex items-center gap-1">
                  <UIcon
                    name="i-lucide-flag"
                    class="w-3.5 h-3.5"
                  />
                  {{ competition.challengeCount }} 题目
                </span>
                <span
                  v-if="competition.isTeamCompetition && competition.maxTeamSize"
                  class="flex items-center gap-1"
                >
                  <UIcon
                    name="i-lucide-users-round"
                    class="w-3.5 h-3.5"
                  />
                  最多 {{ competition.maxTeamSize }} 人/队
                </span>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex items-center gap-2 flex-shrink-0">
              <!-- Edit -->
              <UButton
                icon="i-lucide-pencil"
                color="neutral"
                variant="ghost"
                size="sm"
                aria-label="编辑"
                @click="router.push(`/admin/competitions/${competition.id}`)"
              />

              <!-- Manage Challenges -->
              <UButton
                icon="i-lucide-flag"
                color="neutral"
                variant="outline"
                size="sm"
                @click="router.push(`/admin/competitions/${competition.id}/challenges`)"
              >
                题目
              </UButton>

              <!-- View Participants -->
              <UButton
                icon="i-lucide-users"
                color="neutral"
                variant="outline"
                size="sm"
                @click="router.push(`/admin/competitions/${competition.id}/participants`)"
              >
                参赛者
              </UButton>

              <!-- Status Change -->
              <UDropdownMenu :items="getStatusActions(competition)">
                <UButton
                  icon="i-lucide-more-vertical"
                  color="neutral"
                  variant="ghost"
                  size="sm"
                  aria-label="更多操作"
                />
              </UDropdownMenu>
            </div>
          </div>
        </UCard>
      </div>

      <!-- Empty State -->
      <div
        v-if="!isLoading && adminCompetitions.length === 0"
        class="flex flex-col items-center justify-center py-16"
      >
        <UIcon
          name="i-lucide-trophy"
          class="w-16 h-16 text-gray-300 dark:text-gray-700 mb-4"
        />
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
          没有找到竞赛
        </h3>
        <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">
          尝试调整筛选条件或创建新竞赛
        </p>
        <UButton
          icon="i-lucide-plus"
          @click="router.push('/admin/competitions/new')"
        >
          创建竞赛
        </UButton>
      </div>

      <!-- Pagination -->
      <div
        v-if="adminCompetitions.length > 0"
        class="flex items-center justify-between mt-8"
      >
        <p class="text-sm text-gray-500 dark:text-gray-400">
          显示 {{ (adminCompetitionPagination.page - 1) * adminCompetitionPagination.size + 1 }} -
          {{ Math.min(adminCompetitionPagination.page * adminCompetitionPagination.size, adminCompetitionPagination.total) }} /
          {{ adminCompetitionPagination.total }} 场
        </p>
        <UPagination
          v-model:page="currentPage"
          :total="adminCompetitionPagination.total"
          :page-count="adminCompetitionPagination.size"
          @update:page="handlePageChange"
        />
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import type { AdminCompetition, CompetitionStatus } from '~/composables/useCompetitionAdmin'

// Use admin middleware for route protection
definePageMeta({
  middleware: 'admin'
})

const router = useRouter()

useSeoMeta({
  title: '竞赛管理 - NKCTF Admin',
  description: '管理 CTF 竞赛'
})

// Composables
const {
  adminCompetitions,
  adminCompetitionPagination,
  isLoading,
  fetchCompetitions,
  changeCompetitionStatus,
  deleteCompetition
} = useCompetitionAdmin()

// State
const selectedStatus = ref<CompetitionStatus | undefined>(undefined)
const searchQuery = ref('')
const currentPage = ref(1)

// Filter options
const statusOptions = [
  { label: '所有状态', value: undefined },
  { label: '未开始', value: 'inactive' as CompetitionStatus },
  { label: '进行中', value: 'active' as CompetitionStatus },
  { label: '已结束', value: 'ending' as CompetitionStatus }
]

/**
 * Get status display label
 */
const getStatusLabel = (status: CompetitionStatus): string => {
  const labels: Record<CompetitionStatus, string> = {
    inactive: '未开始',
    active: '进行中',
    ending: '已结束'
  }
  return labels[status]
}

/**
 * Get status color
 */
const getStatusColor = (status: CompetitionStatus): 'neutral' | 'success' | 'warning' => {
  const colors: Record<CompetitionStatus, 'neutral' | 'success' | 'warning'> = {
    inactive: 'neutral',
    active: 'success',
    ending: 'warning'
  }
  return colors[status]
}

/**
 * Format datetime
 */
const formatDateTime = (dateStr: string): string => {
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

/**
 * Get status action items for dropdown
 */
const getStatusActions = (competition: AdminCompetition) => {
  const actions = []

  // Status change actions
  if (competition.status !== 'inactive') {
    actions.push({
      label: '设为未开始',
      icon: 'i-lucide-pause',
      onSelect: () => handleStatusChange(competition.id, 'inactive')
    })
  }
  if (competition.status !== 'active') {
    actions.push({
      label: '设为进行中',
      icon: 'i-lucide-play',
      onSelect: () => handleStatusChange(competition.id, 'active')
    })
  }
  if (competition.status !== 'ending') {
    actions.push({
      label: '设为已结束',
      icon: 'i-lucide-square',
      onSelect: () => handleStatusChange(competition.id, 'ending')
    })
  }

  // Separator
  actions.push({ type: 'separator' as const })

  // Delete action
  actions.push({
    label: '删除竞赛',
    icon: 'i-lucide-trash-2',
    color: 'error' as const,
    onSelect: () => handleDelete(competition)
  })

  return [actions]
}

/**
 * Load competitions
 */
const loadCompetitions = async () => {
  await fetchCompetitions({
    status: selectedStatus.value,
    keyword: searchQuery.value || undefined,
    page: currentPage.value
  })
}

/**
 * Handle filter change
 */
const handleFilterChange = () => {
  currentPage.value = 1
  loadCompetitions()
}

/**
 * Handle search
 */
const handleSearch = () => {
  currentPage.value = 1
  loadCompetitions()
}

/**
 * Handle page change
 */
const handlePageChange = (page: number) => {
  currentPage.value = page
  loadCompetitions()
}

/**
 * Handle status change
 */
const handleStatusChange = async (competitionId: number, status: CompetitionStatus) => {
  await changeCompetitionStatus(competitionId, status)
}

/**
 * Handle delete
 */
const handleDelete = async (competition: AdminCompetition) => {
  if (!confirm(`确定要删除竞赛 "${competition.name}" 吗？此操作不可恢复。`)) {
    return
  }

  const success = await deleteCompetition(competition.id)
  if (success) {
    await loadCompetitions()
  }
}

// Initialize
onMounted(() => {
  loadCompetitions()
})
</script>
