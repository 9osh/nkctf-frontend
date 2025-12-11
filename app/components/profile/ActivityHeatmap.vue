<template>
  <div class="activity-heatmap relative">
    <!-- Header -->
    <div class="flex items-center justify-between mb-3">
      <div class="flex items-center gap-2">
        <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
          {{ totalActiveDays }} 天活跃
        </span>
        <span class="text-xs text-gray-500 dark:text-gray-400">
          / {{ displayData.length }} 天
        </span>
      </div>
      <div class="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
        <span>少</span>
        <div
          v-for="level in 5"
          :key="level"
          class="w-2.5 h-2.5 rounded-sm border"
          :class="getLevelClass(level - 1)"
        />
        <span>多</span>
      </div>
    </div>

    <!-- Scrollable Container -->
    <div class="heatmap-scroll overflow-x-auto pb-2">
      <div class="inline-block min-w-fit">
        <!-- Month Labels -->
        <div class="flex mb-1" :style="{ marginLeft: `${dayLabelWidth}px` }">
          <div
            v-for="(month, index) in monthLabels"
            :key="index"
            class="text-[10px] text-gray-500 dark:text-gray-400"
            :style="{ width: `${month.weeks * cellSize}px` }"
          >
            {{ month.name }}
          </div>
        </div>

        <!-- Heatmap Grid -->
        <div class="flex">
          <!-- Day Labels -->
          <div
            class="flex flex-col text-[10px] text-gray-500 dark:text-gray-400 pr-1"
            :style="{ width: `${dayLabelWidth}px`, height: `${7 * cellSize - gap}px` }"
          >
            <span class="flex-1 flex items-center">一</span>
            <span class="flex-1 flex items-center">三</span>
            <span class="flex-1 flex items-center">五</span>
            <span class="flex-1 flex items-center">日</span>
          </div>

          <!-- Calendar Grid -->
          <div class="flex" :style="{ gap: `${gap}px` }">
            <div
              v-for="(week, weekIndex) in weeks"
              :key="weekIndex"
              class="flex flex-col"
              :style="{ gap: `${gap}px` }"
            >
              <div
                v-for="(day, dayIndex) in week"
                :key="dayIndex"
                class="rounded-sm transition-all duration-150 border"
                :style="{ width: `${cellSize - gap}px`, height: `${cellSize - gap}px` }"
                :class="[
                  day ? getLevelClass(getActivityLevel(day.count)) : 'bg-transparent border-transparent',
                  day ? 'cursor-pointer hover:scale-110 hover:z-10 relative' : ''
                ]"
                @mouseenter="day && showTooltip(day, $event)"
                @mouseleave="hideTooltip"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Tooltip -->
    <Teleport to="body">
      <Transition name="tooltip">
        <div
          v-if="tooltipVisible && tooltipData"
          class="fixed z-50 px-3 py-2 text-sm bg-gray-900 text-white rounded-lg shadow-2xl pointer-events-none border border-gray-600"
          :style="tooltipStyle"
        >
          <div class="font-semibold text-white">
            {{ formatDate(tooltipData.date) }}
          </div>
          <div class="flex items-center gap-1.5 mt-1">
            <span
              class="w-2.5 h-2.5 rounded-sm border border-white/20"
              :class="getLevelBgClass(getActivityLevel(tooltipData.count))"
            />
            <span class="text-emerald-400 font-medium">{{ tooltipData.count }}</span>
            <span class="text-white/90">次提交</span>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Stats Summary -->
    <div class="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
      <div class="flex items-center gap-1 text-xs">
        <span class="text-gray-500 dark:text-gray-400">总提交:</span>
        <span class="font-medium text-gray-700 dark:text-gray-300">{{ totalSubmissions }}</span>
      </div>
      <div class="flex items-center gap-1 text-xs">
        <span class="text-gray-500 dark:text-gray-400">最长连续:</span>
        <span class="font-medium text-gray-700 dark:text-gray-300">{{ longestStreak }} 天</span>
      </div>
      <div class="flex items-center gap-1 text-xs">
        <span class="text-gray-500 dark:text-gray-400">当前连续:</span>
        <span class="font-medium text-emerald-600 dark:text-emerald-400">{{ currentStreak }} 天</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ActivityData } from '~/composables/useUser'

interface Props {
  data: ActivityData[]
  /** Number of days to display (default: 180 = ~6 months) */
  days?: number
  /** Cell size in pixels (default: 11) */
  cellSize?: number
}

const props = withDefaults(defineProps<Props>(), {
  days: 180,
  cellSize: 11
})

const gap = 2
const dayLabelWidth = 20

// Limit data to display range
const displayData = computed(() => {
  if (props.data.length <= props.days) {
    return props.data
  }
  return props.data.slice(-props.days)
})

// Tooltip state
const tooltipVisible = ref(false)
const tooltipData = ref<ActivityData | null>(null)
const tooltipPosition = ref({ x: 0, y: 0 })

const tooltipStyle = computed(() => ({
  left: `${tooltipPosition.value.x}px`,
  top: `${tooltipPosition.value.y}px`,
  transform: 'translate(-50%, -100%) translateY(-6px)'
}))

// Tooltip methods
const showTooltip = (day: ActivityData, event: MouseEvent) => {
  tooltipData.value = day
  const rect = (event.target as Element).getBoundingClientRect()
  tooltipPosition.value = {
    x: rect.left + rect.width / 2,
    y: rect.top
  }
  tooltipVisible.value = true
}

const hideTooltip = () => {
  tooltipVisible.value = false
}

// Format date for display
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  const month = date.getMonth() + 1
  const day = date.getDate()
  const weekDay = weekDays[date.getDay()]
  return `${month}月${day}日 ${weekDay}`
}

// Calculate total active days
const totalActiveDays = computed(() => {
  return displayData.value.filter(d => d.count > 0).length
})

// Calculate total submissions
const totalSubmissions = computed(() => {
  return displayData.value.reduce((sum, d) => sum + d.count, 0)
})

// Calculate longest streak
const longestStreak = computed(() => {
  let maxStreak = 0
  let streak = 0

  for (const day of displayData.value) {
    if (day.count > 0) {
      streak++
      maxStreak = Math.max(maxStreak, streak)
    }
    else {
      streak = 0
    }
  }

  return maxStreak
})

// Calculate current streak (from today backwards)
const currentStreak = computed(() => {
  let streak = 0
  const reversedData = [...displayData.value].reverse()

  for (const day of reversedData) {
    if (day.count > 0) {
      streak++
    }
    else {
      break
    }
  }

  return streak
})

// Group data by weeks (7 days per column)
const weeks = computed(() => {
  const result: (ActivityData | null)[][] = []
  let currentWeek: (ActivityData | null)[] = []

  if (displayData.value.length > 0) {
    const firstDate = new Date(displayData.value[0].date)
    const firstDayOfWeek = firstDate.getDay()
    const adjustedFirstDay = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1

    for (let i = 0; i < adjustedFirstDay; i++) {
      currentWeek.push(null)
    }
  }

  for (const day of displayData.value) {
    currentWeek.push(day)

    if (currentWeek.length === 7) {
      result.push(currentWeek)
      currentWeek = []
    }
  }

  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push(null)
    }
    result.push(currentWeek)
  }

  return result
})

// Generate month labels
const monthLabels = computed(() => {
  const months: { name: string, weeks: number }[] = []
  const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']

  let currentMonth = -1
  let weekCount = 0

  for (const week of weeks.value) {
    const firstValidDay = week.find(d => d !== null)

    if (firstValidDay) {
      const date = new Date(firstValidDay.date)
      const month = date.getMonth()

      if (month !== currentMonth) {
        if (currentMonth !== -1) {
          months.push({ name: monthNames[currentMonth], weeks: weekCount })
        }
        currentMonth = month
        weekCount = 1
      }
      else {
        weekCount++
      }
    }
  }

  if (currentMonth !== -1) {
    months.push({ name: monthNames[currentMonth], weeks: weekCount })
  }

  return months
})

// Get activity level (0-4) based on count
const getActivityLevel = (count: number): number => {
  if (count === 0) return 0
  if (count === 1) return 1
  if (count <= 2) return 2
  if (count <= 4) return 3
  return 4
}

// Get CSS class for activity level (with border)
const getLevelClass = (level: number): string => {
  const classes = [
    'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700',
    'bg-emerald-200 dark:bg-emerald-900/80 border-emerald-300 dark:border-emerald-800',
    'bg-emerald-400 dark:bg-emerald-700 border-emerald-500 dark:border-emerald-600',
    'bg-emerald-500 dark:bg-emerald-600 border-emerald-600 dark:border-emerald-500',
    'bg-emerald-600 dark:bg-emerald-500 border-emerald-700 dark:border-emerald-400'
  ]
  return classes[level] || classes[0]
}

// Get background class only (for tooltip indicator)
const getLevelBgClass = (level: number): string => {
  const classes = [
    'bg-gray-100 dark:bg-gray-800',
    'bg-emerald-200 dark:bg-emerald-900',
    'bg-emerald-400 dark:bg-emerald-700',
    'bg-emerald-500 dark:bg-emerald-600',
    'bg-emerald-600 dark:bg-emerald-500'
  ]
  return classes[level] || classes[0]
}
</script>

<style scoped>
.heatmap-scroll {
  scrollbar-width: thin;
  scrollbar-color: #d1d5db transparent;
}

.heatmap-scroll::-webkit-scrollbar {
  height: 4px;
}

.heatmap-scroll::-webkit-scrollbar-track {
  background: transparent;
}

.heatmap-scroll::-webkit-scrollbar-thumb {
  background-color: #d1d5db;
  border-radius: 2px;
}

.dark .heatmap-scroll {
  scrollbar-color: #4b5563 transparent;
}

.dark .heatmap-scroll::-webkit-scrollbar-thumb {
  background-color: #4b5563;
}

/* Tooltip transition */
.tooltip-enter-active,
.tooltip-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.tooltip-enter-from,
.tooltip-leave-to {
  opacity: 0;
  transform: translate(-50%, -100%) translateY(-2px);
}
</style>
