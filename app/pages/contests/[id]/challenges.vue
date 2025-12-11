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
      class="max-w-2xl"
    >
      <template #content>
        <UCard
          v-if="selectedChallenge"
          :ui="{
            root: 'bg-white dark:bg-gray-900',
            header: 'border-b border-gray-200 dark:border-gray-800',
            body: 'p-6',
            footer: 'border-t border-gray-200 dark:border-gray-800'
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
                    :label="selectedChallenge.difficulty"
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
                @click="isChallengeModalOpen = false"
              />
            </div>
          </template>

          <div class="space-y-4">
            <p class="text-gray-600 dark:text-gray-300">
              {{ selectedChallenge.description }}
            </p>

            <div class="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
              <span class="flex items-center gap-1">
                <UIcon
                  name="i-lucide-users"
                  class="w-4 h-4"
                />
                {{ selectedChallenge.solves }} 人解决
              </span>
            </div>

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
                  :disabled="selectedChallenge.solved"
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
interface Challenge {
  id: number
  title: string
  description: string
  category: string
  difficulty: string
  points: number
  solves: number
  solved: boolean
}

const route = useRoute()
const router = useRouter()
const { currentContest, contests, isLoading, error, fetchContest, fetchContests, getStatusText, getStatusColor } = useContests()

// Get contest ID from route
const contestId = computed(() => Number(route.params.id))

// Challenge state
const selectedCategory = ref('all')
const isChallengeModalOpen = ref(false)
const selectedChallenge = ref<Challenge | null>(null)
const flagInput = ref('')
const isSubmitting = ref(false)

// Mock challenges for this contest
// TODO: Fetch from API based on contest ID
const challenges = ref<Challenge[]>([
  {
    id: 1,
    title: 'Web 签到',
    description: '一道简单的 Web 签到题，让你熟悉比赛环境。',
    category: 'Web',
    difficulty: 'easy',
    points: 100,
    solves: 45,
    solved: true
  },
  {
    id: 2,
    title: 'Baby Pwn',
    description: '入门级 Pwn 题目，学习基本的栈溢出。',
    category: 'Pwn',
    difficulty: 'easy',
    points: 100,
    solves: 32,
    solved: false
  },
  {
    id: 3,
    title: 'RSA 入门',
    description: '简单的 RSA 加密题目。',
    category: 'Crypto',
    difficulty: 'easy',
    points: 100,
    solves: 38,
    solved: true
  },
  {
    id: 4,
    title: 'SQL Master',
    description: '进阶 SQL 注入挑战。',
    category: 'Web',
    difficulty: 'medium',
    points: 200,
    solves: 18,
    solved: false
  },
  {
    id: 5,
    title: 'Heap Fun',
    description: '堆利用题目，需要一定的 Pwn 基础。',
    category: 'Pwn',
    difficulty: 'hard',
    points: 350,
    solves: 5,
    solved: false
  },
  {
    id: 6,
    title: 'Hidden Flag',
    description: '图片隐写题目。',
    category: 'Misc',
    difficulty: 'easy',
    points: 100,
    solves: 42,
    solved: true
  }
])

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

// Load contest data
const loadContest = async () => {
  if (contests.value.length === 0) {
    await fetchContests()
  }
  await fetchContest(contestId.value)
}

// Open challenge modal
const openChallenge = (challenge: Challenge) => {
  selectedChallenge.value = challenge
  flagInput.value = ''
  isChallengeModalOpen.value = true
}

// Submit flag
const submitFlag = async () => {
  if (!flagInput.value || !selectedChallenge.value) return

  isSubmitting.value = true

  try {
    // TODO: Implement flag submission API
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Mock success
    selectedChallenge.value.solved = true
    isChallengeModalOpen.value = false
    // TODO: Show success toast
  }
  catch (e) {
    // TODO: Show error toast
    console.error('Flag 提交失败:', e)
  }
  finally {
    isSubmitting.value = false
  }
}

// Helper functions
const getCategoryColor = (category: string) => {
  const colors: Record<string, 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' | 'neutral'> = {
    Web: 'primary',
    Pwn: 'error',
    Crypto: 'warning',
    Reverse: 'info',
    Misc: 'success'
  }
  return colors[category] || 'neutral'
}

const getDifficultyColor = (difficulty: string) => {
  const colors: Record<string, 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' | 'neutral'> = {
    easy: 'success',
    medium: 'warning',
    hard: 'error'
  }
  return colors[difficulty] || 'neutral'
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
</style>
