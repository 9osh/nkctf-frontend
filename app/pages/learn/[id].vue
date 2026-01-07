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
        <span
          v-if="estimatedReadTime"
          class="flex items-center gap-1"
        >
          <UIcon
            name="i-lucide-clock"
            class="w-4 h-4"
          />
          {{ estimatedReadTime }} 分钟阅读
        </span>
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

    <!-- Reading Progress Bar - Teleport to body to escape stacking context -->
    <Teleport to="body">
      <div
        class="fixed top-0 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-800 z-50"
        aria-hidden="true"
      >
        <div
          class="h-full bg-primary-500 transition-all duration-150 ease-out"
          :style="{ width: `${readingProgress}%` }"
        />
      </div>
    </Teleport>

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
      <div
        v-else-if="currentArticle"
        class="flex gap-8 max-w-6xl mx-auto"
      >
        <!-- Main Content -->
        <article class="flex-1 min-w-0 max-w-4xl">
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

            <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
              {{ currentArticle.title }}
            </h1>

            <!-- Summary -->
            <p
              v-if="currentArticle.summary"
              class="text-base sm:text-lg text-gray-600 dark:text-gray-400 mb-4 leading-relaxed"
            >
              {{ currentArticle.summary }}
            </p>

            <div class="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
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
              <span
                v-if="estimatedReadTime"
                class="flex items-center gap-1"
              >
                <UIcon
                  name="i-lucide-clock"
                  class="w-4 h-4"
                />
                约 {{ estimatedReadTime }} 分钟
              </span>
            </div>
          </header>

          <!-- Markdown Content -->
          <div class="prose prose-gray dark:prose-invert max-w-none">
            <ClientOnly>
              <MdPreview
                v-if="currentArticle.content"
                :id="previewId"
                :model-value="currentArticle.content"
                :theme="previewTheme"
                language="zh-CN"
                class="article-content"
                @on-get-catalog="handleCatalog"
              />
              <template #fallback>
                <div class="py-8 text-center text-gray-500 dark:text-gray-400">
                  <UIcon
                    name="i-lucide-loader-2"
                    class="w-6 h-6 animate-spin mx-auto mb-2"
                  />
                  加载中...
                </div>
              </template>
            </ClientOnly>
          </div>

          <!-- Footer Navigation -->
          <footer class="mt-12 pt-6 border-t border-gray-200 dark:border-gray-800">
            <div class="flex items-center justify-between flex-wrap gap-4">
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
                >
                  <span class="hidden sm:inline ml-1">分享</span>
                </UButton>
                <UButton
                  icon="i-lucide-copy"
                  color="neutral"
                  variant="ghost"
                  aria-label="复制链接"
                  @click="copyLink"
                >
                  <span class="hidden sm:inline ml-1">复制链接</span>
                </UButton>
              </div>
            </div>
          </footer>
        </article>

        <!-- Table of Contents Sidebar -->
        <aside
          v-if="catalog.length > 0"
          class="hidden lg:block w-64 flex-shrink-0"
        >
          <div class="sticky top-20">
            <h3 class="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <UIcon
                name="i-lucide-list"
                class="w-4 h-4"
              />
              目录
            </h3>
            <nav class="space-y-1 max-h-[calc(100vh-160px)] overflow-y-auto pr-2">
              <a
                v-for="item in catalog"
                :key="item.text"
                :href="`#${item.text}`"
                class="block text-sm py-1.5 transition-colors"
                :class="[
                  item.level === 1 ? 'pl-0 font-medium' : '',
                  item.level === 2 ? 'pl-3' : '',
                  item.level === 3 ? 'pl-6 text-xs' : '',
                  activeTocId === item.text
                    ? 'text-primary-600 dark:text-primary-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                ]"
                @click.prevent="scrollToHeading(item.text)"
              >
                {{ item.text }}
              </a>
            </nav>
          </div>
        </aside>
      </div>
    </div>

    <!-- Scroll to Top Button -->
    <Transition
      enter-active-class="transition-opacity duration-200"
      leave-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <UButton
        v-if="showScrollTop"
        icon="i-lucide-arrow-up"
        color="neutral"
        variant="solid"
        size="lg"
        class="fixed bottom-6 right-6 shadow-lg z-40"
        aria-label="回到顶部"
        @click="scrollToTop"
      />
    </Transition>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { MdPreview } from 'md-editor-v3'
import 'md-editor-v3/lib/preview.css'

interface CatalogItem {
  text: string
  level: number
}

const route = useRoute()
const router = useRouter()
const colorMode = useColorMode()
const { currentArticle, isLoading, error, fetchPublishedArticle, clearCurrentArticle } = useLearn()

// Get article ID from route
const articleId = computed(() => Number(route.params.id))

// Theme for MdPreview
const previewTheme = computed(() => colorMode.value === 'dark' ? 'dark' : 'light')

// Preview ID for catalog
const previewId = 'article-preview'

// Reading progress
const readingProgress = ref(0)
const showScrollTop = ref(false)

// Table of Contents
const catalog = ref<CatalogItem[]>([])
const activeTocId = ref('')

// Estimated reading time (words per minute)
const estimatedReadTime = computed(() => {
  if (!currentArticle.value?.content) return 0
  const wordCount = currentArticle.value.content.length
  // Average reading speed: ~500 Chinese characters per minute
  return Math.ceil(wordCount / 500)
})

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
      // User cancelled or share failed
    }
  }
}

/**
 * Copy link to clipboard
 */
const copyLink = async () => {
  try {
    await navigator.clipboard.writeText(window.location.href)
    alert('链接已复制到剪贴板')
  } catch {
    // Fallback
  }
}

/**
 * Handle catalog from MdPreview
 */
const handleCatalog = (list: CatalogItem[]) => {
  catalog.value = list
}

/**
 * Scroll to heading
 */
const scrollToHeading = (id: string) => {
  const element = document.getElementById(id)
  if (element) {
    const offset = 80 // Header height
    const top = element.getBoundingClientRect().top + window.scrollY - offset
    window.scrollTo({ top, behavior: 'smooth' })
  }
}

/**
 * Scroll to top
 */
const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

/**
 * Handle scroll for reading progress and active TOC
 */
const handleScroll = () => {
  const scrollTop = window.scrollY
  const docHeight = document.documentElement.scrollHeight - window.innerHeight
  readingProgress.value = docHeight > 0 ? Math.min((scrollTop / docHeight) * 100, 100) : 0
  showScrollTop.value = scrollTop > 300

  // Update active TOC item
  if (catalog.value.length > 0) {
    let currentActive = ''
    for (const item of catalog.value) {
      const element = document.getElementById(item.text)
      if (element) {
        const rect = element.getBoundingClientRect()
        if (rect.top <= 100) {
          currentActive = item.text
        }
      }
    }
    activeTocId.value = currentActive
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
  window.addEventListener('scroll', handleScroll, { passive: true })
})

// Watch for route changes
watch(() => route.params.id, () => {
  loadArticle()
  catalog.value = []
  readingProgress.value = 0
})

// Clean up on unmount
onUnmounted(() => {
  clearCurrentArticle()
  window.removeEventListener('scroll', handleScroll)
})
</script>
