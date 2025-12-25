<template>
  <aside
    class="sidebar-container sticky top-0 h-screen flex flex-col border-r border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl transition-all duration-300 shrink-0"
    :class="isCollapsed ? 'w-16' : 'w-64'"
  >
    <!-- Logo Section -->
    <!-- <div class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
      <NuxtLink
        v-if="!isCollapsed"
        to="/"
        class="flex items-center gap-2"
      >
        <AppLogo />
      </NuxtLink>
      <NuxtLink
        v-else
        to="/"
        class="flex items-center justify-center w-full"
      >
        <svg
          width="32"
          height="32"
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M20 2L4 8V18C4 28.5 10.84 38.26 20 40C29.16 38.26 36 28.5 36 18V8L20 2Z"
            fill="var(--ui-primary)"
            fill-opacity="0.15"
            stroke="var(--ui-primary)"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M14 12V28M14 12L26 16L14 20"
            stroke="var(--ui-primary)"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </NuxtLink>
    </div> -->

    <!-- User Section -->
    <div
      class="p-4 border-b border-gray-200 dark:border-gray-800"
      :class="isCollapsed ? 'flex justify-center' : ''"
    >
      <!-- Loading State -->
      <div
        v-if="isLoading"
        class="flex items-center justify-center"
      >
        <USkeleton
          class="w-10 h-10 rounded-full"
        />
        <div
          v-if="!isCollapsed"
          class="flex-1 ml-3 space-y-2"
        >
          <USkeleton class="h-4 w-24" />
          <USkeleton class="h-3 w-32" />
        </div>
      </div>
      <!-- User Info -->
      <template v-else-if="user">
        <div
          v-if="!isCollapsed"
          class="flex items-center gap-3"
        >
          <UAvatar
            :alt="user.nickname"
            :src="user.avatar"
            size="lg"
          />
          <div class="flex-1 min-w-0">
            <p class="text-sm font-semibold text-gray-900 dark:text-white truncate">
              {{ user.nickname }}
            </p>
            <p class="text-xs text-gray-500 dark:text-gray-400 truncate">
              {{ formattedPoints }} pts · Rank {{ formattedRank }}
            </p>
          </div>
        </div>
        <UAvatar
          v-else
          :alt="user.nickname"
          :src="user.avatar"
          size="md"
        />
      </template>
      <!-- Not Logged In -->
      <div
        v-else
        class="flex items-center justify-center"
      >
        <NuxtLink
          to="/login"
          class="text-sm text-primary-600 dark:text-primary-400 hover:underline"
        >
          {{ isCollapsed ? '' : '请登录' }}
          <UIcon
            v-if="isCollapsed"
            name="i-lucide-log-in"
            class="w-5 h-5"
          />
        </NuxtLink>
      </div>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 overflow-y-auto p-2">
      <ul class="space-y-1">
        <li
          v-for="item in navItems"
          :key="item.to"
        >
          <NuxtLink
            :to="item.to"
            class="nav-item flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200"
            :class="[
              isCollapsed ? 'justify-center' : '',
              isActive(item.to)
                ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
            ]"
          >
            <UIcon
              :name="item.icon"
              class="w-5 h-5 shrink-0"
            />
            <span
              v-if="!isCollapsed"
              class="text-sm font-medium"
            >
              {{ item.label }}
            </span>
            <UBadge
              v-if="item.badge && !isCollapsed"
              :label="item.badge"
              color="primary"
              variant="subtle"
              size="xs"
              class="ml-auto"
            />
          </NuxtLink>
        </li>
      </ul>
    </nav>

    <!-- Bottom Section -->
    <div class="p-2 border-t border-gray-200 dark:border-gray-800">
      <!-- Theme Toggle -->
      <button
        class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors"
        :class="isCollapsed ? 'justify-center' : ''"
        :aria-label="colorMode.value === 'dark' ? '切换到浅色模式' : '切换到深色模式'"
        @click="toggleColorMode"
      >
        <UIcon
          :name="colorMode.value === 'dark' ? 'i-lucide-moon' : 'i-lucide-sun'"
          class="w-5 h-5 shrink-0"
        />
        <span
          v-if="!isCollapsed"
          class="text-sm font-medium"
        >
          切换主题
        </span>
      </button>

      <!-- Collapse Toggle -->
      <button
        class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        :class="isCollapsed ? 'justify-center' : ''"
        :aria-label="isCollapsed ? '展开侧边栏' : '折叠侧边栏'"
        @click="toggleCollapse"
      >
        <UIcon
          :name="isCollapsed ? 'i-lucide-panel-left-open' : 'i-lucide-panel-left-close'"
          class="w-5 h-5 shrink-0"
        />
        <span
          v-if="!isCollapsed"
          class="text-sm font-medium"
        >
          折叠侧边栏
        </span>
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
interface NavItem {
  label: string
  to: string
  icon: string
  badge?: string
}

const route = useRoute()
const colorMode = useColorMode()
const { user, isLoading, fetchUser, formattedPoints, formattedRank, initUser } = useUser()
const { isAuthenticated } = useAuth()
const { hasPermission } = usePermission()

const isCollapsed = ref(false)

// Initialize auth state and fetch user data on component mount
onMounted(() => {
  initUser()
  if (isAuthenticated.value) {
    fetchUser()
  }
})

// Re-fetch user data when authentication state changes
// This handles the case when user logs in and navigates back
watch(isAuthenticated, (newValue, oldValue) => {
  if (newValue && !oldValue) {
    // User just logged in
    fetchUser()
  }
})

const navItems = computed<NavItem[]>(() => {
  const items: NavItem[] = [
    { label: '用户中心', to: '/profile', icon: 'i-lucide-user' },
    { label: '挑战', to: '/challenges', icon: 'i-lucide-flag', badge: '200+' },
    { label: '学习指南', to: '/learn', icon: 'i-lucide-book-open' }
  ]

  // Add "我的文章" for users who can create articles
  if (hasPermission('article:create')) {
    const myArticlesPath = hasPermission('admin:access') ? '/admin/articles' : '/learn/my'
    items.push({ label: '我的文章', to: myArticlesPath, icon: 'i-lucide-file-pen' })
  }

  items.push(
    { label: '排行榜', to: '/leaderboard', icon: 'i-lucide-trophy' },
    { label: '竞赛', to: '/contests', icon: 'i-lucide-swords', badge: 'Live' }
  )

  // Add admin menu for users with admin access
  if (hasPermission('admin:access')) {
    items.push(
      { label: '文章管理', to: '/admin/articles', icon: 'i-lucide-file-check' },
      { label: '用户管理', to: '/admin/users', icon: 'i-lucide-users' },
      { label: '题目管理', to: '/admin/challenges', icon: 'i-lucide-shield' },
      { label: '竞赛管理', to: '/admin/competitions', icon: 'i-lucide-trophy' }
    )
  }

  return items
})

const isActive = (path: string) => {
  return route.path === path || route.path.startsWith(`${path}/`)
}

const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value
}

const toggleColorMode = () => {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}

// Expose collapse state for parent components
defineExpose({
  isCollapsed,
  toggleCollapse
})
</script>

<style scoped>
.nav-item {
  position: relative;
}

.nav-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 0;
  background: var(--ui-primary);
  border-radius: 0 2px 2px 0;
  transition: height 0.2s ease;
}

.nav-item.router-link-active::before,
.nav-item:has(.bg-primary-100)::before {
  height: 60%;
}
</style>
