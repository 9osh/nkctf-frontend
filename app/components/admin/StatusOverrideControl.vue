<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-semibold">状态控制</h3>
        <UBadge v-if="hasOverride" color="orange" variant="subtle">
          <UIcon name="i-lucide-shield-alert" class="w-3 h-3 mr-1" />
          手动覆盖中
        </UBadge>
      </div>
    </template>

    <div class="space-y-4">
      <!-- Current Status Display -->
      <div class="flex items-center justify-between">
        <span class="text-[var(--ui-text-muted)]">当前状态</span>
        <UBadge :color="statusColor" size="lg">
          {{ statusLabel }}
        </UBadge>
      </div>

      <!-- Computed Status (when overridden) -->
      <div v-if="hasOverride" class="flex items-center justify-between text-sm">
        <span class="text-[var(--ui-text-muted)]">计算状态</span>
        <span class="text-[var(--ui-text-dimmed)]">
          {{ computedStatusLabel }}（基于时间）
        </span>
      </div>

      <USeparator />

      <!-- Override Actions -->
      <div class="space-y-3">
        <p class="text-sm text-[var(--ui-text-muted)]">
          手动设置状态将覆盖基于时间的自动计算。
        </p>

        <div class="flex flex-wrap gap-2">
          <UButton
            v-for="option in statusOptions"
            :key="option.value"
            :color="currentStatus === option.value ? 'primary' : 'neutral'"
            :variant="currentStatus === option.value ? 'solid' : 'outline'"
            size="sm"
            :loading="isLoading && pendingStatus === option.value"
            :disabled="isLoading"
            @click="handleSetOverride(option.value)"
          >
            <UIcon :name="option.icon" class="w-4 h-4 mr-1" />
            {{ option.label }}
          </UButton>
        </div>

        <!-- Clear Override Button -->
        <UButton
          v-if="hasOverride"
          color="neutral"
          variant="ghost"
          size="sm"
          :loading="isClearing"
          :disabled="isLoading"
          class="w-full"
          @click="handleClearOverride"
        >
          <UIcon name="i-lucide-rotate-ccw" class="w-4 h-4 mr-1" />
          清除覆盖，恢复自动计算
        </UButton>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { CompetitionStatus } from '~/composables/useCompetitionAdmin'

const props = defineProps<{
  competitionId: number
  currentStatus: CompetitionStatus
  statusOverride?: string | null
  startTime: string
  endTime: string
}>()

const emit = defineEmits<{
  (e: 'statusChanged', status: CompetitionStatus): void
}>()

const { setStatusOverride, clearStatusOverride } = useCompetitionAdmin()
const { computeStatus } = useCompetitionStatus()
const toast = useToast()

const isLoading = ref(false)
const isClearing = ref(false)
const pendingStatus = ref<CompetitionStatus | null>(null)

// Check if there's an active override
const hasOverride = computed(() => !!props.statusOverride)

// Status options for buttons
const statusOptions: { value: CompetitionStatus; label: string; icon: string }[] = [
  { value: 'inactive', label: '暂停', icon: 'i-lucide-pause' },
  { value: 'active', label: '进行中', icon: 'i-lucide-play' },
  { value: 'ending', label: '已结束', icon: 'i-lucide-square' }
]

// Current status display
const statusLabel = computed(() => {
  const labels: Record<CompetitionStatus, string> = {
    inactive: '未开始',
    active: '进行中',
    ending: '已结束'
  }
  return labels[props.currentStatus]
})

const statusColor = computed(() => {
  const colors: Record<CompetitionStatus, 'warning' | 'success' | 'neutral'> = {
    inactive: 'warning',
    active: 'success',
    ending: 'neutral'
  }
  return colors[props.currentStatus]
})

// Computed status (what it would be without override)
const computedStatusLabel = computed(() => {
  const computed = computeStatus(props.startTime, props.endTime)
  const labels: Record<CompetitionStatus, string> = {
    inactive: '未开始',
    active: '进行中',
    ending: '已结束'
  }
  return labels[computed]
})

// Handle setting override
async function handleSetOverride(status: CompetitionStatus) {
  if (status === props.currentStatus && hasOverride.value) {
    return // Already at this status with override
  }

  isLoading.value = true
  pendingStatus.value = status

  try {
    const success = await setStatusOverride(props.competitionId, status)

    if (success) {
      toast.add({
        title: '状态已更新',
        description: `竞赛状态已设置为 ${statusOptions.find(o => o.value === status)?.label}`,
        color: 'green'
      })
      emit('statusChanged', status)
    } else {
      toast.add({
        title: '操作失败',
        description: '设置状态覆盖失败，请重试',
        color: 'red'
      })
    }
  } finally {
    isLoading.value = false
    pendingStatus.value = null
  }
}

// Handle clearing override
async function handleClearOverride() {
  isClearing.value = true

  try {
    const success = await clearStatusOverride(props.competitionId)

    if (success) {
      const computedStatus = computeStatus(props.startTime, props.endTime)
      toast.add({
        title: '覆盖已清除',
        description: `状态已恢复为自动计算（${computedStatusLabel.value}）`,
        color: 'green'
      })
      emit('statusChanged', computedStatus as CompetitionStatus)
    } else {
      toast.add({
        title: '操作失败',
        description: '清除状态覆盖失败，请重试',
        color: 'red'
      })
    }
  } finally {
    isClearing.value = false
  }
}
</script>
