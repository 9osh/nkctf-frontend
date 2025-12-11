<template>
  <div class="solve-radar-chart flex flex-col items-center">
    <div class="relative">
      <svg
        :width="size"
        :height="size"
        :viewBox="`0 0 ${size} ${size}`"
      >
        <!-- Background circles -->
        <g :transform="`translate(${center}, ${center})`">
          <polygon
            v-for="level in 5"
            :key="`bg-${level}`"
            :points="getPolygonPoints(level / 5)"
            fill="none"
            :stroke="gridColor"
            stroke-width="1"
          />

          <!-- Axis lines -->
          <line
            v-for="(_, index) in categories"
            :key="`axis-${index}`"
            x1="0"
            y1="0"
            :x2="getAxisPoint(index).x"
            :y2="getAxisPoint(index).y"
            :stroke="gridColor"
            stroke-width="1"
          />

          <!-- Data polygon -->
          <polygon
            :points="dataPoints"
            :fill="dataFillColor"
            :stroke="dataStrokeColor"
            stroke-width="2"
          />

          <!-- Hover areas (invisible, larger hit targets) -->
          <circle
            v-for="(point, index) in dataPointsArray"
            :key="`hover-${index}`"
            :cx="point.x"
            :cy="point.y"
            r="16"
            fill="transparent"
            class="cursor-pointer"
            @mouseenter="showTooltip(index, $event)"
            @mouseleave="hideTooltip"
          />

          <!-- Data points -->
          <circle
            v-for="(point, index) in dataPointsArray"
            :key="`point-${index}`"
            :cx="point.x"
            :cy="point.y"
            r="4"
            :fill="dataStrokeColor"
            class="pointer-events-none"
          />
        </g>

        <!-- Labels -->
        <text
          v-for="(category, index) in categories"
          :key="`label-${index}`"
          :x="getLabelPosition(index).x"
          :y="getLabelPosition(index).y"
          :text-anchor="getLabelAnchor(index)"
          :fill="labelColor"
          font-size="12"
          dominant-baseline="middle"
          class="cursor-pointer"
          @mouseenter="showTooltip(index, $event)"
          @mouseleave="hideTooltip"
        >
          {{ category.label }}
        </text>
      </svg>

      <!-- Tooltip -->
      <div
        v-if="tooltipVisible"
        class="absolute z-10 px-3 py-2 text-sm bg-gray-800 dark:bg-gray-700 text-white rounded-lg shadow-lg pointer-events-none whitespace-nowrap border border-gray-700 dark:border-gray-600"
        :style="tooltipStyle"
      >
        <div class="font-medium">
          {{ tooltipData?.label }}
        </div>
        <div class="text-gray-200">
          已解决: {{ tooltipData?.solved }} / {{ tooltipData?.total }}
        </div>
      </div>
    </div>

    <!-- Legend -->
    <div class="flex flex-wrap justify-center gap-4 mt-4">
      <div
        v-for="category in categories"
        :key="category.key"
        class="flex items-center gap-2 text-sm cursor-pointer hover:opacity-80 transition-opacity"
        @mouseenter="showTooltipByKey(category.key, $event)"
        @mouseleave="hideTooltip"
      >
        <div
          class="w-3 h-3 rounded-full"
          :class="getCategoryColorClass(category.key)"
        />
        <span class="text-gray-600 dark:text-gray-400">
          {{ category.label }}: {{ category.value }}/{{ category.total }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SolveStats } from '~/composables/useUser'

/**
 * Total challenge counts per category
 * TODO: This should come from the backend API
 */
interface TotalStats {
  web: number
  pwn: number
  crypto: number
  reverse: number
  misc: number
  blockchain: number
}

interface Props {
  stats: SolveStats
  /** Total challenges per category */
  totalStats?: TotalStats
  size?: number
}

const props = withDefaults(defineProps<Props>(), {
  size: 280,
  totalStats: () => ({
    web: 20,
    pwn: 15,
    crypto: 12,
    reverse: 10,
    misc: 8,
    blockchain: 5
  })
})

const center = computed(() => props.size / 2)
const radius = computed(() => props.size * 0.35)

// Color mode detection
const colorMode = useColorMode()
const isDark = computed(() => colorMode.value === 'dark')

// SVG colors based on color mode
const gridColor = computed(() => isDark.value ? '#374151' : '#e5e7eb')
const labelColor = computed(() => isDark.value ? '#9ca3af' : '#4b5563')
const dataStrokeColor = computed(() => '#22c55e')
const dataFillColor = computed(() => 'rgba(34, 197, 94, 0.2)')

// Tooltip state
const tooltipVisible = ref(false)
const tooltipData = ref<{ label: string, solved: number, total: number } | null>(null)
const tooltipPosition = ref({ x: 0, y: 0 })

const tooltipStyle = computed(() => ({
  left: `${tooltipPosition.value.x}px`,
  top: `${tooltipPosition.value.y}px`,
  transform: 'translate(-50%, -100%) translateY(-8px)'
}))

// Category definitions
const categories = computed(() => {
  const maxValue = Math.max(
    props.totalStats.web,
    props.totalStats.pwn,
    props.totalStats.crypto,
    props.totalStats.reverse,
    props.totalStats.misc,
    props.totalStats.blockchain,
    10
  )

  return [
    { key: 'web', label: 'Web', value: props.stats.web, total: props.totalStats.web, normalized: props.stats.web / maxValue },
    { key: 'pwn', label: 'Pwn', value: props.stats.pwn, total: props.totalStats.pwn, normalized: props.stats.pwn / maxValue },
    { key: 'crypto', label: 'Crypto', value: props.stats.crypto, total: props.totalStats.crypto, normalized: props.stats.crypto / maxValue },
    { key: 'reverse', label: 'Reverse', value: props.stats.reverse, total: props.totalStats.reverse, normalized: props.stats.reverse / maxValue },
    { key: 'misc', label: 'Misc', value: props.stats.misc, total: props.totalStats.misc, normalized: props.stats.misc / maxValue },
    { key: 'blockchain', label: 'Blockchain', value: props.stats.blockchain, total: props.totalStats.blockchain, normalized: props.stats.blockchain / maxValue }
  ]
})

// Tooltip methods
const showTooltip = (index: number, event: MouseEvent) => {
  const category = categories.value[index]
  tooltipData.value = {
    label: category.label,
    solved: category.value,
    total: category.total
  }

  const rect = (event.currentTarget as SVGElement).closest('svg')?.getBoundingClientRect()
  const targetRect = (event.currentTarget as Element).getBoundingClientRect()

  if (rect) {
    tooltipPosition.value = {
      x: targetRect.left - rect.left + targetRect.width / 2,
      y: targetRect.top - rect.top
    }
  }

  tooltipVisible.value = true
}

const showTooltipByKey = (key: string, event: MouseEvent) => {
  const category = categories.value.find(c => c.key === key)
  if (!category) return

  tooltipData.value = {
    label: category.label,
    solved: category.value,
    total: category.total
  }

  const container = (event.currentTarget as Element).closest('.solve-radar-chart')
  const targetRect = (event.currentTarget as Element).getBoundingClientRect()
  const containerRect = container?.getBoundingClientRect()

  if (containerRect) {
    tooltipPosition.value = {
      x: targetRect.left - containerRect.left + targetRect.width / 2,
      y: targetRect.top - containerRect.top
    }
  }

  tooltipVisible.value = true
}

const hideTooltip = () => {
  tooltipVisible.value = false
}

// Calculate angle for each axis
const getAngle = (index: number) => {
  const angleStep = (2 * Math.PI) / categories.value.length
  return angleStep * index - Math.PI / 2
}

// Get point on axis at given scale (0-1)
const getPoint = (index: number, scale: number) => {
  const angle = getAngle(index)
  return {
    x: Math.cos(angle) * radius.value * scale,
    y: Math.sin(angle) * radius.value * scale
  }
}

// Get axis endpoint
const getAxisPoint = (index: number) => getPoint(index, 1)

// Get polygon points for background circles
const getPolygonPoints = (scale: number) => {
  return categories.value
    .map((_, index) => {
      const point = getPoint(index, scale)
      return `${point.x},${point.y}`
    })
    .join(' ')
}

// Get data points as string
const dataPoints = computed(() => {
  return categories.value
    .map((cat, index) => {
      const point = getPoint(index, cat.normalized || 0.05)
      return `${point.x},${point.y}`
    })
    .join(' ')
})

// Get data points as array for circles
const dataPointsArray = computed(() => {
  return categories.value.map((cat, index) => {
    return getPoint(index, cat.normalized || 0.05)
  })
})

// Get label position (outside the chart)
const getLabelPosition = (index: number) => {
  const angle = getAngle(index)
  const labelRadius = radius.value + 25
  return {
    x: center.value + Math.cos(angle) * labelRadius,
    y: center.value + Math.sin(angle) * labelRadius
  }
}

// Get text anchor based on position
const getLabelAnchor = (index: number) => {
  const angle = getAngle(index)
  const x = Math.cos(angle)
  if (Math.abs(x) < 0.1) return 'middle'
  return x > 0 ? 'start' : 'end'
}

// Get category color class
const getCategoryColorClass = (key: string) => {
  const colors: Record<string, string> = {
    web: 'bg-blue-500',
    pwn: 'bg-red-500',
    crypto: 'bg-yellow-500',
    reverse: 'bg-purple-500',
    misc: 'bg-green-500',
    blockchain: 'bg-orange-500'
  }
  return colors[key] || 'bg-gray-500'
}
</script>

<style scoped>
.solve-radar-chart svg {
  overflow: visible;
}
</style>
