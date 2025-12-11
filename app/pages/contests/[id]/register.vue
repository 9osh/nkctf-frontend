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
          @click="navigateTo(`/contests/${contestId}`)"
        />
        <UIcon
          name="i-lucide-user-plus"
          class="w-6 h-6 text-primary-500"
        />
        <h1 class="text-xl font-semibold text-gray-900 dark:text-white">
          报名参赛
        </h1>
      </div>
    </template>

    <div class="p-6">
      <!-- Loading State -->
      <div
        v-if="isLoading"
        class="max-w-2xl mx-auto"
      >
        <USkeleton class="h-8 w-1/2 mb-4" />
        <USkeleton class="h-4 w-full mb-8" />
        <USkeleton class="h-32 w-full mb-4" />
        <USkeleton class="h-10 w-32" />
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

      <!-- Already Registered -->
      <div
        v-else-if="currentContest?.isRegistered"
        class="max-w-2xl mx-auto"
      >
        <UCard
          :ui="{
            root: 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800',
            body: 'p-6'
          }"
        >
          <div class="flex flex-col items-center text-center py-8">
            <div class="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
              <UIcon
                name="i-lucide-check-circle"
                class="w-8 h-8 text-green-600 dark:text-green-400"
              />
            </div>
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              您已报名成功
            </h2>
            <p class="text-gray-500 dark:text-gray-400 mb-6">
              您已成功报名 {{ currentContest.title }}，请在比赛开始后进入参赛
            </p>
            <div class="flex gap-3">
              <UButton
                variant="outline"
                @click="navigateTo(`/contests/${contestId}`)"
              >
                返回赛事详情
              </UButton>
              <UButton
                v-if="currentContest.status === 'active'"
                @click="navigateTo(`/contests/${contestId}/challenges`)"
              >
                进入比赛
              </UButton>
            </div>
          </div>
        </UCard>
      </div>

      <!-- Cannot Register (not inactive) -->
      <div
        v-else-if="currentContest && currentContest.status !== 'inactive'"
        class="max-w-2xl mx-auto"
      >
        <UCard
          :ui="{
            root: 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800',
            body: 'p-6'
          }"
        >
          <div class="flex flex-col items-center text-center py-8">
            <div class="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-4">
              <UIcon
                name="i-lucide-alert-triangle"
                class="w-8 h-8 text-amber-600 dark:text-amber-400"
              />
            </div>
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              无法报名
            </h2>
            <p class="text-gray-500 dark:text-gray-400 mb-6">
              {{ currentContest.status === 'active' ? '比赛已经开始，无法报名' : '比赛已经结束' }}
            </p>
            <UButton
              variant="outline"
              @click="navigateTo(`/contests/${contestId}`)"
            >
              返回赛事详情
            </UButton>
          </div>
        </UCard>
      </div>

      <!-- Registration Form -->
      <div
        v-else-if="currentContest"
        class="max-w-2xl mx-auto"
      >
        <UCard
          :ui="{
            root: 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800',
            body: 'p-6'
          }"
        >
          <!-- Contest Info -->
          <div class="mb-6 pb-6 border-b border-gray-200 dark:border-gray-800">
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {{ currentContest.title }}
            </h2>
            <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">
              {{ currentContest.description }}
            </p>
            <div class="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
              <span class="flex items-center gap-1">
                <UIcon
                  name="i-lucide-calendar"
                  class="w-4 h-4"
                />
                {{ formatDateTime(currentContest.startTime) }} - {{ formatDateTime(currentContest.endTime) }}
              </span>
              <span class="flex items-center gap-1">
                <UIcon
                  name="i-lucide-users"
                  class="w-4 h-4"
                />
                {{ currentContest.participantCount }} 人已报名
              </span>
            </div>
          </div>

          <!-- Registration Agreement -->
          <div class="mb-6">
            <h3 class="text-base font-medium text-gray-900 dark:text-white mb-3">
              参赛须知
            </h3>
            <div class="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg text-sm text-gray-600 dark:text-gray-300 space-y-2">
              <p>1. 每位选手独立参赛，禁止共享 Flag 或解题思路</p>
              <p>2. 禁止攻击比赛平台、题目环境和其他选手</p>
              <p>3. 禁止使用任何自动化攻击工具对平台进行扫描</p>
              <p>4. Flag 格式为 NKCTF{...}，提交时请确保格式正确</p>
              <p>5. 比赛期间如有问题请通过平台联系管理员</p>
            </div>
          </div>

          <!-- Agreement Checkbox -->
          <div class="mb-6">
            <label class="flex items-start gap-3 cursor-pointer">
              <UCheckbox v-model="agreeToRules" />
              <span class="text-sm text-gray-600 dark:text-gray-400">
                我已阅读并同意以上参赛须知，承诺遵守比赛规则
              </span>
            </label>
          </div>

          <!-- Submit Button -->
          <div class="flex items-center gap-3">
            <UButton
              size="lg"
              :disabled="!agreeToRules"
              :loading="isRegistering"
              @click="handleRegister"
            >
              <UIcon
                name="i-lucide-check"
                class="w-5 h-5 mr-2"
              />
              确认报名
            </UButton>
            <UButton
              variant="outline"
              size="lg"
              @click="navigateTo(`/contests/${contestId}`)"
            >
              取消
            </UButton>
          </div>
        </UCard>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const { currentContest, contests, isLoading, error, fetchContest, fetchContests, registerContest } = useContests()

// Get contest ID from route
const contestId = computed(() => Number(route.params.id))

// Form state
const agreeToRules = ref(false)
const isRegistering = ref(false)

// Load contest data
const loadContest = async () => {
  if (contests.value.length === 0) {
    await fetchContests()
  }
  await fetchContest(contestId.value)
}

// Handle registration
const handleRegister = async () => {
  if (!currentContest.value || !agreeToRules.value) return

  isRegistering.value = true
  const result = await registerContest(currentContest.value.id)
  isRegistering.value = false

  if (result.success) {
    // Registration successful, page will re-render to show success state
  }
  else {
    // TODO: Show error toast
    console.error('报名失败:', result.error)
  }
}

// Helper functions
const formatDateTime = (dateString: string) => {
  const date = new Date(dateString)
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${month}/${day} ${hours}:${minutes}`
}

// SEO
useSeoMeta({
  title: () => currentContest.value ? `报名 ${currentContest.value.title} - NKCTF` : '报名参赛 - NKCTF',
  description: '报名参加 NKCTF 竞赛'
})

// Fetch contest on mount
onMounted(() => {
  loadContest()
})

// Watch for route changes
watch(() => route.params.id, () => {
  loadContest()
})
</script>
