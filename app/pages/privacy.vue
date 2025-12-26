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
            name="i-lucide-shield"
            class="w-8 h-8 text-primary-500"
          />
        </div>
        <h1 class="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          隐私政策
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
            NKCTF（宁波大学科学技术学院网络安全竞赛训练平台）重视用户隐私保护。本隐私政策说明我们如何收集、使用、存储和保护您的个人信息。使用本平台即表示您同意本隐私政策的内容。
          </p>
        </section>

        <!-- Section 1 -->
        <UCard
          class="mb-6"
          :ui="{ body: 'p-6' }"
        >
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <span class="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center text-sm font-bold text-primary-700 dark:text-primary-300">1</span>
            信息收集
          </h2>
          <div class="text-gray-700 dark:text-gray-300 space-y-3">
            <p>我们可能收集以下类型的信息：</p>
            <h3 class="font-medium text-gray-900 dark:text-white mt-4">
              1.1 您主动提供的信息
            </h3>
            <ul class="list-disc list-inside space-y-2 ml-4">
              <li>注册信息：用户名、电子邮箱、密码</li>
              <li>个人资料：昵称、头像、个人简介</li>
              <li>竞赛信息：团队名称、参赛信息</li>
            </ul>
            <h3 class="font-medium text-gray-900 dark:text-white mt-4">
              1.2 自动收集的信息
            </h3>
            <ul class="list-disc list-inside space-y-2 ml-4">
              <li>设备信息：设备类型、操作系统、浏览器类型</li>
              <li>日志数据：IP 地址、访问时间、页面浏览记录</li>
              <li>使用数据：答题记录、得分情况、学习进度</li>
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
            信息使用
          </h2>
          <div class="text-gray-700 dark:text-gray-300 space-y-3">
            <p>我们使用收集的信息用于：</p>
            <ul class="list-disc list-inside space-y-2 ml-4">
              <li>提供、维护和改进平台服务</li>
              <li>创建和管理您的账户</li>
              <li>显示排行榜和竞赛成绩</li>
              <li>发送服务相关通知（如密码重置、系统更新）</li>
              <li>分析平台使用情况以改进用户体验</li>
              <li>防止欺诈和滥用行为</li>
              <li>遵守法律法规要求</li>
            </ul>
          </div>
        </UCard>

        <!-- Section 3 -->
        <UCard
          class="mb-6"
          :ui="{ body: 'p-6' }"
        >
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <span class="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center text-sm font-bold text-primary-700 dark:text-primary-300">3</span>
            信息共享
          </h2>
          <div class="text-gray-700 dark:text-gray-300 space-y-3">
            <p>我们不会出售您的个人信息。在以下情况下，我们可能会共享您的信息：</p>
            <ul class="list-disc list-inside space-y-2 ml-4">
              <li>
                <strong>公开展示：</strong>您的用户名、昵称、排名和得分将在排行榜上公开显示
              </li>
              <li>
                <strong>团队成员：</strong>加入团队后，团队管理员可查看您的基本信息
              </li>
              <li>
                <strong>法律要求：</strong>应法律法规、政府机关或司法程序要求披露
              </li>
              <li>
                <strong>安全保护：</strong>为保护平台、用户或公众的权益和安全
              </li>
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
            数据安全
          </h2>
          <div class="text-gray-700 dark:text-gray-300 space-y-3">
            <p>我们采取多种安全措施保护您的个人信息：</p>
            <ul class="list-disc list-inside space-y-2 ml-4">
              <li>使用加密技术传输和存储敏感数据</li>
              <li>密码采用安全的哈希算法存储</li>
              <li>定期安全审计和漏洞检测</li>
              <li>访问控制和权限管理</li>
              <li>数据备份和灾难恢复机制</li>
            </ul>
            <p class="mt-4">
              尽管我们努力保护您的信息安全，但互联网传输不能保证绝对安全。请妥善保管您的账号密码。
            </p>
          </div>
        </UCard>

        <!-- Section 5 -->
        <UCard
          class="mb-6"
          :ui="{ body: 'p-6' }"
        >
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <span class="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center text-sm font-bold text-primary-700 dark:text-primary-300">5</span>
            Cookie 使用
          </h2>
          <div class="text-gray-700 dark:text-gray-300 space-y-3">
            <p>我们使用 Cookie 和类似技术来：</p>
            <ul class="list-disc list-inside space-y-2 ml-4">
              <li>保持您的登录状态</li>
              <li>记住您的偏好设置（如深色模式）</li>
              <li>分析平台访问和使用情况</li>
              <li>防止恶意攻击和滥用</li>
            </ul>
            <p class="mt-4">
              您可以通过浏览器设置管理 Cookie，但禁用 Cookie 可能影响部分功能的正常使用。
            </p>
          </div>
        </UCard>

        <!-- Section 6 -->
        <UCard
          class="mb-6"
          :ui="{ body: 'p-6' }"
        >
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <span class="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center text-sm font-bold text-primary-700 dark:text-primary-300">6</span>
            您的权利
          </h2>
          <div class="text-gray-700 dark:text-gray-300 space-y-3">
            <p>关于您的个人信息，您享有以下权利：</p>
            <ul class="list-disc list-inside space-y-2 ml-4">
              <li>
                <strong>访问权：</strong>查看我们持有的您的个人信息
              </li>
              <li>
                <strong>更正权：</strong>更新或更正您的个人资料
              </li>
              <li>
                <strong>删除权：</strong>请求删除您的账户和相关数据
              </li>
              <li>
                <strong>数据导出：</strong>请求导出您的个人数据副本
              </li>
              <li>
                <strong>撤回同意：</strong>撤回之前给予的数据处理同意
              </li>
            </ul>
            <p class="mt-4">
              如需行使上述权利，请通过下方联系方式与我们联系。
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
            未成年人保护
          </h2>
          <div class="text-gray-700 dark:text-gray-300 space-y-3">
            <p>
              本平台主要面向高等院校学生和网络安全爱好者。如果您是未满 18 周岁的未成年人，请在监护人指导下使用本平台。我们不会故意收集 14 周岁以下儿童的个人信息。
            </p>
          </div>
        </UCard>

        <!-- Section 8 -->
        <UCard
          class="mb-6"
          :ui="{ body: 'p-6' }"
        >
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <span class="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center text-sm font-bold text-primary-700 dark:text-primary-300">8</span>
            政策更新
          </h2>
          <div class="text-gray-700 dark:text-gray-300 space-y-3">
            <p>
              我们可能会不时更新本隐私政策。更新后的政策将在平台上公布，重大变更将通过邮件或平台通知方式告知您。继续使用本平台即表示您接受更新后的政策。
            </p>
          </div>
        </UCard>

        <!-- Section 9 -->
        <UCard
          class="mb-6"
          :ui="{ body: 'p-6' }"
        >
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <span class="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center text-sm font-bold text-primary-700 dark:text-primary-300">9</span>
            联系我们
          </h2>
          <div class="text-gray-700 dark:text-gray-300 space-y-3">
            <p>
              如果您对本隐私政策有任何疑问、意见或投诉，请通过以下方式联系我们：
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
            <p class="mt-4 text-sm text-gray-500 dark:text-gray-400">
              我们将在收到请求后 15 个工作日内回复您。
            </p>
          </div>
        </UCard>

        <!-- Footer Links -->
        <div class="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
          <div class="flex flex-wrap items-center justify-between gap-4">
            <NuxtLink
              to="/terms"
              class="text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-2"
            >
              <UIcon
                name="i-lucide-file-text"
                class="w-4 h-4"
              />
              查看服务条款
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
  title: '隐私政策 - NKCTF',
  description: 'NKCTF 网络安全竞赛训练平台隐私政策，了解我们如何收集、使用和保护您的个人信息。'
})
</script>
