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
          @click="router.push('/admin/articles')"
        />
        <UIcon
          name="i-lucide-tags"
          class="w-6 h-6 text-primary-500"
        />
        <h1 class="text-xl font-semibold text-gray-900 dark:text-white">
          标签管理
        </h1>
        <UBadge
          :label="`${tags.length} 个`"
          color="primary"
          variant="subtle"
        />
      </div>
    </template>

    <template #header-right>
      <UButton
        icon="i-lucide-plus"
        @click="openCreateModal"
      >
        创建标签
      </UButton>
    </template>

    <div class="p-6">
      <!-- Loading State -->
      <div
        v-if="isLoadingTags"
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        <div
          v-for="i in 6"
          :key="i"
        >
          <UCard
            :ui="{
              root: 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800',
              body: 'p-4'
            }"
          >
            <div class="flex items-center justify-between">
              <USkeleton class="h-6 w-24" />
              <USkeleton class="h-6 w-16" />
            </div>
          </UCard>
        </div>
      </div>

      <!-- Tag Grid -->
      <div
        v-else
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        <UCard
          v-for="tag in tags"
          :key="tag.id"
          :ui="{
            root: 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-primary-400 dark:hover:border-primary-600 transition-colors',
            body: 'p-4'
          }"
        >
          <div class="flex items-start justify-between gap-4">
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-2">
                <div
                  class="w-4 h-4 rounded-full flex-shrink-0"
                  :style="{ backgroundColor: tag.color }"
                />
                <span class="font-semibold text-gray-900 dark:text-white truncate">
                  {{ tag.name }}
                </span>
              </div>
              <p
                v-if="tag.description"
                class="text-sm text-gray-500 dark:text-gray-400 mb-2 line-clamp-1"
              >
                {{ tag.description }}
              </p>
              <div class="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <span class="flex items-center gap-1">
                  <UIcon
                    name="i-lucide-file-text"
                    class="w-3.5 h-3.5"
                  />
                  {{ tag.articleCount || 0 }} 篇文章
                </span>
              </div>
            </div>

            <div class="flex items-center gap-1 flex-shrink-0">
              <UButton
                icon="i-lucide-edit-3"
                color="neutral"
                variant="ghost"
                size="xs"
                aria-label="编辑"
                @click="openEditModal(tag)"
              />
              <UButton
                icon="i-lucide-trash-2"
                color="error"
                variant="ghost"
                size="xs"
                aria-label="删除"
                :disabled="(tag.articleCount || 0) > 0"
                @click="handleDelete(tag)"
              />
            </div>
          </div>
        </UCard>
      </div>

      <!-- Empty State -->
      <div
        v-if="!isLoadingTags && tags.length === 0"
        class="flex flex-col items-center justify-center py-16"
      >
        <UIcon
          name="i-lucide-tag"
          class="w-16 h-16 text-gray-300 dark:text-gray-700 mb-4"
        />
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
          还没有标签
        </h3>
        <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">
          创建标签以便对文章进行分类
        </p>
        <UButton
          icon="i-lucide-plus"
          @click="openCreateModal"
        >
          创建第一个标签
        </UButton>
      </div>
    </div>

    <!-- Create/Edit Tag Modal -->
    <UModal v-model:open="showTagModal">
      <template #content>
        <UCard :ui="{ root: 'w-full max-w-md' }">
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold">
                {{ editingTag ? '编辑标签' : '创建标签' }}
              </h3>
              <UButton
                icon="i-lucide-x"
                color="neutral"
                variant="ghost"
                size="sm"
                @click="showTagModal = false"
              />
            </div>
          </template>

          <form
            class="space-y-4"
            @submit.prevent="handleSubmit"
          >
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                标签名称 *
              </label>
              <UInput
                v-model="formData.name"
                placeholder="请输入标签名称"
                required
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                描述
              </label>
              <UTextarea
                v-model="formData.description"
                placeholder="请输入标签描述（可选）"
                :rows="2"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                颜色
              </label>
              <div class="flex items-center gap-2 flex-wrap">
                <button
                  v-for="color in presetColors"
                  :key="color"
                  type="button"
                  class="w-8 h-8 rounded-full border-2 transition-all"
                  :class="formData.color === color ? 'border-primary-500 scale-110' : 'border-transparent hover:scale-105'"
                  :style="{ backgroundColor: color }"
                  @click="formData.color = color"
                />
                <input
                  v-model="formData.color"
                  type="color"
                  class="w-8 h-8 rounded-full cursor-pointer border-0"
                  title="自定义颜色"
                >
              </div>
              <div class="mt-2 flex items-center gap-2">
                <span class="text-sm text-gray-500 dark:text-gray-400">预览:</span>
                <UBadge
                  :label="formData.name || '标签预览'"
                  :style="{ backgroundColor: formData.color + '20', color: formData.color }"
                  variant="subtle"
                />
              </div>
            </div>
          </form>

          <template #footer>
            <div class="flex justify-end gap-3">
              <UButton
                variant="outline"
                @click="showTagModal = false"
              >
                取消
              </UButton>
              <UButton
                :loading="isSaving"
                @click="handleSubmit"
              >
                {{ editingTag ? '保存' : '创建' }}
              </UButton>
            </div>
          </template>
        </UCard>
      </template>
    </UModal>
  </NuxtLayout>
</template>

<script setup lang="ts">
import type { Tag } from '~/composables/useLearn'

// Use admin middleware for route protection
definePageMeta({
  middleware: 'admin'
})

const router = useRouter()

useSeoMeta({
  title: '标签管理 - NKCTF Admin',
  description: '管理学习指南文章标签'
})

// Composables
const { tags, fetchTags } = useLearn()
const { createTag, updateTag, deleteTag } = useArticleAdmin()

// State
const isLoadingTags = ref(true)
const showTagModal = ref(false)
const editingTag = ref<Tag | null>(null)
const isSaving = ref(false)

// Form data
const formData = reactive({
  name: '',
  description: '',
  color: '#3B82F6'
})

// Preset colors
const presetColors = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Yellow
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#F97316' // Orange
]

/**
 * Reset form
 */
const resetForm = () => {
  formData.name = ''
  formData.description = ''
  formData.color = '#3B82F6'
  editingTag.value = null
}

/**
 * Open create modal
 */
const openCreateModal = () => {
  resetForm()
  showTagModal.value = true
}

/**
 * Open edit modal
 */
const openEditModal = (tag: Tag) => {
  editingTag.value = tag
  formData.name = tag.name
  formData.description = tag.description || ''
  formData.color = tag.color
  showTagModal.value = true
}

/**
 * Handle form submit
 */
const handleSubmit = async () => {
  if (!formData.name.trim()) {
    alert('请输入标签名称')
    return
  }

  isSaving.value = true

  try {
    if (editingTag.value) {
      // Update
      const result = await updateTag({
        id: editingTag.value.id,
        name: formData.name,
        description: formData.description || undefined,
        color: formData.color
      })

      if (result) {
        // Update local state
        const index = tags.value.findIndex(t => t.id === editingTag.value!.id)
        if (index !== -1) {
          tags.value[index] = result
        }
        showTagModal.value = false
      }
    } else {
      // Create
      const result = await createTag({
        name: formData.name,
        description: formData.description || undefined,
        color: formData.color
      })

      if (result) {
        tags.value.push(result)
        showTagModal.value = false
      }
    }
  } finally {
    isSaving.value = false
  }
}

/**
 * Handle delete
 */
const handleDelete = async (tag: Tag) => {
  if ((tag.articleCount || 0) > 0) {
    alert('无法删除有关联文章的标签')
    return
  }

  if (!confirm(`确定要删除标签 "${tag.name}" 吗？`)) {
    return
  }

  const success = await deleteTag(tag.id)
  if (success) {
    tags.value = tags.value.filter(t => t.id !== tag.id)
  }
}

// Initialize
onMounted(async () => {
  await fetchTags()
  isLoadingTags.value = false
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
