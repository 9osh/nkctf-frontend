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
          @click="handleBack"
        />
        <UIcon
          name="i-lucide-edit-3"
          class="w-6 h-6 text-primary-500"
        />
        <h1 class="text-xl font-semibold text-gray-900 dark:text-white">
          编辑文章
        </h1>
        <UBadge
          v-if="currentArticle"
          :label="getStatusLabel(currentArticle.status)"
          :color="getStatusColor(currentArticle.status)"
          variant="subtle"
        />
      </div>
    </template>

    <template #header-right>
      <div class="flex items-center gap-3">
        <!-- Auto-save indicator -->
        <span
          v-if="lastSavedText"
          class="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1"
        >
          <UIcon
            name="i-lucide-save"
            class="w-3.5 h-3.5"
          />
          {{ lastSavedText }}
        </span>

        <UButton
          variant="outline"
          :loading="isSavingDraft"
          @click="handleSaveDraft"
        >
          保存
        </UButton>
        <UButton
          v-if="canSubmit"
          icon="i-lucide-send"
          :loading="isSubmitting"
          @click="handleSubmitForReview"
        >
          提交审核
        </UButton>
      </div>
    </template>

    <div class="p-6">
      <!-- Loading State -->
      <div
        v-if="isLoading"
        class="max-w-5xl mx-auto space-y-6"
      >
        <USkeleton class="h-12 w-full" />
        <USkeleton class="h-20 w-full" />
        <USkeleton class="h-[600px] w-full" />
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
          @click="loadArticle"
        >
          重试
        </UButton>
      </div>

      <!-- Editor Form -->
      <div
        v-else-if="currentArticle"
        class="max-w-5xl mx-auto space-y-6"
      >
        <!-- Review Comment (if rejected) -->
        <UAlert
          v-if="currentArticle.status === 'REJECTED' && currentArticle.reviewComment"
          icon="i-lucide-alert-circle"
          color="error"
          class="mb-6"
        >
          <template #title>
            审核未通过
          </template>
          <template #description>
            {{ currentArticle.reviewComment }}
          </template>
        </UAlert>

        <!-- Title -->
        <div>
          <UInput
            v-model="formData.title"
            placeholder="请输入文章标题..."
            size="xl"
            :ui="{
              base: 'text-2xl font-bold',
              size: { xl: 'text-2xl' }
            }"
          />
        </div>

        <!-- Summary -->
        <div>
          <UTextarea
            v-model="formData.summary"
            placeholder="请输入文章摘要（可选）..."
            :rows="2"
            autoresize
          />
        </div>

        <!-- Tags -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            选择标签
          </label>
          <div class="flex flex-wrap gap-2">
            <UButton
              v-for="tag in tags"
              :key="tag.id"
              size="sm"
              :variant="selectedTagIds.includes(tag.id) ? 'solid' : 'outline'"
              :style="selectedTagIds.includes(tag.id) ? { backgroundColor: tag.color, borderColor: tag.color } : { borderColor: tag.color, color: tag.color }"
              @click="toggleTag(tag.id)"
            >
              {{ tag.name }}
            </UButton>
            <span
              v-if="tags.length === 0"
              class="text-sm text-gray-500 dark:text-gray-400"
            >
              加载标签中...
            </span>
          </div>
        </div>

        <!-- Markdown Editor -->
        <div class="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          <ClientOnly>
            <MdEditor
              v-model="formData.content"
              :theme="editorTheme"
              language="zh-CN"
              :preview="true"
              :toolbars-exclude="['save', 'htmlPreview', 'github', 'catalog']"
              style="height: 600px;"
              @on-save="handleSaveDraft"
            />
            <template #fallback>
              <div class="h-[600px] flex items-center justify-center bg-gray-50 dark:bg-gray-800">
                <USkeleton class="w-full h-full" />
              </div>
            </template>
          </ClientOnly>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { MdEditor } from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'
import type { ArticleStatus } from '~/composables/useLearn'

// Use auth middleware for route protection
definePageMeta({
  middleware: 'auth'
})

const route = useRoute()
const router = useRouter()

// Permission composable for article-level checks
const { canEditArticle, canSubmitForReview } = usePermission()
const { storedUser } = useUser()

// Get article ID from route
const articleId = computed(() => Number(route.params.id))

useSeoMeta({
  title: () => currentArticle.value ? `编辑: ${currentArticle.value.title} - NKCTF` : '编辑文章 - NKCTF',
  description: '编辑学习指南文章'
})

// Composables
const {
  currentArticle,
  tags,
  isLoading,
  error,
  fetchTags,
  fetchMyArticle,
  updateArticle,
  submitForReview: submitArticleForReview
} = useLearn()
const {
  lastSavedText,
  saveDraft,
  clearDraft,
  startAutoSave
} = useAutoSave(String(articleId.value))
const colorMode = useColorMode()

// Editor theme
const editorTheme = computed(() => colorMode.value === 'dark' ? 'dark' : 'light')

// Form data
const formData = reactive({
  title: '',
  summary: '',
  content: ''
})
const selectedTagIds = ref<number[]>([])

// State
const isSavingDraft = ref(false)
const isSubmitting = ref(false)

// Computed
const canSubmit = computed(() => {
  if (!currentArticle.value || !storedUser.value) return false
  // Use permission composable to check if user can submit this article
  return canSubmitForReview(currentArticle.value.status, currentArticle.value.author.id)
})

/**
 * Get status label
 */
const getStatusLabel = (status: ArticleStatus): string => {
  const labels: Record<ArticleStatus, string> = {
    DRAFT: '草稿',
    PENDING: '待审核',
    PUBLISHED: '已发布',
    REJECTED: '已拒绝'
  }
  return labels[status]
}

/**
 * Get status color
 */
const getStatusColor = (status: ArticleStatus): 'neutral' | 'warning' | 'success' | 'error' => {
  const colors: Record<ArticleStatus, 'neutral' | 'warning' | 'success' | 'error'> = {
    DRAFT: 'neutral',
    PENDING: 'warning',
    PUBLISHED: 'success',
    REJECTED: 'error'
  }
  return colors[status]
}

/**
 * Toggle tag selection
 */
const toggleTag = (tagId: number) => {
  const index = selectedTagIds.value.indexOf(tagId)
  if (index === -1) {
    selectedTagIds.value.push(tagId)
  } else {
    selectedTagIds.value.splice(index, 1)
  }
}

/**
 * Get current form data for auto-save
 */
const getCurrentData = () => ({
  title: formData.title,
  summary: formData.summary,
  content: formData.content,
  tagIds: selectedTagIds.value
})

/**
 * Load article data
 */
const loadArticle = async () => {
  const article = await fetchMyArticle(articleId.value)
  if (article) {
    // Check if user has permission to edit this article
    if (!storedUser.value || !canEditArticle(article.status, article.author.id)) {
      router.push('/learn/my')
      return
    }
    formData.title = article.title
    formData.summary = article.summary || ''
    formData.content = article.content || ''
    selectedTagIds.value = article.tags.map(t => t.id)
  }
}

/**
 * Handle save draft button
 */
const handleSaveDraft = async () => {
  // Save to localStorage
  saveDraft(getCurrentData())

  isSavingDraft.value = true

  try {
    // Save to server
    const result = await updateArticle({
      id: articleId.value,
      title: formData.title || '无标题草稿',
      summary: formData.summary,
      content: formData.content,
      tagIds: selectedTagIds.value
    })

    if (result) {
      // Clear local draft after server save
      clearDraft()
    }
  } finally {
    isSavingDraft.value = false
  }
}

/**
 * Handle submit for review
 */
const handleSubmitForReview = async () => {
  // Validation
  if (!formData.title.trim()) {
    alert('请输入文章标题')
    return
  }
  if (!formData.content.trim()) {
    alert('请输入文章内容')
    return
  }

  isSubmitting.value = true

  try {
    // Save first
    const article = await updateArticle({
      id: articleId.value,
      title: formData.title,
      summary: formData.summary,
      content: formData.content,
      tagIds: selectedTagIds.value
    })

    if (article) {
      // Submit for review
      const success = await submitArticleForReview(articleId.value)
      if (success) {
        clearDraft()
        router.push('/learn/my')
      }
    }
  } finally {
    isSubmitting.value = false
  }
}

/**
 * Handle back button
 */
const handleBack = () => {
  router.push('/learn/my')
}

// Initialize
onMounted(async () => {
  // Fetch tags and article in parallel
  await Promise.all([
    fetchTags(),
    loadArticle()
  ])

  // Start auto-save
  startAutoSave(getCurrentData)
})

// Save before leaving
onBeforeUnmount(() => {
  if (formData.title || formData.content) {
    saveDraft(getCurrentData())
  }
})
</script>

<style>
/* Override md-editor-v3 styles for dark mode */
.md-editor-dark {
  --md-bk-color: var(--color-gray-900);
}
</style>
