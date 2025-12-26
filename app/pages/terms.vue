<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-950">
    <!-- Header -->
    <div class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      <div class="max-w-4xl mx-auto px-6 py-12">
        <div class="flex items-center gap-3 mb-4">
          <UButton
            icon="i-lucide-arrow-left"
            color="neutral"
            variant="ghost"
            size="sm"
            aria-label="返回首页"
            to="/"
          />
          <UIcon
            name="i-lucide-file-text"
            class="w-8 h-8 text-primary-500"
          />
        </div>
        <h1 class="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          服务条款
        </h1>
        <p class="text-gray-600 dark:text-gray-400">
          最后更新日期：2025 年 12 月
        </p>
      </div>
    </div>

    <!-- Content -->
    <div class="max-w-4xl mx-auto px-6 py-12">
      <div class="prose prose-gray dark:prose-invert max-w-none">
        <!-- Introduction -->
        <section class="mb-12">
          <p class="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
            欢迎使用 NKCTF（宁波大学科学技术学院网络安全竞赛训练平台）。在使用本平台之前，请您仔细阅读以下服务条款。使用本平台即表示您同意接受这些条款的约束。
          </p>
        </section>

        <!-- Section 1 -->
        <UCard
          class="mb-6"
          :ui="{ body: 'p-6' }"
        >
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <span class="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center text-sm font-bold text-primary-700 dark:text-primary-300">1</span>
            服务说明
          </h2>
          <div class="text-gray-700 dark:text-gray-300 space-y-3">
            <p>
              NKCTF 是一个网络安全竞赛训练平台，旨在为宁波大学科学技术学院及网络安全爱好者提供 CTF（Capture The Flag）竞赛训练服务。本平台提供：
            </p>
            <ul class="list-disc list-inside space-y-2 ml-4">
              <li>各类网络安全挑战题目（Web、Pwn、Crypto、Reverse、Misc 等）</li>
              <li>实时排行榜和积分系统</li>
              <li>学习资源和指南文章</li>
              <li>动态容器环境支持</li>
              <li>团队协作和竞赛功能</li>
            </ul>
          </div>
        </UCard>

        <!-- Section 2 -->
        <UCard
          class="mb-6"
          :ui="{ body: 'p-6' }"
        >
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <span class="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center text-sm font-bold text-primary-700 dark:text-primary-300">2</span>
            用户注册与账号
          </h2>
          <div class="text-gray-700 dark:text-gray-300 space-y-3">
            <p>使用本平台的部分功能需要注册账号。注册时，您需要：</p>
            <ul class="list-disc list-inside space-y-2 ml-4">
              <li>提供真实、准确的个人信息</li>
              <li>使用有效的电子邮箱地址</li>
              <li>妥善保管您的账号密码</li>
              <li>对使用您账号进行的所有活动负责</li>
            </ul>
            <p class="mt-4">
              我们保留在发现违规行为时暂停或终止账号的权利。
            </p>
          </div>
        </UCard>

        <!-- Section 3 -->
        <UCard
          class="mb-6"
          :ui="{ body: 'p-6' }"
        >
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <span class="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center text-sm font-bold text-primary-700 dark:text-primary-300">3</span>
            使用规范
          </h2>
          <div class="text-gray-700 dark:text-gray-300 space-y-3">
            <p>在使用本平台时，您同意：</p>
            <ul class="list-disc list-inside space-y-2 ml-4">
              <li>仅在平台提供的环境中进行安全测试和练习</li>
              <li>不对平台基础设施进行未授权的攻击或渗透测试</li>
              <li>不分享、泄露题目的 Flag 或解题思路（除官方 Writeup 外）</li>
              <li>不使用自动化工具批量提交答案或刷分</li>
              <li>不冒充他人或使用多账号作弊</li>
              <li>不传播恶意软件或有害内容</li>
              <li>尊重其他用户，不进行骚扰或歧视行为</li>
            </ul>
          </div>
        </UCard>

        <!-- Section 4 -->
        <UCard
          class="mb-6"
          :ui="{ body: 'p-6' }"
        >
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <span class="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center text-sm font-bold text-primary-700 dark:text-primary-300">4</span>
            知识产权
          </h2>
          <div class="text-gray-700 dark:text-gray-300 space-y-3">
            <p>
              本平台的所有内容，包括但不限于题目、文章、设计、代码和商标，均受知识产权法律保护。
            </p>
            <ul class="list-disc list-inside space-y-2 ml-4">
              <li>未经授权，不得复制、修改或分发平台内容</li>
              <li>用户提交的 Writeup 等内容，版权归用户所有，但授予平台非独占使用权</li>
              <li>平台可能包含第三方内容，相关权利归原作者所有</li>
            </ul>
          </div>
        </UCard>

        <!-- Section 5 -->
        <UCard
          class="mb-6"
          :ui="{ body: 'p-6' }"
        >
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <span class="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center text-sm font-bold text-primary-700 dark:text-primary-300">5</span>
            免责声明
          </h2>
          <div class="text-gray-700 dark:text-gray-300 space-y-3">
            <ul class="list-disc list-inside space-y-2 ml-4">
              <li>本平台按"现状"提供服务，不对服务的持续性、准确性作出保证</li>
              <li>平台可能因维护、升级等原因暂时中断服务</li>
              <li>对于用户因使用本平台而产生的任何直接或间接损失，平台不承担责任</li>
              <li>本平台仅供学习和训练目的，用户不得将学到的技术用于非法活动</li>
            </ul>
          </div>
        </UCard>

        <!-- Section 6 -->
        <UCard
          class="mb-6"
          :ui="{ body: 'p-6' }"
        >
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <span class="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center text-sm font-bold text-primary-700 dark:text-primary-300">6</span>
            条款修改
          </h2>
          <div class="text-gray-700 dark:text-gray-300 space-y-3">
            <p>
              我们保留随时修改本服务条款的权利。修改后的条款将在平台上公布，继续使用本平台即表示您接受修改后的条款。重大修改将通过邮件或平台通知方式告知用户。
            </p>
          </div>
        </UCard>

        <!-- Section 7 -->
        <UCard
          class="mb-6"
          :ui="{ body: 'p-6' }"
        >
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <span class="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center text-sm font-bold text-primary-700 dark:text-primary-300">7</span>
            联系我们
          </h2>
          <div class="text-gray-700 dark:text-gray-300 space-y-3">
            <p>
              如果您对本服务条款有任何疑问，请通过以下方式联系我们：
            </p>
            <div class="flex items-center gap-2 mt-4">
              <UIcon
                name="i-lucide-mail"
                class="w-5 h-5 text-primary-500"
              />
              <a
                href="mailto:contact@nkctf.com"
                class="text-primary-600 dark:text-primary-400 hover:underline"
              >
                contact@nkctf.com
              </a>
            </div>
          </div>
        </UCard>

        <!-- Footer Links -->
        <div class="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
          <div class="flex flex-wrap items-center justify-between gap-4">
            <NuxtLink
              to="/privacy"
              class="text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-2"
            >
              <UIcon
                name="i-lucide-shield"
                class="w-4 h-4"
              />
              查看隐私政策
            </NuxtLink>
            <UButton
              to="/"
              color="primary"
              variant="outline"
            >
              返回首页
            </UButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
useSeoMeta({
  title: '服务条款 - NKCTF',
  description: 'NKCTF 网络安全竞赛训练平台服务条款，了解平台使用规范和用户权利义务。'
})
</script>
