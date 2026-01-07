<template>
  <Transition name="fade">
    <div
      v-if="showIndicator"
      class="fixed bottom-4 right-4 z-50"
    >
      <div
        class="flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg"
        :class="statusClasses"
      >
        <UIcon
          :name="statusIcon"
          class="w-4 h-4"
          :class="{ 'animate-spin': isReconnecting }"
        />
        <span class="text-sm font-medium">{{ statusText }}</span>
        <UButton
          v-if="shouldUseFallback"
          size="xs"
          variant="ghost"
          icon="i-lucide-x"
          aria-label="关闭"
          @click="dismiss"
        />
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
/**
 * Connection Status Indicator
 * Shows WebSocket connection status and fallback mode
 */

const { isConnected, reconnectAttempts, shouldUseFallback } = useWebSocket()

const isDismissed = ref(false)

// Show indicator when disconnected or in fallback mode
const showIndicator = computed(() => {
  if (isDismissed.value) return false
  // Show when disconnected and reconnecting, or in fallback mode
  return (!isConnected.value && reconnectAttempts.value > 0) || shouldUseFallback.value
})

// Check if currently trying to reconnect
const isReconnecting = computed(() => {
  return !isConnected.value && reconnectAttempts.value > 0 && !shouldUseFallback.value
})

// Status icon
const statusIcon = computed(() => {
  if (shouldUseFallback.value) {
    return 'i-lucide-wifi-off'
  }
  if (isReconnecting.value) {
    return 'i-lucide-loader-2'
  }
  return 'i-lucide-wifi'
})

// Status text
const statusText = computed(() => {
  if (shouldUseFallback.value) {
    return '离线模式 - 使用轮询更新'
  }
  if (isReconnecting.value) {
    return `正在重连 (${reconnectAttempts.value}/10)...`
  }
  return '已连接'
})

// CSS classes for the indicator
const statusClasses = computed(() => {
  if (shouldUseFallback.value) {
    return 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
  }
  if (isReconnecting.value) {
    return 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
  }
  return 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800'
})

// Dismiss the indicator (only for fallback mode)
function dismiss() {
  isDismissed.value = true
}

// Reset dismissed state when connection is restored
watch(isConnected, (connected) => {
  if (connected) {
    isDismissed.value = false
  }
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
