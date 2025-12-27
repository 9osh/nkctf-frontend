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
          icon="i-lucide-plus"
          @click="router.push('/admin/articles/write')"
        >
          写新文章
        </UButton>
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
              <textarea
                v-model="reviewComment"
                placeholder="请输入审核意见..."
                rows="3"
                class="w-full min-h-[80px] max-h-[200px] text-sm bg-transparent border border-gray-300 dark:border-gray-600 rounded-lg placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-white px-3 py-2 resize-y transition-colors focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
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
          :ui="{ root: 'w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col', body: 'flex-1 overflow-y-auto p-0 min-h-0' }"
        >
          <template #header>
            <div class="flex items-center justify-between gap-4">
              <!-- Navigation & Title -->
              <div class="flex items-center gap-3 min-w-0 flex-1">
                <!-- Previous Article -->
                <UButton
                  icon="i-lucide-chevron-left"
                  color="neutral"
                  variant="ghost"
                  size="sm"
                  :disabled="!hasPreviousArticle"
                  aria-label="上一篇"
                  @click="navigateArticle(-1)"
                />

                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 mb-1 flex-wrap">
                    <UBadge
                      :label="getStatusLabel(selectedArticle.status)"
                      :color="getStatusColor(selectedArticle.status)"
                      variant="subtle"
                    />
                    <UBadge
                      v-for="tag in selectedArticle.tags"
                      :key="tag.id"
                      :label="tag.name"
                      :style="{ backgroundColor: tag.color + '20', color: tag.color }"
                      variant="subtle"
                      size="xs"
                    />
                    <span class="text-xs text-gray-400">
                      {{ currentArticleIndex + 1 }} / {{ adminArticles.length }}
                    </span>
                  </div>
                  <h3 class="text-lg sm:text-xl font-bold text-gray-900 dark:text-white line-clamp-1">
                    {{ selectedArticle.title }}
                  </h3>
                </div>

                <!-- Next Article -->
                <UButton
                  icon="i-lucide-chevron-right"
                  color="neutral"
                  variant="ghost"
                  size="sm"
                  :disabled="!hasNextArticle"
                  aria-label="下一篇"
                  @click="navigateArticle(1)"
                />
              </div>

              <!-- Close -->
              <UButton
                icon="i-lucide-x"
                color="neutral"
                variant="ghost"
                size="sm"
                class="flex-shrink-0"
                @click="showPreviewModal = false"
              />
            </div>
          </template>

            <!-- Article Metadata Panel -->
            <div class="px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
              <div class="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
                <span class="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                  <UIcon
                    name="i-lucide-user"
                    class="w-4 h-4"
                  />
                  <span class="font-medium">{{ selectedArticle.author.nickname }}</span>
                </span>
                <span class="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                  <UIcon
                    name="i-lucide-calendar-plus"
                    class="w-4 h-4"
                  />
                  创建: {{ formatDateTime(selectedArticle.createTime) }}
                </span>
                <span
                  v-if="selectedArticle.updateTime !== selectedArticle.createTime"
                  class="flex items-center gap-1.5 text-gray-600 dark:text-gray-400"
                >
                  <UIcon
                    name="i-lucide-calendar-check"
                    class="w-4 h-4"
                  />
                  更新: {{ formatDateTime(selectedArticle.updateTime) }}
                </span>
                <span
                  v-if="selectedArticle.publishTime"
                  class="flex items-center gap-1.5 text-green-600 dark:text-green-400"
                >
                  <UIcon
                    name="i-lucide-globe"
                    class="w-4 h-4"
                  />
                  发布: {{ formatDateTime(selectedArticle.publishTime) }}
                </span>
                <span
                  v-if="selectedArticle.viewCount"
                  class="flex items-center gap-1.5 text-gray-600 dark:text-gray-400"
                >
                  <UIcon
                    name="i-lucide-eye"
                    class="w-4 h-4"
                  />
                  {{ selectedArticle.viewCount }} 次阅读
                </span>
              </div>

              <!-- Summary -->
              <p
                v-if="previewSummary"
                class="mt-3 text-sm text-gray-600 dark:text-gray-400 italic border-l-2 border-gray-300 dark:border-gray-600 pl-3"
              >
                {{ previewSummary }}
              </p>
            </div>

            <!-- Review History (for rejected articles) -->
            <div
              v-if="selectedArticle.status === 'REJECTED' && selectedArticle.reviewComment"
              class="px-4 py-3 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800"
            >
              <div class="flex items-start gap-3">
                <UIcon
                  name="i-lucide-message-circle-x"
                  class="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5"
                />
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 mb-1">
                    <span class="text-sm font-medium text-red-700 dark:text-red-300">
                      审核未通过
                    </span>
                    <span
                      v-if="selectedArticle.reviewer"
                      class="text-xs text-red-600 dark:text-red-400"
                    >
                      by {{ selectedArticle.reviewer.nickname }}
                    </span>
                    <span
                      v-if="selectedArticle.reviewTime"
                      class="text-xs text-red-500 dark:text-red-400"
                    >
                      {{ formatDateTime(selectedArticle.reviewTime) }}
                    </span>
                  </div>
                  <p class="text-sm text-red-600 dark:text-red-300">
                    {{ selectedArticle.reviewComment }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Quick Review Panel (for pending articles) -->
            <div
              v-if="selectedArticle.status === 'PENDING'"
              class="px-4 py-3 bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800"
            >
              <div class="flex flex-col sm:flex-row sm:items-center gap-3">
                <div class="flex items-center gap-2 flex-shrink-0">
                  <UIcon
                    name="i-lucide-clock"
                    class="w-5 h-5 text-yellow-600"
                  />
                  <span class="text-sm font-medium text-yellow-700 dark:text-yellow-300">
                    待审核
                  </span>
                </div>
                <div class="flex-1 min-w-0">
                  <input
                    v-model="previewReviewComment"
                    type="text"
                    placeholder="输入审核意见（拒绝时必填）..."
                    class="w-full text-sm bg-white dark:bg-gray-800 border border-yellow-300 dark:border-yellow-700 rounded-lg placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-white px-3 py-1.5 transition-colors focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20"
                  >
                </div>
                <div class="flex items-center gap-2 flex-shrink-0">
                  <UButton
                    icon="i-lucide-x"
                    color="error"
                    size="sm"
                    :loading="isReviewingFromPreview"
                    @click="handlePreviewReview(false)"
                  >
                    拒绝
                  </UButton>
                  <UButton
                    icon="i-lucide-check"
                    color="success"
                    size="sm"
                    :loading="isReviewingFromPreview"
                    @click="handlePreviewReview(true)"
                  >
                    通过
                  </UButton>
                </div>
              </div>
            </div>

            <!-- Markdown Content -->
            <div class="p-4 min-h-0">
              <ClientOnly>
                <MdPreview
                  v-if="previewContent"
                  :model-value="previewContent"
                  :theme="previewTheme"
                  language="zh-CN"
                  class="article-preview-content"
                />
                <template #fallback>
                  <div class="text-center py-8 text-gray-500 dark:text-gray-400">
                    <UIcon
                      name="i-lucide-loader-2"
                      class="w-6 h-6 animate-spin mx-auto mb-2"
                    />
                    加载中...
                  </div>
                </template>
              </ClientOnly>
              <div
                v-if="!previewContent && !isLoadingPreview"
                class="text-center py-8 text-gray-500 dark:text-gray-400"
              >
                <UIcon
                  name="i-lucide-file-x"
                  class="w-8 h-8 mx-auto mb-2"
                />
                暂无内容
              </div>
              <div
                v-if="isLoadingPreview"
                class="text-center py-8 text-gray-500 dark:text-gray-400"
              >
                <UIcon
                  name="i-lucide-loader-2"
                  class="w-6 h-6 animate-spin mx-auto mb-2"
                />
                加载中...
              </div>
            </div>

          <!-- Footer Actions -->
          <template #footer>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <UButton
                  v-if="selectedArticle.status === 'PUBLISHED'"
                  icon="i-lucide-external-link"
                  variant="outline"
                  size="sm"
                  @click="viewPublishedArticle"
                >
                  查看已发布
                </UButton>
                <UButton
                  icon="i-lucide-trash-2"
                  color="error"
                  variant="ghost"
                  size="sm"
                  @click="handleDeleteFromPreview"
                >
                  删除文章
                </UButton>
              </div>
              <div class="text-xs text-gray-400">
                按 ← → 切换文章 | ESC 关闭
              </div>
            </div>
          </template>
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
const previewSummary = ref('')
const previewReviewComment = ref('')
const isReviewingFromPreview = ref(false)
const isLoadingPreview = ref(false)

// Status options
const statusOptions = [
  { label: '所有状态', value: undefined },
  { label: '草稿', value: 'DRAFT' as ArticleStatus },
  { label: '待审核', value: 'PENDING' as ArticleStatus },
  { label: '已发布', value: 'PUBLISHED' as ArticleStatus },
  { label: '已拒绝', value: 'REJECTED' as ArticleStatus }
]

// Computed: current article index in list
const currentArticleIndex = computed(() => {
  if (!selectedArticle.value) return -1
  return adminArticles.value.findIndex(a => a.id === selectedArticle.value!.id)
})

// Computed: navigation availability
const hasPreviousArticle = computed(() => currentArticleIndex.value > 0)
const hasNextArticle = computed(() => currentArticleIndex.value < adminArticles.value.length - 1)

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
 * Format date time string with time
 */
const formatDateTime = (dateStr: string | null | undefined): string => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
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
  previewSummary.value = ''
  previewReviewComment.value = ''
  isLoadingPreview.value = true
  showPreviewModal.value = true

  // Fetch full article content
  const detail = await fetchArticleDetail(article.id)
  if (detail) {
    previewContent.value = detail.content || ''
    previewSummary.value = detail.summary || ''
    // Update selected article with full details
    selectedArticle.value = detail
  }
  isLoadingPreview.value = false
}

/**
 * Navigate to previous/next article in preview
 */
const navigateArticle = async (direction: number) => {
  const newIndex = currentArticleIndex.value + direction
  if (newIndex >= 0 && newIndex < adminArticles.value.length) {
    const article = adminArticles.value[newIndex]
    if (article) {
      await openPreviewModal(article)
    }
  }
}

/**
 * Handle review from preview modal
 */
const handlePreviewReview = async (approved: boolean) => {
  if (!selectedArticle.value) return

  // Require comment for rejection
  if (!approved && !previewReviewComment.value.trim()) {
    alert('请输入拒绝原因')
    return
  }

  isReviewingFromPreview.value = true

  const success = await reviewArticle({
    articleId: selectedArticle.value.id,
    approved,
    comment: previewReviewComment.value || undefined
  })

  isReviewingFromPreview.value = false

  if (success) {
    // Update local article status
    if (selectedArticle.value) {
      selectedArticle.value.status = approved ? 'PUBLISHED' : 'REJECTED'
      if (!approved) {
        selectedArticle.value.reviewComment = previewReviewComment.value
      }
    }
    previewReviewComment.value = ''
    await loadArticles()

    // Navigate to next pending article or close if no more
    if (hasNextArticle.value) {
      await navigateArticle(1)
    }
  }
}

/**
 * View published article in new tab
 */
const viewPublishedArticle = () => {
  if (selectedArticle.value) {
    window.open(`/learn/${selectedArticle.value.id}`, '_blank')
  }
}

/**
 * Handle delete from preview modal
 */
const handleDeleteFromPreview = async () => {
  if (!selectedArticle.value) return

  if (!confirm('确定要删除这篇文章吗？此操作不可恢复。')) {
    return
  }

  const success = await deleteArticle(selectedArticle.value.id)
  if (success) {
    showPreviewModal.value = false
    await loadArticles()
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

/**
 * Handle keyboard navigation in preview modal
 */
const handleKeydown = (event: KeyboardEvent) => {
  if (!showPreviewModal.value) return

  switch (event.key) {
    case 'ArrowLeft':
      if (hasPreviousArticle.value) {
        navigateArticle(-1)
      }
      break
    case 'ArrowRight':
      if (hasNextArticle.value) {
        navigateArticle(1)
      }
      break
    case 'Escape':
      showPreviewModal.value = false
      break
  }
}

// Initialize
onMounted(() => {
  loadArticles()
  // Add keyboard event listener
  window.addEventListener('keydown', handleKeydown)
})

// Cleanup
onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<style>
/* Override md-editor-v3 preview styles for transparent background */
.article-preview-content {
  background-color: transparent !important;
}

.article-preview-content .md-editor-preview-wrapper {
  background-color: transparent !important;
}

.article-preview-content .md-editor-preview {
  background-color: transparent !important;
}

/* Dark mode overrides */
.dark .article-preview-content,
.dark .article-preview-content .md-editor-preview-wrapper,
.dark .article-preview-content .md-editor-preview {
  background-color: transparent !important;
}
</style>
