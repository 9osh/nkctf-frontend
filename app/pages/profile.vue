<template>
  <NuxtLayout name="dashboard">
    <template #header-left>
      <div class="flex items-center gap-3">
        <UIcon
          name="i-lucide-user"
          class="w-6 h-6 text-primary-500"
        />
        <h1 class="text-xl font-semibold text-gray-900 dark:text-white">
          个人中心
        </h1>
      </div>
    </template>

    <template #header-right>
      <UButton
        icon="i-lucide-log-out"
        color="error"
        variant="ghost"
        @click="handleLogout"
      >
        退出登录
      </UButton>
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
        v-else-if="user"
        class="space-y-6"
      >
        <!-- User Info Card -->
        <div class="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
          <div class="flex flex-col md:flex-row md:items-start gap-6">
            <!-- Avatar -->
            <div class="flex-shrink-0">
              <div class="w-24 h-24 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                {{ user.nickname.charAt(0).toUpperCase() }}
              </div>
            </div>

            <!-- User Details -->
            <div class="flex-1 min-w-0">
              <div class="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
                <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
                  {{ user.nickname }}
                </h2>
                <UBadge
                  v-if="user.team"
                  :label="user.team.name"
                  color="info"
                  variant="subtle"
                  icon="i-lucide-users"
                />
              </div>

              <!-- Stats Row -->
              <div class="flex flex-wrap items-center gap-4 mb-4 text-sm">
                <span class="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                  <UIcon
                    name="i-lucide-trophy"
                    class="w-4 h-4 text-yellow-500"
                  />
                  排名 #{{ user.rank }}
                </span>
                <span class="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                  <UIcon
                    name="i-lucide-star"
                    class="w-4 h-4 text-primary-500"
                  />
                  {{ user.points.toLocaleString() }} 积分
                </span>
                <span class="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                  <UIcon
                    name="i-lucide-flag"
                    class="w-4 h-4 text-green-500"
                  />
                  {{ user.solvedCount }} 道题目
                </span>
                <span class="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                  <UIcon
                    name="i-lucide-calendar"
                    class="w-4 h-4"
                  />
                  {{ formatJoinDate(user.joinedAt) }} 加入
                </span>
              </div>

              <!-- Bio -->
              <div class="mb-4">
                <div
                  v-if="!isEditingBio"
                  class="flex items-start gap-2"
                >
                  <p class="text-gray-600 dark:text-gray-400 text-sm flex-1">
                    {{ user.bio || '这个人很懒，什么都没留下...' }}
                  </p>
                  <UButton
                    icon="i-lucide-pencil"
                    color="neutral"
                    variant="ghost"
                    size="xs"
                    @click="startEditBio"
                  />
                </div>
                <div
                  v-else
                  class="flex items-center gap-2"
                >
                  <UInput
                    v-model="bioInput"
                    placeholder="写点什么介绍自己..."
                    class="flex-1"
                    :maxlength="100"
                  />
                  <UButton
                    icon="i-lucide-check"
                    color="primary"
                    size="sm"
                    :loading="isSavingBio"
                    @click="saveBio"
                  />
                  <UButton
                    icon="i-lucide-x"
                    color="neutral"
                    variant="ghost"
                    size="sm"
                    @click="cancelEditBio"
                  />
                </div>
              </div>

              <!-- Team Actions -->
              <div class="flex flex-wrap items-center gap-2">
                <template v-if="!user.team">
                  <UButton
                    icon="i-lucide-plus"
                    color="primary"
                    size="sm"
                    @click="openCreateTeamModal"
                  >
                    创建战队
                  </UButton>
                  <UButton
                    icon="i-lucide-user-plus"
                    color="neutral"
                    variant="outline"
                    size="sm"
                    @click="openJoinTeamModal"
                  >
                    加入战队
                  </UButton>
                </template>
                <template v-else>
                  <UButton
                    icon="i-lucide-users"
                    color="info"
                    variant="soft"
                    size="sm"
                  >
                    {{ user.team.name }} ({{ user.team.memberCount }} 人)
                  </UButton>
                  <UButton
                    icon="i-lucide-log-out"
                    color="error"
                    variant="ghost"
                    size="sm"
                    @click="openLeaveTeamModal"
                  >
                    退出战队
                  </UButton>
                </template>
              </div>
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
            <ActivityHeatmap :data="user.activityData" :days="365" />
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
            <SolveRadarChart :stats="user.solveStats" />
          </div>
        </div>

        <!-- Recent Solves (Optional Enhancement) -->
        <div class="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <UIcon
              name="i-lucide-check-circle"
              class="w-5 h-5 text-green-500"
            />
            总计已解决 {{ user.solvedCount }} 道题目
          </h3>
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            <div
              v-for="(value, key) in user.solveStats"
              :key="key"
              class="text-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
            >
              <div class="text-2xl font-bold text-gray-900 dark:text-white">
                {{ value }}
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
          {{ error || '请稍后重试' }}
        </p>
        <UButton @click="fetchUser">
          重试
        </UButton>
      </div>
    </div>

    <!-- Create Team Modal -->
    <UModal v-model:open="isCreateTeamModalOpen">
      <template #content>
        <UCard
          :ui="{
            root: 'bg-white dark:bg-gray-900',
            header: 'border-b border-gray-200 dark:border-gray-800',
            body: 'p-6'
          }"
        >
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                创建战队
              </h3>
              <UButton
                icon="i-lucide-x"
                color="neutral"
                variant="ghost"
                size="sm"
                @click="isCreateTeamModalOpen = false"
              />
            </div>
          </template>

          <div class="space-y-4">
            <UFormField label="战队名称">
              <UInput
                v-model="createTeamName"
                placeholder="输入战队名称"
                icon="i-lucide-users"
              />
            </UFormField>
            <div class="flex justify-end gap-2">
              <UButton
                color="neutral"
                variant="outline"
                @click="isCreateTeamModalOpen = false"
              >
                取消
              </UButton>
              <UButton
                :loading="isCreatingTeam"
                :disabled="!createTeamName.trim()"
                @click="handleCreateTeam"
              >
                创建
              </UButton>
            </div>
          </div>
        </UCard>
      </template>
    </UModal>

    <!-- Join Team Modal -->
    <UModal v-model:open="isJoinTeamModalOpen">
      <template #content>
        <UCard
          :ui="{
            root: 'bg-white dark:bg-gray-900',
            header: 'border-b border-gray-200 dark:border-gray-800',
            body: 'p-6'
          }"
        >
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                加入战队
              </h3>
              <UButton
                icon="i-lucide-x"
                color="neutral"
                variant="ghost"
                size="sm"
                @click="isJoinTeamModalOpen = false"
              />
            </div>
          </template>

          <div class="space-y-4">
            <UFormField label="战队 ID">
              <UInput
                v-model="joinTeamId"
                type="number"
                placeholder="输入战队 ID"
                icon="i-lucide-hash"
              />
            </UFormField>
            <UFormField label="战队名称">
              <UInput
                v-model="joinTeamName"
                placeholder="输入战队名称确认"
                icon="i-lucide-users"
              />
            </UFormField>
            <div class="flex justify-end gap-2">
              <UButton
                color="neutral"
                variant="outline"
                @click="isJoinTeamModalOpen = false"
              >
                取消
              </UButton>
              <UButton
                :loading="isJoiningTeam"
                :disabled="!joinTeamId || !joinTeamName.trim()"
                @click="handleJoinTeam"
              >
                加入
              </UButton>
            </div>
          </div>
        </UCard>
      </template>
    </UModal>

    <!-- Leave Team Confirmation Modal -->
    <UModal v-model:open="isLeaveTeamModalOpen">
      <template #content>
        <UCard
          :ui="{
            root: 'bg-white dark:bg-gray-900',
            header: 'border-b border-gray-200 dark:border-gray-800',
            body: 'p-6'
          }"
        >
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                退出战队
              </h3>
              <UButton
                icon="i-lucide-x"
                color="neutral"
                variant="ghost"
                size="sm"
                @click="isLeaveTeamModalOpen = false"
              />
            </div>
          </template>

          <div class="space-y-4">
            <p class="text-gray-600 dark:text-gray-400">
              确定要退出战队 <strong class="text-gray-900 dark:text-white">{{ user?.team?.name }}</strong> 吗？
            </p>
            <p class="text-sm text-amber-600 dark:text-amber-400">
              退出后，您将无法参与该战队的团队赛事。
            </p>
            <div class="flex justify-end gap-2">
              <UButton
                color="neutral"
                variant="outline"
                @click="isLeaveTeamModalOpen = false"
              >
                取消
              </UButton>
              <UButton
                color="error"
                :loading="isLeavingTeam"
                @click="handleLeaveTeam"
              >
                确认退出
              </UButton>
            </div>
          </div>
        </UCard>
      </template>
    </UModal>

    <!-- Logout Confirmation Modal -->
    <UModal v-model:open="isLogoutModalOpen">
      <template #content>
        <UCard
          :ui="{
            root: 'bg-white dark:bg-gray-900',
            header: 'border-b border-gray-200 dark:border-gray-800',
            body: 'p-6'
          }"
        >
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                退出登录
              </h3>
              <UButton
                icon="i-lucide-x"
                color="neutral"
                variant="ghost"
                size="sm"
                @click="isLogoutModalOpen = false"
              />
            </div>
          </template>

          <div class="space-y-4">
            <p class="text-gray-600 dark:text-gray-400">
              确定要退出登录吗？
            </p>
            <div class="flex justify-end gap-2">
              <UButton
                color="neutral"
                variant="outline"
                @click="isLogoutModalOpen = false"
              >
                取消
              </UButton>
              <UButton
                color="error"
                :loading="isLoggingOut"
                @click="confirmLogout"
              >
                退出登录
              </UButton>
            </div>
          </div>
        </UCard>
      </template>
    </UModal>
  </NuxtLayout>
</template>

<script setup lang="ts">
import ActivityHeatmap from '~/components/profile/ActivityHeatmap.vue'
import SolveRadarChart from '~/components/profile/SolveRadarChart.vue'

const {
  user,
  isLoading,
  error,
  fetchUser,
  logout,
  createTeam,
  joinTeam,
  leaveTeam,
  updateBio
} = useUser()

// Bio editing state
const isEditingBio = ref(false)
const bioInput = ref('')
const isSavingBio = ref(false)

// Modal states
const isCreateTeamModalOpen = ref(false)
const isJoinTeamModalOpen = ref(false)
const isLeaveTeamModalOpen = ref(false)
const isLogoutModalOpen = ref(false)

// Team action states
const createTeamName = ref('')
const joinTeamId = ref<number | null>(null)
const joinTeamName = ref('')
const isCreatingTeam = ref(false)
const isJoiningTeam = ref(false)
const isLeavingTeam = ref(false)
const isLoggingOut = ref(false)

// Bio editing methods
const startEditBio = () => {
  bioInput.value = user.value?.bio || ''
  isEditingBio.value = true
}

const cancelEditBio = () => {
  isEditingBio.value = false
  bioInput.value = ''
}

const saveBio = async () => {
  isSavingBio.value = true
  const result = await updateBio(bioInput.value)
  isSavingBio.value = false

  if (result.success) {
    isEditingBio.value = false
  }
}

// Modal openers
const openCreateTeamModal = () => {
  createTeamName.value = ''
  isCreateTeamModalOpen.value = true
}

const openJoinTeamModal = () => {
  joinTeamId.value = null
  joinTeamName.value = ''
  isJoinTeamModalOpen.value = true
}

const openLeaveTeamModal = () => {
  isLeaveTeamModalOpen.value = true
}

// Team action handlers
const handleCreateTeam = async () => {
  if (!createTeamName.value.trim()) return

  isCreatingTeam.value = true
  const result = await createTeam(createTeamName.value.trim())
  isCreatingTeam.value = false

  if (result.success) {
    isCreateTeamModalOpen.value = false
  }
}

const handleJoinTeam = async () => {
  if (!joinTeamId.value || !joinTeamName.value.trim()) return

  isJoiningTeam.value = true
  const result = await joinTeam(joinTeamId.value, joinTeamName.value.trim())
  isJoiningTeam.value = false

  if (result.success) {
    isJoinTeamModalOpen.value = false
  }
}

const handleLeaveTeam = async () => {
  isLeavingTeam.value = true
  const result = await leaveTeam()
  isLeavingTeam.value = false

  if (result.success) {
    isLeaveTeamModalOpen.value = false
  }
}

// Logout handlers
const handleLogout = () => {
  isLogoutModalOpen.value = true
}

const confirmLogout = async () => {
  isLoggingOut.value = true
  await logout()
  isLoggingOut.value = false
  isLogoutModalOpen.value = false
}

// Helper functions
const formatJoinDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return `${date.getFullYear()}年${date.getMonth() + 1}月`
}

// SEO
useSeoMeta({
  title: () => user.value ? `${user.value.nickname} - 个人中心 - NKCTF` : '个人中心 - NKCTF',
  description: '查看和管理您的 NKCTF 个人资料'
})

// Fetch user on mount
onMounted(() => {
  fetchUser()
})
</script>
