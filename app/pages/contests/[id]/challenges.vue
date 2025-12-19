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
          @click="navigateTo(`/contests/${contestId}`)"
        />
        <UIcon
          name="i-lucide-swords"
          class="w-6 h-6 text-primary-500"
        />
        <h1 class="text-xl font-semibold text-gray-900 dark:text-white truncate max-w-md">
          {{ currentContest?.title || '加载中...' }}
        </h1>
        <UBadge
          v-if="currentContest"
          :label="getStatusText(currentContest.status)"
          :color="getStatusColor(currentContest.status)"
        />
      </div>
    </template>

    <template #header-right>
      <div
        v-if="currentContest"
        class="flex items-center gap-4 text-sm"
      >
        <!-- Countdown / Status -->
        <span
          v-if="currentContest.status === 'active'"
          class="flex items-center gap-2 text-green-600 dark:text-green-400"
        >
          <UIcon
            name="i-lucide-clock"
            class="w-4 h-4"
          />
          比赛进行中
        </span>
        <span
          v-else-if="currentContest.status === 'ending'"
          class="flex items-center gap-2 text-gray-500 dark:text-gray-400"
        >
          <UIcon
            name="i-lucide-flag-off"
            class="w-4 h-4"
          />
          比赛已结束
        </span>

        <!-- Leaderboard Link -->
        <UButton
          icon="i-lucide-trophy"
          color="neutral"
          variant="ghost"
          size="sm"
          aria-label="排行榜"
          @click="navigateTo(`/contests/${contestId}/leaderboard`)"
        >
          排行榜
        </UButton>
      </div>
    </template>

    <div class="p-6">
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
              <USkeleton class="h-4 w-20" />
              <USkeleton class="h-4 w-16" />
            </div>
          </UCard>
        </div>
      </div>

      <!-- Error State -->
      <div
        v-else-if="error"
        class="flex flex-col items-center justify-center py-16"
      >
        <UIcon
          name="i-lucide-alert-circle"
          class="w-16 h-16 text-red-400 mb-4"
        />
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
          加载失败
        </h3>
        <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">
          {{ error }}
        </p>
        <UButton
          icon="i-lucide-refresh-cw"
          @click="loadContest"
        >
          重试
        </UButton>
      </div>

      <!-- Not Registered Warning -->
      <div
        v-else-if="currentContest && !currentContest.isRegistered && currentContest.status === 'active'"
        class="flex flex-col items-center justify-center py-16"
      >
        <UIcon
          name="i-lucide-lock"
          class="w-16 h-16 text-amber-400 mb-4"
        />
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
          您尚未报名此比赛
        </h3>
        <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">
          请先报名后再进入比赛
        </p>
        <UButton @click="navigateTo(`/contests/${contestId}`)">
          返回赛事详情
        </UButton>
      </div>

      <!-- Challenge Grid -->
      <div v-else-if="currentContest">
        <!-- Category Tabs -->
        <div class="flex flex-wrap items-center gap-2 mb-6">
          <UButton
            v-for="category in categories"
            :key="category"
            :color="selectedCategory === category ? 'primary' : 'neutral'"
            :variant="selectedCategory === category ? 'solid' : 'ghost'"
            size="sm"
            @click="selectedCategory = category"
          >
            {{ category === 'all' ? '全部' : category }}
          </UButton>
        </div>

        <!-- Challenges -->
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <div
            v-for="challenge in filteredChallenges"
            :key="challenge.id"
            class="challenge-card group cursor-pointer"
            @click="openChallenge(challenge)"
          >
            <UCard
              :ui="{
                root: 'h-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-primary-400 dark:hover:border-primary-600 transition-all duration-200',
                body: 'p-5'
              }"
            >
              <!-- Header -->
              <div class="flex items-start justify-between mb-3">
                <UBadge
                  :label="challenge.category"
                  :color="getCategoryColor(challenge.category)"
                  variant="subtle"
                  size="xs"
                />
                <div class="flex items-center gap-2">
                  <UBadge
                    :label="getDifficultyText(challenge.difficulty)"
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

              <!-- Title -->
              <h3 class="text-base font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                {{ challenge.title }}
              </h3>

              <!-- Footer -->
              <div class="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
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
            </UCard>
          </div>
        </div>

        <!-- Empty State -->
        <div
          v-if="filteredChallenges.length === 0"
          class="flex flex-col items-center justify-center py-16"
        >
          <UIcon
            name="i-lucide-flag"
            class="w-16 h-16 text-gray-300 dark:text-gray-700 mb-4"
          />
          <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
            暂无题目
          </h3>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            该分类下暂无题目
          </p>
        </div>
      </div>
    </div>

    <!-- Challenge Modal -->
    <UModal
      v-model:open="isChallengeModalOpen"
      class="sm:max-w-2xl"
      @close="closeModal"
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
                    :label="getDifficultyText(selectedChallenge.difficulty)"
                    :color="getDifficultyColor(selectedChallenge.difficulty)"
                    variant="solid"
                    size="xs"
                  />
                  <span class="text-xs text-gray-500 dark:text-gray-400">
                    {{ selectedChallenge.points }} pts
                  </span>
                </div>
              </div>
              <UButton
                icon="i-lucide-x"
                color="neutral"
                variant="ghost"
                size="sm"
                @click="closeModal"
              />
            </div>
          </template>

          <div class="space-y-4">
            <!-- Loading state for detail -->
            <div
              v-if="isLoadingDetail"
              class="space-y-3"
            >
              <USkeleton class="h-4 w-full" />
              <USkeleton class="h-4 w-full" />
              <USkeleton class="h-4 w-3/4" />
            </div>

            <!-- Challenge content -->
            <template v-else>
              <!-- Author and solves info -->
              <div class="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                <span
                  v-if="currentChallengeDetail?.author"
                  class="flex items-center gap-1"
                >
                  <UIcon
                    name="i-lucide-user"
                    class="w-4 h-4"
                  />
                  {{ currentChallengeDetail.author }}
                </span>
                <span class="flex items-center gap-1">
                  <UIcon
                    name="i-lucide-users"
                    class="w-4 h-4"
                  />
                  {{ selectedChallenge.solves }} 人解决
                </span>
              </div>

              <!-- Description / Content (Markdown) -->
              <div
                v-if="currentChallengeDetail?.content"
                class="mt-2"
              >
                <ClientOnly>
                  <MdPreview
                    :model-value="currentChallengeDetail.content"
                    :theme="previewTheme"
                    language="zh-CN"
                    class="bg-gray-50 dark:bg-gray-800 rounded-lg"
                  />
                </ClientOnly>
              </div>
              <div
                v-else
                class="prose prose-sm dark:prose-invert max-w-none"
              >
                <p class="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                  {{ selectedChallenge.description }}
                </p>
              </div>

              <!-- Attachments -->
              <div
                v-if="currentChallengeDetail?.attachments && currentChallengeDetail.attachments.length > 0"
                class="space-y-2"
              >
                <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300">
                  附件
                </h4>
                <div class="flex flex-wrap gap-2">
                  <UButton
                    v-for="attachment in currentChallengeDetail.attachments"
                    :key="attachment.name"
                    icon="i-lucide-download"
                    color="neutral"
                    variant="outline"
                    size="sm"
                    @click="downloadAttachment(attachment)"
                  >
                    {{ attachment.name }}
                  </UButton>
                </div>
              </div>

              <!-- Docker Container Section -->
              <div
                v-if="currentChallengeDetail?.hasDocker && currentContest?.status === 'active'"
                class="space-y-2"
              >
                <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300">
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

              <!-- Hints -->
              <div
                v-if="currentChallengeDetail?.hints && currentChallengeDetail.hints.length > 0"
                class="space-y-2"
              >
                <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300">
                  提示
                </h4>
                <div
                  v-for="(hint, index) in currentChallengeDetail.hints"
                  :key="hint.id"
                  class="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
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
                      v-if="!hint.unlocked && currentContest?.status === 'active'"
                      size="xs"
                      variant="outline"
                      :loading="isUnlockingHint === hint.id"
                      @click="handleUnlockHint(hint)"
                    >
                      解锁
                    </UButton>
                    <UBadge
                      v-else-if="hint.unlocked"
                      label="已解锁"
                      color="success"
                      variant="subtle"
                      size="xs"
                    />
                    <UBadge
                      v-else
                      :label="`${hint.cost} 积分`"
                      color="warning"
                      variant="soft"
                      size="xs"
                    />
                  </div>
                  <p
                    v-if="hint.unlocked && hint.content"
                    class="mt-2 text-sm text-gray-700 dark:text-gray-300"
                  >
                    {{ hint.content }}
                  </p>
                  <p
                    v-else-if="!hint.unlocked"
                    class="mt-1 text-sm text-gray-400 dark:text-gray-500 italic"
                  >
                    {{ currentContest?.status === 'active' ? '点击解锁查看提示内容' : '需要花费积分解锁' }}
                  </p>
                </div>
              </div>
            </template>

            <!-- Flag Submission -->
            <div
              v-if="currentContest?.status === 'active'"
              class="mt-6"
            >
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
                  :disabled="selectedChallenge.solved || !flagInput.trim()"
                  @click="submitFlag"
                >
                  {{ selectedChallenge.solved ? '已解决' : '提交' }}
                </UButton>
              </div>
            </div>

            <!-- Review Mode Notice -->
            <div
              v-else-if="currentContest?.status === 'ending'"
              class="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
            >
              <p class="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                <UIcon
                  name="i-lucide-info"
                  class="w-4 h-4"
                />
                比赛已结束，当前为回顾模式，无法提交 Flag
              </p>
            </div>
          </div>
        </UCard>
      </template>
    </UModal>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { MdPreview } from 'md-editor-v3'
import 'md-editor-v3/lib/preview.css'
import type { CompetitionChallenge, ChallengeHint, ChallengeAttachment } from '~/composables/useContests'

/**
 * API response wrapper
 */
interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T
}

/**
 * Unlock hint response
 */
interface UnlockHintResponse {
  hintId: number
  content: string
  cost: number
  remainingScore: number
}

const route = useRoute()
const toast = useToast()
const colorMode = useColorMode()

// Theme for MdPreview
const previewTheme = computed(() => colorMode.value === 'dark' ? 'dark' : 'light')

const {
  currentContest,
  contests,
  currentChallengeDetail,
  isLoading,
  error,
  fetchContest,
  fetchContests,
  fetchCompetitionChallengeDetail,
  submitCompetitionFlag,
  clearChallengeDetail,
  getStatusText,
  getStatusColor
} = useContests()
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
const { storedUser } = useUser()

// Get contest ID from route
const contestId = computed(() => Number(route.params.id))

// Challenge state
const selectedCategory = ref('all')
const isChallengeModalOpen = ref(false)
const selectedChallenge = ref<CompetitionChallenge | null>(null)
const flagInput = ref('')
const isSubmitting = ref(false)
const isLoadingDetail = ref(false)

// Container state
const isStartingContainer = ref(false)
const isStoppingContainer = ref(false)
const isExtendingContainer = ref(false)

// Hint state
const isUnlockingHint = ref<number | null>(null)

// Use challenges from currentContest
const challenges = computed(() => currentContest.value?.challenges || [])

// Categories
const categories = computed(() => {
  const cats = new Set(challenges.value.map(c => c.category))
  return ['all', ...Array.from(cats)]
})

// Filtered challenges
const filteredChallenges = computed(() => {
  if (selectedCategory.value === 'all') {
    return challenges.value
  }
  return challenges.value.filter(c => c.category === selectedCategory.value)
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

// Cleanup countdown timers on unmount
onUnmounted(() => {
  if (currentChallengeContainer.value) {
    stopCountdown(currentChallengeContainer.value.containerId)
  }
})

// Load contest data
const loadContest = async () => {
  if (contests.value.length === 0) {
    await fetchContests()
  }
  await fetchContest(contestId.value)
  await fetchContainers()
}

// Open challenge modal
const openChallenge = async (challenge: CompetitionChallenge) => {
  selectedChallenge.value = challenge
  flagInput.value = ''
  isChallengeModalOpen.value = true

  // Fetch challenge detail
  isLoadingDetail.value = true
  const result = await fetchCompetitionChallengeDetail(contestId.value, challenge.id)
  isLoadingDetail.value = false

  if (!result.success) {
    toast.add({
      title: '加载失败',
      description: result.error || '获取题目详情失败',
      color: 'error'
    })
  }
}

// Close modal and clear detail
const closeModal = () => {
  isChallengeModalOpen.value = false
  clearChallengeDetail()
}

// Submit flag
const submitFlag = async () => {
  if (!flagInput.value.trim() || !selectedChallenge.value) return

  isSubmitting.value = true
  const result = await submitCompetitionFlag(contestId.value, selectedChallenge.value.id, flagInput.value.trim())
  isSubmitting.value = false

  if (result.success && result.data) {
    if (result.data.correct) {
      toast.add({
        title: result.data.scored ? '🎉 Flag 正确！' : 'Flag 正确',
        description: result.data.scored
          ? `获得 ${result.data.pointsAwarded} 分，当前排名第 ${result.data.rank}`
          : '比赛已结束，本次提交不计分',
        color: 'success'
      })
      // Update local state
      if (selectedChallenge.value) {
        selectedChallenge.value.solved = true
        selectedChallenge.value.solves++
      }
      closeModal()
    } else {
      toast.add({
        title: 'Flag 错误',
        description: result.data.message || '请再试一次',
        color: 'error'
      })
    }
  } else {
    toast.add({
      title: '提交失败',
      description: result.error || '提交失败，请稍后再试',
      color: 'error'
    })
  }
}

/**
 * Download attachment
 */
const downloadAttachment = (attachment: ChallengeAttachment) => {
  window.open(attachment.url, '_blank')
}

/**
 * Copy to clipboard
 */
const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    toast.add({ title: '已复制', color: 'success' })
  } catch {
    toast.add({ title: '复制失败', color: 'error' })
  }
}

/**
 * Start container for challenge
 */
const handleStartContainer = async () => {
  if (!selectedChallenge.value) return

  isStartingContainer.value = true

  const result = await startContainer(selectedChallenge.value.id, contestId.value)
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
 * Unlock hint
 */
const handleUnlockHint = async (hint: ChallengeHint) => {
  const token = storedUser.value?.token
  if (!token) {
    toast.add({
      title: '请先登录',
      color: 'error'
    })
    return
  }

  if (hint.unlocked && hint.content) {
    return
  }

  isUnlockingHint.value = hint.id

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
      // Update the hint in currentChallengeDetail
      if (currentChallengeDetail.value?.hints) {
        const hintIndex = currentChallengeDetail.value.hints.findIndex(h => h.id === hint.id)
        if (hintIndex !== -1) {
          const targetHint = currentChallengeDetail.value.hints[hintIndex]
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
  } finally {
    isUnlockingHint.value = null
  }
}

// Helper functions
const getCategoryColor = (category: string) => {
  const colors: Record<string, 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' | 'neutral'> = {
    web: 'primary',
    pwn: 'error',
    crypto: 'warning',
    reverse: 'info',
    misc: 'success',
    blockchain: 'secondary'
  }
  return colors[category.toLowerCase()] || 'neutral'
}

const getDifficultyColor = (difficulty: string) => {
  const colors: Record<string, 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' | 'neutral'> = {
    EASY: 'success',
    MEDIUM: 'warning',
    HARD: 'error'
  }
  return colors[difficulty] || 'neutral'
}

const getDifficultyText = (difficulty: string) => {
  const textMap: Record<string, string> = {
    EASY: '简单',
    MEDIUM: '中等',
    HARD: '困难'
  }
  return textMap[difficulty] || difficulty
}

// SEO
useSeoMeta({
  title: () => currentContest.value ? `${currentContest.value.title} - 题目 - NKCTF` : '比赛题目 - NKCTF',
  description: '参加 NKCTF 竞赛，挑战题目'
})

// Fetch contest on mount
onMounted(() => {
  loadContest()
})

// Watch for route changes
watch(() => route.params.id, () => {
  loadContest()
})
</script>

<style scoped>
.challenge-card {
  transition: transform 0.2s ease;
}

.challenge-card:hover {
  transform: translateY(-2px);
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
