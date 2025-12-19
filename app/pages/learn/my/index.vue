<template>
  <NuxtLayout name="dashboard">
    <template #header-left>
      <div class="flex items-center gap-3">
        <UIcon
          name="i-lucide-file-text"
          class="w-6 h-6 text-primary-500"
        />
        <h1 class="text-xl font-semibold text-gray-900 dark:text-white">
          我的文章
        </h1>
        <UBadge
          :label="`${totalArticles} 篇`"
          color="primary"
          variant="subtle"
        />
      </div>
    </template>

    <template #header-right>
      <UButton
        icon="i-lucide-plus"
        @click="router.push('/learn/write')"
      >
        写新文章
      </UButton>
    </template>

    <div class="p-6">
      <!-- Status Tabs -->
      <div class="flex items-center gap-2 mb-6 flex-wrap">
        <UButton
          v-for="tab in statusTabs"
          :key="tab.value"
          :variant="currentStatus === tab.value ? 'solid' : 'ghost'"
          :color="currentStatus === tab.value ? 'primary' : 'neutral'"
          size="sm"
          @click="handleStatusChange(tab.value)"
        >
          {{ tab.label }}
          <UBadge
            v-if="tab.count > 0"
            :label="String(tab.count)"
            :color="currentStatus === tab.value ? 'neutral' : 'primary'"
            variant="subtle"
            size="xs"
            class="ml-1"
          />
        </UButton>
      </div>

      <!-- Loading State -->
      <div
        v-if="isLoading"
        class="space-y-4"
      >
        <div
          v-for="i in 3"
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
          v-for="article in articles"
          :key="article.id"
          :ui="{
            root: 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-primary-400 dark:hover:border-primary-600 transition-colors',
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

              <p
                v-if="article.summary"
                class="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-1"
              >
                {{ article.summary }}
              </p>

              <!-- Review Comment (if rejected) -->
              <div
                v-if="article.status === 'REJECTED' && article.reviewComment"
                class="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm p-3 rounded-lg mb-3"
              >
                <div class="flex items-start gap-2">
                  <UIcon
                    name="i-lucide-alert-circle"
                    class="w-4 h-4 mt-0.5 flex-shrink-0"
                  />
                  <div>
                    <span class="font-medium">审核意见：</span>
                    {{ article.reviewComment }}
                  </div>
                </div>
              </div>

              <div class="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                <span class="flex items-center gap-1">
                  <UIcon
                    name="i-lucide-calendar"
                    class="w-3.5 h-3.5"
                  />
                  创建: {{ formatDate(article.createTime) }}
                </span>
                <span
                  v-if="article.updateTime !== article.createTime"
                  class="flex items-center gap-1"
                >
                  <UIcon
                    name="i-lucide-edit"
                    class="w-3.5 h-3.5"
                  />
                  更新: {{ formatDate(article.updateTime) }}
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
              <!-- View published article (external link) -->
              <UButton
                v-if="article.status === 'PUBLISHED'"
                icon="i-lucide-external-link"
                color="neutral"
                variant="ghost"
                size="sm"
                aria-label="查看已发布"
                @click="router.push(`/learn/${article.id}`)"
              />

              <!-- Preview (for pending - read only) -->
              <UButton
                v-if="article.status === 'PENDING'"
                icon="i-lucide-eye"
                color="neutral"
                variant="ghost"
                size="sm"
                aria-label="预览"
                @click="openPreviewModal(article)"
              />

              <!-- Edit (for draft/rejected) -->
              <UButton
                v-if="canEdit(article)"
                icon="i-lucide-edit-3"
                color="neutral"
                variant="ghost"
                size="sm"
                aria-label="编辑"
                @click="router.push(`/learn/edit/${article.id}`)"
              />

              <!-- Submit for review (for draft) -->
              <UButton
                v-if="canSubmit(article)"
                icon="i-lucide-send"
                variant="outline"
                size="sm"
                :loading="submittingId === article.id"
                @click="handleSubmitForReview(article.id)"
              >
                提交审核
              </UButton>

              <!-- Delete (for draft) -->
              <UButton
                v-if="canDelete(article)"
                icon="i-lucide-trash-2"
                color="error"
                variant="ghost"
                size="sm"
                aria-label="删除"
                :loading="deletingId === article.id"
                @click="handleDelete(article.id)"
              />
            </div>
          </div>
        </UCard>
      </div>

      <!-- Empty State -->
      <div
        v-if="!isLoading && articles.length === 0"
        class="flex flex-col items-center justify-center py-16"
      >
        <UIcon
          name="i-lucide-file-x"
          class="w-16 h-16 text-gray-300 dark:text-gray-700 mb-4"
        />
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
          {{ getEmptyMessage() }}
        </h3>
        <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">
          {{ getEmptyDescription() }}
        </p>
        <UButton
          v-if="currentStatus === undefined"
          icon="i-lucide-plus"
          @click="router.push('/learn/write')"
        >
          写第一篇文章
        </UButton>
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

    <!-- Preview Modal -->
    <UModal v-model:open="showPreviewModal">
      <template #content>
        <UCard
          v-if="previewArticle"
          :ui="{ root: 'w-full max-w-3xl max-h-[80vh] overflow-auto' }"
        >
          <template #header>
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-lg font-semibold">
                  {{ previewArticle.title }}
                </h3>
                <div class="flex items-center gap-2 mt-1">
                  <UBadge
                    :label="getStatusLabel(previewArticle.status)"
                    :color="getStatusColor(previewArticle.status)"
                    variant="subtle"
                    size="xs"
                  />
                  <span class="text-xs text-gray-500 dark:text-gray-400">
                    {{ formatDate(previewArticle.createTime) }}
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

// Use auth middleware for route protection
definePageMeta({
  middleware: 'auth'
})

const router = useRouter()

// Permission composable for fine-grained checks
const { canEditArticle, canDeleteArticle, canSubmitForReview } = usePermission()
const { storedUser, isLoggedIn } = useUser()
const colorMode = useColorMode()

useSeoMeta({
  title: '我的文章 - NKCTF',
  description: '管理我的学习指南文章'
})

const {
  articles,
  pagination,
  isLoading,
  fetchMyArticles,
  fetchMyArticle,
  submitForReview,
  deleteArticle,
  totalArticles
} = useLearn()

// Editor theme for MdPreview
const previewTheme = computed(() => colorMode.value === 'dark' ? 'dark' : 'light')

// State
const currentStatus = ref<ArticleStatus | undefined>(undefined)
const currentPage = ref(1)
const submittingId = ref<number | null>(null)
const deletingId = ref<number | null>(null)

// Preview modal state
const showPreviewModal = ref(false)
const previewArticle = ref<Article | null>(null)
const previewContent = ref('')

// Status tabs
const statusTabs = computed(() => [
  { label: '全部', value: undefined as ArticleStatus | undefined, count: 0 },
  { label: '草稿', value: 'DRAFT' as ArticleStatus, count: 0 },
  { label: '待审核', value: 'PENDING' as ArticleStatus, count: 0 },
  { label: '已发布', value: 'PUBLISHED' as ArticleStatus, count: 0 },
  { label: '已拒绝', value: 'REJECTED' as ArticleStatus, count: 0 }
])

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
 * Check if article can be edited using permission composable
 */
const canEdit = (article: Article): boolean => {
  if (!storedUser.value) return false
  return canEditArticle(article.status, article.author.id)
}

/**
 * Check if article can be deleted using permission composable
 */
const canDelete = (article: Article): boolean => {
  if (!storedUser.value) return false
  return canDeleteArticle(article.status, article.author.id)
}

/**
 * Check if article can be submitted for review
 */
const canSubmit = (article: Article): boolean => {
  if (!storedUser.value) return false
  return canSubmitForReview(article.status, article.author.id)
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
 * Get empty state message
 */
const getEmptyMessage = (): string => {
  if (currentStatus.value === 'DRAFT') return '没有草稿'
  if (currentStatus.value === 'PENDING') return '没有待审核的文章'
  if (currentStatus.value === 'PUBLISHED') return '没有已发布的文章'
  if (currentStatus.value === 'REJECTED') return '没有被拒绝的文章'
  return '还没有文章'
}

/**
 * Get empty state description
 */
const getEmptyDescription = (): string => {
  if (currentStatus.value === 'DRAFT') return '开始写一篇新文章吧'
  if (currentStatus.value === 'PENDING') return '提交草稿后将在这里显示'
  if (currentStatus.value === 'PUBLISHED') return '文章审核通过后将在这里显示'
  if (currentStatus.value === 'REJECTED') return '审核未通过的文章将在这里显示'
  return '点击按钮创建你的第一篇文章'
}

/**
 * Load articles
 */
const loadArticles = async () => {
  await fetchMyArticles({
    status: currentStatus.value,
    page: currentPage.value
  })
}

/**
 * Handle status tab change
 */
const handleStatusChange = (status: ArticleStatus | undefined) => {
  currentStatus.value = status
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
 * Open preview modal
 */
const openPreviewModal = async (article: Article) => {
  previewArticle.value = article
  previewContent.value = ''
  showPreviewModal.value = true

  // Fetch full article content
  const detail = await fetchMyArticle(article.id)
  if (detail?.content) {
    previewContent.value = detail.content
  }
}

/**
 * Handle submit for review
 */
const handleSubmitForReview = async (articleId: number) => {
  submittingId.value = articleId
  const success = await submitForReview(articleId)
  submittingId.value = null

  if (success) {
    // Refresh list
    await loadArticles()
  }
}

/**
 * Handle delete
 */
const handleDelete = async (articleId: number) => {
  // Confirm delete
  if (!confirm('确定要删除这篇文章吗？此操作不可恢复。')) {
    return
  }

  deletingId.value = articleId
  const success = await deleteArticle(articleId)
  deletingId.value = null

  if (success) {
    // Refresh list
    await loadArticles()
  }
}

// Fetch articles on mount
onMounted(() => {
  if (isLoggedIn.value) {
    loadArticles()
  }
})
</script>

<style scoped>
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
