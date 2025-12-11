<template>
  <div class="dashboard-layout min-h-screen flex bg-gray-50 dark:bg-gray-950">
    <!-- Sidebar -->
    <AppSidebar />

    <!-- Main Content -->
    <div class="flex-1 flex flex-col min-w-0">
      <!-- Top Header -->
      <header class="sticky top-0 z-10 flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl">
        <div class="flex items-center gap-4">
          <slot name="header-left">
            <h1 class="text-xl font-semibold text-gray-900 dark:text-white">
              {{ pageTitle }}
            </h1>
          </slot>
        </div>

        <div class="flex items-center gap-3">
          <slot name="header-right">
            <!-- Search -->
            <UInput
              placeholder="搜索..."
              icon="i-lucide-search"
              size="sm"
              class="w-64 hidden md:block"
            />
            <!-- Notifications -->
            <UButton
              icon="i-lucide-bell"
              color="neutral"
              variant="ghost"
              aria-label="通知"
            />
          </slot>
        </div>
      </header>

      <!-- Page Content -->
      <main class="flex-1">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  pageTitle?: string
}

withDefaults(defineProps<Props>(), {
  pageTitle: ''
})
</script>

<style scoped>
.dashboard-layout {
  --sidebar-width: 16rem;
  --sidebar-collapsed-width: 4rem;
}
</style>
