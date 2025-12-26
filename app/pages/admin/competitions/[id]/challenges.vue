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
          竞赛题目管理
        </h1>
        <UBadge
          :label="`${challenges.length} 题`"
          color="primary"
          variant="subtle"
        />
      </div>
    </template>

    <template #header-right>
      <UButton
        icon="i-lucide-plus"
        @click="showSelector = true"
      >
        添加题目
      </UButton>
    </template>

    <div class="p-6">
      <!-- Loading State -->
      <div
        v-if="isLoading"
        class="space-y-3"
      >
        <div
          v-for="i in 5"
          :key="i"
          class="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
        >
          <USkeleton class="h-6 w-6" />
          <USkeleton class="h-5 w-48" />
          <div class="flex-1" />
          <USkeleton class="h-8 w-20" />
        </div>
      </div>

      <!-- Challenge List -->
      <div
        v-else-if="challenges.length > 0"
        class="space-y-3"
      >
        <div
          v-for="(challenge, index) in challenges"
          :key="challenge.id"
          class="flex items-center gap-4 p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg group"
        >
          <!-- Order Number -->
          <div class="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded text-sm font-medium text-gray-600 dark:text-gray-400">
            {{ index + 1 }}
          </div>

          <!-- Challenge Info -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-1">
              <span class="font-medium text-gray-900 dark:text-white truncate">
                {{ challenge.title }}
              </span>
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
              <UBadge
                v-if="!challenge.enabled"
                label="仅竞赛"
                color="neutral"
                variant="outline"
                size="xs"
              />
            </div>
            <p class="text-xs text-gray-500 dark:text-gray-400">
              {{ challenge.points }} 分
              <span
                v-if="challenge.scoringType === 'DYNAMIC'"
                class="text-purple-500"
              >
                · 动态积分 ({{ challenge.maxPoints }}-{{ challenge.minPoints }})
              </span>
            </p>
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <!-- Move Up -->
            <UButton
              v-if="index > 0"
              icon="i-lucide-chevron-up"
              color="neutral"
              variant="ghost"
              size="sm"
              aria-label="上移"
              @click="moveChallenge(index, index - 1)"
            />
            <!-- Move Down -->
            <UButton
              v-if="index < challenges.length - 1"
              icon="i-lucide-chevron-down"
              color="neutral"
              variant="ghost"
              size="sm"
              aria-label="下移"
              @click="moveChallenge(index, index + 1)"
            />
            <!-- Remove -->
            <UButton
              icon="i-lucide-x"
              color="error"
              variant="ghost"
              size="sm"
              aria-label="移除"
              @click="handleRemove(challenge)"
            />
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div
        v-else
        class="flex flex-col items-center justify-center py-16"
      >
        <UIcon
          name="i-lucide-flag"
          class="w-16 h-16 text-gray-300 dark:text-gray-700 mb-4"
        />
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
          暂无题目
        </h3>
        <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">
          点击上方按钮添加题目到竞赛
        </p>
        <UButton
          icon="i-lucide-plus"
          @click="showSelector = true"
        >
          添加题目
        </UButton>
      </div>
    </div>

    <!-- Challenge Selector Modal -->
    <AdminChallengeSelector
      v-model:open="showSelector"
      :exclude-ids="existingChallengeIds"
      @select="handleAddChallenges"
    />
  </NuxtLayout>
</template>

<script setup lang="ts">
import type { AdminCompetitionChallenge } from '~/composables/useCompetitionAdmin'
import type { ChallengeCategory, ChallengeDifficulty } from '~/composables/useChallengeAdmin'

// Use admin middleware for route protection
definePageMeta({
  middleware: 'admin'
})

const route = useRoute()
const router = useRouter()

const competitionId = computed(() => Number(route.params.id))

useSeoMeta({
  title: '竞赛题目管理 - NKCTF Admin',
  description: '管理竞赛中的题目'
})

// Composables
const {
  fetchCompetitionChallenges,
  addChallengesToCompetition,
  removeChallengeFromCompetition,
  reorderCompetitionChallenges
} = useCompetitionAdmin()

// State
const isLoading = ref(false)
const challenges = ref<AdminCompetitionChallenge[]>([])
const showSelector = ref(false)

// Existing challenge IDs for exclude
const existingChallengeIds = computed(() => challenges.value.map(c => c.challengeId))

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
  isLoading.value = true
  challenges.value = await fetchCompetitionChallenges(competitionId.value)
  isLoading.value = false
}

/**
 * Handle add challenges
 */
const handleAddChallenges = async (challengeIds: number[]) => {
  const result = await addChallengesToCompetition(competitionId.value, challengeIds)
  if (result) {
    challenges.value = result
  }
}

/**
 * Handle remove challenge
 */
const handleRemove = async (challenge: AdminCompetitionChallenge) => {
  if (!confirm(`确定要从竞赛中移除题目 "${challenge.title}" 吗？`)) return

  const success = await removeChallengeFromCompetition(competitionId.value, challenge.challengeId)
  if (success) {
    challenges.value = challenges.value.filter(c => c.id !== challenge.id)
  }
}

/**
 * Move challenge (reorder)
 */
const moveChallenge = async (fromIndex: number, toIndex: number) => {
  const newChallenges = [...challenges.value]
  const [moved] = newChallenges.splice(fromIndex, 1)
  newChallenges.splice(toIndex, 0, moved)

  // Optimistic update
  challenges.value = newChallenges

  // Send reorder request to server
  const challengeIds = newChallenges.map(c => c.challengeId)
  const result = await reorderCompetitionChallenges(competitionId.value, challengeIds)

  if (result) {
    challenges.value = result
  }
}

// Initialize
onMounted(() => {
  loadChallenges()
})
</script>
