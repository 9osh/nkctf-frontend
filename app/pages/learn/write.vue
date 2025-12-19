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
          name="i-lucide-pen-line"
          class="w-6 h-6 text-primary-500"
        />
        <h1 class="text-xl font-semibold text-gray-900 dark:text-white">
          写新文章
        </h1>
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
          :loading="isSaving"
          @click="handleSaveDraft"
        >
          保存草稿
        </UButton>
        <UButton
          icon="i-lucide-send"
          :loading="isSubmitting"
          @click="handleSubmitForReview"
        >
          提交审核
        </UButton>
      </div>
    </template>

    <div class="p-6">
      <!-- Restore Draft Alert -->
      <UAlert
        v-if="showRestoreAlert"
        icon="i-lucide-file-clock"
        color="info"
        class="mb-6"
      >
        <template #title>
          发现未保存的草稿
        </template>
        <template #description>
          是否恢复上次编辑的内容？
          <div class="mt-2 flex gap-2">
            <UButton
              size="xs"
              @click="restoreDraft"
            >
              恢复
            </UButton>
            <UButton
              size="xs"
              variant="outline"
              @click="discardDraft"
            >
              放弃
            </UButton>
          </div>
        </template>
      </UAlert>

      <!-- Editor Form -->
      <div class="max-w-5xl mx-auto space-y-6">
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

// Use auth middleware for route protection
definePageMeta({
  middleware: 'auth'
})

const router = useRouter()

useSeoMeta({
  title: '写新文章 - NKCTF',
  description: '创建新的学习指南文章'
})

// Composables
const { tags, fetchTags, createArticle, submitForReview: submitArticleForReview } = useLearn()
const {
  lastSavedText,
  isSaving,
  saveDraft,
  loadDraft,
  hasDraft,
  clearDraft,
  startAutoSave
} = useAutoSave('new')
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
const showRestoreAlert = ref(false)
const isSubmitting = ref(false)

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
 * Restore draft from localStorage
 */
const restoreDraft = () => {
  const draft = loadDraft()
  if (draft) {
    formData.title = draft.title || ''
    formData.summary = draft.summary || ''
    formData.content = draft.content || ''
    selectedTagIds.value = draft.tagIds || []
  }
  showRestoreAlert.value = false
}

/**
 * Discard saved draft
 */
const discardDraft = () => {
  clearDraft()
  showRestoreAlert.value = false
}

/**
 * Handle save draft button
 */
const handleSaveDraft = async () => {
  // Save to localStorage
  saveDraft(getCurrentData())

  // Also create/update on server if there's content
  if (formData.title || formData.content) {
    const result = await createArticle({
      title: formData.title || '无标题草稿',
      summary: formData.summary,
      content: formData.content,
      tagIds: selectedTagIds.value
    })

    if (result) {
      // Clear local draft after server save
      clearDraft()
      // Navigate to edit page with the new article ID
      router.push(`/learn/edit/${result.id}`)
    }
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
    // Create article
    const article = await createArticle({
      title: formData.title,
      summary: formData.summary,
      content: formData.content,
      tagIds: selectedTagIds.value
    })

    if (article) {
      // Submit for review
      const success = await submitArticleForReview(article.id)
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
  if (formData.title || formData.content) {
    if (confirm('确定要离开吗？未保存的内容将丢失。')) {
      router.push('/learn/my')
    }
  } else {
    router.push('/learn/my')
  }
}

// Initialize
onMounted(async () => {
  if (!isLoggedIn.value) return

  // Fetch tags
  await fetchTags()

  // Check for saved draft
  if (hasDraft()) {
    showRestoreAlert.value = true
  }

  // Start auto-save
  startAutoSave(getCurrentData)
})

// Warn before leaving with unsaved changes
onBeforeUnmount(() => {
  // Save current state before leaving
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
