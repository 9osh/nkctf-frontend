<script setup lang="ts">
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
</script>

<template>
  <UApp>
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
