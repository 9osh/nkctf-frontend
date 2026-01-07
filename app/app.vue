<script setup lang="ts">
const { storedUser, isLoggedIn, initUser, logout } = useUser()

// Initialize user state from localStorage on mount
onMounted(() => {
  initUser()
})

useHead({
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' }
  ],
  link: [
    { rel: 'icon', href: '/favicon.ico' }
  ],
  htmlAttrs: {
    lang: 'zh-CN'
  }
})

const title = 'NKCTF - 网络安全竞赛训练平台'
const description = '宁波大学科学技术学院网络安全竞赛训练平台，提供丰富的CTF挑战题目、实时排行榜和专业的学习资源，助力网络安全人才成长。'

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  twitterCard: 'summary_large_image'
})

const navLinks = [
  { label: '挑战', to: '/challenges', icon: 'i-lucide-flag' },
  { label: '排行榜', to: '/leaderboard', icon: 'i-lucide-trophy' },
  { label: '学习', to: '/learn', icon: 'i-lucide-book-open' }
]

const userMenuItems = computed(() => [
  [{
    label: storedUser.value?.nickname || storedUser.value?.username || '用户',
    slot: 'account',
    disabled: true
  }],
  [{
    label: '个人中心',
    icon: 'i-lucide-user',
    to: '/profile'
  }],
  [{
    label: '退出登录',
    icon: 'i-lucide-log-out',
    onSelect: () => logout()
  }]
])
</script>

<template>
  <UApp>
    <!-- Connection status indicator -->
    <ConnectionStatus />

    <UHeader>
      <template #left>
        <NuxtLink
          to="/"
          class="flex items-center"
        >
          <AppLogo />
        </NuxtLink>
      </template>

      <template #center>
        <UNavigationMenu :items="navLinks" />
      </template>

      <template #right>
        <UColorModeButton />

        <!-- Show login/register buttons when not logged in -->
        <template v-if="!isLoggedIn">
          <UButton
            to="/login"
            color="neutral"
            variant="ghost"
            aria-label="登录"
          >
            登录
          </UButton>

          <UButton
            to="/register"
            color="primary"
            aria-label="注册"
          >
            注册
          </UButton>
        </template>

        <!-- Show user dropdown when logged in -->
        <UDropdownMenu
          v-else
          :items="userMenuItems"
          :ui="{ content: 'min-w-48' }"
        >
          <UButton
            color="neutral"
            variant="ghost"
            class="flex items-center gap-2"
          >
            <UAvatar
              :alt="storedUser?.nickname || storedUser?.username"
              size="xs"
            />
            <span class="hidden sm:inline">{{ storedUser?.nickname || storedUser?.username }}</span>
            <UIcon
              name="i-lucide-chevron-down"
              class="w-4 h-4"
            />
          </UButton>

          <template #account>
            <div class="text-left">
              <p class="font-medium truncate">
                {{ storedUser?.nickname || storedUser?.username }}
              </p>
              <p class="text-xs text-muted truncate">
                @{{ storedUser?.username }}
              </p>
            </div>
          </template>
        </UDropdownMenu>
      </template>
    </UHeader>

    <UMain>
      <NuxtPage />
    </UMain>

    <USeparator />

    <UFooter>
      <template #left>
        <div class="flex flex-col gap-1">
          <AppLogo />
          <p class="text-sm text-muted mt-2">
            宁波大学科学技术学院网络安全竞赛训练平台
          </p>
          <p class="text-xs text-muted">
            &copy; {{ new Date().getFullYear() }} NKCTF. All rights reserved.
          </p>
        </div>
      </template>

      <template #center>
        <div class="flex items-center gap-4 text-sm">
          <NuxtLink
            to="/terms"
            class="text-muted hover:text-[var(--ui-text)] transition-colors"
          >
            服务条款
          </NuxtLink>
          <NuxtLink
            to="/privacy"
            class="text-muted hover:text-[var(--ui-text)] transition-colors"
          >
            隐私政策
          </NuxtLink>
        </div>
      </template>

      <template #right>
        <div class="flex gap-2">
          <UButton
            to="https://github.com/9osh/nkctf-frontend"
            target="_blank"
            icon="i-simple-icons-github"
            aria-label="GitHub"
            color="neutral"
            variant="ghost"
          />
          <UButton
            to="mailto:contact@nkctf.com"
            icon="i-lucide-mail"
            aria-label="联系我们"
            color="neutral"
            variant="ghost"
          />
        </div>
      </template>
    </UFooter>
  </UApp>
</template>
