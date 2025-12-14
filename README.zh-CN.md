# NKCTF Frontend

<div align="center">

一个基于 Nuxt.js 构建的现代化 CTF 竞赛平台前端系统

[功能特性](#功能特性) • [快速开始](#快速开始) • [项目结构](#项目结构) • [开发指南](#开发指南)

[English](./README.md) | 简体中文

</div>

---

## 项目简介

NKCTF Frontend 是 NKCTF 项目的前端子系统，旨在为高校网络安全竞赛训练提供一个现代化、易用的 Web 平台。本项目基于 Nuxt.js 生态系统构建，采用 TypeScript 开发，提供了挑战管理、排行榜、用户系统等核心功能。

### 功能特性

- 🎯 **挑战系统** - 支持多类型 CTF 挑战（Web、Pwn、Reverse、Crypto 等）
- 🏆 **实时排行榜** - 动态展示用户排名和得分统计
- 👤 **用户系统** - 完整的用户注册、登录和个人资料管理
- 🖥️ **终端挑战** - 内置终端模拟器支持交互式挑战
- 🎨 **现代化 UI** - 基于 Nuxt UI 3 的响应式设计
- 📱 **移动端适配** - 完美支持移动设备访问
- 🔒 **安全性** - XSS 防护、输入验证等安全措施
- ♿ **无障碍** - 符合 ARIA 标准的可访问性设计

## 技术栈

### 核心框架
- **[Nuxt.js](https://nuxt.com/)** (v4.x) - Vue.js 全栈框架
- **[Vue.js](https://vuejs.org/)** (v3.x) - 渐进式 JavaScript 框架
- **[TypeScript](https://www.typescriptlang.org/)** (v5.x) - 类型安全的 JavaScript 超集

### UI 与样式
- **[Nuxt UI](https://ui.nuxt.com/)** (v4.x) - 基于 Tailwind CSS 的 UI 组件库
- **[Iconify](https://iconify.design/)** - 图标解决方案

### 开发工具
- **[ESLint](https://eslint.org/)** - JavaScript/TypeScript 代码检查工具
- **[Prettier](https://prettier.io/)** - 代码格式化工具
- **[pnpm](https://pnpm.io/)** - 快速、节省磁盘空间的包管理器

### 其他依赖
- **[Marked](https://marked.js.org/)** - Markdown 解析器
- **[Pinia](https://pinia.vuejs.org/)** - Vue 状态管理库

## 快速开始

### 环境要求

确保你的开发环境满足以下要求：

- **Node.js**: ≥ 20.0.0
- **包管理器**: pnpm ≥ 10.0.0 或 npm ≥ 10.0.0

### 安装依赖

```bash
# 克隆仓库
git clone <repository-url>
cd nkctf-frontend

# 使用 pnpm 安装依赖（推荐）
pnpm install

# 或使用 npm 安装依赖
npm install
```

### 开发模式

```bash
# 使用 pnpm 启动开发服务器（默认运行在 http://localhost:3000）
pnpm dev

# 或使用 npm 启动开发服务器
npm run dev
```

### 生产构建

```bash
# 使用 pnpm 构建生产版本
pnpm build

# 或使用 npm 构建生产版本
npm run build

# 使用 pnpm 预览生产构建
pnpm preview

# 或使用 npm 预览生产构建
npm run preview
```

### 代码检查与格式化

```bash
# 使用 pnpm 运行 ESLint 代码检查
pnpm lint

# 或使用 npm 运行 ESLint 代码检查
npm run lint

# 使用 pnpm 运行 TypeScript 类型检查
pnpm typecheck

# 或使用 npm 运行 TypeScript 类型检查
npm run typecheck
```

## 项目结构

```plaintext
nkctf-frontend/
├── app/                      # Nuxt 应用目录
│   ├── assets/              # 静态资源（图片、字体等）
│   │   └── css/             # 全局样式文件
│   ├── components/          # 公共组件（自动导入）
│   │   ├── challenges/      # 挑战相关组件
│   │   ├── common/          # 通用组件
│   │   ├── leaderboard/     # 排行榜组件
│   │   └── ui/              # 基础 UI 组件（可结合 Nuxt UI）
│   ├── composables/         # 组合式函数（自动导入）
│   │   ├── useChallenges.ts # 挑战相关逻辑
│   │   ├── useTerminal.ts   # 终端功能逻辑
│   │   └── useUser.ts       # 用户相关逻辑
│   ├── layouts/             # 布局组件
│   │   ├── default.vue      # 默认布局（含导航栏）
│   │   └── terminal.vue     # 终端挑战专用布局
│   ├── pages/               # 页面（基于文件的路由）
│   │   ├── index.vue              # 平台首页/挑战大厅
│   │   ├── challenges/
│   │   │   ├── index.vue          # 挑战列表页
│   │   │   └── [id].vue           # 挑战详情页（动态路由）
│   │   ├── profile/
│   │   │   ├── index.vue          # 用户中心列表页
│   │   │   └── [id].vue           # 特定用户详情页（动态路由）
│   │   ├── leaderboard/
│   │   │   └── index.vue          # 排行榜列表页
│   │   ├── learn/
│   │   │   ├── index.vue          # 学习指南列表页
│   │   │   └── [id].vue           # 学习指南文章详情页（动态路由）
│   │   ├── contests/
│   │   │   ├── index.vue          # 竞赛列表页
│   │   │   └── [id]/
│   │   │       ├── challenges.vue # 竞赛赛题详情页（动态路由）
│   │   │       ├── index.vue      # 竞赛详情页（动态路由）
│   │   │       └── register.vue   # 竞赛报名页（动态路由）
│   │   └── admin/                 # 管理后台
│   ├── server/              # 服务器端 API 与逻辑
│   │   ├── api/             # API 路由（如：提交 Flag）
│   │   └── middleware/      # 服务器中间件（如：身份验证）
│   └── app.config.ts        # 应用配置
├── public/                  # 静态资源（无需构建）
├── .editorconfig           # 编辑器配置
├── .github/                # GitHub Actions CI/CD
├── eslint.config.mjs       # ESLint 配置
├── nuxt.config.ts          # Nuxt 主配置文件
├── package.json            # 项目依赖和脚本
├── pnpm-lock.yaml          # pnpm 依赖锁定文件
├── tsconfig.json           # TypeScript 配置
└── README.md               # 项目说明文档
```

## 开发指南

### 代码规范

本项目遵循严格的代码规范。

#### 关键规范摘要

**命名约定**
- 组件文件：使用 `PascalCase`（如 `ChallengeCard.vue`）
- 其他文件：使用 `camelCase`（如 `useChallenges.ts`）
- 常量：使用 `UPPER_SNAKE_CASE`（如 `API_BASE_URL`）

**组件开发**
- 优先使用 `<script setup>` 语法
- 使用 `@` 代替 `v-on:`，`:` 代替 `v-bind:`
- 超过 2 个属性时，每个属性独占一行
- 事件名使用 `kebab-case`（如 `@submit-flag`）

**代码组织**
```vue
<template>
  <!-- 1. 模板 -->
</template>

<script setup lang="ts">
// 2.1 导入
// 2.2 Props/Emits
// 2.3 组合式函数和状态
// 2.4 计算属性
// 2.5 监听器
// 2.6 方法
// 2.7 生命周期钩子
</script>

<style scoped lang="scss">
/* 3. 样式 */
</style>
```

**安全最佳实践**
- 避免直接渲染未过滤的用户输入，防止 XSS 攻击
- 对所有用户提交的数据进行验证和清理
- 使用 HTTPS 进行敏感数据传输

**性能优化**
- 大列表使用虚拟滚动
- 合理使用 `computed` 和 `watch`
- 避免不必要的响应式数据

### 组件开发

#### 创建新组件

```bash
# 在 app/components 目录下创建组件
# 组件会自动注册，无需手动导入
app/components/challenges/NewChallenge.vue
```

#### 组件示例

```vue
<template>
  <UCard>
    <template #header>
      <h3>{{ challenge.title }}</h3>
    </template>

    <p>{{ challenge.description }}</p>

    <template #footer>
      <UButton @click="submitFlag">
        提交 Flag
      </UButton>
    </template>
  </UCard>
</template>

<script setup lang="ts">
import type { Challenge } from '@/types'

interface Props {
  challenge: Challenge
}

const props = defineProps<Props>()

const submitFlag = () => {
  // 提交逻辑
}
</script>
```

### 创建新页面

在 `app/pages/` 目录下创建 `.vue` 文件，Nuxt 会自动生成路由：

```plaintext
app/pages/
├── index.vue           → /
├── about.vue           → /about
└── challenges/
    ├── index.vue       → /challenges
    └── [id].vue        → /challenges/:id
```

### 状态管理

使用 Pinia 进行全局状态管理：

```typescript
// app/stores/useChallengeStore.ts
import { defineStore } from 'pinia'

export const useChallengeStore = defineStore('challenge', () => {
  const challenges = ref([])

  const fetchChallenges = async () => {
    // 获取挑战数据
  }

  return {
    challenges,
    fetchChallenges
  }
})
```

### API 开发

在 `app/server/api/` 目录下创建 API 路由：

```typescript
// app/server/api/submit-flag.post.ts
export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  // 处理 Flag 提交逻辑

  return {
    success: true,
    message: 'Flag 提交成功'
  }
})
```

## 贡献指南

我们欢迎所有形式的贡献！在提交贡献之前，请确保：

1. 代码遵循项目的代码规范
2. 所有测试通过
3. 提交信息清晰明确
4. 更新相关文档

### 提交流程

```bash
# 1. Fork 并克隆仓库
git clone <your-fork-url>

# 2. 创建功能分支
git checkout -b feature/your-feature-name

# 3. 进行开发并提交
git add .
git commit -m "feat: 添加新功能"

# 4. 推送到你的 Fork
git push origin feature/your-feature-name

# 5. 创建 Pull Request
```

### Commit 规范

使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

- `feat:` 新功能
- `fix:` 修复 Bug
- `docs:` 文档更新
- `style:` 代码格式调整（不影响功能）
- `refactor:` 代码重构
- `perf:` 性能优化
- `test:` 测试相关
- `chore:` 构建过程或辅助工具的变动

## 常见问题

### 端口被占用

如果 3000 端口被占用，可以指定其他端口：

```bash
PORT=3001 pnpm dev
```

### 构建错误

清除缓存并重新安装依赖：

```bash
rm -rf node_modules .nuxt
pnpm install
```

### TypeScript 错误

运行类型检查查看详细错误信息：

```bash
pnpm typecheck
```

## 许可证

本项目采用 MIT 许可证。详见 [LICENSE](./LICENSE) 文件。

## 联系方式

如有问题或建议，请通过以下方式联系我们：

- 提交 [Issue](../../issues)
- 发起 [Discussion](../../discussions)

---

<div align="center">

[![回到顶部](https://img.shields.io/badge/回到顶部-⬆-blue?style=for-the-badge)](#nkctf-frontend)

Made with ❤️ by **NKCTF Team**

</div>
