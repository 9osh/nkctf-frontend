<template>
  <NuxtLayout name="dashboard">
    <template #header-left>
      <div class="flex items-center gap-3">
        <UIcon
          name="i-lucide-file-check"
          class="w-6 h-6 text-primary-500"
        />
        <h1 class="text-xl font-semibold text-gray-900 dark:text-white">
          文章管理
        </h1>
        <UBadge
          :label="`${adminPagination.total} 篇`"
          color="primary"
          variant="subtle"
        />
      </div>
    </template>

    <template #header-right>
      <div class="flex items-center gap-3">
        <UButton
          icon="i-lucide-tags"
          variant="outline"
          @click="router.push('/admin/articles/tags')"
        >
          标签管理
        </UButton>
      </div>
    </template>

    <div class="p-6">
      <!-- Filters -->
      <div class="flex flex-wrap items-center gap-4 mb-6">
        <!-- Status Filter -->
        <USelectMenu
          v-model="selectedStatus"
          :items="statusOptions"
          value-key="value"
          placeholder="所有状态"
          class="w-40"
          @update:model-value="handleFilterChange"
        />

        <!-- Search -->
        <UInput
          v-model="searchQuery"
          placeholder="搜索文章..."
          icon="i-lucide-search"
          size="sm"
          class="w-64"
          @keyup.enter="handleSearch"
        />
      </div>

      <!-- Loading State -->
      <div
        v-if="isLoading"
        class="space-y-4"
      >
        <div
          v-for="i in 5"
          :key="i"
        >
          <UCard
            :ui="{
              root: 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800',
              body: 'p-5'
            }"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <USkeleton class="h-5 w-2/3 mb-3" />
                <USkeleton class="h-4 w-1/3 mb-2" />
                <USkeleton class="h-4 w-1/4" />
              </div>
              <USkeleton class="h-8 w-24" />
            </div>
          </UCard>
        </div>
      </div>

      <!-- Article List -->
      <div
        v-else
        class="space-y-4"
      >
        <UCard
          v-for="article in adminArticles"
          :key="article.id"
          :ui="{
            root: 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800',
            body: 'p-5'
          }"
        >
          <div class="flex items-start justify-between gap-4">
            <!-- Article Info -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-2 flex-wrap">
                <!-- Status Badge -->
                <UBadge
                  :label="getStatusLabel(article.status)"
                  :color="getStatusColor(article.status)"
                  variant="subtle"
                  size="xs"
                />
                <!-- Tags -->
                <UBadge
                  v-for="tag in article.tags.slice(0, 2)"
                  :key="tag.id"
                  :label="tag.name"
                  :style="{ backgroundColor: tag.color + '20', color: tag.color }"
                  variant="subtle"
                  size="xs"
                />
              </div>

              <h3 class="text-base font-semibold text-gray-900 dark:text-white mb-2 truncate">
                {{ article.title }}
              </h3>

              <div class="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                <span class="flex items-center gap-1">
                  <UIcon
                    name="i-lucide-user"
                    class="w-3.5 h-3.5"
                  />
                  {{ article.author.nickname }}
                </span>
                <span class="flex items-center gap-1">
                  <UIcon
                    name="i-lucide-calendar"
                    class="w-3.5 h-3.5"
                  />
                  {{ formatDate(article.createTime) }}
                </span>
                <span
                  v-if="article.status === 'PUBLISHED'"
                  class="flex items-center gap-1"
                >
                  <UIcon
                    name="i-lucide-eye"
                    class="w-3.5 h-3.5"
                  />
                  {{ article.viewCount }}
                </span>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex items-center gap-2 flex-shrink-0">
              <!-- View -->
              <UButton
                icon="i-lucide-eye"
                color="neutral"
                variant="ghost"
                size="sm"
                aria-label="查看"
                @click="openPreviewModal(article)"
              />

              <!-- Review (for pending) -->
              <UButton
                v-if="article.status === 'PENDING'"
                icon="i-lucide-check-circle"
                variant="outline"
                size="sm"
                @click="openReviewModal(article)"
              >
                审核
              </UButton>

              <!-- Delete -->
              <UButton
                icon="i-lucide-trash-2"
                color="error"
                variant="ghost"
                size="sm"
                aria-label="删除"
                @click="handleDelete(article.id)"
              />
            </div>
          </div>
        </UCard>
      </div>

      <!-- Empty State -->
      <div
        v-if="!isLoading && adminArticles.length === 0"
        class="flex flex-col items-center justify-center py-16"
      >
        <UIcon
          name="i-lucide-file-x"
          class="w-16 h-16 text-gray-300 dark:text-gray-700 mb-4"
        />
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
          没有找到文章
        </h3>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          尝试调整筛选条件
        </p>
      </div>

      <!-- Pagination -->
      <div
        v-if="adminArticles.length > 0"
        class="flex items-center justify-between mt-8"
      >
        <p class="text-sm text-gray-500 dark:text-gray-400">
          显示 {{ (adminPagination.page - 1) * adminPagination.size + 1 }} - {{ Math.min(adminPagination.page * adminPagination.size, adminPagination.total) }} / {{ adminPagination.total }} 篇
        </p>
        <UPagination
          v-model:page="currentPage"
          :total="adminPagination.total"
          :page-count="adminPagination.size"
          @update:page="handlePageChange"
        />
      </div>
    </div>

    <!-- Review Modal -->
    <UModal v-model:open="showReviewModal">
      <template #content>
        <UCard
          v-if="selectedArticle"
          :ui="{ root: 'w-full max-w-lg' }"
        >
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold">
                审核文章
              </h3>
              <UButton
                icon="i-lucide-x"
                color="neutral"
                variant="ghost"
                size="sm"
                @click="showReviewModal = false"
              />
            </div>
          </template>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                文章标题
              </label>
              <p class="text-gray-900 dark:text-white font-medium">
                {{ selectedArticle.title }}
              </p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                作者
              </label>
              <p class="text-gray-600 dark:text-gray-400">
                {{ selectedArticle.author.nickname }}
              </p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                审核意见（拒绝时必填）
              </label>
              <UTextarea
                v-model="reviewComment"
                placeholder="请输入审核意见..."
                :rows="3"
              />
            </div>
          </div>

          <template #footer>
            <div class="flex justify-end gap-3">
              <UButton
                variant="outline"
                @click="showReviewModal = false"
              >
                取消
              </UButton>
              <UButton
                color="error"
                :loading="isReviewing"
                @click="handleReview(false)"
              >
                拒绝
              </UButton>
              <UButton
                color="success"
                :loading="isReviewing"
                @click="handleReview(true)"
              >
                通过
              </UButton>
            </div>
          </template>
        </UCard>
      </template>
    </UModal>

    <!-- Preview Modal -->
    <UModal v-model:open="showPreviewModal">
      <template #content>
        <UCard
          v-if="selectedArticle"
          :ui="{ root: 'w-full max-w-3xl max-h-[80vh] overflow-auto' }"
        >
          <template #header>
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-lg font-semibold">
                  {{ selectedArticle.title }}
                </h3>
                <div class="flex items-center gap-2 mt-1">
                  <UBadge
                    :label="getStatusLabel(selectedArticle.status)"
                    :color="getStatusColor(selectedArticle.status)"
                    variant="subtle"
                    size="xs"
                  />
                  <span class="text-xs text-gray-500 dark:text-gray-400">
                    {{ selectedArticle.author.nickname }}
                  </span>
                </div>
              </div>
              <UButton
                icon="i-lucide-x"
                color="neutral"
                variant="ghost"
                size="sm"
                @click="showPreviewModal = false"
              />
            </div>
          </template>

          <ClientOnly>
            <MdPreview
              v-if="previewContent"
              :model-value="previewContent"
              :theme="previewTheme"
              language="zh-CN"
            />
            <template #fallback>
              <div class="text-center py-8 text-gray-500 dark:text-gray-400">
                加载中...
              </div>
            </template>
          </ClientOnly>
          <div
            v-if="!previewContent"
            class="text-center py-8 text-gray-500 dark:text-gray-400"
          >
            加载中...
          </div>
        </UCard>
      </template>
    </UModal>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { MdPreview } from 'md-editor-v3'
import 'md-editor-v3/lib/preview.css'
import type { Article, ArticleStatus } from '~/composables/useLearn'

// Use admin middleware for route protection
definePageMeta({
  middleware: 'admin'
})

const router = useRouter()
const colorMode = useColorMode()

useSeoMeta({
  title: '文章管理 - NKCTF Admin',
  description: '管理学习指南文章'
})

// Composables
const {
  adminArticles,
  adminPagination,
  isLoading,
  fetchAllArticles,
  fetchArticleDetail,
  reviewArticle,
  deleteArticle
} = useArticleAdmin()

// Editor theme for MdPreview
const previewTheme = computed(() => colorMode.value === 'dark' ? 'dark' : 'light')

// State
const selectedStatus = ref<ArticleStatus | undefined>(undefined)
const searchQuery = ref('')
const currentPage = ref(1)

// Modal state
const showReviewModal = ref(false)
const showPreviewModal = ref(false)
const selectedArticle = ref<Article | null>(null)
const reviewComment = ref('')
const isReviewing = ref(false)
const previewContent = ref('')

// Status options
const statusOptions = [
  { label: '所有状态', value: undefined },
  { label: '草稿', value: 'DRAFT' as ArticleStatus },
  { label: '待审核', value: 'PENDING' as ArticleStatus },
  { label: '已发布', value: 'PUBLISHED' as ArticleStatus },
  { label: '已拒绝', value: 'REJECTED' as ArticleStatus }
]

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
 * Format date string
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
 * Load articles
 */
const loadArticles = async () => {
  await fetchAllArticles({
    status: selectedStatus.value,
    keyword: searchQuery.value || undefined,
    page: currentPage.value
  })
}

/**
 * Handle filter change
 */
const handleFilterChange = () => {
  currentPage.value = 1
  loadArticles()
}

/**
 * Handle search
 */
const handleSearch = () => {
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

/**
 * Open review modal
 */
const openReviewModal = (article: Article) => {
  selectedArticle.value = article
  reviewComment.value = ''
  showReviewModal.value = true
}

/**
 * Open preview modal
 */
const openPreviewModal = async (article: Article) => {
  selectedArticle.value = article
  previewContent.value = ''
  showPreviewModal.value = true

  // Fetch full article content
  const detail = await fetchArticleDetail(article.id)
  if (detail?.content) {
    previewContent.value = detail.content
  }
}

/**
 * Handle review (approve/reject)
 */
const handleReview = async (approved: boolean) => {
  if (!selectedArticle.value) return

  // Require comment for rejection
  if (!approved && !reviewComment.value.trim()) {
    alert('请输入拒绝原因')
    return
  }

  isReviewing.value = true

  const success = await reviewArticle({
    articleId: selectedArticle.value.id,
    approved,
    comment: reviewComment.value || undefined
  })

  isReviewing.value = false

  if (success) {
    showReviewModal.value = false
    await loadArticles()
  }
}

/**
 * Handle delete
 */
const handleDelete = async (articleId: number) => {
  if (!confirm('确定要删除这篇文章吗？此操作不可恢复。')) {
    return
  }

  const success = await deleteArticle(articleId)
  if (success) {
    await loadArticles()
  }
}

// Initialize
onMounted(() => {
  loadArticles()
})
</script>
