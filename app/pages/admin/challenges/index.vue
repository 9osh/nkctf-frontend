<template>
  <NuxtLayout name="dashboard">
    <template #header-left>
      <div class="flex items-center gap-3">
        <UIcon
          name="i-lucide-flag"
          class="w-6 h-6 text-primary-500"
        />
        <h1 class="text-xl font-semibold text-gray-900 dark:text-white">
          题目管理
        </h1>
        <UBadge
          :label="`${adminChallengePagination.total} 题`"
          color="primary"
          variant="subtle"
        />
      </div>
    </template>

    <template #header-right>
      <UButton
        icon="i-lucide-plus"
        @click="router.push('/admin/challenges/new')"
      >
        创建题目
      </UButton>
    </template>

    <div class="p-6">
      <!-- Filters -->
      <div class="flex flex-wrap items-center gap-4 mb-6">
        <!-- Category Filter -->
        <USelectMenu
          v-model="selectedCategory"
          :items="categoryOptions"
          value-key="value"
          placeholder="所有分类"
          class="w-36"
          @update:model-value="handleFilterChange"
        />

        <!-- Difficulty Filter -->
        <USelectMenu
          v-model="selectedDifficulty"
          :items="difficultyOptions"
          value-key="value"
          placeholder="所有难度"
          class="w-36"
          @update:model-value="handleFilterChange"
        />

        <!-- Enabled Filter -->
        <USelectMenu
          v-model="selectedEnabled"
          :items="enabledOptions"
          value-key="value"
          placeholder="所有状态"
          class="w-36"
          @update:model-value="handleFilterChange"
        />

        <!-- Search -->
        <UInput
          v-model="searchQuery"
          placeholder="搜索题目标题..."
          icon="i-lucide-search"
          size="sm"
          class="w-64"
          @keyup.enter="handleSearch"
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
              root: 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800',
              body: 'p-5'
            }"
          >
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <USkeleton class="h-5 w-16" />
                <USkeleton class="h-5 w-12" />
              </div>
              <USkeleton class="h-6 w-3/4" />
              <USkeleton class="h-4 w-1/2" />
              <div class="flex justify-between items-center pt-2">
                <USkeleton class="h-4 w-20" />
                <USkeleton class="h-8 w-24" />
              </div>
            </div>
          </UCard>
        </div>
      </div>

      <!-- Challenge Grid -->
      <div
        v-else
        class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
      >
        <UCard
          v-for="challenge in adminChallenges"
          :key="challenge.id"
          :ui="{
            root: 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-primary-300 dark:hover:border-primary-700 transition-colors cursor-pointer',
            body: 'p-5'
          }"
          @click="router.push(`/admin/challenges/${challenge.id}`)"
        >
          <div class="space-y-3">
            <!-- Header: Category & Difficulty -->
            <div class="flex items-center justify-between">
              <UBadge
                :label="getCategoryLabel(challenge.category)"
                :color="getCategoryColor(challenge.category)"
                variant="subtle"
                size="xs"
              />
              <UBadge
                :label="getDifficultyLabel(challenge.difficulty)"
                :color="getDifficultyColor(challenge.difficulty)"
                variant="subtle"
                size="xs"
              />
            </div>

            <!-- Title -->
            <h3 class="text-base font-semibold text-gray-900 dark:text-white line-clamp-1">
              {{ challenge.title }}
            </h3>

            <!-- Info Row -->
            <div class="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
              <span class="flex items-center gap-1">
                <UIcon
                  name="i-lucide-star"
                  class="w-3.5 h-3.5"
                />
                {{ challenge.points }} 分
              </span>
              <span class="flex items-center gap-1">
                <UIcon
                  name="i-lucide-check-circle"
                  class="w-3.5 h-3.5"
                />
                {{ challenge.solveCount }} 解
              </span>
              <span
                v-if="challenge.isDynamic"
                class="flex items-center gap-1 text-blue-500"
              >
                <UIcon
                  name="i-lucide-container"
                  class="w-3.5 h-3.5"
                />
                容器
              </span>
              <span
                v-if="challenge.scoringType === 'DYNAMIC'"
                class="flex items-center gap-1 text-purple-500"
              >
                <UIcon
                  name="i-lucide-trending-down"
                  class="w-3.5 h-3.5"
                />
                动态分
              </span>
            </div>

            <!-- Footer: Status & Actions -->
            <div class="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
              <UBadge
                :label="challenge.enabled ? '已启用' : '已禁用'"
                :color="challenge.enabled ? 'success' : 'neutral'"
                variant="subtle"
                size="xs"
              />
              <div
                class="flex items-center gap-1"
                @click.stop
              >
                <UButton
                  :icon="challenge.enabled ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                  :color="challenge.enabled ? 'warning' : 'success'"
                  variant="ghost"
                  size="xs"
                  :aria-label="challenge.enabled ? '禁用' : '启用'"
                  @click="handleToggleEnabled(challenge)"
                />
                <UButton
                  icon="i-lucide-trash-2"
                  color="error"
                  variant="ghost"
                  size="xs"
                  aria-label="删除"
                  @click="handleDelete(challenge)"
                />
              </div>
            </div>
          </div>
        </UCard>
      </div>

      <!-- Empty State -->
      <div
        v-if="!isLoading && adminChallenges.length === 0"
        class="flex flex-col items-center justify-center py-16"
      >
        <UIcon
          name="i-lucide-flag-off"
          class="w-16 h-16 text-gray-300 dark:text-gray-700 mb-4"
        />
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
          没有找到题目
        </h3>
        <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">
          尝试调整筛选条件或创建新题目
        </p>
        <UButton
          icon="i-lucide-plus"
          @click="router.push('/admin/challenges/new')"
        >
          创建题目
        </UButton>
      </div>

      <!-- Pagination -->
      <div
        v-if="adminChallenges.length > 0"
        class="flex items-center justify-between mt-8"
      >
        <p class="text-sm text-gray-500 dark:text-gray-400">
          显示 {{ (adminChallengePagination.page - 1) * adminChallengePagination.size + 1 }} -
          {{ Math.min(adminChallengePagination.page * adminChallengePagination.size, adminChallengePagination.total) }} /
          {{ adminChallengePagination.total }} 题
        </p>
        <UPagination
          v-model:page="currentPage"
          :total="adminChallengePagination.total"
          :page-count="adminChallengePagination.size"
          @update:page="handlePageChange"
        />
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import type { AdminChallengeListItem, ChallengeCategory, ChallengeDifficulty } from '~/composables/useChallengeAdmin'

// Use admin middleware for route protection
definePageMeta({
  middleware: 'admin'
})

const router = useRouter()

useSeoMeta({
  title: '题目管理 - NKCTF Admin',
  description: '管理 CTF 题目'
})

// Composables
const {
  adminChallenges,
  adminChallengePagination,
  isLoading,
  fetchChallenges,
  toggleChallengeEnabled,
  deleteChallenge
} = useChallengeAdmin()

// Toast for notifications
const toast = useToast()

// State
const selectedCategory = ref<ChallengeCategory | undefined>(undefined)
const selectedDifficulty = ref<ChallengeDifficulty | undefined>(undefined)
const selectedEnabled = ref<boolean | undefined>(undefined)
const searchQuery = ref('')
const currentPage = ref(1)

// Filter options
const categoryOptions = [
  { label: '所有分类', value: undefined },
  { label: 'Web', value: 'WEB' as ChallengeCategory },
  { label: 'Pwn', value: 'PWN' as ChallengeCategory },
  { label: 'Crypto', value: 'CRYPTO' as ChallengeCategory },
  { label: 'Reverse', value: 'REVERSE' as ChallengeCategory },
  { label: 'Misc', value: 'MISC' as ChallengeCategory },
  { label: 'Blockchain', value: 'BLOCKCHAIN' as ChallengeCategory }
]

const difficultyOptions = [
  { label: '所有难度', value: undefined },
  { label: '简单', value: 'EASY' as ChallengeDifficulty },
  { label: '中等', value: 'MEDIUM' as ChallengeDifficulty },
  { label: '困难', value: 'HARD' as ChallengeDifficulty }
]

const enabledOptions = [
  { label: '所有状态', value: undefined },
  { label: '已启用', value: true },
  { label: '已禁用', value: false }
]

/**
 * Get category display label
 */
const getCategoryLabel = (category: ChallengeCategory): string => {
  const labels: Record<ChallengeCategory, string> = {
    WEB: 'Web',
    PWN: 'Pwn',
    CRYPTO: 'Crypto',
    REVERSE: 'Reverse',
    MISC: 'Misc',
    BLOCKCHAIN: 'Blockchain'
  }
  return labels[category]
}

/**
 * Get category color
 */
const getCategoryColor = (category: ChallengeCategory): 'primary' | 'error' | 'warning' | 'success' | 'info' | 'neutral' => {
  const colors: Record<ChallengeCategory, 'primary' | 'error' | 'warning' | 'success' | 'info' | 'neutral'> = {
    WEB: 'primary',
    PWN: 'error',
    CRYPTO: 'warning',
    REVERSE: 'success',
    MISC: 'info',
    BLOCKCHAIN: 'neutral'
  }
  return colors[category]
}

/**
 * Get difficulty display label
 */
const getDifficultyLabel = (difficulty: ChallengeDifficulty): string => {
  const labels: Record<ChallengeDifficulty, string> = {
    EASY: '简单',
    MEDIUM: '中等',
    HARD: '困难'
  }
  return labels[difficulty]
}

/**
 * Get difficulty color
 */
const getDifficultyColor = (difficulty: ChallengeDifficulty): 'success' | 'warning' | 'error' => {
  const colors: Record<ChallengeDifficulty, 'success' | 'warning' | 'error'> = {
    EASY: 'success',
    MEDIUM: 'warning',
    HARD: 'error'
  }
  return colors[difficulty]
}

/**
 * Load challenges
 */
const loadChallenges = async () => {
  await fetchChallenges({
    category: selectedCategory.value,
    difficulty: selectedDifficulty.value,
    enabled: selectedEnabled.value,
    keyword: searchQuery.value || undefined,
    page: currentPage.value
  })
}

/**
 * Handle filter change
 */
const handleFilterChange = () => {
  currentPage.value = 1
  loadChallenges()
}

/**
 * Handle search
 */
const handleSearch = () => {
  currentPage.value = 1
  loadChallenges()
}

/**
 * Handle page change
 */
const handlePageChange = (page: number) => {
  currentPage.value = page
  loadChallenges()
}

/**
 * Handle toggle enabled
 */
const handleToggleEnabled = async (challenge: AdminChallengeListItem) => {
  const action = challenge.enabled ? '禁用' : '启用'
  if (!confirm(`确定要${action}题目 "${challenge.title}" 吗？`)) {
    return
  }

  const success = await toggleChallengeEnabled(challenge.id, !challenge.enabled)
  if (success) {
    toast.add({ title: `题目已${action}`, color: 'success' })
  } else {
    toast.add({ title: `${action}失败`, color: 'error' })
  }
}

/**
 * Handle delete
 */
const handleDelete = async (challenge: AdminChallengeListItem) => {
  if (!confirm(`确定要删除题目 "${challenge.title}" 吗？此操作不可恢复。`)) {
    return
  }

  const success = await deleteChallenge(challenge.id)
  if (success) {
    await loadChallenges()
  }
}

// Initialize
onMounted(() => {
  loadChallenges()
})
</script>
