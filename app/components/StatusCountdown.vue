<template>
  <div class="flex items-center gap-2 text-sm">
    <template v-if="countdown">
      <UIcon :name="iconName" class="w-4 h-4" />
      <span class="text-[var(--ui-text-muted)]">{{ countdown.label }}:</span>
      <span class="font-mono font-semibold" :class="urgencyClass">
        {{ formattedTime }}
      </span>
    </template>
    <template v-else-if="props.contest.status === 'active'">
      <UIcon name="i-lucide-clock" class="w-4 h-4 text-green-500" />
      <span class="text-[var(--ui-text-muted)]">比赛进行中</span>
    </template>
    <template v-else-if="props.contest.status === 'inactive'">
      <UIcon name="i-lucide-timer" class="w-4 h-4 text-amber-500" />
      <span class="text-[var(--ui-text-muted)]">即将开始</span>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { Contest } from '~/composables/useContests'

const props = defineProps<{
  contest: Contest
}>()

const { getTimeToNextTransition } = useCompetitionStatus()

// Reactive countdown state
const countdown = ref<{ label: string; milliseconds: number } | null>(null)
const formattedTime = ref('')

// Update countdown every second
let intervalId: ReturnType<typeof setInterval> | null = null

const updateCountdown = () => {
  countdown.value = getTimeToNextTransition(props.contest)

  if (countdown.value) {
    formattedTime.value = formatDuration(countdown.value.milliseconds)
  }
}

const formatDuration = (ms: number): string => {
  if (ms <= 0) return '00:00:00'

  const totalSeconds = Math.floor(ms / 1000)
  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  const pad = (n: number) => n.toString().padStart(2, '0')

  if (days > 0) {
    return `${days}d ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
  }
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
}

// Icon based on status
const iconName = computed(() => {
  if (props.contest.status === 'inactive') {
    return 'i-lucide-timer'
  }
  return 'i-lucide-clock'
})

// Urgency styling based on remaining time
const urgencyClass = computed(() => {
  if (!countdown.value) return ''

  const ms = countdown.value.milliseconds
  const minutes = ms / 60000

  if (minutes <= 5) {
    return 'text-red-500 animate-pulse'
  }
  if (minutes <= 30) {
    return 'text-orange-500'
  }
  if (minutes <= 60) {
    return 'text-yellow-500'
  }
  return 'text-[var(--ui-text-highlighted)]'
})

onMounted(() => {
  updateCountdown()
  intervalId = setInterval(updateCountdown, 1000)
})

onUnmounted(() => {
  if (intervalId) {
    clearInterval(intervalId)
  }
})

// Re-calculate when contest changes
watch(() => props.contest, updateCountdown, { deep: true })
</script>
