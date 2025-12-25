<template>
  <NuxtLayout name="dashboard">
    <template #header-left>
      <div class="flex items-center gap-3">
        <UIcon
          name="i-lucide-users"
          class="w-6 h-6 text-primary-500"
        />
        <h1 class="text-xl font-semibold text-gray-900 dark:text-white">
          用户管理
        </h1>
        <UBadge
          :label="`${adminUserPagination.total} 人`"
          color="primary"
          variant="subtle"
        />
      </div>
    </template>

    <div class="p-6">
      <!-- Filters -->
      <div class="flex flex-wrap items-center gap-4 mb-6">
        <!-- Role Filter -->
        <USelectMenu
          v-model="selectedRole"
          :items="roleOptions"
          value-key="value"
          placeholder="所有角色"
          class="w-36"
          @update:model-value="handleFilterChange"
        />

        <!-- Enabled Filter -->
        <USelectMenu
          v-model="selectedEnabled"
          :items="enabledOptions"
          value-key="value"
          placeholder="所有状态"
          class="w-36"
          @update:model-value="handleFilterChange"
        />

        <!-- Search -->
        <UInput
          v-model="searchQuery"
          placeholder="搜索用户名/昵称/邮箱..."
          icon="i-lucide-search"
          size="sm"
          class="w-72"
          @keyup.enter="handleSearch"
        />
      </div>

      <!-- Loading State -->
      <div
        v-if="isLoading"
        class="space-y-4"
      >
        <div
          v-for="i in 5"
          :key="i"
        >
          <UCard
            :ui="{
              root: 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800',
              body: 'p-5'
            }"
          >
            <div class="flex items-start justify-between">
              <div class="flex items-center gap-4">
                <USkeleton class="h-12 w-12 rounded-full" />
                <div>
                  <USkeleton class="h-5 w-32 mb-2" />
                  <USkeleton class="h-4 w-48" />
                </div>
              </div>
              <USkeleton class="h-8 w-24" />
            </div>
          </UCard>
        </div>
      </div>

      <!-- User List -->
      <div
        v-else
        class="space-y-4"
      >
        <UCard
          v-for="user in adminUsers"
          :key="user.id"
          :ui="{
            root: 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800',
            body: 'p-5'
          }"
        >
          <div class="flex items-center justify-between gap-4">
            <!-- User Info -->
            <div class="flex items-center gap-4 min-w-0">
              <UAvatar
                :alt="user.nickname || user.username"
                size="lg"
                class="flex-shrink-0"
              />
              <div class="min-w-0">
                <div class="flex items-center gap-2 mb-1 flex-wrap">
                  <span class="font-semibold text-gray-900 dark:text-white truncate">
                    {{ user.nickname || user.username }}
                  </span>
                  <UBadge
                    :label="user.role === 'ADMIN' ? '管理员' : '用户'"
                    :color="user.role === 'ADMIN' ? 'primary' : 'neutral'"
                    variant="subtle"
                    size="xs"
                  />
                  <UBadge
                    :label="user.enabled ? '已启用' : '已禁用'"
                    :color="user.enabled ? 'success' : 'error'"
                    variant="subtle"
                    size="xs"
                  />
                </div>
                <div class="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                  <span class="flex items-center gap-1">
                    <UIcon
                      name="i-lucide-at-sign"
                      class="w-3.5 h-3.5"
                    />
                    {{ user.username }}
                  </span>
                  <span class="flex items-center gap-1">
                    <UIcon
                      name="i-lucide-mail"
                      class="w-3.5 h-3.5"
                    />
                    {{ user.email }}
                  </span>
                  <span class="flex items-center gap-1">
                    <UIcon
                      name="i-lucide-trophy"
                      class="w-3.5 h-3.5"
                    />
                    {{ user.points }} 积分
                  </span>
                  <span
                    v-if="user.teamName"
                    class="flex items-center gap-1"
                  >
                    <UIcon
                      name="i-lucide-users"
                      class="w-3.5 h-3.5"
                    />
                    {{ user.teamName }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex items-center gap-2 flex-shrink-0">
              <!-- Toggle Enabled -->
              <UButton
                :icon="user.enabled ? 'i-lucide-user-x' : 'i-lucide-user-check'"
                :color="user.enabled ? 'warning' : 'success'"
                variant="ghost"
                size="sm"
                :aria-label="user.enabled ? '禁用' : '启用'"
                @click="handleToggleEnabled(user)"
              />

              <!-- Change Role -->
              <UButton
                icon="i-lucide-shield"
                color="neutral"
                variant="ghost"
                size="sm"
                aria-label="更改角色"
                @click="openRoleModal(user)"
              />

              <!-- Delete -->
              <UButton
                icon="i-lucide-trash-2"
                color="error"
                variant="ghost"
                size="sm"
                aria-label="删除"
                @click="handleDelete(user)"
              />
            </div>
          </div>
        </UCard>
      </div>

      <!-- Empty State -->
      <div
        v-if="!isLoading && adminUsers.length === 0"
        class="flex flex-col items-center justify-center py-16"
      >
        <UIcon
          name="i-lucide-users-round"
          class="w-16 h-16 text-gray-300 dark:text-gray-700 mb-4"
        />
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
          没有找到用户
        </h3>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          尝试调整筛选条件
        </p>
      </div>

      <!-- Pagination -->
      <div
        v-if="adminUsers.length > 0"
        class="flex items-center justify-between mt-8"
      >
        <p class="text-sm text-gray-500 dark:text-gray-400">
          显示 {{ (adminUserPagination.page - 1) * adminUserPagination.size + 1 }} -
          {{ Math.min(adminUserPagination.page * adminUserPagination.size, adminUserPagination.total) }} /
          {{ adminUserPagination.total }} 人
        </p>
        <UPagination
          v-model:page="currentPage"
          :total="adminUserPagination.total"
          :page-count="adminUserPagination.size"
          @update:page="handlePageChange"
        />
      </div>
    </div>

    <!-- Role Change Modal -->
    <UModal v-model:open="showRoleModal">
      <template #content>
        <UCard
          v-if="selectedUser"
          :ui="{ root: 'w-full max-w-md' }"
        >
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold">
                更改用户角色
              </h3>
              <UButton
                icon="i-lucide-x"
                color="neutral"
                variant="ghost"
                size="sm"
                @click="showRoleModal = false"
              />
            </div>
          </template>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                用户
              </label>
              <p class="text-gray-900 dark:text-white font-medium">
                {{ selectedUser.nickname || selectedUser.username }}
              </p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                新角色
              </label>
              <USelectMenu
                v-model="newRole"
                :items="roleChangeOptions"
                value-key="value"
                class="w-full"
              />
            </div>
          </div>

          <template #footer>
            <div class="flex justify-end gap-3">
              <UButton
                variant="outline"
                @click="showRoleModal = false"
              >
                取消
              </UButton>
              <UButton
                color="primary"
                :loading="isChangingRole"
                @click="handleChangeRole"
              >
                确认更改
              </UButton>
            </div>
          </template>
        </UCard>
      </template>
    </UModal>
  </NuxtLayout>
</template>

<script setup lang="ts">
import type { AdminUser, UserRole } from '~/composables/useUserAdmin'

// Use admin middleware for route protection
definePageMeta({
  middleware: 'admin'
})

useSeoMeta({
  title: '用户管理 - NKCTF Admin',
  description: '管理平台用户'
})

// Composables
const {
  adminUsers,
  adminUserPagination,
  isLoading,
  fetchUsers,
  toggleUserEnabled,
  changeUserRole,
  deleteUser
} = useUserAdmin()

// State
const selectedRole = ref<UserRole | undefined>(undefined)
const selectedEnabled = ref<boolean | undefined>(undefined)
const searchQuery = ref('')
const currentPage = ref(1)

// Modal state
const showRoleModal = ref(false)
const selectedUser = ref<AdminUser | null>(null)
const newRole = ref<UserRole>('USER')
const isChangingRole = ref(false)

// Filter options
const roleOptions = [
  { label: '所有角色', value: undefined },
  { label: '管理员', value: 'ADMIN' as UserRole },
  { label: '用户', value: 'USER' as UserRole }
]

const enabledOptions = [
  { label: '所有状态', value: undefined },
  { label: '已启用', value: true },
  { label: '已禁用', value: false }
]

const roleChangeOptions = [
  { label: '普通用户', value: 'USER' as UserRole },
  { label: '管理员', value: 'ADMIN' as UserRole }
]

/**
 * Load users
 */
const loadUsers = async () => {
  await fetchUsers({
    role: selectedRole.value,
    enabled: selectedEnabled.value,
    keyword: searchQuery.value || undefined,
    page: currentPage.value
  })
}

/**
 * Handle filter change
 */
const handleFilterChange = () => {
  currentPage.value = 1
  loadUsers()
}

/**
 * Handle search
 */
const handleSearch = () => {
  currentPage.value = 1
  loadUsers()
}

/**
 * Handle page change
 */
const handlePageChange = (page: number) => {
  currentPage.value = page
  loadUsers()
}

/**
 * Handle toggle enabled
 */
const handleToggleEnabled = async (user: AdminUser) => {
  const action = user.enabled ? '禁用' : '启用'
  if (!confirm(`确定要${action}用户 "${user.nickname || user.username}" 吗？`)) {
    return
  }

  await toggleUserEnabled(user.id, !user.enabled)
}

/**
 * Open role change modal
 */
const openRoleModal = (user: AdminUser) => {
  selectedUser.value = user
  newRole.value = user.role
  showRoleModal.value = true
}

/**
 * Handle change role
 */
const handleChangeRole = async () => {
  if (!selectedUser.value) return

  if (newRole.value === selectedUser.value.role) {
    showRoleModal.value = false
    return
  }

  isChangingRole.value = true
  const success = await changeUserRole(selectedUser.value.id, newRole.value)
  isChangingRole.value = false

  if (success) {
    showRoleModal.value = false
  }
}

/**
 * Handle delete
 */
const handleDelete = async (user: AdminUser) => {
  if (!confirm(`确定要删除用户 "${user.nickname || user.username}" 吗？此操作不可恢复。`)) {
    return
  }

  const success = await deleteUser(user.id)
  if (success) {
    await loadUsers()
  }
}

// Initialize
onMounted(() => {
  loadUsers()
})
</script>
