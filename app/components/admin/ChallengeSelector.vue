<template>
  <UModal
    v-model:open="open"
    :ui="{ width: 'max-w-2xl' }"
  >
    <template #content>
      <UCard :ui="{ root: 'w-full' }">
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold">
              添加题目到竞赛
            </h3>
            <UButton
              icon="i-lucide-x"
              color="neutral"
              variant="ghost"
              size="sm"
              @click="open = false"
            />
          </div>
        </template>

        <div class="space-y-4">
          <!-- Filters -->
          <div class="flex items-center gap-4">
            <USelectMenu
              v-model="selectedCategory"
              :items="categoryOptions"
              value-key="value"
              placeholder="所有分类"
              class="w-32"
              @update:model-value="loadChallenges"
            />
            <UInput
              v-model="searchQuery"
              placeholder="搜索题目..."
              icon="i-lucide-search"
              size="sm"
              class="flex-1"
              @keyup.enter="loadChallenges"
            />
          </div>

          <!-- Loading State -->
          <div
            v-if="isLoading"
            class="space-y-2"
          >
            <div
              v-for="i in 5"
              :key="i"
              class="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
            >
              <USkeleton class="h-5 w-5" />
              <USkeleton class="h-5 w-48" />
            </div>
          </div>

          <!-- Challenge List -->
          <div
            v-else
            class="max-h-96 overflow-y-auto space-y-2"
          >
            <div
              v-for="challenge in availableChallenges"
              :key="challenge.id"
              class="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors"
              @click="toggleSelection(challenge.id)"
            >
              <UCheckbox
                :model-value="selectedIds.includes(challenge.id)"
                @update:model-value="toggleSelection(challenge.id)"
              />
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2">
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
                </div>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {{ challenge.points }} 分 · {{ challenge.solveCount }} 解
                </p>
              </div>
            </div>

            <!-- Empty State -->
            <div
              v-if="availableChallenges.length === 0"
              class="text-center py-8 text-gray-500 dark:text-gray-400"
            >
              没有找到可添加的题目
            </div>
          </div>
        </div>

        <template #footer>
          <div class="flex items-center justify-between">
            <p class="text-sm text-gray-500 dark:text-gray-400">
              已选择 {{ selectedIds.length }} 道题目
            </p>
            <div class="flex gap-3">
              <UButton
                variant="outline"
                @click="open = false"
              >
                取消
              </UButton>
              <UButton
                color="primary"
                :loading="isAdding"
                :disabled="selectedIds.length === 0"
                @click="handleAdd"
              >
                添加选中
              </UButton>
            </div>
          </div>
        </template>
      </UCard>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import type { AdminChallengeListItem, ChallengeCategory, ChallengeDifficulty } from '~/composables/useChallengeAdmin'

/**
 * Props
 */
interface Props {
  excludeIds?: number[]
}

const props = withDefaults(defineProps<Props>(), {
  excludeIds: () => []
})

/**
 * Model
 */
const open = defineModel<boolean>('open', { default: false })

/**
 * Emits
 */
const emit = defineEmits<{
  'select': [challengeIds: number[]]
}>()

// Composables
const { fetchChallenges } = useChallengeAdmin()

// State
const isLoading = ref(false)
const isAdding = ref(false)
const allChallenges = ref<AdminChallengeListItem[]>([])
const selectedIds = ref<number[]>([])
const selectedCategory = ref<ChallengeCategory | undefined>(undefined)
const searchQuery = ref('')

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

// Available challenges (excluding already added)
const availableChallenges = computed(() => {
  return allChallenges.value.filter(c => !props.excludeIds.includes(c.id))
})

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

  await fetchChallenges({
    category: selectedCategory.value,
    keyword: searchQuery.value || undefined,
    enabled: true // Only show enabled challenges
  })

  // Get from composable state
  const { adminChallenges } = useChallengeAdmin()
  allChallenges.value = adminChallenges.value

  isLoading.value = false
}

/**
 * Toggle challenge selection
 */
const toggleSelection = (challengeId: number) => {
  const index = selectedIds.value.indexOf(challengeId)
  if (index === -1) {
    selectedIds.value.push(challengeId)
  } else {
    selectedIds.value.splice(index, 1)
  }
}

/**
 * Handle add selected challenges
 */
const handleAdd = () => {
  if (selectedIds.value.length === 0) return

  isAdding.value = true
  emit('select', [...selectedIds.value])

  // Reset and close
  selectedIds.value = []
  open.value = false
  isAdding.value = false
}

// Load challenges when modal opens
watch(open, (isOpen) => {
  if (isOpen) {
    selectedIds.value = []
    loadChallenges()
  }
})
</script>
