<template>
  <NuxtLayout name="dashboard">
    <template #header-left>
      <div class="flex items-center gap-3">
        <UIcon
          name="i-lucide-book-open"
          class="w-6 h-6 text-primary-500"
        />
        <h1 class="text-xl font-semibold text-gray-900 dark:text-white">
          学习指南
        </h1>
        <UBadge
          :label="`${totalArticles} 篇`"
          color="primary"
          variant="subtle"
        />
      </div>
    </template>

    <template #header-right>
      <UInput
        v-model="searchQuery"
        placeholder="搜索文章..."
        icon="i-lucide-search"
        size="sm"
        class="w-64 hidden md:block"
        @keyup.enter="handleSearch"
      />
    </template>

    <div class="p-6">
      <!-- Filters -->
      <div class="flex flex-wrap items-center gap-4 mb-6">
        <!-- Tag Filter -->
        <USelectMenu
          v-model="selectedTagId"
          :items="tagOptions"
          value-key="value"
          placeholder="所有标签"
          class="w-40"
          @update:model-value="handleFilterChange"
        />

        <!-- Sort -->
        <USelectMenu
          v-model="sortBy"
          :items="sortOptions"
          value-key="value"
          class="w-40 ml-auto"
          @update:model-value="handleFilterChange"
        />
      </div>

      <!-- Loading State -->
      <div
        v-if="isLoading"
        class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
      >
        <div
          v-for="i in 6"
          :key="i"
        >
          <UCard
            :ui="{
              root: 'h-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800',
              body: 'p-5'
            }"
          >
            <USkeleton class="h-5 w-16 mb-3" />
            <USkeleton class="h-6 w-full mb-4" />
            <div class="flex items-center justify-between">
              <USkeleton class="h-4 w-24" />
              <USkeleton class="h-4 w-20" />
            </div>
          </UCard>
        </div>
      </div>

      <!-- Article Grid -->
      <div
        v-else
        class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
      >
        <NuxtLink
          v-for="article in articles"
          :key="article.id"
          :to="`/learn/${article.id}`"
          class="article-card group"
        >
          <UCard
            :ui="{
              root: 'h-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-primary-400 dark:hover:border-primary-600 transition-all duration-200 cursor-pointer',
              body: 'p-5'
            }"
          >
            <!-- Tags -->
            <div class="flex items-center gap-2 mb-3 flex-wrap">
              <UBadge
                v-for="tag in article.tags.slice(0, 2)"
                :key="tag.id"
                :label="tag.name"
                :style="{ backgroundColor: tag.color + '20', color: tag.color }"
                variant="subtle"
                size="xs"
              />
              <UBadge
                v-if="article.tags.length > 2"
                :label="`+${article.tags.length - 2}`"
                color="neutral"
                variant="subtle"
                size="xs"
              />
            </div>

            <!-- Title -->
            <h3 class="text-base font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-2">
              {{ article.title }}
            </h3>

            <!-- Summary -->
            <p
              v-if="article.summary"
              class="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2"
            >
              {{ article.summary }}
            </p>

            <!-- Footer -->
            <div class="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <div class="flex items-center gap-3">
                <span class="flex items-center gap-1">
                  <UIcon
                    name="i-lucide-user"
                    class="w-4 h-4"
                  />
                  {{ article.author.nickname }}
                </span>
                <span class="flex items-center gap-1">
                  <UIcon
                    name="i-lucide-eye"
                    class="w-4 h-4"
                  />
                  {{ article.viewCount }}
                </span>
              </div>
              <span>{{ formatDate(article.publishTime) }}</span>
            </div>
          </UCard>
        </NuxtLink>
      </div>

      <!-- Empty State -->
      <div
        v-if="!isLoading && articles.length === 0"
        class="flex flex-col items-center justify-center py-16"
      >
        <UIcon
          name="i-lucide-book-x"
          class="w-16 h-16 text-gray-300 dark:text-gray-700 mb-4"
        />
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
          没有找到文章
        </h3>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          尝试调整筛选条件或搜索关键词
        </p>
      </div>

      <!-- Pagination -->
      <div
        v-if="articles.length > 0"
        class="flex items-center justify-between mt-8"
      >
        <p class="text-sm text-gray-500 dark:text-gray-400">
          显示 {{ (pagination.page - 1) * pagination.size + 1 }} - {{ Math.min(pagination.page * pagination.size, pagination.total) }} / {{ pagination.total }} 篇
        </p>
        <UPagination
          v-model:page="currentPage"
          :total="pagination.total"
          :page-count="pagination.size"
          @update:page="handlePageChange"
        />
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import type { Tag } from '~/composables/useLearn'

useSeoMeta({
  title: '学习指南 - NKCTF',
  description: '浏览 CTF 学习资源，从入门到进阶的安全技术文章'
})

const {
  articles,
  tags,
  pagination,
  isLoading,
  fetchTags,
  fetchPublishedArticles,
  totalArticles
} = useLearn()

// Filters
const searchQuery = ref('')
const selectedTagId = ref<number | undefined>(undefined)
const sortBy = ref<'newest' | 'most_views'>('newest')

// Pagination
const currentPage = ref(1)

// Tag options computed from fetched tags
const tagOptions = computed(() => {
  const options: Array<{ label: string, value: number | undefined }> = [
    { label: '所有标签', value: undefined }
  ]
  tags.value.forEach((tag: Tag) => {
    options.push({
      label: `${tag.name} (${tag.articleCount || 0})`,
      value: tag.id
    })
  })
  return options
})

const sortOptions = [
  { label: '最新发布', value: 'newest' as const },
  { label: '最多阅读', value: 'most_views' as const }
]

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
 * Load articles with current filters
 */
const loadArticles = async () => {
  await fetchPublishedArticles({
    tagId: selectedTagId.value,
    keyword: searchQuery.value || undefined,
    sortBy: sortBy.value,
    page: currentPage.value
  })
}

/**
 * Handle search input
 */
const handleSearch = () => {
  currentPage.value = 1
  loadArticles()
}

/**
 * Handle filter change
 */
const handleFilterChange = () => {
  currentPage.value = 1
  loadArticles()
}

/**
 * Handle page change
 */
const handlePageChange = (page: number) => {
  currentPage.value = page
  loadArticles()
}

// Fetch tags and articles on mount
onMounted(async () => {
  await fetchTags()
  await loadArticles()
})
</script>

<style scoped>
.article-card {
  transition: transform 0.2s ease;
}

.article-card:hover {
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
