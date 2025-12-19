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
                <div
                  v-if="user.team"
                  class="flex items-center gap-2"
                >
                  <UBadge
                    :label="user.team.name"
                    color="info"
                    variant="subtle"
                    icon="i-lucide-users"
                  />
                  <UBadge
                    v-if="isCaptain"
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
                    @click="openTeamManageModal"
                  >
                    {{ user.team.name }}
                    <template v-if="user.team.memberCount">
                      ({{ user.team.memberCount }} 人)
                    </template>
                  </UButton>
                  <UButton
                    v-if="isCaptain"
                    icon="i-lucide-settings"
                    color="neutral"
                    variant="outline"
                    size="sm"
                    @click="openTeamManageModal"
                  >
                    管理战队
                  </UButton>
                  <UButton
                    v-if="!isCaptain"
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
            <ActivityHeatmap
              :data="user.activityData"
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
              :stats="user.solveStats"
              :total-stats="user.categoryTotals"
            />
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
                {{ value }}<span
                  v-if="user.categoryTotals"
                  class="text-sm font-normal text-gray-400"
                >/{{ user.categoryTotals[key as keyof typeof user.categoryTotals] }}</span>
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
                placeholder="输入战队名称 (2-50字符)"
                icon="i-lucide-users"
              />
            </UFormField>
            <UFormField label="战队描述">
              <UTextarea
                v-model="createTeamDescription"
                placeholder="输入战队描述 (可选，最多500字符)"
                :rows="3"
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
                :disabled="!createTeamName.trim() || createTeamName.trim().length < 2"
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
            <UFormField label="邀请令牌">
              <UInput
                v-model="joinInviteToken"
                placeholder="输入队长分享的邀请令牌"
                icon="i-lucide-key"
              />
            </UFormField>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              请向队长获取邀请令牌后加入战队
            </p>
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
                :disabled="!joinInviteToken.trim()"
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

    <!-- Team Management Modal (Captain Only) -->
    <UModal v-model:open="isTeamManageModalOpen">
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
                战队管理
              </h3>
              <UButton
                icon="i-lucide-x"
                color="neutral"
                variant="ghost"
                size="sm"
                @click="isTeamManageModalOpen = false"
              />
            </div>
          </template>

          <div
            v-if="user?.team"
            class="space-y-6"
          >
            <!-- Team Info -->
            <div class="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <h4 class="font-medium text-gray-900 dark:text-white mb-2">
                {{ user.team.name }}
              </h4>
              <p
                v-if="user.team.description"
                class="text-sm text-gray-600 dark:text-gray-400 mb-2"
              >
                {{ user.team.description }}
              </p>
              <div class="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                <span class="flex items-center gap-1">
                  <UIcon
                    name="i-lucide-users"
                    class="w-4 h-4"
                  />
                  {{ user.team.memberCount || user.team.members?.length || 1 }} 成员
                </span>
              </div>
            </div>

            <!-- Member List -->
            <div
              v-if="user.team.members && user.team.members.length > 0"
              class="space-y-2"
            >
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                战队成员
              </label>
              <div class="space-y-2 max-h-48 overflow-y-auto">
                <div
                  v-for="member in user.team.members"
                  :key="member.id"
                  class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
                >
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-sm font-bold">
                      {{ member.nickname.charAt(0).toUpperCase() }}
                    </div>
                    <div>
                      <span class="text-sm font-medium text-gray-900 dark:text-white">
                        {{ member.nickname }}
                      </span>
                      <UBadge
                        v-if="member.role === 'CAPTAIN'"
                        label="队长"
                        color="warning"
                        variant="soft"
                        size="xs"
                        class="ml-2"
                      />
                    </div>
                  </div>
                  <div
                    v-if="isCaptain && member.role !== 'CAPTAIN'"
                    class="flex items-center gap-1"
                  >
                    <UButton
                      icon="i-lucide-crown"
                      color="warning"
                      variant="ghost"
                      size="xs"
                      title="转让队长"
                      @click="openTransferCaptainModal({ id: member.id, nickname: member.nickname })"
                    />
                    <UButton
                      icon="i-lucide-user-minus"
                      color="error"
                      variant="ghost"
                      size="xs"
                      title="移出战队"
                      @click="openRemoveMemberModal({ id: member.id, nickname: member.nickname })"
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- Invite Token (Captain Only) -->
            <div
              v-if="isCaptain && user.team.inviteToken"
              class="space-y-2"
            >
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                邀请令牌
              </label>
              <div class="flex gap-2">
                <UInput
                  :model-value="user.team.inviteToken"
                  readonly
                  icon="i-lucide-key"
                  class="flex-1 font-mono text-sm"
                />
                <UButton
                  icon="i-lucide-copy"
                  color="neutral"
                  variant="outline"
                  @click="copyInviteToken"
                >
                  复制
                </UButton>
              </div>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                分享此令牌给队友加入战队
              </p>
            </div>

            <!-- Captain Actions -->
            <div
              v-if="isCaptain"
              class="space-y-3"
            >
              <UButton
                icon="i-lucide-refresh-cw"
                color="neutral"
                variant="outline"
                class="w-full"
                :loading="isRefreshingToken"
                @click="handleRefreshInviteToken"
              >
                刷新邀请令牌
              </UButton>
              <UButton
                icon="i-lucide-trash-2"
                color="error"
                variant="outline"
                class="w-full"
                @click="openDissolveTeamModal"
              >
                解散战队
              </UButton>
            </div>

            <!-- Member Actions -->
            <div
              v-if="!isCaptain"
              class="space-y-3"
            >
              <UButton
                icon="i-lucide-log-out"
                color="error"
                variant="outline"
                class="w-full"
                @click="openLeaveTeamModal"
              >
                退出战队
              </UButton>
            </div>
          </div>
        </UCard>
      </template>
    </UModal>

    <!-- Dissolve Team Confirmation Modal -->
    <UModal v-model:open="isDissolveTeamModalOpen">
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
              <h3 class="text-lg font-semibold text-red-600 dark:text-red-400">
                解散战队
              </h3>
              <UButton
                icon="i-lucide-x"
                color="neutral"
                variant="ghost"
                size="sm"
                @click="isDissolveTeamModalOpen = false"
              />
            </div>
          </template>

          <div class="space-y-4">
            <div class="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <p class="text-red-600 dark:text-red-400 font-medium mb-2">
                警告：此操作不可撤销！
              </p>
              <p class="text-sm text-red-500 dark:text-red-400/80">
                解散战队后，所有成员将被移出队伍，战队数据将被永久删除。
              </p>
            </div>
            <p class="text-gray-600 dark:text-gray-400">
              确定要解散战队 <strong class="text-gray-900 dark:text-white">{{ user?.team?.name }}</strong> 吗？
            </p>
            <div class="flex justify-end gap-2">
              <UButton
                color="neutral"
                variant="outline"
                @click="isDissolveTeamModalOpen = false"
              >
                取消
              </UButton>
              <UButton
                color="error"
                :loading="isDissolvingTeam"
                @click="handleDissolveTeam"
              >
                确认解散
              </UButton>
            </div>
          </div>
        </UCard>
      </template>
    </UModal>

    <!-- Remove Member Confirmation Modal -->
    <UModal v-model:open="isRemoveMemberModalOpen">
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
                移除成员
              </h3>
              <UButton
                icon="i-lucide-x"
                color="neutral"
                variant="ghost"
                size="sm"
                @click="isRemoveMemberModalOpen = false"
              />
            </div>
          </template>

          <div class="space-y-4">
            <p class="text-gray-600 dark:text-gray-400">
              确定要将 <strong class="text-gray-900 dark:text-white">{{ memberToRemove?.nickname }}</strong> 移出战队吗？
            </p>
            <p class="text-sm text-amber-600 dark:text-amber-400">
              该成员将无法继续参与战队的团队赛事。
            </p>
            <div class="flex justify-end gap-2">
              <UButton
                color="neutral"
                variant="outline"
                @click="isRemoveMemberModalOpen = false"
              >
                取消
              </UButton>
              <UButton
                color="error"
                :loading="isRemovingMember"
                @click="handleRemoveMember"
              >
                确认移除
              </UButton>
            </div>
          </div>
        </UCard>
      </template>
    </UModal>

    <!-- Transfer Captain Confirmation Modal -->
    <UModal v-model:open="isTransferCaptainModalOpen">
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
                转让队长
              </h3>
              <UButton
                icon="i-lucide-x"
                color="neutral"
                variant="ghost"
                size="sm"
                @click="isTransferCaptainModalOpen = false"
              />
            </div>
          </template>

          <div class="space-y-4">
            <p class="text-gray-600 dark:text-gray-400">
              确定要将队长转让给 <strong class="text-gray-900 dark:text-white">{{ memberToTransfer?.nickname }}</strong> 吗？
            </p>
            <p class="text-sm text-amber-600 dark:text-amber-400">
              转让后，您将成为普通成员，无法管理战队。
            </p>
            <div class="flex justify-end gap-2">
              <UButton
                color="neutral"
                variant="outline"
                @click="isTransferCaptainModalOpen = false"
              >
                取消
              </UButton>
              <UButton
                color="warning"
                :loading="isTransferringCaptain"
                @click="handleTransferCaptain"
              >
                确认转让
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
  isLoggedIn,
  initUser,
  fetchUser,
  logout,
  createTeam,
  getMyTeam,
  joinTeam,
  leaveTeam,
  refreshTeamInviteToken,
  getInviteToken,
  removeMember,
  transferCaptain,
  dissolveTeam,
  updateBio,
  isCaptain
} = useUser()

const toast = useToast()

// Bio editing state
const isEditingBio = ref(false)
const bioInput = ref('')
const isSavingBio = ref(false)

// Modal states
const isCreateTeamModalOpen = ref(false)
const isJoinTeamModalOpen = ref(false)
const isLeaveTeamModalOpen = ref(false)
const isLogoutModalOpen = ref(false)
const isTeamManageModalOpen = ref(false)
const isDissolveTeamModalOpen = ref(false)

// Team action states
const createTeamName = ref('')
const createTeamDescription = ref('')
const joinInviteToken = ref('')
const isCreatingTeam = ref(false)
const isJoiningTeam = ref(false)
const isLeavingTeam = ref(false)
const isLoggingOut = ref(false)
const isRefreshingToken = ref(false)
const isDissolvingTeam = ref(false)
const isRemovingMember = ref(false)
const isTransferringCaptain = ref(false)
const memberToRemove = ref<{ id: number, nickname: string } | null>(null)
const memberToTransfer = ref<{ id: number, nickname: string } | null>(null)
const isRemoveMemberModalOpen = ref(false)
const isTransferCaptainModalOpen = ref(false)

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
    toast.add({
      title: '更新成功',
      description: '个性签名已更新',
      color: 'success'
    })
  } else {
    toast.add({
      title: '更新失败',
      description: result.error || '请稍后重试',
      color: 'error'
    })
  }
}

// Modal openers
const openCreateTeamModal = () => {
  createTeamName.value = ''
  createTeamDescription.value = ''
  isCreateTeamModalOpen.value = true
}

const openJoinTeamModal = () => {
  joinInviteToken.value = ''
  isJoinTeamModalOpen.value = true
}

const openLeaveTeamModal = () => {
  isLeaveTeamModalOpen.value = true
}

const openTeamManageModal = async () => {
  // Fetch latest team details
  await getMyTeam()
  // Fetch invite token for captains (getMyTeam doesn't return inviteToken)
  if (isCaptain.value) {
    await getInviteToken()
  }
  isTeamManageModalOpen.value = true
}

const openDissolveTeamModal = () => {
  isDissolveTeamModalOpen.value = true
}

// Team action handlers
const handleCreateTeam = async () => {
  if (!createTeamName.value.trim()) return

  isCreatingTeam.value = true
  const result = await createTeam(createTeamName.value.trim(), createTeamDescription.value.trim())
  isCreatingTeam.value = false

  if (result.success) {
    isCreateTeamModalOpen.value = false
    toast.add({
      title: '创建成功',
      description: '战队已创建，邀请令牌已生成',
      color: 'success'
    })
  } else {
    toast.add({
      title: '创建失败',
      description: result.error || '请稍后重试',
      color: 'error'
    })
  }
}

const handleJoinTeam = async () => {
  if (!joinInviteToken.value.trim()) return

  isJoiningTeam.value = true
  const result = await joinTeam(joinInviteToken.value.trim())
  isJoiningTeam.value = false

  if (result.success) {
    isJoinTeamModalOpen.value = false
    toast.add({
      title: '加入成功',
      description: `已加入战队 ${result.team?.name}`,
      color: 'success'
    })
  } else {
    toast.add({
      title: '加入失败',
      description: result.error || '请稍后重试',
      color: 'error'
    })
  }
}

const handleLeaveTeam = async () => {
  isLeavingTeam.value = true
  const result = await leaveTeam()
  isLeavingTeam.value = false

  if (result.success) {
    isLeaveTeamModalOpen.value = false
    toast.add({
      title: '退出成功',
      description: '您已退出战队',
      color: 'success'
    })
  } else {
    toast.add({
      title: '退出失败',
      description: result.error || '请稍后重试',
      color: 'error'
    })
  }
}

const handleRefreshInviteToken = async () => {
  isRefreshingToken.value = true
  const result = await refreshTeamInviteToken()
  isRefreshingToken.value = false

  if (result.success) {
    toast.add({
      title: '刷新成功',
      description: '邀请令牌已更新，旧令牌已失效',
      color: 'success'
    })
  } else {
    toast.add({
      title: '刷新失败',
      description: result.error || '请稍后重试',
      color: 'error'
    })
  }
}

const handleDissolveTeam = async () => {
  isDissolvingTeam.value = true
  const result = await dissolveTeam()
  isDissolvingTeam.value = false

  if (result.success) {
    isDissolveTeamModalOpen.value = false
    isTeamManageModalOpen.value = false
    toast.add({
      title: '解散成功',
      description: '战队已解散',
      color: 'success'
    })
  } else {
    toast.add({
      title: '解散失败',
      description: result.error || '请稍后重试',
      color: 'error'
    })
  }
}

// Remove member handlers
const openRemoveMemberModal = (member: { id: number, nickname: string }) => {
  memberToRemove.value = member
  isRemoveMemberModalOpen.value = true
}

const handleRemoveMember = async () => {
  if (!memberToRemove.value) return

  isRemovingMember.value = true
  const result = await removeMember(memberToRemove.value.id)
  isRemovingMember.value = false

  if (result.success) {
    isRemoveMemberModalOpen.value = false
    memberToRemove.value = null
    toast.add({
      title: '移除成功',
      description: '成员已被移出战队',
      color: 'success'
    })
  } else {
    toast.add({
      title: '移除失败',
      description: result.error || '请稍后重试',
      color: 'error'
    })
  }
}

// Transfer captain handlers
const openTransferCaptainModal = (member: { id: number, nickname: string }) => {
  memberToTransfer.value = member
  isTransferCaptainModalOpen.value = true
}

const handleTransferCaptain = async () => {
  if (!memberToTransfer.value) return

  isTransferringCaptain.value = true
  const result = await transferCaptain(memberToTransfer.value.id)
  isTransferringCaptain.value = false

  if (result.success) {
    isTransferCaptainModalOpen.value = false
    memberToTransfer.value = null
    toast.add({
      title: '转让成功',
      description: '队长已成功转让',
      color: 'success'
    })
    // Refresh team data
    await getMyTeam()
  } else {
    toast.add({
      title: '转让失败',
      description: result.error || '请稍后重试',
      color: 'error'
    })
  }
}

const copyInviteToken = () => {
  if (user.value?.team?.inviteToken) {
    navigator.clipboard.writeText(user.value.team.inviteToken)
    toast.add({
      title: '已复制',
      description: '邀请令牌已复制到剪贴板',
      color: 'success'
    })
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
  // Initialize stored user from localStorage
  initUser()

  // Check if user is logged in
  if (!isLoggedIn.value) {
    toast.add({
      title: '请先登录',
      description: '您需要登录后才能访问个人中心',
      color: 'warning'
    })
    navigateTo('/login')
    return
  }

  // Fetch full user profile
  fetchUser()
})
</script>
