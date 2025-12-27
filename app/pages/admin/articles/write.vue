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
          发布新文章
        </h1>
        <UBadge
          label="管理员"
          color="warning"
          variant="subtle"
        />
      </div>
    </template>

    <template #header-right>
      <div class="flex items-center gap-3">
        <UButton
          icon="i-lucide-send"
          :loading="isPublishing"
          @click="handlePublish"
        >
          直接发布
        </UButton>
      </div>
    </template>

    <div class="p-6">
      <!-- Editor Form -->
      <div class="max-w-5xl mx-auto space-y-6">
        <!-- Title -->
        <div class="w-full">
          <input
            v-model="formData.title"
            type="text"
            placeholder="请输入文章标题..."
            class="w-full text-xl sm:text-2xl md:text-3xl font-bold bg-transparent border border-transparent rounded-lg placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-white px-3 py-2 transition-colors focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
          >
        </div>

        <!-- Summary -->
        <div class="w-full">
          <textarea
            v-model="formData.summary"
            placeholder="请输入文章摘要（可选），用于在文章列表中展示..."
            rows="2"
            class="w-full text-sm sm:text-base bg-transparent border border-transparent rounded-lg placeholder-gray-400 dark:placeholder-gray-500 text-gray-600 dark:text-gray-300 px-3 py-2 resize-none leading-relaxed transition-colors focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
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

// Use admin middleware for route protection
definePageMeta({
  middleware: 'admin'
})

const router = useRouter()

useSeoMeta({
  title: '发布新文章 - NKCTF Admin',
  description: '管理员直接发布文章'
})

// Composables
const { tags, fetchTags } = useLearn()
const { publishDirectly, isLoading } = useArticleAdmin()
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
const isPublishing = ref(false)

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
 * Handle publish
 */
const handlePublish = async () => {
  // Validation
  if (!formData.title.trim()) {
    alert('请输入文章标题')
    return
  }
  if (!formData.content.trim()) {
    alert('请输入文章内容')
    return
  }

  isPublishing.value = true

  try {
    const article = await publishDirectly({
      title: formData.title,
      summary: formData.summary || undefined,
      content: formData.content,
      tagIds: selectedTagIds.value.length > 0 ? selectedTagIds.value : undefined
    })

    if (article) {
      router.push('/admin/articles')
    }
  } finally {
    isPublishing.value = false
  }
}

/**
 * Handle back button
 */
const handleBack = () => {
  if (formData.title || formData.content) {
    if (confirm('确定要离开吗？未保存的内容将丢失。')) {
      router.push('/admin/articles')
    }
  } else {
    router.push('/admin/articles')
  }
}

// Initialize
onMounted(async () => {
  await fetchTags()
})
</script>

<style>
/* Override md-editor-v3 styles for dark mode */
.md-editor-dark {
  --md-bk-color: var(--color-gray-900);
}
</style>
