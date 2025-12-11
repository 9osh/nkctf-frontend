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
      />
    </template>

    <div class="p-6">
      <!-- Filters -->
      <div class="flex flex-wrap items-center gap-4 mb-6">
        <!-- Category Filter -->
        <USelectMenu
          v-model="selectedCategory"
          :items="categoryOptions"
          value-key="value"
          placeholder="所有分类"
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
          v-for="article in paginatedArticles"
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
            <!-- Category Badge -->
            <div class="flex items-center gap-2 mb-3">
              <div
                class="w-8 h-8 rounded-lg flex items-center justify-center"
                :class="getCategoryBgClass(article.category)"
              >
                <UIcon
                  :name="getCategoryIcon(article.category)"
                  class="w-4 h-4"
                  :class="getCategoryIconClass(article.category)"
                />
              </div>
              <UBadge
                :label="article.category"
                :color="getCategoryColor(article.category)"
                variant="subtle"
                size="xs"
              />
            </div>

            <!-- Title -->
            <h3 class="text-base font-semibold text-gray-900 dark:text-white mb-4 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-2">
              {{ article.title }}
            </h3>

            <!-- Footer -->
            <div class="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <div class="flex items-center gap-3">
                <span class="flex items-center gap-1">
                  <UIcon
                    name="i-lucide-clock"
                    class="w-4 h-4"
                  />
                  {{ article.readTime }} 分钟
                </span>
                <span class="flex items-center gap-1">
                  <UIcon
                    name="i-lucide-eye"
                    class="w-4 h-4"
                  />
                  {{ article.views }}
                </span>
              </div>
              <span>{{ article.publishedAt }}</span>
            </div>
          </UCard>
        </NuxtLink>
      </div>

      <!-- Empty State -->
      <div
        v-if="!isLoading && filteredArticles.length === 0"
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
        v-if="filteredArticles.length > 0"
        class="flex items-center justify-between mt-8"
      >
        <p class="text-sm text-gray-500 dark:text-gray-400">
          显示 {{ (currentPage - 1) * pageSize + 1 }} - {{ Math.min(currentPage * pageSize, filteredArticles.length) }} / {{ filteredArticles.length }} 篇
        </p>
        <UPagination
          v-model="currentPage"
          :total="filteredArticles.length"
          :page-count="pageSize"
        />
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
useSeoMeta({
  title: '学习指南 - NKCTF',
  description: '浏览 CTF 学习资源，从入门到进阶的安全技术文章'
})

const { articles, isLoading, fetchArticles, totalArticles } = useLearn()

// Filters
const searchQuery = ref('')
const selectedCategory = ref<string | undefined>(undefined)
const sortBy = ref('newest')

// Pagination
const currentPage = ref(1)
const pageSize = 12

// Filter options
const categoryOptions = computed(() => [
  { label: '所有分类', value: undefined },
  { label: 'Web', value: 'Web' },
  { label: 'Pwn', value: 'Pwn' },
  { label: 'Crypto', value: 'Crypto' },
  { label: 'Reverse', value: 'Reverse' },
  { label: 'Misc', value: 'Misc' },
  { label: 'Blockchain', value: 'Blockchain' }
])

const sortOptions = [
  { label: '最新发布', value: 'newest' },
  { label: '最多阅读', value: 'most-views' },
  { label: '阅读时间', value: 'read-time' }
]

// Computed
const filteredArticles = computed(() => {
  let result = [...articles.value]

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(a =>
      a.title.toLowerCase().includes(query)
    )
  }

  // Category filter
  if (selectedCategory.value) {
    result = result.filter(a => a.category === selectedCategory.value)
  }

  // Sort
  switch (sortBy.value) {
    case 'newest':
      result.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      break
    case 'most-views':
      result.sort((a, b) => b.views - a.views)
      break
    case 'read-time':
      result.sort((a, b) => a.readTime - b.readTime)
      break
  }

  return result
})

const paginatedArticles = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  const end = start + pageSize
  return filteredArticles.value.slice(start, end)
})

// Reset page when filters change
watch([searchQuery, selectedCategory, sortBy], () => {
  currentPage.value = 1
})

// Helper functions
const getCategoryIcon = (category: string) => {
  const icons: Record<string, string> = {
    Web: 'i-lucide-globe',
    Pwn: 'i-lucide-bug',
    Crypto: 'i-lucide-key',
    Reverse: 'i-lucide-cpu',
    Misc: 'i-lucide-puzzle',
    Blockchain: 'i-lucide-link'
  }
  return icons[category] || 'i-lucide-book-open'
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

// Fetch articles on mount
onMounted(() => {
  fetchArticles()
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
