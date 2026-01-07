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
          @click="router.push('/contests')"
        />
        <UIcon
          name="i-lucide-swords"
          class="w-6 h-6 text-primary-500"
        />
        <h1 class="text-xl font-semibold text-gray-900 dark:text-white truncate max-w-md">
          {{ currentContest?.title || '加载中...' }}
        </h1>
      </div>
    </template>

    <template #header-right>
      <div
        v-if="currentContest"
        class="flex items-center gap-3"
      >
        <UBadge
          :label="getStatusText(currentContest.status)"
          :color="getStatusColor(currentContest.status)"
          size="lg"
        />
      </div>
    </template>

    <div class="p-6">
      <!-- Loading State -->
      <div
        v-if="isLoading"
        class="max-w-4xl mx-auto"
      >
        <USkeleton class="h-8 w-3/4 mb-4" />
        <USkeleton class="h-4 w-1/4 mb-8" />
        <div class="space-y-3">
          <USkeleton class="h-4 w-full" />
          <USkeleton class="h-4 w-full" />
          <USkeleton class="h-4 w-5/6" />
        </div>
      </div>

      <!-- Error State -->
      <div
        v-else-if="error"
        class="flex flex-col items-center justify-center py-16"
      >
        <UIcon
          name="i-lucide-alert-circle"
          class="w-16 h-16 text-red-400 mb-4"
        />
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
          加载失败
        </h3>
        <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">
          {{ error }}
        </p>
        <UButton
          icon="i-lucide-refresh-cw"
          @click="loadContest"
        >
          重试
        </UButton>
      </div>

      <!-- Contest Content -->
      <div
        v-else-if="currentContest"
        class="max-w-4xl mx-auto"
      >
        <!-- Contest Header Card -->
        <UCard
          :ui="{
            root: 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800',
            body: 'p-6'
          }"
        >
          <!-- Status & Registration -->
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-2">
              <UBadge
                :label="getStatusText(currentContest.status)"
                :color="getStatusColor(currentContest.status)"
                size="lg"
              />
              <UBadge
                :label="currentContest.isTeamCompetition ? '团队赛' : '个人赛'"
                :color="currentContest.isTeamCompetition ? 'info' : 'neutral'"
                variant="soft"
              />
            </div>
            <span
              v-if="currentContest.isRegistered"
              class="text-sm text-green-600 dark:text-green-400 flex items-center gap-1"
            >
              <UIcon
                name="i-lucide-check-circle"
                class="w-5 h-5"
              />
              已报名
            </span>
          </div>

          <!-- Title -->
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {{ currentContest.title }}
          </h1>

          <!-- Description -->
          <p class="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
            {{ currentContest.description }}
          </p>

          <!-- Contest Info Grid -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <!-- Start Time -->
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <UIcon
                  name="i-lucide-play"
                  class="w-5 h-5 text-green-600 dark:text-green-400"
                />
              </div>
              <div>
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  开始时间
                </p>
                <p class="text-sm font-medium text-gray-900 dark:text-white">
                  {{ formatDateTime(currentContest.startTime) }}
                </p>
              </div>
            </div>

            <!-- End Time -->
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <UIcon
                  name="i-lucide-flag-off"
                  class="w-5 h-5 text-red-600 dark:text-red-400"
                />
              </div>
              <div>
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  结束时间
                </p>
                <p class="text-sm font-medium text-gray-900 dark:text-white">
                  {{ formatDateTime(currentContest.endTime) }}
                </p>
              </div>
            </div>

            <!-- Participants -->
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <UIcon
                  name="i-lucide-users"
                  class="w-5 h-5 text-blue-600 dark:text-blue-400"
                />
              </div>
              <div>
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  参赛人数
                </p>
                <p class="text-sm font-medium text-gray-900 dark:text-white">
                  {{ currentContest.participantCount }} 人
                </p>
              </div>
            </div>
          </div>

          <!-- Countdown Timer (for inactive or active status) -->
          <div
            v-if="currentContest && currentContest.status !== 'ended'"
            class="mb-6 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg border border-primary-200 dark:border-primary-800"
          >
            <StatusCountdown :contest="currentContest" />
          </div>

          <!-- Action Buttons -->
          <div class="flex items-center gap-3">
            <!-- Register Button (only for inactive status) -->
            <UButton
              v-if="currentContest.status === 'inactive'"
              size="lg"
              :disabled="currentContest.isRegistered || isRegistering || (currentContest.isTeamCompetition && !hasTeam)"
              :loading="isRegistering"
              @click="handleRegister"
            >
              <UIcon
                name="i-lucide-user-plus"
                class="w-5 h-5 mr-2"
              />
              {{ currentContest.isRegistered ? '已报名' : '报名参赛' }}
            </UButton>

            <!-- Enter/Review Button (for active and ending status) -->
            <UButton
              v-if="currentContest.status === 'active' || currentContest.status === 'ending'"
              size="lg"
              :color="currentContest.status === 'active' ? 'primary' : 'neutral'"
              :disabled="!currentContest.isRegistered && currentContest.status === 'active'"
              @click="navigateTo(`/contests/${contestId}/challenges`)"
            >
              <UIcon
                :name="currentContest.status === 'active' ? 'i-lucide-swords' : 'i-lucide-history'"
                class="w-5 h-5 mr-2"
              />
              {{ currentContest.status === 'active' ? '参赛' : '回顾' }}
            </UButton>

            <!-- Leaderboard Button (for active and ending status) -->
            <UButton
              v-if="currentContest.status === 'active' || currentContest.status === 'ending'"
              size="lg"
              variant="outline"
              :disabled="!currentContest.isRegistered"
              @click="navigateTo(`/contests/${contestId}/leaderboard`)"
            >
              <UIcon
                name="i-lucide-trophy"
                class="w-5 h-5 mr-2"
              />
              排行榜
            </UButton>

            <!-- Back Button -->
            <UButton
              variant="outline"
              size="lg"
              @click="navigateTo('/contests')"
            >
              <UIcon
                name="i-lucide-arrow-left"
                class="w-5 h-5 mr-2"
              />
              返回列表
            </UButton>
          </div>

          <!-- Team Competition Warning -->
          <p
            v-if="currentContest.status === 'inactive' && currentContest.isTeamCompetition && !hasTeam && !currentContest.isRegistered"
            class="mt-4 text-sm text-amber-600 dark:text-amber-400 flex items-center gap-2"
          >
            <UIcon
              name="i-lucide-alert-triangle"
              class="w-4 h-4"
            />
            这是团队赛，请先加入或创建战队后再报名
          </p>

          <!-- Not Registered Warning -->
          <p
            v-if="currentContest.status === 'active' && !currentContest.isRegistered"
            class="mt-4 text-sm text-amber-600 dark:text-amber-400 flex items-center gap-2"
          >
            <UIcon
              name="i-lucide-alert-triangle"
              class="w-4 h-4"
            />
            {{ currentContest.isTeamCompetition ? '您的队伍尚未报名此比赛，无法参赛' : '您尚未报名此比赛，无法参赛' }}
          </p>
        </UCard>

        <!-- Contest Rules / Additional Info (placeholder) -->
        <UCard
          class="mt-6"
          :ui="{
            root: 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800',
            body: 'p-6'
          }"
        >
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <UIcon
              name="i-lucide-scroll-text"
              class="w-5 h-5"
            />
            比赛规则
          </h2>
          <ul class="space-y-2 text-sm text-gray-600 dark:text-gray-300">
            <li class="flex items-start gap-2">
              <UIcon
                name="i-lucide-check"
                class="w-4 h-4 mt-0.5 text-green-500"
              />
              每位选手独立参赛，禁止共享 Flag
            </li>
            <li class="flex items-start gap-2">
              <UIcon
                name="i-lucide-check"
                class="w-4 h-4 mt-0.5 text-green-500"
              />
              禁止攻击比赛平台和其他选手
            </li>
            <li class="flex items-start gap-2">
              <UIcon
                name="i-lucide-check"
                class="w-4 h-4 mt-0.5 text-green-500"
              />
              Flag 格式为 NKCTF{...}
            </li>
            <li class="flex items-start gap-2">
              <UIcon
                name="i-lucide-check"
                class="w-4 h-4 mt-0.5 text-green-500"
              />
              比赛期间如有问题请联系管理员
            </li>
          </ul>
        </UCard>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const toast = useToast()
const { currentContest, contests, isLoading, error, fetchContest, fetchContests, registerContest, getStatusText, getStatusColor } = useContests()
const { hasTeam, isLoggedIn } = useUser()
const { subscribeToCompetition } = useCompetitionStatus()

// Get contest ID from route
const contestId = computed(() => Number(route.params.id))

// Registration state
const isRegistering = ref(false)

// Store unsubscribe function
let unsubscribeStatus: (() => void) | null = null

// Load contest data
const loadContest = async () => {
  // Ensure contests list is loaded first
  if (contests.value.length === 0) {
    await fetchContests()
  }
  await fetchContest(contestId.value)
}

// Handle registration
const handleRegister = async () => {
  if (!isLoggedIn.value) {
    toast.add({
      title: '请先登录',
      description: '您需要登录后才能报名参赛',
      color: 'warning'
    })
    navigateTo('/login')
    return
  }

  if (currentContest.value?.isTeamCompetition && !hasTeam.value) {
    toast.add({
      title: '请先加入战队',
      description: '这是团队赛，请先加入或创建战队后再报名',
      color: 'warning'
    })
    return
  }

  isRegistering.value = true
  const result = await registerContest(contestId.value)
  isRegistering.value = false

  if (result.success) {
    toast.add({
      title: '报名成功',
      description: currentContest.value?.isTeamCompetition ? '您的队伍已成功报名' : '您已成功报名',
      color: 'success'
    })
  } else {
    toast.add({
      title: '报名失败',
      description: result.error || '报名失败，请稍后再试',
      color: 'error'
    })
  }
}

// Helper functions
const formatDateTime = (dateString: string) => {
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}`
}

// SEO
useSeoMeta({
  title: () => currentContest.value ? `${currentContest.value.title} - NKCTF` : '加载中... - NKCTF',
  description: () => currentContest.value ? currentContest.value.description : ''
})

// Fetch contest on mount and subscribe to status updates
onMounted(() => {
  loadContest()
  // Subscribe to this competition's status updates
  unsubscribeStatus = subscribeToCompetition(contestId.value)
})

// Cleanup subscription on unmount
onUnmounted(() => {
  if (unsubscribeStatus) {
    unsubscribeStatus()
    unsubscribeStatus = null
  }
})

// Watch for route changes
watch(() => route.params.id, () => {
  // Cleanup previous subscription
  if (unsubscribeStatus) {
    unsubscribeStatus()
  }
  loadContest()
  // Subscribe to new competition
  unsubscribeStatus = subscribeToCompetition(contestId.value)
})
</script>
