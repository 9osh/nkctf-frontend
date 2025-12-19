<template>
  <NuxtLayout name="dashboard">
    <template #header-left>
      <div class="flex items-center gap-3">
        <UIcon
          name="i-lucide-flag"
          class="w-6 h-6 text-primary-500"
        />
        <h1 class="text-xl font-semibold text-gray-900 dark:text-white">
          挑战
        </h1>
        <UBadge
          :label="`${totalChallenges} 题`"
          color="primary"
          variant="subtle"
        />
      </div>
    </template>

    <template #header-right>
      <UInput
        v-model="searchQuery"
        placeholder="搜索挑战..."
        icon="i-lucide-search"
        size="sm"
        class="w-64 hidden md:block"
      />
      <UButton
        icon="i-lucide-bell"
        color="neutral"
        variant="ghost"
        aria-label="通知"
      />
    </template>

    <div class="p-6">
      <!-- Filters -->
      <div class="flex flex-wrap items-center gap-4 mb-6">
        <!-- Category Filter -->
        <USelectMenu
          v-model="selectedCategory"
          :items="categories"
          value-key="value"
          placeholder="所有分类"
          class="w-40"
        />

        <!-- Difficulty Filter -->
        <USelectMenu
          v-model="selectedDifficulty"
          :items="difficulties"
          value-key="value"
          placeholder="所有难度"
          class="w-40"
        />

        <!-- Status Filter -->
        <USelectMenu
          v-model="selectedStatus"
          :items="statuses"
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
        v-if="isLoadingList"
        class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
      >
        <div
          v-for="n in 6"
          :key="n"
          class="h-48"
        >
          <UCard
            :ui="{
              root: 'h-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800',
              body: 'p-5'
            }"
          >
            <div class="flex items-start justify-between mb-3">
              <USkeleton class="h-10 w-10 rounded-lg" />
              <USkeleton class="h-5 w-16" />
            </div>
            <USkeleton class="h-5 w-3/4 mb-2" />
            <USkeleton class="h-4 w-full mb-1" />
            <USkeleton class="h-4 w-2/3 mb-4" />
            <div class="flex justify-between">
              <USkeleton class="h-4 w-24" />
              <USkeleton class="h-4 w-20" />
            </div>
          </UCard>
        </div>
      </div>

      <!-- Error State -->
      <div
        v-else-if="listError"
        class="flex flex-col items-center justify-center py-16"
      >
        <UIcon
          name="i-lucide-alert-circle"
          class="w-16 h-16 text-red-400 dark:text-red-500 mb-4"
        />
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
          加载失败
        </h3>
        <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">
          {{ listError }}
        </p>
        <UButton
          icon="i-lucide-refresh-cw"
          @click="fetchChallenges"
        >
          重试
        </UButton>
      </div>

      <!-- Challenge Grid -->
      <div
        v-else
        class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
      >
        <div
          v-for="challenge in filteredChallenges"
          :key="challenge.id"
          class="challenge-card group"
        >
          <UCard
            :ui="{
              root: 'h-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-primary-400 dark:hover:border-primary-600 transition-all duration-200 cursor-pointer',
              body: 'p-5'
            }"
            @click="openChallenge(challenge)"
          >
            <!-- Header -->
            <div class="flex items-start justify-between mb-3">
              <div class="flex items-center gap-2">
                <div
                  class="w-10 h-10 rounded-lg flex items-center justify-center"
                  :class="getCategoryBgClass(challenge.category)"
                >
                  <UIcon
                    :name="getCategoryIcon(challenge.category)"
                    class="w-5 h-5"
                    :class="getCategoryIconClass(challenge.category)"
                  />
                </div>
                <div>
                  <UBadge
                    :label="challenge.category"
                    :color="getCategoryColor(challenge.category)"
                    variant="subtle"
                    size="xs"
                  />
                </div>
              </div>
              <div class="flex items-center gap-2">
                <UBadge
                  :label="challenge.difficulty"
                  :color="getDifficultyColor(challenge.difficulty)"
                  variant="solid"
                  size="xs"
                />
                <UIcon
                  v-if="challenge.solved"
                  name="i-lucide-check-circle"
                  class="w-5 h-5 text-green-500"
                />
              </div>
            </div>

            <!-- Title & Description -->
            <h3 class="text-base font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
              {{ challenge.title }}
            </h3>
            <p class="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4">
              {{ challenge.description }}
            </p>

            <!-- Footer -->
            <div class="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <div class="flex items-center gap-3">
                <span class="flex items-center gap-1">
                  <UIcon
                    name="i-lucide-star"
                    class="w-4 h-4"
                  />
                  {{ challenge.points }} pts
                </span>
                <span class="flex items-center gap-1">
                  <UIcon
                    name="i-lucide-users"
                    class="w-4 h-4"
                  />
                  {{ challenge.solves }} 解决
                </span>
              </div>
              <span class="flex items-center gap-1">
                <UIcon
                  name="i-lucide-clock"
                  class="w-4 h-4"
                />
                {{ challenge.releaseDate }}
              </span>
            </div>
          </UCard>
        </div>
      </div>

      <!-- Empty State -->
      <div
        v-if="!isLoadingList && !listError && filteredChallenges.length === 0"
        class="flex flex-col items-center justify-center py-16"
      >
        <UIcon
          name="i-lucide-search-x"
          class="w-16 h-16 text-gray-300 dark:text-gray-700 mb-4"
        />
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
          没有找到挑战
        </h3>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          尝试调整筛选条件或搜索关键词
        </p>
      </div>

      <!-- Pagination -->
      <div
        v-if="!isLoadingList && !listError && totalItems > 0"
        class="flex items-center justify-between mt-8"
      >
        <p class="text-sm text-gray-500 dark:text-gray-400">
          显示 {{ (currentPage - 1) * pageSize + 1 }} - {{ Math.min(currentPage * pageSize, totalItems) }} / {{ totalItems }} 题
        </p>
        <UPagination
          v-model:page="currentPage"
          :total="totalItems"
          :items-per-page="pageSize"
        />
      </div>
    </div>

    <!-- Challenge Modal -->
    <UModal
      v-model:open="isChallengeModalOpen"
      class="sm:max-w-2xl"
    >
      <template #content>
        <UCard
          v-if="selectedChallenge"
          :ui="{
            root: 'bg-white dark:bg-gray-900 flex flex-col max-h-[90vh]',
            header: 'border-b border-gray-200 dark:border-gray-800 flex-shrink-0',
            body: 'p-6 overflow-y-auto flex-1',
            footer: 'border-t border-gray-200 dark:border-gray-800 flex-shrink-0'
          }"
        >
          <template #header>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div
                  class="w-12 h-12 rounded-lg flex items-center justify-center"
                  :class="getCategoryBgClass(selectedChallenge.category)"
                >
                  <UIcon
                    :name="getCategoryIcon(selectedChallenge.category)"
                    class="w-6 h-6"
                    :class="getCategoryIconClass(selectedChallenge.category)"
                  />
                </div>
                <div>
                  <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
                    {{ selectedChallenge.title }}
                  </h2>
                  <div class="flex items-center gap-2 mt-1">
                    <UBadge
                      :label="selectedChallenge.category"
                      :color="getCategoryColor(selectedChallenge.category)"
                      variant="subtle"
                      size="xs"
                    />
                    <UBadge
                      :label="selectedChallenge.difficulty"
                      :color="getDifficultyColor(selectedChallenge.difficulty)"
                      variant="solid"
                      size="xs"
                    />
                  </div>
                </div>
              </div>
              <UButton
                icon="i-lucide-x"
                color="neutral"
                variant="ghost"
                size="sm"
                @click="isChallengeModalOpen = false"
              />
            </div>
          </template>

          <div class="space-y-4">
            <p class="text-gray-600 dark:text-gray-300">
              {{ selectedChallenge.description }}
            </p>

            <!-- Loading state for details -->
            <template v-if="isLoadingDetail">
              <div class="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
                <span class="flex items-center gap-1">
                  <UIcon
                    name="i-lucide-star"
                    class="w-4 h-4"
                  />
                  {{ selectedChallenge.points }} 分
                </span>
                <span class="flex items-center gap-1">
                  <UIcon
                    name="i-lucide-users"
                    class="w-4 h-4"
                  />
                  {{ selectedChallenge.solves }} 人解决
                </span>
                <span class="flex items-center gap-1">
                  <UIcon
                    name="i-lucide-loader-2"
                    class="w-4 h-4 animate-spin"
                  />
                  加载中...
                </span>
              </div>
              <div class="mt-6 space-y-3">
                <USkeleton class="h-4 w-20" />
                <USkeleton class="h-10 w-full" />
                <USkeleton class="h-10 w-24" />
              </div>
            </template>

            <!-- Error state -->
            <template v-else-if="detailError">
              <div class="flex items-center gap-2 text-red-500 dark:text-red-400">
                <UIcon
                  name="i-lucide-alert-circle"
                  class="w-5 h-5"
                />
                <span>{{ detailError }}</span>
              </div>
            </template>

            <!-- Loaded state -->
            <template v-else>
              <div class="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
                <span class="flex items-center gap-1">
                  <UIcon
                    name="i-lucide-star"
                    class="w-4 h-4"
                  />
                  {{ selectedChallenge.points }} 分
                </span>
                <span class="flex items-center gap-1">
                  <UIcon
                    name="i-lucide-users"
                    class="w-4 h-4"
                  />
                  {{ selectedChallenge.solves }} 人解决
                </span>
                <span class="flex items-center gap-1">
                  <UIcon
                    name="i-lucide-user"
                    class="w-4 h-4"
                  />
                  {{ selectedChallenge.author }}
                </span>
              </div>

              <!-- Challenge Content (Markdown) -->
              <div
                v-if="selectedChallenge.content"
                class="mt-4"
              >
                <ClientOnly>
                  <MdPreview
                    :model-value="selectedChallenge.content"
                    :theme="previewTheme"
                    language="zh-CN"
                    class="bg-gray-50 dark:bg-gray-800 rounded-lg"
                  />
                </ClientOnly>
              </div>

              <!-- Attachments -->
              <div
                v-if="selectedChallenge.attachments && selectedChallenge.attachments.length > 0"
                class="mt-4"
              >
                <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  附件
                </h4>
                <div class="flex flex-wrap gap-2">
                  <UButton
                    v-for="attachment in selectedChallenge.attachments"
                    :key="attachment.name"
                    size="sm"
                    variant="outline"
                    icon="i-lucide-download"
                    @click="downloadAttachment(attachment)"
                  >
                    {{ attachment.name }}
                  </UButton>
                </div>
              </div>

              <!-- Docker Container Section -->
              <div
                v-if="selectedChallenge.hasDocker"
                class="mt-4"
              >
                <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  动态容器
                </h4>
                <!-- Container Running -->
                <div
                  v-if="currentChallengeContainer"
                  class="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg space-y-3"
                >
                  <div class="flex items-center justify-between">
                    <span class="flex items-center gap-2 text-green-700 dark:text-green-400">
                      <UIcon
                        name="i-lucide-server"
                        class="w-4 h-4"
                      />
                      容器运行中
                    </span>
                    <span class="text-sm text-green-600 dark:text-green-400">
                      剩余: {{ formatRemainingTime(currentChallengeContainer.remainingSeconds) }}
                    </span>
                  </div>
                  <!-- Progress Bar (gradient + pulsing animation) -->
                  <div class="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      class="h-full rounded-full progress-bar-animated"
                      :class="getProgressPercentage(currentChallengeContainer.remainingSeconds) > 20
                        ? 'bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500'
                        : 'bg-gradient-to-r from-red-400 via-orange-500 to-yellow-500'"
                      :style="{
                        width: getProgressPercentage(currentChallengeContainer.remainingSeconds) + '%',
                        animation: `countdown ${currentChallengeContainer.remainingSeconds}s linear forwards, pulse 2s ease-in-out infinite`
                      }"
                    />
                  </div>
                  <div class="flex items-center gap-2 text-sm">
                    <span class="text-gray-600 dark:text-gray-400">访问地址:</span>
                    <code class="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-gray-900 dark:text-gray-100">
                      {{ currentChallengeContainer.host }}:{{ currentChallengeContainer.port }}
                    </code>
                    <UButton
                      size="xs"
                      variant="ghost"
                      icon="i-lucide-copy"
                      @click="copyToClipboard(`${currentChallengeContainer.host}:${currentChallengeContainer.port}`)"
                    />
                  </div>
                  <div class="flex justify-center gap-2">
                    <UButton
                      size="sm"
                      variant="outline"
                      icon="i-lucide-clock"
                      :loading="isExtendingContainer"
                      @click="handleExtendContainer"
                    >
                      延长时间
                    </UButton>
                    <UButton
                      size="sm"
                      variant="outline"
                      color="error"
                      icon="i-lucide-square"
                      :loading="isStoppingContainer"
                      @click="handleStopContainer"
                    >
                      销毁容器
                    </UButton>
                  </div>
                </div>
                <!-- No Container Running -->
                <div
                  v-else
                  class="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center"
                >
                  <p class="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    此题目支持动态容器，点击启动按钮获取专属环境
                  </p>
                  <UButton
                    size="sm"
                    icon="i-lucide-play"
                    :loading="isStartingContainer"
                    @click="handleStartContainer"
                  >
                    启动容器
                  </UButton>
                </div>
              </div>

              <!-- Flag Submission -->
              <div class="mt-6">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  提交 Flag
                </label>
                <div class="flex gap-2">
                  <UInput
                    v-model="flagInput"
                    placeholder="NKCTF{...}"
                    icon="i-lucide-flag"
                    class="flex-1"
                    :disabled="selectedChallenge.solved"
                  />
                  <UButton
                    :loading="isSubmitting"
                    :disabled="selectedChallenge.solved"
                    @click="submitFlag"
                  >
                    {{ selectedChallenge.solved ? '已解决' : '提交' }}
                  </UButton>
                </div>
              </div>

              <!-- Hints -->
              <div
                v-if="selectedChallenge.hints && selectedChallenge.hints.length > 0"
                class="mt-4"
              >
                <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  提示
                </h4>
                <div class="space-y-2">
                  <div
                    v-for="(hint, index) in selectedChallenge.hints"
                    :key="hint.id"
                    class="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <div class="flex items-center justify-between">
                      <span class="text-sm text-gray-600 dark:text-gray-400">
                        提示 {{ index + 1 }}
                        <span
                          v-if="!hint.unlocked"
                          class="text-xs text-gray-400 dark:text-gray-500"
                        >
                          (-{{ hint.cost }} 分)
                        </span>
                      </span>
                      <UButton
                        v-if="!hint.unlocked"
                        size="xs"
                        variant="outline"
                        @click="unlockHint(hint)"
                      >
                        解锁
                      </UButton>
                      <UBadge
                        v-else
                        label="已解锁"
                        color="success"
                        variant="subtle"
                        size="xs"
                      />
                    </div>
                    <p
                      v-if="hint.unlocked && hint.content"
                      class="mt-2 text-sm text-gray-700 dark:text-gray-300"
                    >
                      {{ hint.content }}
                    </p>
                  </div>
                </div>
              </div>
            </template>
          </div>
        </UCard>
      </template>
    </UModal>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { MdPreview } from 'md-editor-v3'
import 'md-editor-v3/lib/preview.css'

/**
 * API response interface
 */
interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T
}

/**
 * Paginated response from API
 */
interface PaginatedResponse<T> {
  records: T[]
  total: number
  page: number
  size: number
  pages: number
  hasNext: boolean
  hasPrevious: boolean
}

interface Hint {
  id: number
  cost: number
  unlocked: boolean
  content?: string
}

interface Attachment {
  name: string
  url: string
}

/**
 * Challenge list item (basic info for card display)
 */
interface ChallengeListItem {
  id: number
  title: string
  description: string
  category: string
  difficulty: string
  points: number
  solves: number
  solved: boolean
  releaseDate: string
}

/**
 * Challenge detail (full info for modal display)
 */
interface ChallengeDetail extends ChallengeListItem {
  author: string
  hints?: Hint[]
  attachments?: Attachment[]
  content?: string
  hasDocker?: boolean
}

useSeoMeta({
  title: '挑战 - NKCTF',
  description: '浏览和挑战各类 CTF 题目，提升你的网络安全技能'
})

// Filters
const searchQuery = ref('')
const selectedCategory = ref<string | undefined>(undefined)
const selectedDifficulty = ref<string | undefined>(undefined)
const selectedStatus = ref<string | undefined>(undefined)
const sortBy = ref('newest')

// Pagination (API returns 30 items per page)
const currentPage = ref(1)
const totalItems = ref(0)
const totalPages = ref(0)
const pageSize = 30

// Modal
const isChallengeModalOpen = ref(false)
const selectedChallenge = ref<ChallengeDetail | null>(null)
const isLoadingDetail = ref(false)
const detailError = ref<string | null>(null)
const flagInput = ref('')
const isSubmitting = ref(false)

const { storedUser, initUser } = useUser()
const colorMode = useColorMode()

// Theme for MdPreview
const previewTheme = computed(() => colorMode.value === 'dark' ? 'dark' : 'light')

const {
  containers,
  startContainer,
  stopContainer,
  extendContainer,
  fetchContainers,
  formatRemainingTime,
  startCountdown,
  stopCountdown,
  getProgressPercentage
} = useContainers()
const toast = useToast()

// Container state
const isStartingContainer = ref(false)
const isStoppingContainer = ref(false)
const isExtendingContainer = ref(false)

// Filter options
const categories = [
  { label: '所有分类', value: undefined },
  { label: 'Web', value: 'web' },
  { label: 'Pwn', value: 'pwn' },
  { label: 'Crypto', value: 'crypto' },
  { label: 'Reverse', value: 'reverse' },
  { label: 'Misc', value: 'misc' },
  { label: 'Blockchain', value: 'blockchain' }
]

const difficulties = [
  { label: '所有难度', value: undefined },
  { label: 'Easy', value: 'EASY' },
  { label: 'Medium', value: 'MEDIUM' },
  { label: 'Hard', value: 'HARD' }
]

const statuses = [
  { label: '所有状态', value: undefined },
  { label: '已解决', value: 'true' },
  { label: '未解决', value: 'false' }
]

const sortOptions = [
  { label: '最新发布', value: 'newest' },
  { label: '最多解决', value: 'most_solves' },
  { label: '最少解决', value: 'least_solves' },
  { label: '最高分值', value: 'highest_points' }
]

// Challenge list data
const challenges = ref<ChallengeListItem[]>([])
const isLoadingList = ref(false)
const listError = ref<string | null>(null)

/**
 * Fetch challenges from API with filters and pagination
 */
const fetchChallenges = async () => {
  const token = storedUser.value?.token
  if (!token) {
    listError.value = '请先登录'
    return
  }

  isLoadingList.value = true
  listError.value = null

  try {
    // Build query params
    const params = new URLSearchParams()
    if (selectedCategory.value) params.append('category', selectedCategory.value)
    if (selectedDifficulty.value) params.append('difficulty', selectedDifficulty.value)
    if (selectedStatus.value) params.append('solved', selectedStatus.value)
    if (sortBy.value) params.append('sortBy', sortBy.value)
    params.append('page', currentPage.value.toString())

    const url = `/api/challenges?${params.toString()}`

    const response = await $fetch<ApiResponse<PaginatedResponse<ChallengeListItem>>>(url, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    if (response.code === 200 && response.data) {
      challenges.value = response.data.records
      totalItems.value = response.data.total
      totalPages.value = response.data.pages
    } else {
      listError.value = response.message || '获取挑战列表失败'
    }
  } catch (e: unknown) {
    const fetchError = e as { data?: ApiResponse, status?: number }
    if (fetchError.status === 401) {
      listError.value = '登录已过期，请重新登录'
    } else {
      listError.value = fetchError?.data?.message || '获取挑战列表失败'
    }
  } finally {
    isLoadingList.value = false
  }
}

// Fetch challenges on mount and when filters change
onMounted(() => {
  initUser()
  fetchChallenges()
  fetchContainers()
})

// Cleanup countdown timers on unmount
onUnmounted(() => {
  if (currentChallengeContainer.value) {
    stopCountdown(currentChallengeContainer.value.containerId)
  }
})

// Get container for current challenge
const currentChallengeContainer = computed(() => {
  if (!selectedChallenge.value) return null
  return containers.value.find(c => c.challengeId === selectedChallenge.value!.id)
})

// Start/stop countdown when container changes
watch(currentChallengeContainer, (newContainer, oldContainer) => {
  // Stop countdown for old container
  if (oldContainer) {
    stopCountdown(oldContainer.containerId)
  }
  // Start countdown for new container
  if (newContainer && newContainer.remainingSeconds > 0) {
    startCountdown(newContainer.containerId)
  }
}, { immediate: true })

watch([selectedCategory, selectedDifficulty, selectedStatus, sortBy], () => {
  currentPage.value = 1
  fetchChallenges()
})

// Fetch new page when page changes
watch(currentPage, () => {
  fetchChallenges()
})

const totalChallenges = computed(() => totalItems.value)

// Local text search only (API handles other filters and pagination)
const filteredChallenges = computed(() => {
  if (!searchQuery.value) {
    return challenges.value
  }

  const query = searchQuery.value.toLowerCase()
  return challenges.value.filter(c =>
    c.title.toLowerCase().includes(query)
    || c.description.toLowerCase().includes(query)
  )
})

// Reset search when changing filters
watch(searchQuery, () => {
  // Search is local only, no need to refetch
})

/**
 * Capitalize first letter for display
 */
const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()

const getCategoryIcon = (category: string) => {
  const cat = capitalize(category)
  const icons: Record<string, string> = {
    Web: 'i-lucide-globe',
    Pwn: 'i-lucide-bug',
    Crypto: 'i-lucide-key',
    Reverse: 'i-lucide-cpu',
    Misc: 'i-lucide-puzzle',
    Blockchain: 'i-lucide-link'
  }
  return icons[cat] || 'i-lucide-flag'
}

const getCategoryColor = (category: string) => {
  const cat = capitalize(category)
  const colors: Record<string, 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' | 'neutral'> = {
    Web: 'primary',
    Pwn: 'error',
    Crypto: 'warning',
    Reverse: 'info',
    Misc: 'success',
    Blockchain: 'secondary'
  }
  return colors[cat] || 'neutral'
}

const getCategoryBgClass = (category: string) => {
  const cat = capitalize(category)
  const classes: Record<string, string> = {
    Web: 'bg-primary-100 dark:bg-primary-900/30',
    Pwn: 'bg-red-100 dark:bg-red-900/30',
    Crypto: 'bg-yellow-100 dark:bg-yellow-900/30',
    Reverse: 'bg-blue-100 dark:bg-blue-900/30',
    Misc: 'bg-green-100 dark:bg-green-900/30',
    Blockchain: 'bg-purple-100 dark:bg-purple-900/30'
  }
  return classes[cat] || 'bg-gray-100 dark:bg-gray-800'
}

const getCategoryIconClass = (category: string) => {
  const cat = capitalize(category)
  const classes: Record<string, string> = {
    Web: 'text-primary-600 dark:text-primary-400',
    Pwn: 'text-red-600 dark:text-red-400',
    Crypto: 'text-yellow-600 dark:text-yellow-400',
    Reverse: 'text-blue-600 dark:text-blue-400',
    Misc: 'text-green-600 dark:text-green-400',
    Blockchain: 'text-purple-600 dark:text-purple-400'
  }
  return classes[cat] || 'text-gray-600 dark:text-gray-400'
}

const getDifficultyColor = (difficulty: string) => {
  const diff = difficulty.toUpperCase()
  const colors: Record<string, 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' | 'neutral'> = {
    EASY: 'success',
    MEDIUM: 'warning',
    HARD: 'error'
  }
  return colors[diff] || 'neutral'
}

/**
 * Fetch challenge details from API
 */
const fetchChallengeDetail = async (challengeId: number): Promise<ChallengeDetail | null> => {
  const token = storedUser.value?.token
  if (!token) {
    toast.add({
      title: '请先登录',
      color: 'error'
    })
    return null
  }

  try {
    const response = await $fetch<ApiResponse<ChallengeDetail>>(`/api/challenges/${challengeId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    if (response.code === 200 && response.data) {
      return response.data
    } else {
      detailError.value = response.message || '获取题目详情失败'
      return null
    }
  } catch (e: unknown) {
    const fetchError = e as { data?: ApiResponse, status?: number }
    detailError.value = fetchError?.data?.message || '获取题目详情失败'
    return null
  }
}

/**
 * Open challenge modal and fetch details
 */
const openChallenge = async (challenge: ChallengeListItem) => {
  // Open modal immediately with basic info
  selectedChallenge.value = {
    ...challenge,
    author: '' // Placeholder until loaded
  }
  flagInput.value = ''
  isLoadingDetail.value = true
  detailError.value = null
  isChallengeModalOpen.value = true

  // Fetch full details from API
  const detail = await fetchChallengeDetail(challenge.id)
  if (detail) {
    selectedChallenge.value = detail
  }
  isLoadingDetail.value = false
}

/**
 * Submit flag response interface
 */
interface SubmitFlagResponse {
  correct: boolean
  pointsAwarded: number | null
  message: string
  totalScore: number
  rank: number
}

const submitFlag = async () => {
  if (!flagInput.value || !selectedChallenge.value) return

  const token = storedUser.value?.token
  if (!token) {
    toast.add({
      title: '请先登录',
      color: 'error'
    })
    return
  }

  isSubmitting.value = true

  try {
    const response = await $fetch<ApiResponse<SubmitFlagResponse>>('/api/challenges/submit', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: {
        challengeId: selectedChallenge.value.id,
        flag: flagInput.value
      }
    })

    if (response.code === 200 && response.data) {
      const data = response.data
      if (data.correct) {
        toast.add({
          title: data.message,
          description: `获得 ${data.pointsAwarded} 分！当前排名：${data.rank}`,
          color: 'success'
        })
        selectedChallenge.value.solved = true
        flagInput.value = ''
        // Refresh challenge list to update solved status
        fetchChallenges()
      } else {
        toast.add({
          title: data.message,
          color: 'error'
        })
      }
    } else {
      toast.add({
        title: response.message || 'Flag 提交失败',
        color: 'error'
      })
    }
  } catch (e: unknown) {
    const fetchError = e as { data?: ApiResponse, status?: number }
    if (fetchError.status === 429) {
      toast.add({
        title: '提交过于频繁',
        description: '请稍后再试',
        color: 'warning'
      })
    } else if (fetchError.status === 401) {
      toast.add({
        title: '登录已过期',
        description: '请重新登录',
        color: 'error'
      })
    } else {
      toast.add({
        title: fetchError?.data?.message || 'Flag 提交失败',
        color: 'error'
      })
    }
  } finally {
    isSubmitting.value = false
  }
}

/**
 * Download attachment via API
 */
const downloadAttachment = (attachment: Attachment) => {
  // Open attachment URL in new window to trigger download
  // URL format: /api/attachments/download?path=...
  window.open(attachment.url, '_blank')
}

/**
 * Unlock hint response interface
 */
interface UnlockHintResponse {
  hintId: number
  content: string
  cost: number
  remainingScore: number
}

/**
 * Unlock hint via API
 */
const unlockHint = async (hint: Hint) => {
  const token = storedUser.value?.token
  if (!token) {
    toast.add({
      title: '请先登录',
      color: 'error'
    })
    return
  }

  // If already unlocked, just show the content
  if (hint.unlocked && hint.content) {
    return
  }

  try {
    const response = await $fetch<ApiResponse<UnlockHintResponse>>('/api/challenges/hints/unlock', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: {
        hintId: hint.id
      }
    })

    if (response.code === 200 && response.data) {
      const data = response.data
      // Update the hint in selectedChallenge
      if (selectedChallenge.value?.hints) {
        const hintIndex = selectedChallenge.value.hints.findIndex(h => h.id === hint.id)
        if (hintIndex !== -1) {
          const targetHint = selectedChallenge.value.hints[hintIndex]
          if (targetHint) {
            targetHint.unlocked = true
            targetHint.content = data.content
          }
        }
      }

      if (data.cost > 0) {
        toast.add({
          title: '提示已解锁',
          description: `花费 ${data.cost} 积分，剩余 ${data.remainingScore} 积分`,
          color: 'success'
        })
      } else {
        toast.add({
          title: '提示内容',
          description: data.content,
          color: 'info'
        })
      }
    } else {
      toast.add({
        title: response.message || '解锁提示失败',
        color: 'error'
      })
    }
  } catch (e: unknown) {
    const fetchError = e as { data?: ApiResponse, status?: number }
    if (fetchError.status === 429) {
      toast.add({
        title: '请求过于频繁',
        description: '请稍后再试',
        color: 'warning'
      })
    } else if (fetchError.status === 400) {
      toast.add({
        title: fetchError?.data?.message || '积分不足',
        color: 'error'
      })
    } else if (fetchError.status === 401) {
      toast.add({
        title: '登录已过期',
        description: '请重新登录',
        color: 'error'
      })
    } else if (fetchError.status === 404) {
      toast.add({
        title: '提示不存在',
        color: 'error'
      })
    } else {
      toast.add({
        title: fetchError?.data?.message || '解锁提示失败',
        color: 'error'
      })
    }
  }
}

/**
 * Start container for challenge
 */
const handleStartContainer = async () => {
  if (!selectedChallenge.value) return

  isStartingContainer.value = true

  const result = await startContainer(selectedChallenge.value.id)
  isStartingContainer.value = false

  if (result.success && result.data) {
    // Start countdown timer for the new container
    startCountdown(result.data.containerId)
    toast.add({
      title: '容器已启动',
      description: `访问地址: ${result.data.host}:${result.data.port}`,
      color: 'success'
    })
  } else {
    toast.add({
      title: '启动失败',
      description: result.error || '启动容器失败',
      color: 'error'
    })
  }
}

/**
 * Stop container for challenge
 */
const handleStopContainer = async () => {
  if (!currentChallengeContainer.value) return

  isStoppingContainer.value = true
  const containerId = currentChallengeContainer.value.containerId

  // Stop countdown timer before destroying
  stopCountdown(containerId)

  const result = await stopContainer(containerId)
  isStoppingContainer.value = false

  if (result.success) {
    toast.add({
      title: '容器已销毁',
      color: 'success'
    })
  } else {
    toast.add({
      title: '销毁失败',
      description: result.error || '销毁容器失败',
      color: 'error'
    })
  }
}

/**
 * Extend container lifetime
 */
const handleExtendContainer = async () => {
  if (!currentChallengeContainer.value) return

  isExtendingContainer.value = true

  const result = await extendContainer(currentChallengeContainer.value.containerId)
  isExtendingContainer.value = false

  if (result.success && result.data) {
    toast.add({
      title: '已延长时间',
      description: `剩余时间: ${formatRemainingTime(result.data.remainingSeconds)}`,
      color: 'success'
    })
  } else {
    toast.add({
      title: '延长失败',
      description: result.error || '延长时间失败',
      color: 'error'
    })
  }
}

/**
 * Copy text to clipboard
 */
const copyToClipboard = async (text: string) => {
  try {
    await window.navigator.clipboard.writeText(text)
    toast.add({ title: '已复制', color: 'success' })
  } catch {
    toast.add({ title: '复制失败', color: 'error' })
  }
}
</script>

<style scoped>
.challenge-card {
  transition: transform 0.2s ease;
}

.challenge-card:hover {
  transform: translateY(-2px);
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

@keyframes countdown {
  to {
    width: 0%;
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
    filter: brightness(1);
  }
  50% {
    opacity: 0.85;
    filter: brightness(1.2);
  }
}

.progress-bar-animated {
  box-shadow: 0 0 10px currentColor;
}
</style>
