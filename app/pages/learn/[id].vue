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
          @click="router.push('/learn')"
        />
        <UIcon
          name="i-lucide-book-open"
          class="w-6 h-6 text-primary-500"
        />
        <h1 class="text-xl font-semibold text-gray-900 dark:text-white truncate max-w-md">
          {{ currentArticle?.title || '加载中...' }}
        </h1>
      </div>
    </template>

    <template #header-right>
      <div
        v-if="currentArticle"
        class="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400"
      >
        <span class="flex items-center gap-1">
          <UIcon
            name="i-lucide-user"
            class="w-4 h-4"
          />
          {{ currentArticle.author.nickname }}
        </span>
        <span class="flex items-center gap-1">
          <UIcon
            name="i-lucide-eye"
            class="w-4 h-4"
          />
          {{ currentArticle.viewCount }}
        </span>
      </div>
    </template>

    <div class="p-6">
      <!-- Loading State -->
      <div
        v-if="isLoading"
        class="max-w-4xl mx-auto"
      >
        <USkeleton class="h-8 w-3/4 mb-4" />
        <USkeleton class="h-4 w-1/4 mb-8" />
        <div class="space-y-3">
          <USkeleton class="h-4 w-full" />
          <USkeleton class="h-4 w-full" />
          <USkeleton class="h-4 w-5/6" />
          <USkeleton class="h-4 w-full" />
          <USkeleton class="h-4 w-4/5" />
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
          @click="loadArticle"
        >
          重试
        </UButton>
      </div>

      <!-- Article Content -->
      <article
        v-else-if="currentArticle"
        class="max-w-4xl mx-auto"
      >
        <!-- Article Header -->
        <header class="mb-8 pb-6 border-b border-gray-200 dark:border-gray-800">
          <!-- Tags -->
          <div class="flex items-center gap-2 mb-4 flex-wrap">
            <UBadge
              v-for="tag in currentArticle.tags"
              :key="tag.id"
              :label="tag.name"
              :style="{ backgroundColor: tag.color + '20', color: tag.color }"
              variant="subtle"
            />
            <span class="text-sm text-gray-500 dark:text-gray-400 ml-2">
              {{ formatDate(currentArticle.publishTime) }}
            </span>
          </div>

          <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            {{ currentArticle.title }}
          </h1>

          <!-- Summary -->
          <p
            v-if="currentArticle.summary"
            class="text-lg text-gray-600 dark:text-gray-400 mb-4"
          >
            {{ currentArticle.summary }}
          </p>

          <div class="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            <!-- Author with avatar -->
            <span class="flex items-center gap-2">
              <UAvatar
                v-if="currentArticle.author.avatar"
                :src="currentArticle.author.avatar"
                :alt="currentArticle.author.nickname"
                size="xs"
              />
              <UIcon
                v-else
                name="i-lucide-user"
                class="w-4 h-4"
              />
              {{ currentArticle.author.nickname }}
            </span>
            <span class="flex items-center gap-1">
              <UIcon
                name="i-lucide-eye"
                class="w-4 h-4"
              />
              {{ currentArticle.viewCount }} 次阅读
            </span>
            <span class="flex items-center gap-1">
              <UIcon
                name="i-lucide-calendar"
                class="w-4 h-4"
              />
              {{ formatDate(currentArticle.createTime) }}
            </span>
          </div>
        </header>

        <!-- Markdown Content -->
        <ClientOnly>
          <MdPreview
            v-if="currentArticle.content"
            :model-value="currentArticle.content"
            :theme="previewTheme"
            language="zh-CN"
          />
          <template #fallback>
            <div class="py-8 text-center text-gray-500 dark:text-gray-400">
              加载中...
            </div>
          </template>
        </ClientOnly>

        <!-- Footer Navigation -->
        <footer class="mt-12 pt-6 border-t border-gray-200 dark:border-gray-800">
          <div class="flex items-center justify-between">
            <UButton
              icon="i-lucide-arrow-left"
              variant="outline"
              @click="router.push('/learn')"
            >
              返回列表
            </UButton>
            <div class="flex items-center gap-2">
              <UButton
                icon="i-lucide-share-2"
                color="neutral"
                variant="ghost"
                aria-label="分享"
                @click="shareArticle"
              />
              <UButton
                icon="i-lucide-bookmark"
                color="neutral"
                variant="ghost"
                aria-label="收藏"
              />
            </div>
          </div>
        </footer>
      </article>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { MdPreview } from 'md-editor-v3'
import 'md-editor-v3/lib/preview.css'

const route = useRoute()
const router = useRouter()
const colorMode = useColorMode()
const { currentArticle, isLoading, error, fetchPublishedArticle, clearCurrentArticle } = useLearn()

// Get article ID from route
const articleId = computed(() => Number(route.params.id))

// Theme for MdPreview
const previewTheme = computed(() => colorMode.value === 'dark' ? 'dark' : 'light')

/**
 * Format date string to display format
 */
const formatDate = (dateStr: string | null | undefined): string => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

/**
 * Load article data
 */
const loadArticle = async () => {
  await fetchPublishedArticle(articleId.value)
}

/**
 * Share article
 */
const shareArticle = async () => {
  if (navigator.share && currentArticle.value) {
    try {
      await navigator.share({
        title: currentArticle.value.title,
        text: currentArticle.value.summary || '',
        url: window.location.href
      })
    } catch {
      // User cancelled or share failed, copy to clipboard instead
      await navigator.clipboard.writeText(window.location.href)
    }
  } else {
    // Fallback: copy to clipboard
    await navigator.clipboard.writeText(window.location.href)
  }
}

// SEO
useSeoMeta({
  title: () => currentArticle.value ? `${currentArticle.value.title} - NKCTF` : '加载中... - NKCTF',
  description: () => currentArticle.value?.summary || ''
})

// Fetch article on mount
onMounted(() => {
  loadArticle()
})

// Watch for route changes
watch(() => route.params.id, () => {
  loadArticle()
})

// Clean up on unmount
onUnmounted(() => {
  clearCurrentArticle()
})
</script>
