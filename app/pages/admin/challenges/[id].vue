<template>
  <NuxtLayout name="dashboard">
    <template #header-left>
      <div class="flex items-center gap-3">
        <UButton
          icon="i-lucide-arrow-left"
          color="neutral"
          variant="ghost"
          size="sm"
          @click="router.push('/admin/challenges')"
        />
        <h1 class="text-xl font-semibold text-gray-900 dark:text-white">
          {{ isNew ? '创建题目' : '编辑题目' }}
        </h1>
      </div>
    </template>

    <template #header-right>
      <div class="flex items-center gap-3">
        <template v-if="!isNew">
          <span class="text-sm text-gray-500 dark:text-gray-400">
            {{ formData.enabled ? '已启用' : '已禁用' }}
          </span>
          <UToggle v-model="formData.enabled" />
        </template>
        <UButton
          icon="i-lucide-save"
          :loading="isSaving"
          @click="handleSave"
        >
          {{ isNew ? '创建' : '保存' }}
        </UButton>
      </div>
    </template>

    <div class="p-6">
      <!-- Loading State -->
      <div
        v-if="isLoading"
        class="space-y-6"
      >
        <UCard>
          <div class="space-y-4">
            <USkeleton class="h-10 w-full" />
            <USkeleton class="h-10 w-1/2" />
            <USkeleton class="h-32 w-full" />
          </div>
        </UCard>
      </div>

      <!-- Form -->
      <div
        v-else
        class="space-y-6"
      >
        <!-- Basic Info -->
        <UCard>
          <template #header>
            <h2 class="text-lg font-semibold">
              基本信息
            </h2>
          </template>

          <div class="space-y-4">
            <!-- Title -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                题目标题 <span class="text-red-500">*</span>
              </label>
              <UInput
                v-model="formData.title"
                placeholder="输入题目标题..."
                size="lg"
                class="w-full"
              />
            </div>

            <!-- Category & Difficulty -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  分类 <span class="text-red-500">*</span>
                </label>
                <USelectMenu
                  v-model="formData.category"
                  :items="categoryOptions"
                  value-key="value"
                  class="w-full"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  难度 <span class="text-red-500">*</span>
                </label>
                <USelectMenu
                  v-model="formData.difficulty"
                  :items="difficultyOptions"
                  value-key="value"
                  class="w-full"
                />
              </div>
            </div>

            <!-- Description -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                题目描述 <span class="text-red-500">*</span>
              </label>
              <ClientOnly>
                <MdEditor
                  v-model="formData.description"
                  :theme="editorTheme"
                  language="zh-CN"
                  :preview="false"
                  :toolbars-exclude="['github', 'save']"
                  style="height: 300px"
                />
                <template #fallback>
                  <UTextarea
                    v-model="formData.description"
                    placeholder="输入题目描述 (支持 Markdown)..."
                    :rows="10"
                  />
                </template>
              </ClientOnly>
            </div>

            <!-- Author -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                作者
              </label>
              <UInput
                v-model="formData.author"
                placeholder="题目作者..."
                class="w-full"
              />
            </div>
          </div>
        </UCard>

        <!-- Scoring Settings -->
        <UCard>
          <template #header>
            <h2 class="text-lg font-semibold">
              积分设置
            </h2>
          </template>

          <div class="space-y-4">
            <!-- Scoring Type Toggle -->
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-700 dark:text-gray-300">
                  积分类型
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  {{ formData.scoringType === 'STATIC' ? '静态积分：所有人获得相同分数' : '动态积分：分数随解题人数递减' }}
                </p>
              </div>
              <div class="flex gap-2">
                <UButton
                  :color="formData.scoringType === 'STATIC' ? 'primary' : 'neutral'"
                  :variant="formData.scoringType === 'STATIC' ? 'solid' : 'outline'"
                  size="sm"
                  @click="formData.scoringType = 'STATIC'"
                >
                  静态积分
                </UButton>
                <UButton
                  :color="formData.scoringType === 'DYNAMIC' ? 'primary' : 'neutral'"
                  :variant="formData.scoringType === 'DYNAMIC' ? 'solid' : 'outline'"
                  size="sm"
                  @click="formData.scoringType = 'DYNAMIC'"
                >
                  动态积分
                </UButton>
              </div>
            </div>

            <!-- Static Points (always shown) -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {{ formData.scoringType === 'STATIC' ? '分值' : '练习模式分值' }} <span class="text-red-500">*</span>
              </label>
              <UInput
                v-model.number="formData.points"
                type="number"
                min="1"
                placeholder="100"
              />
              <p
                v-if="formData.scoringType === 'DYNAMIC'"
                class="text-xs text-gray-500 dark:text-gray-400 mt-1"
              >
                动态积分题目启用为练习题前，必须设置此静态分值
              </p>
            </div>

            <!-- Dynamic Scoring Settings -->
            <div
              v-if="formData.scoringType === 'DYNAMIC'"
              class="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700"
            >
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    最大分值 <span class="text-red-500">*</span>
                  </label>
                  <UInput
                    v-model.number="formData.maxPoints"
                    type="number"
                    min="1"
                    placeholder="500"
                  />
                  <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    首次解题时的分数
                  </p>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    最小分值 <span class="text-red-500">*</span>
                  </label>
                  <UInput
                    v-model.number="formData.minPoints"
                    type="number"
                    min="1"
                    placeholder="100"
                  />
                  <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    分数下限
                  </p>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    衰减系数
                  </label>
                  <UInput
                    v-model.number="formData.decay"
                    type="number"
                    min="1"
                    placeholder="20"
                  />
                  <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    达到最小分值所需的解题人数
                  </p>
                </div>
              </div>

              <!-- Formula Preview -->
              <div class="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  动态积分公式预览
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-400 font-mono">
                  currentPoints = max({{ formData.minPoints }}, (({{ formData.minPoints }} - {{ formData.maxPoints }}) / {{ formData.decay }}²) × solves² + {{ formData.maxPoints }})
                </p>
                <div class="mt-3 grid grid-cols-4 gap-2 text-xs">
                  <div class="text-center p-2 bg-white dark:bg-gray-700 rounded">
                    <p class="text-gray-500 dark:text-gray-400">1 人解出</p>
                    <p class="font-medium text-gray-900 dark:text-white">{{ formData.maxPoints }} 分</p>
                  </div>
                  <div class="text-center p-2 bg-white dark:bg-gray-700 rounded">
                    <p class="text-gray-500 dark:text-gray-400">5 人解出</p>
                    <p class="font-medium text-gray-900 dark:text-white">{{ calculateDynamicPoints(5) }} 分</p>
                  </div>
                  <div class="text-center p-2 bg-white dark:bg-gray-700 rounded">
                    <p class="text-gray-500 dark:text-gray-400">10 人解出</p>
                    <p class="font-medium text-gray-900 dark:text-white">{{ calculateDynamicPoints(10) }} 分</p>
                  </div>
                  <div class="text-center p-2 bg-white dark:bg-gray-700 rounded">
                    <p class="text-gray-500 dark:text-gray-400">{{ formData.decay }}+ 人解出</p>
                    <p class="font-medium text-gray-900 dark:text-white">{{ formData.minPoints }} 分</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </UCard>

        <!-- Flag Settings -->
        <UCard>
          <template #header>
            <h2 class="text-lg font-semibold">
              Flag 设置
            </h2>
          </template>

          <div class="space-y-4">
            <!-- Toggle: Static/Dynamic -->
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-700 dark:text-gray-300">
                  题目类型
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  {{ formData.isDynamic ? '动态容器会为每个用户生成独立环境' : '静态 Flag 固定不变' }}
                </p>
              </div>
              <div class="flex gap-2">
                <UButton
                  :color="!formData.isDynamic ? 'primary' : 'neutral'"
                  :variant="!formData.isDynamic ? 'solid' : 'outline'"
                  size="sm"
                  @click="formData.isDynamic = false"
                >
                  静态 Flag
                </UButton>
                <UButton
                  :color="formData.isDynamic ? 'primary' : 'neutral'"
                  :variant="formData.isDynamic ? 'solid' : 'outline'"
                  size="sm"
                  @click="formData.isDynamic = true"
                >
                  动态容器
                </UButton>
              </div>
            </div>

            <!-- Static Flag -->
            <div v-if="!formData.isDynamic">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Flag <span class="text-red-500">*</span>
              </label>
              <div class="flex gap-2">
                <UInput
                  v-model="formData.flag"
                  :type="showFlag ? 'text' : 'password'"
                  placeholder="flag{...}"
                  class="flex-1"
                />
                <UButton
                  :icon="showFlag ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                  color="neutral"
                  variant="outline"
                  @click="showFlag = !showFlag"
                />
              </div>
            </div>

            <!-- Dynamic Container -->
            <div v-else>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Docker 镜像 <span class="text-red-500">*</span>
              </label>
              <UInput
                v-model="formData.dockerImage"
                placeholder="ctf/challenge:latest"
              />
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                动态容器题目会为每个用户生成独立的 Flag
              </p>
            </div>
          </div>
        </UCard>

        <!-- Attachment -->
        <UCard>
          <template #header>
            <h2 class="text-lg font-semibold">
              附件
            </h2>
          </template>

          <div class="space-y-4">
            <!-- Current Attachment -->
            <div
              v-if="currentAttachment"
              class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
            >
              <div class="flex items-center gap-3">
                <UIcon
                  name="i-lucide-file-archive"
                  class="w-8 h-8 text-gray-400"
                />
                <div>
                  <p class="text-sm font-medium text-gray-900 dark:text-white">
                    当前附件
                  </p>
                  <p class="text-xs text-gray-500 dark:text-gray-400">
                    {{ currentAttachment }}
                  </p>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <UButton
                  icon="i-lucide-download"
                  color="neutral"
                  variant="outline"
                  size="sm"
                  :href="currentAttachment"
                  target="_blank"
                >
                  下载
                </UButton>
                <UButton
                  icon="i-lucide-trash-2"
                  color="error"
                  variant="ghost"
                  size="sm"
                  :loading="isDeletingAttachment"
                  @click="handleDeleteAttachment"
                >
                  删除
                </UButton>
              </div>
            </div>

            <!-- Upload New -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {{ currentAttachment ? '替换附件' : '上传附件' }}
              </label>
              <input
                ref="fileInput"
                type="file"
                class="block w-full text-sm text-gray-500 dark:text-gray-400
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-medium
                  file:bg-primary-50 file:text-primary-700
                  dark:file:bg-primary-900 dark:file:text-primary-300
                  hover:file:bg-primary-100 dark:hover:file:bg-primary-800
                  cursor-pointer"
                @change="handleFileChange"
              />
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                支持 zip、tar.gz 等压缩格式
              </p>
            </div>

            <!-- Upload Progress -->
            <div
              v-if="isUploadingAttachment"
              class="flex items-center gap-3"
            >
              <UIcon
                name="i-lucide-loader-2"
                class="w-5 h-5 text-primary-500 animate-spin"
              />
              <span class="text-sm text-gray-500 dark:text-gray-400">
                上传中...
              </span>
            </div>
          </div>
        </UCard>

        <!-- Hints (only for existing challenges) -->
        <UCard v-if="!isNew && challengeId">
          <template #header>
            <h2 class="text-lg font-semibold">
              提示管理
            </h2>
          </template>

          <AdminHintEditor
            :challenge-id="challengeId"
            :hints="hints"
            @update:hints="hints = $event"
          />
        </UCard>

        <!-- Hints info for new challenges -->
        <UCard v-if="isNew">
          <template #header>
            <h2 class="text-lg font-semibold">
              提示管理
            </h2>
          </template>

          <div class="text-center py-8">
            <UIcon
              name="i-lucide-lightbulb"
              class="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2"
            />
            <p class="text-sm text-gray-500 dark:text-gray-400">
              请先创建题目，然后再添加提示
            </p>
          </div>
        </UCard>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { MdEditor } from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'
import type {
  AdminChallenge,
  AdminHint,
  ChallengeCategory,
  ChallengeDifficulty,
  ChallengeFormData,
  ScoringType
} from '~/composables/useChallengeAdmin'

// Use admin middleware for route protection
definePageMeta({
  middleware: 'admin'
})

const route = useRoute()
const router = useRouter()
const colorMode = useColorMode()

// Determine if this is a new challenge or editing existing
const isNew = computed(() => route.params.id === 'new')
const challengeId = computed(() => isNew.value ? null : Number(route.params.id))

useSeoMeta({
  title: computed(() => isNew.value ? '创建题目 - NKCTF Admin' : '编辑题目 - NKCTF Admin'),
  description: '管理 CTF 题目'
})

// Composables
const {
  fetchChallengeDetail,
  createChallenge,
  updateChallenge,
  uploadAttachment,
  deleteAttachment
} = useChallengeAdmin()

// Editor theme
const editorTheme = computed(() => colorMode.value === 'dark' ? 'dark' : 'light')

// State
const isLoading = ref(false)
const isSaving = ref(false)
const showFlag = ref(false)
const hints = ref<AdminHint[]>([])
const currentAttachment = ref<string | null>(null)
const isUploadingAttachment = ref(false)
const isDeletingAttachment = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

// Form data
const formData = reactive<ChallengeFormData & { enabled: boolean }>({
  title: '',
  description: '',
  content: '',
  category: 'WEB',
  difficulty: 'EASY',
  points: 100,
  scoringType: 'STATIC',
  maxPoints: 500,
  minPoints: 100,
  decay: 20,
  flag: '',
  author: '',
  isDynamic: false,
  dockerImage: '',
  enabled: false
})

// Toast for notifications
const toast = useToast()

// Options
const categoryOptions = [
  { label: 'Web', value: 'WEB' as ChallengeCategory },
  { label: 'Pwn', value: 'PWN' as ChallengeCategory },
  { label: 'Crypto', value: 'CRYPTO' as ChallengeCategory },
  { label: 'Reverse', value: 'REVERSE' as ChallengeCategory },
  { label: 'Misc', value: 'MISC' as ChallengeCategory },
  { label: 'Blockchain', value: 'BLOCKCHAIN' as ChallengeCategory }
]

const difficultyOptions = [
  { label: '简单', value: 'EASY' as ChallengeDifficulty },
  { label: '中等', value: 'MEDIUM' as ChallengeDifficulty },
  { label: '困难', value: 'HARD' as ChallengeDifficulty }
]

const scoringTypeOptions = [
  { label: '静态积分', value: 'STATIC' as ScoringType },
  { label: '动态积分', value: 'DYNAMIC' as ScoringType }
]

/**
 * Calculate dynamic points based on solve count
 * Formula: currentPoints = max(minPoints, ((minPoints - maxPoints) / decay²) × solves² + maxPoints)
 */
const calculateDynamicPoints = (solves: number): number => {
  const maxPts = formData.maxPoints || 500
  const minPts = formData.minPoints || 100
  const decayVal = formData.decay || 20

  if (solves <= 0) return maxPts
  if (solves >= decayVal) return minPts

  const calculated = ((minPts - maxPts) / (decayVal * decayVal)) * (solves * solves) + maxPts
  return Math.round(Math.max(minPts, calculated))
}

/**
 * Load challenge data for editing
 */
const loadChallenge = async () => {
  if (isNew.value || !challengeId.value) return

  isLoading.value = true

  const challenge = await fetchChallengeDetail(challengeId.value)
  if (challenge) {
    formData.title = challenge.title
    formData.description = challenge.description
    formData.content = challenge.content || ''
    formData.category = challenge.category
    formData.difficulty = challenge.difficulty
    formData.points = challenge.points
    formData.scoringType = challenge.scoringType || 'STATIC'
    formData.maxPoints = challenge.maxPoints || 500
    formData.minPoints = challenge.minPoints || 100
    formData.decay = challenge.decay || 20
    formData.flag = challenge.flag || ''
    formData.author = challenge.author || ''
    formData.isDynamic = challenge.isDynamic
    formData.dockerImage = challenge.dockerImage || ''
    formData.enabled = challenge.enabled
    hints.value = challenge.hints || []
    currentAttachment.value = challenge.attachmentUrl || null
  } else {
    // Challenge not found, redirect back
    router.push('/admin/challenges')
  }

  isLoading.value = false
}

/**
 * Handle save
 */
const handleSave = async () => {
  // Validation
  if (!formData.title.trim()) {
    toast.add({ title: '请输入题目标题', color: 'error' })
    return
  }
  if (!formData.description.trim()) {
    toast.add({ title: '请输入题目描述', color: 'error' })
    return
  }
  if (!formData.isDynamic && !formData.flag?.trim()) {
    toast.add({ title: '请输入 Flag', color: 'error' })
    return
  }
  if (formData.isDynamic && !formData.dockerImage?.trim()) {
    toast.add({ title: '请输入 Docker 镜像', color: 'error' })
    return
  }

  // Validate dynamic scoring settings
  if (formData.scoringType === 'DYNAMIC') {
    if (!formData.maxPoints || formData.maxPoints < 1) {
      toast.add({ title: '请输入有效的最大分值', color: 'error' })
      return
    }
    if (!formData.minPoints || formData.minPoints < 1) {
      toast.add({ title: '请输入有效的最小分值', color: 'error' })
      return
    }
    if (formData.maxPoints <= formData.minPoints) {
      toast.add({ title: '最大分值必须大于最小分值', color: 'error' })
      return
    }
  }

  isSaving.value = true

  const data: ChallengeFormData = {
    title: formData.title,
    description: formData.description,
    content: formData.content,
    category: formData.category,
    difficulty: formData.difficulty,
    points: formData.points,
    scoringType: formData.scoringType,
    author: formData.author,
    isDynamic: formData.isDynamic,
    enabled: formData.enabled
  }

  // Add dynamic scoring fields if using DYNAMIC scoring
  if (formData.scoringType === 'DYNAMIC') {
    data.maxPoints = formData.maxPoints
    data.minPoints = formData.minPoints
    data.decay = formData.decay || 20
  }

  if (formData.isDynamic) {
    data.dockerImage = formData.dockerImage
  } else {
    data.flag = formData.flag
  }

  let result: AdminChallenge | null = null

  if (isNew.value) {
    result = await createChallenge(data)
  } else if (challengeId.value) {
    result = await updateChallenge(challengeId.value, data)
  }

  isSaving.value = false

  if (result) {
    if (isNew.value) {
      toast.add({ title: '题目创建成功', color: 'success' })
      // Redirect to edit page to manage hints and attachments
      router.push(`/admin/challenges/${result.id}`)
    } else {
      toast.add({ title: '保存成功', color: 'success' })
    }
  } else {
    toast.add({ title: '操作失败', color: 'error' })
  }
}

/**
 * Handle file change for attachment upload
 */
const handleFileChange = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file || !challengeId.value) return

  isUploadingAttachment.value = true

  const result = await uploadAttachment(challengeId.value, file)
  if (result) {
    currentAttachment.value = result.url
    toast.add({ title: '附件上传成功', color: 'success' })
  } else {
    toast.add({ title: '附件上传失败', color: 'error' })
  }

  isUploadingAttachment.value = false

  // Reset file input
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

/**
 * Handle delete attachment
 */
const handleDeleteAttachment = async () => {
  if (!challengeId.value || !currentAttachment.value) return
  if (!confirm('确定要删除附件吗？')) return

  isDeletingAttachment.value = true

  const success = await deleteAttachment(challengeId.value)
  if (success) {
    currentAttachment.value = null
  }

  isDeletingAttachment.value = false
}

// Initialize
onMounted(() => {
  loadChallenge()
})
</script>
