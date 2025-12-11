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
          {{ currentArticle.author }}
        </span>
        <span class="flex items-center gap-1">
          <UIcon
            name="i-lucide-clock"
            class="w-4 h-4"
          />
          {{ currentArticle.readTime }} 分钟阅读
        </span>
        <span class="flex items-center gap-1">
          <UIcon
            name="i-lucide-eye"
            class="w-4 h-4"
          />
          {{ currentArticle.views }}
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
          <div class="flex items-center gap-2 mb-4">
            <UBadge
              :label="currentArticle.category"
              :color="getCategoryColor(currentArticle.category)"
              variant="subtle"
            />
            <span class="text-sm text-gray-500 dark:text-gray-400">
              {{ currentArticle.publishedAt }}
            </span>
          </div>
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            {{ currentArticle.title }}
          </h1>
          <div class="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            <span class="flex items-center gap-1">
              <UIcon
                name="i-lucide-user"
                class="w-4 h-4"
              />
              {{ currentArticle.author }}
            </span>
            <span class="flex items-center gap-1">
              <UIcon
                name="i-lucide-clock"
                class="w-4 h-4"
              />
              {{ currentArticle.readTime }} 分钟阅读
            </span>
            <span class="flex items-center gap-1">
              <UIcon
                name="i-lucide-eye"
                class="w-4 h-4"
              />
              {{ currentArticle.views }} 次阅读
            </span>
          </div>
        </header>

        <!-- Markdown Content -->
        <div
          class="prose prose-gray dark:prose-invert max-w-none"
          v-html="renderedContent"
        />

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
const route = useRoute()
const router = useRouter()
const { currentArticle, isLoading, error, fetchArticle, fetchArticles, articles } = useLearn()
const { render } = useMarkdown()

// Get article ID from route
const articleId = computed(() => Number(route.params.id))

// Rendered markdown content
const renderedContent = computed(() => {
  if (!currentArticle.value?.content) return ''
  return render(currentArticle.value.content)
})

// Load article data
const loadArticle = async () => {
  // Ensure articles list is loaded first (for article metadata)
  if (articles.value.length === 0) {
    await fetchArticles()
  }
  await fetchArticle(articleId.value)
}

// SEO
useSeoMeta({
  title: () => currentArticle.value ? `${currentArticle.value.title} - NKCTF` : '加载中... - NKCTF',
  description: () => currentArticle.value ? `阅读 ${currentArticle.value.title}` : ''
})

// Helper functions
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

// Fetch article on mount
onMounted(() => {
  loadArticle()
})

// Watch for route changes
watch(() => route.params.id, () => {
  loadArticle()
})
</script>

<style scoped>
/* Prose styles for markdown content */
.prose {
  --tw-prose-body: var(--color-gray-700);
  --tw-prose-headings: var(--color-gray-900);
  --tw-prose-links: var(--color-primary-600);
  --tw-prose-code: var(--color-primary-600);
  --tw-prose-pre-bg: var(--color-gray-100);
  line-height: 1.75;
}

.dark .prose {
  --tw-prose-body: var(--color-gray-300);
  --tw-prose-headings: var(--color-white);
  --tw-prose-links: var(--color-primary-400);
  --tw-prose-code: var(--color-primary-400);
  --tw-prose-pre-bg: var(--color-gray-800);
}

.prose :deep(h1) {
  font-size: 2rem;
  font-weight: 700;
  margin-top: 2rem;
  margin-bottom: 1rem;
  color: var(--tw-prose-headings);
}

.prose :deep(h2) {
  font-size: 1.5rem;
  font-weight: 600;
  margin-top: 1.75rem;
  margin-bottom: 0.75rem;
  color: var(--tw-prose-headings);
  border-bottom: 1px solid var(--color-gray-200);
  padding-bottom: 0.5rem;
}

.dark .prose :deep(h2) {
  border-bottom-color: var(--color-gray-700);
}

.prose :deep(h3) {
  font-size: 1.25rem;
  font-weight: 600;
  margin-top: 1.5rem;
  margin-bottom: 0.5rem;
  color: var(--tw-prose-headings);
}

.prose :deep(p) {
  margin-top: 1rem;
  margin-bottom: 1rem;
  color: var(--tw-prose-body);
}

.prose :deep(a) {
  color: var(--tw-prose-links);
  text-decoration: underline;
  text-underline-offset: 2px;
}

.prose :deep(a:hover) {
  opacity: 0.8;
}

.prose :deep(code) {
  color: var(--tw-prose-code);
  background-color: var(--color-gray-100);
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  font-size: 0.875em;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

.dark .prose :deep(code) {
  background-color: var(--color-gray-800);
}

.prose :deep(pre) {
  background-color: var(--tw-prose-pre-bg);
  border-radius: 0.5rem;
  padding: 1rem;
  overflow-x: auto;
  margin-top: 1rem;
  margin-bottom: 1rem;
}

.prose :deep(pre code) {
  background-color: transparent;
  padding: 0;
  color: inherit;
  font-size: 0.875rem;
  line-height: 1.7;
}

.prose :deep(ul),
.prose :deep(ol) {
  margin-top: 1rem;
  margin-bottom: 1rem;
  padding-left: 1.5rem;
}

.prose :deep(li) {
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
  color: var(--tw-prose-body);
}

.prose :deep(ul) {
  list-style-type: disc;
}

.prose :deep(ol) {
  list-style-type: decimal;
}

.prose :deep(blockquote) {
  border-left: 4px solid var(--color-primary-500);
  padding-left: 1rem;
  margin-top: 1rem;
  margin-bottom: 1rem;
  font-style: italic;
  color: var(--color-gray-600);
}

.dark .prose :deep(blockquote) {
  color: var(--color-gray-400);
}

.prose :deep(hr) {
  border-color: var(--color-gray-200);
  margin-top: 2rem;
  margin-bottom: 2rem;
}

.dark .prose :deep(hr) {
  border-color: var(--color-gray-700);
}

.prose :deep(strong) {
  font-weight: 600;
  color: var(--tw-prose-headings);
}

.prose :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
  margin-bottom: 1rem;
}

.prose :deep(th),
.prose :deep(td) {
  border: 1px solid var(--color-gray-200);
  padding: 0.5rem 1rem;
  text-align: left;
}

.dark .prose :deep(th),
.dark .prose :deep(td) {
  border-color: var(--color-gray-700);
}

.prose :deep(th) {
  background-color: var(--color-gray-50);
  font-weight: 600;
}

.dark .prose :deep(th) {
  background-color: var(--color-gray-800);
}
</style>
