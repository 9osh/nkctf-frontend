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
          @click="router.back()"
        />
        <UIcon
          name="i-lucide-user"
          class="w-6 h-6 text-primary-500"
        />
        <h1 class="text-xl font-semibold text-gray-900 dark:text-white">
          用户资料
        </h1>
      </div>
    </template>

    <div class="p-6">
      <!-- Loading State -->
      <div
        v-if="isLoading"
        class="space-y-6"
      >
        <div class="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
          <div class="flex items-start gap-6">
            <USkeleton class="w-24 h-24 rounded-full" />
            <div class="flex-1 space-y-3">
              <USkeleton class="h-8 w-48" />
              <USkeleton class="h-5 w-32" />
              <USkeleton class="h-4 w-full max-w-md" />
            </div>
          </div>
        </div>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <USkeleton class="h-64" />
          <USkeleton class="h-64" />
        </div>
      </div>

      <!-- Profile Content -->
      <div
        v-else-if="profileUser"
        class="space-y-6"
      >
        <!-- User Info Card -->
        <div class="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
          <div class="flex flex-col md:flex-row md:items-start gap-6">
            <!-- Avatar -->
            <div class="flex-shrink-0">
              <div class="w-24 h-24 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                {{ profileUser.nickname.charAt(0).toUpperCase() }}
              </div>
            </div>

            <!-- User Details -->
            <div class="flex-1 min-w-0">
              <div class="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
                <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
                  {{ profileUser.nickname }}
                </h2>
                <div
                  v-if="profileUser.team"
                  class="flex items-center gap-2"
                >
                  <UBadge
                    :label="profileUser.team.name"
                    color="info"
                    variant="subtle"
                    icon="i-lucide-users"
                  />
                  <UBadge
                    v-if="profileUser.team.role === 'CAPTAIN'"
                    label="队长"
                    color="warning"
                    variant="soft"
                    size="xs"
                  />
                </div>
              </div>

              <!-- Stats Row -->
              <div class="flex flex-wrap items-center gap-4 mb-4 text-sm">
                <span class="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                  <UIcon
                    name="i-lucide-trophy"
                    class="w-4 h-4 text-yellow-500"
                  />
                  排名 #{{ profileUser.rank }}
                </span>
                <span class="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                  <UIcon
                    name="i-lucide-star"
                    class="w-4 h-4 text-primary-500"
                  />
                  {{ profileUser.points.toLocaleString() }} 积分
                </span>
                <span class="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                  <UIcon
                    name="i-lucide-flag"
                    class="w-4 h-4 text-green-500"
                  />
                  {{ profileUser.solvedCount }} 道题目
                </span>
                <span class="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                  <UIcon
                    name="i-lucide-calendar"
                    class="w-4 h-4"
                  />
                  {{ formatJoinDate(profileUser.joinedAt) }} 加入
                </span>
              </div>

              <!-- Bio -->
              <p class="text-gray-600 dark:text-gray-400 text-sm">
                {{ profileUser.bio || '这个人很懒，什么都没留下...' }}
              </p>
            </div>
          </div>
        </div>

        <!-- Charts Section -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Activity Heatmap -->
          <div class="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <UIcon
                name="i-lucide-activity"
                class="w-5 h-5 text-green-500"
              />
              活跃度
            </h3>
            <ActivityHeatmap
              :data="profileUser.activityData"
              :days="365"
            />
          </div>

          <!-- Solve Radar Chart -->
          <div class="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <UIcon
                name="i-lucide-pie-chart"
                class="w-5 h-5 text-primary-500"
              />
              解题统计
            </h3>
            <SolveRadarChart
              :stats="profileUser.solveStats"
              :total-stats="profileUser.categoryTotals"
            />
          </div>
        </div>

        <!-- Solve Stats Summary -->
        <div class="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <UIcon
              name="i-lucide-check-circle"
              class="w-5 h-5 text-green-500"
            />
            总计已解决 {{ profileUser.solvedCount }} 道题目
          </h3>
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            <div
              v-for="(value, key) in profileUser.solveStats"
              :key="key"
              class="text-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
            >
              <div class="text-2xl font-bold text-gray-900 dark:text-white">
                {{ value }}<span
                  v-if="profileUser.categoryTotals"
                  class="text-sm font-normal text-gray-400"
                >/{{ profileUser.categoryTotals[key as keyof typeof profileUser.categoryTotals] }}</span>
              </div>
              <div class="text-xs text-gray-500 dark:text-gray-400 capitalize">
                {{ key }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Error State -->
      <div
        v-else
        class="flex flex-col items-center justify-center py-16"
      >
        <UIcon
          name="i-lucide-user-x"
          class="w-16 h-16 text-gray-300 dark:text-gray-700 mb-4"
        />
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
          无法加载用户信息
        </h3>
        <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">
          {{ errorMessage || '用户不存在或已被删除' }}
        </p>
        <UButton @click="loadProfile">
          重试
        </UButton>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import type { UserProfile } from '~/composables/useUser'
import ActivityHeatmap from '~/components/profile/ActivityHeatmap.vue'
import SolveRadarChart from '~/components/profile/SolveRadarChart.vue'

const route = useRoute()
const router = useRouter()
const { fetchUserById, storedUser, initUser } = useUser()

// Get user ID from route
const userId = computed(() => Number(route.params.id))

// Profile state
const profileUser = ref<UserProfile | null>(null)
const isLoading = ref(false)
const errorMessage = ref<string | null>(null)

// Load user profile
const loadProfile = async () => {
  // Validate userId first
  if (isNaN(userId.value) || userId.value <= 0) {
    errorMessage.value = '无效的用户ID'
    return
  }

  // Initialize user state first
  initUser()

  // Check if viewing own profile (by comparing stored user ID)
  if (storedUser.value && storedUser.value.userId === userId.value) {
    navigateTo('/profile')
    return
  }

  isLoading.value = true
  errorMessage.value = null

  const result = await fetchUserById(userId.value)

  if (result.success && result.user) {
    profileUser.value = result.user
  } else {
    errorMessage.value = result.error || '获取用户信息失败'
    profileUser.value = null
  }

  isLoading.value = false
}

// Helper functions
const formatJoinDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return `${date.getFullYear()}年${date.getMonth() + 1}月`
}

// SEO
useSeoMeta({
  title: () => profileUser.value ? `${profileUser.value.nickname} - 用户资料 - NKCTF` : '用户资料 - NKCTF',
  description: () => profileUser.value ? `查看 ${profileUser.value.nickname} 的个人资料` : '查看用户个人资料'
})

// Fetch profile on mount
onMounted(() => {
  loadProfile()
})

// Watch for route changes
watch(() => route.params.id, () => {
  loadProfile()
})
</script>
