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

      <!-- Challenge Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <div
          v-for="challenge in paginatedChallenges"
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
        v-if="filteredChallenges.length === 0"
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
        v-if="filteredChallenges.length > 0"
        class="flex items-center justify-between mt-8"
      >
        <p class="text-sm text-gray-500 dark:text-gray-400">
          显示 {{ (currentPage - 1) * pageSize + 1 }} - {{ Math.min(currentPage * pageSize, filteredChallenges.length) }} / {{ filteredChallenges.length }} 题
        </p>
        <UPagination
          v-model="currentPage"
          :total="filteredChallenges.length"
          :page-count="pageSize"
        />
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
                />
                <UButton
                  :loading="isSubmitting"
                  @click="submitFlag"
                >
                  提交
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
                  :key="index"
                  class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <span class="text-sm text-gray-600 dark:text-gray-400">
                    提示 {{ index + 1 }} (-{{ hint.cost }} 分)
                  </span>
                  <UButton
                    size="xs"
                    variant="outline"
                  >
                    查看
                  </UButton>
                </div>
              </div>
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
                >
                  {{ attachment.name }}
                </UButton>
              </div>
            </div>
          </div>
        </UCard>
      </template>
    </UModal>
  </NuxtLayout>
</template>

<script setup lang="ts">
interface Hint {
  cost: number
  unlocked: boolean
}

interface Attachment {
  name: string
  url: string
}

interface Challenge {
  id: number
  title: string
  description: string
  category: string
  difficulty: string
  points: number
  solves: number
  solved: boolean
  releaseDate: string
  author: string
  hints?: Hint[]
  attachments?: Attachment[]
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

// Pagination
const currentPage = ref(1)
const pageSize = 12

// Modal
const isChallengeModalOpen = ref(false)
const selectedChallenge = ref<Challenge | null>(null)
const flagInput = ref('')
const isSubmitting = ref(false)

// Filter options
const categories = [
  { label: '所有分类', value: undefined },
  { label: 'Web', value: 'Web' },
  { label: 'Pwn', value: 'Pwn' },
  { label: 'Crypto', value: 'Crypto' },
  { label: 'Reverse', value: 'Reverse' },
  { label: 'Misc', value: 'Misc' },
  { label: 'Blockchain', value: 'Blockchain' }
]

const difficulties = [
  { label: '所有难度', value: undefined },
  { label: 'very easy', value: 'very easy' },
  { label: 'easy', value: 'easy' },
  { label: 'medium', value: 'medium' },
  { label: 'hard', value: 'hard' },
  { label: 'insane', value: 'insane' }
]

const statuses = [
  { label: '所有状态', value: undefined },
  { label: '已解决', value: 'solved' },
  { label: '未解决', value: 'unsolved' }
]

const sortOptions = [
  { label: '最新发布', value: 'newest' },
  { label: '最多解决', value: 'most-solves' },
  { label: '最少解决', value: 'least-solves' },
  { label: '最高分值', value: 'highest-points' }
]

// Mock challenges data
const challenges = ref<Challenge[]>([
  {
    id: 1,
    title: 'Baby SQL',
    description: '一个简单的 SQL 注入漏洞，适合入门学习。尝试找出绕过登录验证的方法。',
    category: 'Web',
    difficulty: 'very easy',
    points: 100,
    solves: 256,
    solved: true,
    releaseDate: '2024-01-15',
    author: 'admin',
    hints: [{ cost: 10, unlocked: false }, { cost: 20, unlocked: false }],
    attachments: [{ name: 'source.zip', url: '#' }]
  },
  {
    id: 2,
    title: 'Buffer Overflow 101',
    description: '学习基本的栈溢出漏洞利用技术，覆盖返回地址实现代码执行。',
    category: 'Pwn',
    difficulty: 'easy',
    points: 150,
    solves: 189,
    solved: false,
    releaseDate: '2024-01-20',
    author: 'pwner',
    hints: [{ cost: 15, unlocked: false }],
    attachments: [{ name: 'vuln', url: '#' }, { name: 'libc.so.6', url: '#' }]
  },
  {
    id: 3,
    title: 'RSA Beginner',
    description: '经典的 RSA 加密算法攻击，给定公钥和密文，恢复明文。',
    category: 'Crypto',
    difficulty: 'very easy',
    points: 100,
    solves: 312,
    solved: true,
    releaseDate: '2024-01-18',
    author: 'crypto_master',
    hints: [{ cost: 10, unlocked: true }],
    attachments: [{ name: 'output.txt', url: '#' }]
  },
  {
    id: 4,
    title: 'CrackMe #1',
    description: '分析这个简单的 CrackMe 程序，找出正确的序列号。',
    category: 'Reverse',
    difficulty: 'easy',
    points: 150,
    solves: 145,
    solved: false,
    releaseDate: '2024-01-22',
    author: 'reverser',
    attachments: [{ name: 'crackme.exe', url: '#' }]
  },
  {
    id: 5,
    title: 'Hidden Message',
    description: '图片中隐藏了一段秘密信息，你能找到它吗？',
    category: 'Misc',
    difficulty: 'very easy',
    points: 50,
    solves: 420,
    solved: true,
    releaseDate: '2024-01-10',
    author: 'misc_king',
    attachments: [{ name: 'secret.png', url: '#' }]
  },
  {
    id: 6,
    title: 'Smart Contract Vuln',
    description: '分析这个智能合约，找出其中的漏洞并利用它。',
    category: 'Blockchain',
    difficulty: 'hard',
    points: 400,
    solves: 23,
    solved: false,
    releaseDate: '2024-02-01',
    author: 'blockchain_dev',
    hints: [{ cost: 50, unlocked: false }],
    attachments: [{ name: 'contract.sol', url: '#' }]
  },
  {
    id: 7,
    title: 'XSS Playground',
    description: '在这个网页应用中找到 XSS 漏洞，弹出 alert 即可。',
    category: 'Web',
    difficulty: 'easy',
    points: 120,
    solves: 198,
    solved: false,
    releaseDate: '2024-01-25',
    author: 'admin'
  },
  {
    id: 8,
    title: 'Heap Exploitation',
    description: '利用堆漏洞获取 shell，考察 heap overflow 和 UAF 技术。',
    category: 'Pwn',
    difficulty: 'hard',
    points: 350,
    solves: 34,
    solved: false,
    releaseDate: '2024-02-05',
    author: 'pwner',
    hints: [{ cost: 30, unlocked: false }, { cost: 50, unlocked: false }],
    attachments: [{ name: 'heap_chall', url: '#' }]
  },
  {
    id: 9,
    title: 'ECC Attack',
    description: '椭圆曲线加密的漏洞利用，需要一定的数学基础。',
    category: 'Crypto',
    difficulty: 'medium',
    points: 250,
    solves: 67,
    solved: false,
    releaseDate: '2024-01-28',
    author: 'crypto_master',
    attachments: [{ name: 'ecc.py', url: '#' }, { name: 'output.txt', url: '#' }]
  },
  {
    id: 10,
    title: 'Obfuscated Code',
    description: '这段代码被重度混淆，你能还原出原始逻辑吗？',
    category: 'Reverse',
    difficulty: 'medium',
    points: 200,
    solves: 89,
    solved: false,
    releaseDate: '2024-01-30',
    author: 'reverser',
    attachments: [{ name: 'obfuscated', url: '#' }]
  },
  {
    id: 11,
    title: 'Forensics 101',
    description: '分析这个内存转储文件，找出攻击者留下的痕迹。',
    category: 'Misc',
    difficulty: 'medium',
    points: 200,
    solves: 78,
    solved: false,
    releaseDate: '2024-02-02',
    author: 'forensic_expert',
    attachments: [{ name: 'memory.dmp', url: '#' }]
  },
  {
    id: 12,
    title: 'Re-entrancy Attack',
    description: '经典的重入攻击，从合约中提取所有资金。',
    category: 'Blockchain',
    difficulty: 'medium',
    points: 300,
    solves: 45,
    solved: false,
    releaseDate: '2024-02-08',
    author: 'blockchain_dev',
    attachments: [{ name: 'bank.sol', url: '#' }]
  }
])

const totalChallenges = computed(() => challenges.value.length)

const filteredChallenges = computed(() => {
  let result = [...challenges.value]

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(c =>
      c.title.toLowerCase().includes(query)
      || c.description.toLowerCase().includes(query)
    )
  }

  // Category filter
  if (selectedCategory.value) {
    result = result.filter(c => c.category === selectedCategory.value)
  }

  // Difficulty filter
  if (selectedDifficulty.value) {
    result = result.filter(c => c.difficulty === selectedDifficulty.value)
  }

  // Status filter
  if (selectedStatus.value === 'solved') {
    result = result.filter(c => c.solved)
  } else if (selectedStatus.value === 'unsolved') {
    result = result.filter(c => !c.solved)
  }

  // Sort
  switch (sortBy.value) {
    case 'newest':
      result.sort((a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime())
      break
    case 'most-solves':
      result.sort((a, b) => b.solves - a.solves)
      break
    case 'least-solves':
      result.sort((a, b) => a.solves - b.solves)
      break
    case 'highest-points':
      result.sort((a, b) => b.points - a.points)
      break
  }

  return result
})

const paginatedChallenges = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  const end = start + pageSize
  return filteredChallenges.value.slice(start, end)
})

// Reset page when filters change
watch([searchQuery, selectedCategory, selectedDifficulty, selectedStatus, sortBy], () => {
  currentPage.value = 1
})

const getCategoryIcon = (category: string) => {
  const icons: Record<string, string> = {
    Web: 'i-lucide-globe',
    Pwn: 'i-lucide-bug',
    Crypto: 'i-lucide-key',
    Reverse: 'i-lucide-cpu',
    Misc: 'i-lucide-puzzle',
    Blockchain: 'i-lucide-link'
  }
  return icons[category] || 'i-lucide-flag'
}

const getCategoryColor = (category: string) => {
  const colors: Record<string, 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' | 'neutral'> = {
    Web: 'primary',
    Pwn: 'error',
    Crypto: 'warning',
    Reverse: 'info',
    Misc: 'success',
    Blockchain: 'secondary'
  }
  return colors[category] || 'neutral'
}

const getCategoryBgClass = (category: string) => {
  const classes: Record<string, string> = {
    Web: 'bg-primary-100 dark:bg-primary-900/30',
    Pwn: 'bg-red-100 dark:bg-red-900/30',
    Crypto: 'bg-yellow-100 dark:bg-yellow-900/30',
    Reverse: 'bg-blue-100 dark:bg-blue-900/30',
    Misc: 'bg-green-100 dark:bg-green-900/30',
    Blockchain: 'bg-purple-100 dark:bg-purple-900/30'
  }
  return classes[category] || 'bg-gray-100 dark:bg-gray-800'
}

const getCategoryIconClass = (category: string) => {
  const classes: Record<string, string> = {
    Web: 'text-primary-600 dark:text-primary-400',
    Pwn: 'text-red-600 dark:text-red-400',
    Crypto: 'text-yellow-600 dark:text-yellow-400',
    Reverse: 'text-blue-600 dark:text-blue-400',
    Misc: 'text-green-600 dark:text-green-400',
    Blockchain: 'text-purple-600 dark:text-purple-400'
  }
  return classes[category] || 'text-gray-600 dark:text-gray-400'
}

const getDifficultyColor = (difficulty: string) => {
  const colors: Record<string, 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' | 'neutral'> = {
    'very easy': 'success',
    'easy': 'info',
    'medium': 'warning',
    'hard': 'error',
    'insane': 'error'
  }
  return colors[difficulty] || 'neutral'
}

const openChallenge = (challenge: Challenge) => {
  selectedChallenge.value = challenge
  flagInput.value = ''
  isChallengeModalOpen.value = true
}

const submitFlag = async () => {
  if (!flagInput.value || !selectedChallenge.value) return

  isSubmitting.value = true

  try {
    // TODO: 实现 Flag 提交 API
    console.log('Submitting flag:', flagInput.value, 'for challenge:', selectedChallenge.value.id)

    await new Promise(resolve => setTimeout(resolve, 1000))

    // Mock success
    alert('Flag 正确！恭喜你完成了这道挑战！')
    isChallengeModalOpen.value = false
  } catch (error) {
    console.error('Flag submission failed:', error)
    alert('Flag 错误，请再试一次！')
  } finally {
    isSubmitting.value = false
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
</style>
