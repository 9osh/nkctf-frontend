<template>
  <div class="space-y-4">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300">
        提示管理
      </h3>
      <UButton
        icon="i-lucide-plus"
        size="xs"
        variant="outline"
        @click="openAddModal"
      >
        添加提示
      </UButton>
    </div>

    <!-- Empty State -->
    <div
      v-if="hints.length === 0"
      class="text-center py-8 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg"
    >
      <UIcon
        name="i-lucide-lightbulb"
        class="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2"
      />
      <p class="text-sm text-gray-500 dark:text-gray-400">
        暂无提示，点击上方按钮添加
      </p>
    </div>

    <!-- Hint List -->
    <div
      v-else
      class="space-y-2"
    >
      <div
        v-for="(hint, index) in hints"
        :key="hint.id"
        class="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg group"
      >
        <!-- Order Number -->
        <div class="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-gray-200 dark:bg-gray-700 rounded text-xs font-medium text-gray-600 dark:text-gray-400">
          {{ index + 1 }}
        </div>

        <!-- Content -->
        <div class="flex-1 min-w-0">
          <p class="text-sm text-gray-900 dark:text-white break-words">
            {{ hint.content }}
          </p>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
            解锁积分: {{ hint.cost }}
          </p>
        </div>

        <!-- Actions -->
        <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <!-- Move Up -->
          <UButton
            v-if="index > 0"
            icon="i-lucide-chevron-up"
            color="neutral"
            variant="ghost"
            size="xs"
            aria-label="上移"
            @click="moveHint(index, index - 1)"
          />
          <!-- Move Down -->
          <UButton
            v-if="index < hints.length - 1"
            icon="i-lucide-chevron-down"
            color="neutral"
            variant="ghost"
            size="xs"
            aria-label="下移"
            @click="moveHint(index, index + 1)"
          />
          <!-- Edit -->
          <UButton
            icon="i-lucide-pencil"
            color="neutral"
            variant="ghost"
            size="xs"
            aria-label="编辑"
            @click="openEditModal(hint)"
          />
          <!-- Delete -->
          <UButton
            icon="i-lucide-trash-2"
            color="error"
            variant="ghost"
            size="xs"
            aria-label="删除"
            @click="handleDelete(hint)"
          />
        </div>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <UModal v-model:open="showModal">
      <template #content>
        <UCard :ui="{ root: 'w-full max-w-md' }">
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold">
                {{ editingHint ? '编辑提示' : '添加提示' }}
              </h3>
              <UButton
                icon="i-lucide-x"
                color="neutral"
                variant="ghost"
                size="sm"
                @click="showModal = false"
              />
            </div>
          </template>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                提示内容 <span class="text-red-500">*</span>
              </label>
              <UTextarea
                v-model="formData.content"
                placeholder="输入提示内容..."
                :rows="3"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                解锁积分 <span class="text-red-500">*</span>
              </label>
              <UInput
                v-model.number="formData.cost"
                type="number"
                min="0"
                placeholder="0"
              />
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                用户需要消耗的积分才能解锁此提示
              </p>
            </div>
          </div>

          <template #footer>
            <div class="flex justify-end gap-3">
              <UButton
                variant="outline"
                @click="showModal = false"
              >
                取消
              </UButton>
              <UButton
                color="primary"
                :loading="isSaving"
                :disabled="!formData.content.trim()"
                @click="handleSave"
              >
                {{ editingHint ? '保存' : '添加' }}
              </UButton>
            </div>
          </template>
        </UCard>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import type { AdminHint, HintFormData } from '~/composables/useChallengeAdmin'

/**
 * Props
 */
interface Props {
  challengeId: number
  hints: AdminHint[]
}

const props = defineProps<Props>()

/**
 * Emits
 */
const emit = defineEmits<{
  'update:hints': [hints: AdminHint[]]
}>()

// Composables
const {
  createHint,
  updateHint,
  deleteHint,
  reorderHints
} = useChallengeAdmin()

// State
const showModal = ref(false)
const editingHint = ref<AdminHint | null>(null)
const isSaving = ref(false)
const formData = reactive<HintFormData>({
  content: '',
  cost: 0
})

/**
 * Open add modal
 */
const openAddModal = () => {
  editingHint.value = null
  formData.content = ''
  formData.cost = 0
  showModal.value = true
}

/**
 * Open edit modal
 */
const openEditModal = (hint: AdminHint) => {
  editingHint.value = hint
  formData.content = hint.content
  formData.cost = hint.cost
  showModal.value = true
}

/**
 * Handle save (create or update)
 */
const handleSave = async () => {
  if (!formData.content.trim()) return

  isSaving.value = true

  try {
    if (editingHint.value) {
      // Update existing hint
      const updated = await updateHint(props.challengeId, editingHint.value.id, {
        content: formData.content,
        cost: formData.cost
      })

      if (updated) {
        const newHints = props.hints.map(h =>
          h.id === updated.id ? updated : h
        )
        emit('update:hints', newHints)
        showModal.value = false
      }
    } else {
      // Create new hint
      const created = await createHint(props.challengeId, {
        content: formData.content,
        cost: formData.cost
      })

      if (created) {
        emit('update:hints', [...props.hints, created])
        showModal.value = false
      }
    }
  } finally {
    isSaving.value = false
  }
}

/**
 * Handle delete
 */
const handleDelete = async (hint: AdminHint) => {
  if (!confirm('确定要删除这条提示吗？')) return

  const success = await deleteHint(props.challengeId, hint.id)
  if (success) {
    emit('update:hints', props.hints.filter(h => h.id !== hint.id))
  }
}

/**
 * Move hint (reorder)
 */
const moveHint = async (fromIndex: number, toIndex: number) => {
  const newHints = [...props.hints]
  const [moved] = newHints.splice(fromIndex, 1)
  newHints.splice(toIndex, 0, moved)

  // Optimistic update
  emit('update:hints', newHints)

  // Send reorder request to server
  const hintIds = newHints.map(h => h.id)
  const result = await reorderHints(props.challengeId, hintIds)

  if (result) {
    emit('update:hints', result)
  } else {
    // Revert on failure
    emit('update:hints', props.hints)
  }
}
</script>
