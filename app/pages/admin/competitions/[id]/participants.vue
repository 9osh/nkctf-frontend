<template>
  <NuxtLayout name="dashboard">
    <template #header-left>
      <div class="flex items-center gap-3">
        <UButton
          icon="i-lucide-arrow-left"
          color="neutral"
          variant="ghost"
          size="sm"
          @click="router.push(`/admin/competitions/${competitionId}`)"
        />
        <h1 class="text-xl font-semibold text-gray-900 dark:text-white">
          参赛者列表
        </h1>
        <UBadge
          :label="`${pagination.total} ${isTeamCompetition ? '队' : '人'}`"
          color="primary"
          variant="subtle"
        />
      </div>
    </template>

    <div class="p-6">
      <!-- Filters -->
      <div class="flex flex-wrap items-center gap-4 mb-6">
        <UInput
          v-model="searchQuery"
          :placeholder="isTeamCompetition ? '搜索队伍名称...' : '搜索用户名/昵称...'"
          icon="i-lucide-search"
          size="sm"
          class="w-64"
          @keyup.enter="handleSearch"
        />
      </div>

      <!-- Loading State -->
      <div
        v-if="isLoading"
        class="space-y-3"
      >
        <div
          v-for="i in 10"
          :key="i"
          class="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
        >
          <USkeleton class="h-6 w-8" />
          <USkeleton class="h-10 w-10 rounded-full" />
          <USkeleton class="h-5 w-32" />
          <div class="flex-1" />
          <USkeleton class="h-5 w-20" />
        </div>
      </div>

      <!-- Participant List -->
      <div
        v-else-if="participants.length > 0"
        class="space-y-3"
      >
        <div
          v-for="(participant, index) in participants"
          :key="participant.id"
          class="flex items-center gap-4 p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg"
        >
          <!-- Rank -->
          <div
            class="flex-shrink-0 w-8 text-center font-bold"
            :class="{
              'text-yellow-500': index === 0,
              'text-gray-400': index === 1,
              'text-amber-600': index === 2,
              'text-gray-500 dark:text-gray-400': index > 2
            }"
          >
            {{ (pagination.page - 1) * pagination.size + index + 1 }}
          </div>

          <!-- Avatar -->
          <UAvatar
            :alt="participant.teamName || participant.nickname || participant.username"
            size="md"
          />

          <!-- Info -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <span class="font-medium text-gray-900 dark:text-white truncate">
                {{ participant.teamName || participant.nickname || participant.username }}
              </span>
              <UBadge
                v-if="participant.teamId"
                label="团队"
                color="info"
                variant="subtle"
                size="xs"
              />
            </div>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
              加入于 {{ formatDateTime(participant.joinTime) }}
            </p>
          </div>

          <!-- Stats -->
          <div class="flex items-center gap-6 text-sm">
            <div class="text-center">
              <p class="font-bold text-gray-900 dark:text-white">
                {{ participant.score }}
              </p>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                积分
              </p>
            </div>
            <div class="text-center">
              <p class="font-bold text-gray-900 dark:text-white">
                {{ participant.solveCount }}
              </p>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                解题
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div
        v-else
        class="flex flex-col items-center justify-center py-16"
      >
        <UIcon
          name="i-lucide-users"
          class="w-16 h-16 text-gray-300 dark:text-gray-700 mb-4"
        />
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
          暂无参赛者
        </h3>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          {{ searchQuery ? '没有找到匹配的参赛者' : '还没有人报名参赛' }}
        </p>
      </div>

      <!-- Pagination -->
      <div
        v-if="participants.length > 0"
        class="flex items-center justify-between mt-8"
      >
        <p class="text-sm text-gray-500 dark:text-gray-400">
          显示 {{ (pagination.page - 1) * pagination.size + 1 }} -
          {{ Math.min(pagination.page * pagination.size, pagination.total) }} /
          {{ pagination.total }} {{ isTeamCompetition ? '队' : '人' }}
        </p>
        <UPagination
          v-model:page="currentPage"
          :total="pagination.total"
          :page-count="pagination.size"
          @update:page="handlePageChange"
        />
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import type { AdminParticipant } from '~/composables/useCompetitionAdmin'

// Use admin middleware for route protection
definePageMeta({
  middleware: 'admin'
})

const route = useRoute()
const router = useRouter()

const competitionId = computed(() => Number(route.params.id))

useSeoMeta({
  title: '参赛者列表 - NKCTF Admin',
  description: '查看竞赛参赛者'
})

// Composables
const { fetchCompetitionDetail, fetchParticipants } = useCompetitionAdmin()

// State
const isLoading = ref(false)
const isTeamCompetition = ref(false)
const participants = ref<AdminParticipant[]>([])
const searchQuery = ref('')
const currentPage = ref(1)
const pagination = reactive({
  total: 0,
  page: 1,
  size: 20
})

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
 * Load competition info to determine if team competition
 */
const loadCompetitionInfo = async () => {
  const competition = await fetchCompetitionDetail(competitionId.value)
  if (competition) {
    isTeamCompetition.value = competition.isTeamCompetition
  }
}

/**
 * Load participants
 */
const loadParticipants = async () => {
  isLoading.value = true

  const result = await fetchParticipants(competitionId.value, {
    keyword: searchQuery.value || undefined,
    page: currentPage.value
  })

  if (result) {
    participants.value = result.records
    pagination.total = result.total
    pagination.page = result.page
    pagination.size = result.size
  }

  isLoading.value = false
}

/**
 * Handle search
 */
const handleSearch = () => {
  currentPage.value = 1
  loadParticipants()
}

/**
 * Handle page change
 */
const handlePageChange = (page: number) => {
  currentPage.value = page
  loadParticipants()
}

// Initialize
onMounted(async () => {
  await loadCompetitionInfo()
  await loadParticipants()
})
</script>
