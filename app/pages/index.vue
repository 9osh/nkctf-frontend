<template>
  <div class="flex flex-wrap gap-4 justify-center">
    <!-- Hero Section -->
    <UPageHero
      title="掌握网络安全，从挑战开始"
      description="NKCTF 是宁波大学科学技术学院网络安全竞赛训练平台，提供丰富的 CTF 挑战题目、实时排行榜和专业的学习资源。无论你是初学者还是资深选手，都能在这里找到适合自己的挑战。"
      :ui="{ title: 'text-4xl sm:text-5xl lg:text-6xl', description: 'text-lg sm:text-xl max-w-3xl justify-center' }"
    >
      <template #links>
        <div class="flex flex-wrap gap-4 justify-center">
          <UButton
            to="/challenges"
            size="xl"
            trailing-icon="i-lucide-arrow-right"
            aria-label="开始挑战"
          >
            开始挑战
          </UButton>
          <UButton
            to="/learn"
            size="xl"
            color="neutral"
            variant="subtle"
            icon="i-lucide-book-open"
            aria-label="学习指南"
          >
            学习指南
          </UButton>
        </div>
      </template>
    </UPageHero>

    <!-- Stats Section -->
    <UPageSection class="bg-[var(--ui-bg-elevated)]">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
        <div class="flex flex-col items-center gap-2">
          <UIcon
            name="i-lucide-flag"
            class="w-8 h-8 text-[var(--ui-primary)]"
          />
          <span class="text-3xl sm:text-4xl font-bold text-[var(--ui-text-highlighted)]">200+</span>
          <span class="text-sm text-muted">挑战题目</span>
        </div>
        <div class="flex flex-col items-center gap-2">
          <UIcon
            name="i-lucide-users"
            class="w-8 h-8 text-[var(--ui-primary)]"
          />
          <span class="text-3xl sm:text-4xl font-bold text-[var(--ui-text-highlighted)]">1,500+</span>
          <span class="text-sm text-muted">注册用户</span>
        </div>
        <div class="flex flex-col items-center gap-2">
          <UIcon
            name="i-lucide-trophy"
            class="w-8 h-8 text-[var(--ui-primary)]"
          />
          <span class="text-3xl sm:text-4xl font-bold text-[var(--ui-text-highlighted)]">50+</span>
          <span class="text-sm text-muted">举办比赛</span>
        </div>
        <div class="flex flex-col items-center gap-2">
          <UIcon
            name="i-lucide-check-circle"
            class="w-8 h-8 text-[var(--ui-primary)]"
          />
          <span class="text-3xl sm:text-4xl font-bold text-[var(--ui-text-highlighted)]">10,000+</span>
          <span class="text-sm text-muted">Flag 提交</span>
        </div>
      </div>
    </UPageSection>

    <!-- How It Works Section -->
    <UPageSection
      title="三步开启你的 CTF 之旅"
      description="简单几步，即可开始你的网络安全学习与挑战之旅"
    >
      <div class="grid md:grid-cols-3 gap-8 mt-8">
        <UCard
          :ui="{
            root: 'text-center h-full hover:shadow-lg transition-shadow',
            body: 'flex flex-col items-center gap-4 p-6'
          }"
        >
          <div class="w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center">
            <span class="text-2xl font-bold text-primary-700 dark:text-primary-300">1</span>
          </div>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
            注册账号
          </h3>
          <p class="text-gray-600 dark:text-gray-400 text-sm">
            创建你的个人账号，加入 NICCTF 社区，开始记录你的学习成长历程
          </p>
        </UCard>

        <UCard
          :ui="{
            root: 'text-center h-full hover:shadow-lg transition-shadow',
            body: 'flex flex-col items-center gap-4 p-6'
          }"
        >
          <div class="w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center">
            <span class="text-2xl font-bold text-primary-700 dark:text-primary-300">2</span>
          </div>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
            选择挑战
          </h3>
          <p class="text-gray-600 dark:text-gray-400 text-sm">
            浏览各类 CTF 题目，从 Web、Pwn、Crypto 到 Reverse，选择适合你的挑战
          </p>
        </UCard>

        <UCard
          :ui="{
            root: 'text-center h-full hover:shadow-lg transition-shadow',
            body: 'flex flex-col items-center gap-4 p-6'
          }"
        >
          <div class="w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center">
            <span class="text-2xl font-bold text-primary-700 dark:text-primary-300">3</span>
          </div>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
            提交 Flag
          </h3>
          <p class="text-gray-600 dark:text-gray-400 text-sm">
            完成挑战后提交 Flag，获取积分，在排行榜上展示你的实力
          </p>
        </UCard>
      </div>
    </UPageSection>

    <!-- Features Section -->
    <UPageSection
      id="features"
      title="为什么选择 NKCTF"
      description="专为网络安全爱好者打造的训练平台，提供全面的学习和竞赛体验"
      :features="features"
      class="bg-[var(--ui-bg-elevated)]"
    />

    <!-- Challenge Categories Section -->
    <UPageSection
      title="挑战分类"
      description="涵盖 CTF 竞赛的主流方向，满足不同技能的学习需求"
    >
      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        <UCard
          v-for="category in categories"
          :key="category.name"
          :ui="{
            root: 'hover:border-primary-400 dark:hover:border-primary-600 transition-colors cursor-pointer',
            body: 'p-5'
          }"
        >
          <div class="flex items-start gap-4">
            <div class="w-12 h-12 rounded-lg bg-primary-50 dark:bg-primary-950/30 flex items-center justify-center shrink-0">
              <UIcon
                :name="category.icon"
                class="w-6 h-6 text-primary-600 dark:text-primary-500"
              />
            </div>
            <div>
              <h3 class="font-semibold text-gray-900 dark:text-gray-100">
                {{ category.name }}
              </h3>
              <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {{ category.description }}
              </p>
              <UBadge
                :label="`${category.count} 题`"
                color="primary"
                variant="subtle"
                size="sm"
                class="mt-2"
              />
            </div>
          </div>
        </UCard>
      </div>
    </UPageSection>

    <!-- CTA Section -->
    <UPageSection>
      <UPageCTA
        title="准备好接受挑战了吗？"
        description="立即注册，加入数千名网络安全爱好者的行列，开启你的 CTF 之旅。"
        variant="subtle"
        :links="[{
          label: '立即注册',
          to: '/register',
          trailingIcon: 'i-lucide-arrow-right',
          color: 'primary'
        }, {
          label: '浏览挑战',
          to: '/challenges',
          icon: 'i-lucide-flag',
          color: 'neutral',
          variant: 'outline'
        }]"
      />
    </UPageSection>
  </div>
</template>

<script setup lang="ts">
const features = [
  {
    icon: 'i-lucide-layers',
    title: '丰富的题目类型',
    description: '涵盖 Web、Pwn、Crypto、Reverse、Misc 等多种 CTF 题型，从入门到进阶全覆盖'
  },
  {
    icon: 'i-lucide-bar-chart-3',
    title: '实时排行榜',
    description: '实时更新的积分排行榜，与其他选手一较高下，激发竞争动力'
  },
  {
    icon: 'i-lucide-graduation-cap',
    title: '学习资源',
    description: '配套的学习指南和题目 Writeup，帮助你快速成长'
  },
  {
    icon: 'i-lucide-server',
    title: '动态容器环境',
    description: '支持动态启动独立容器环境，提供真实的攻防体验'
  },
  {
    icon: 'i-lucide-users',
    title: '团队协作',
    description: '支持创建团队参与比赛，培养团队协作能力'
  },
  {
    icon: 'i-lucide-calendar',
    title: '定期比赛',
    description: '定期举办 CTF 比赛，提供与全国高手切磋的机会'
  }
]

const categories = [
  {
    name: 'Web',
    icon: 'i-lucide-globe',
    description: 'Web 安全漏洞利用，包括 SQL 注入、XSS、CSRF 等',
    count: 45
  },
  {
    name: 'Pwn',
    icon: 'i-lucide-bug',
    description: '二进制漏洞利用，栈溢出、堆利用、ROP 等技术',
    count: 38
  },
  {
    name: 'Crypto',
    icon: 'i-lucide-key',
    description: '密码学攻击，古典密码、现代加密算法分析',
    count: 42
  },
  {
    name: 'Reverse',
    icon: 'i-lucide-cpu',
    description: '逆向工程分析，程序调试、算法还原',
    count: 35
  },
  {
    name: 'Misc',
    icon: 'i-lucide-puzzle',
    description: '综合杂项题目，隐写、取证、编程等',
    count: 28
  },
  {
    name: 'Blockchain',
    icon: 'i-lucide-link',
    description: '区块链安全，智能合约漏洞分析',
    count: 12
  }
]
</script>
