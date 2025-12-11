# NKCTF Frontend

<div align="center">

A modern CTF competition platform frontend system built with Nuxt.js

[Features](#features) • [Quick Start](#quick-start) • [Project Structure](#project-structure) • [Development Guide](#development-guide)

English | [简体中文](./README.zh-CN.md)

</div>

---

## Introduction

NKCTF Frontend is the frontend subsystem of the NKCTF project, designed to provide a modern and user-friendly web platform for college cybersecurity competition training. Built on the Nuxt.js ecosystem and developed with TypeScript, this project offers core features including challenge management, leaderboards, user systems, and more.

### Features

- 🎯 **Challenge System** - Support for multiple CTF challenge types (Web, Pwn, Reverse, Crypto, etc.)
- 🏆 **Real-time Leaderboard** - Dynamic display of user rankings and score statistics
- 👤 **User System** - Complete user registration, login, and profile management
- 🖥️ **Terminal Challenges** - Built-in terminal emulator for interactive challenges
- 🎨 **Modern UI** - Responsive design based on Nuxt UI 3
- 📱 **Mobile Responsive** - Perfect support for mobile device access
- 🔒 **Security** - XSS protection, input validation, and other security measures
- ♿ **Accessibility** - ARIA-compliant accessible design

## Tech Stack

### Core Framework
- **[Nuxt.js](https://nuxt.com/)** (v4.x) - Vue.js full-stack framework
- **[Vue.js](https://vuejs.org/)** (v3.x) - Progressive JavaScript framework
- **[TypeScript](https://www.typescriptlang.org/)** (v5.x) - Type-safe JavaScript superset

### UI & Styling
- **[Nuxt UI](https://ui.nuxt.com/)** (v4.x) - UI component library based on Tailwind CSS
- **[Iconify](https://iconify.design/)** - Icon solution

### Development Tools
- **[ESLint](https://eslint.org/)** - JavaScript/TypeScript linting tool
- **[Prettier](https://prettier.io/)** - Code formatting tool
- **[pnpm](https://pnpm.io/)** - Fast, disk space efficient package manager

### Other Dependencies
- **[Marked](https://marked.js.org/)** - Markdown parser
- **[Pinia](https://pinia.vuejs.org/)** - Vue state management library

## Quick Start

### Prerequisites

Make sure your development environment meets the following requirements:

- **Node.js**: ≥ 20.0.0
- **Package Manager**: pnpm ≥ 10.0.0 or npm ≥ 10.0.0

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd nkctf-frontend

# Install dependencies with pnpm (recommended)
pnpm install

# Or install dependencies with npm
npm install
```

### Development Mode

```bash
# Start development server with pnpm (runs at http://localhost:3000 by default)
pnpm dev

# Or start development server with npm
npm run dev
```

### Production Build

```bash
# Build for production with pnpm
pnpm build

# Or build for production with npm
npm run build

# Preview production build with pnpm
pnpm preview

# Or preview production build with npm
npm run preview
```

### Linting & Type Checking

```bash
# Run ESLint with pnpm
pnpm lint

# Or run ESLint with npm
npm run lint

# Run TypeScript type checking with pnpm
pnpm typecheck

# Or run TypeScript type checking with npm
npm run typecheck
```

## Project Structure

```plaintext
nkctf-frontend/
├── app/                      # Nuxt application directory
│   ├── assets/              # Static resources (images, fonts, etc.)
│   │   └── css/             # Global style files
│   ├── components/          # Public components (auto-imported)
│   │   ├── challenges/      # Challenge-related components
│   │   ├── common/          # Common components
│   │   ├── leaderboard/     # Leaderboard components
│   │   └── ui/              # Basic UI components
│   ├── composables/         # Composable functions (auto-imported)
│   │   ├── useChallenges.ts # Challenge-related logic
│   │   ├── useTerminal.ts   # Terminal functionality logic
│   │   └── useUser.ts       # User-related logic
│   ├── layouts/             # Layout components
│   │   ├── default.vue      # Default layout (with navigation bar)
│   │   └── terminal.vue     # Terminal challenge specific layout
│   ├── pages/               # Pages (file-based routing)
│   │   ├── index.vue              # Platform homepage/challenge lobby
│   │   ├── challenges/
│   │   │   ├── index.vue          # Challenge list page
│   │   │   └── [id].vue           # Challenge detail page (dynamic route)
│   │   ├── leaderboard.vue        # Leaderboard
│   │   ├── profile.vue            # User profile
│   │   └── admin/                 # Admin dashboard
│   ├── server/              # Server-side API and logic
│   │   ├── api/             # API routes (e.g., flag submission)
│   │   └── middleware/      # Server middleware (e.g., authentication)
│   └── app.config.ts        # Application configuration
├── public/                  # Static resources (no build required)
├── .editorconfig           # Editor configuration
├── .github/                # GitHub Actions CI/CD
├── eslint.config.mjs       # ESLint configuration
├── nuxt.config.ts          # Nuxt main configuration file
├── package.json            # Project dependencies and scripts
├── pnpm-lock.yaml          # pnpm dependency lock file
├── tsconfig.json           # TypeScript configuration
└── README.md               # Project documentation
```

## Development Guide

### Code Standards

This project follows strict code standards.

#### Key Standards Summary

**Naming Conventions**
- Component files: Use `PascalCase` (e.g., `ChallengeCard.vue`)
- Other files: Use `camelCase` (e.g., `useChallenges.ts`)
- Constants: Use `UPPER_SNAKE_CASE` (e.g., `API_BASE_URL`)

**Component Development**
- Prefer `<script setup>` syntax
- Use `@` instead of `v-on:`, `:` instead of `v-bind:`
- When more than 2 attributes, each attribute on its own line
- Event names use `kebab-case` (e.g., `@submit-flag`)

**Code Organization**
```vue
<template>
  <!-- 1. Template -->
</template>

<script setup lang="ts">
// 2.1 Imports
// 2.2 Props/Emits
// 2.3 Composables and state
// 2.4 Computed properties
// 2.5 Watchers
// 2.6 Methods
// 2.7 Lifecycle hooks
</script>

<style scoped lang="scss">
/* 3. Styles */
</style>
```

**Security Best Practices**
- Avoid directly rendering unfiltered user input to prevent XSS attacks
- Validate and sanitize all user-submitted data
- Use HTTPS for sensitive data transmission

**Performance Optimization**
- Use virtual scrolling for large lists
- Use `computed` and `watch` appropriately
- Avoid unnecessary reactive data

### Component Development

#### Creating New Components

```bash
# Create components in the app/components directory
# Components are automatically registered without manual import
app/components/challenges/NewChallenge.vue
```

#### Component Example

```vue
<template>
  <UCard>
    <template #header>
      <h3>{{ challenge.title }}</h3>
    </template>

    <p>{{ challenge.description }}</p>

    <template #footer>
      <UButton @click="submitFlag">
        Submit Flag
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
  // Submission logic
}
</script>
```

### Creating New Pages

Create `.vue` files in the `app/pages/` directory, and Nuxt will automatically generate routes:

```plaintext
app/pages/
├── index.vue           → /
├── about.vue           → /about
└── challenges/
    ├── index.vue       → /challenges
    └── [id].vue        → /challenges/:id
```

### State Management

Use Pinia for global state management:

```typescript
// app/stores/useChallengeStore.ts
import { defineStore } from 'pinia'

export const useChallengeStore = defineStore('challenge', () => {
  const challenges = ref([])

  const fetchChallenges = async () => {
    // Fetch challenge data
  }

  return {
    challenges,
    fetchChallenges
  }
})
```

### API Development

Create API routes in the `app/server/api/` directory:

```typescript
// app/server/api/submit-flag.post.ts
export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  // Handle flag submission logic

  return {
    success: true,
    message: 'Flag submitted successfully'
  }
})
```

## Contributing

We welcome all forms of contributions! Before submitting a contribution, please ensure:

1. Code follows the project's code standards
2. All tests pass
3. Commit messages are clear and concise
4. Relevant documentation is updated

### Contribution Workflow

```bash
# 1. Fork and clone the repository
git clone <your-fork-url>

# 2. Create a feature branch
git checkout -b feature/your-feature-name

# 3. Develop and commit
git add .
git commit -m "feat: add new feature"

# 4. Push to your fork
git push origin feature/your-feature-name

# 5. Create a Pull Request
```

### Commit Conventions

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation update
- `style:` Code format adjustment (no functional impact)
- `refactor:` Code refactoring
- `perf:` Performance optimization
- `test:` Testing related
- `chore:` Build process or auxiliary tool changes

## FAQ

### Port Already in Use

If port 3000 is already in use, you can specify another port:

```bash
PORT=3001 pnpm dev
```

### Build Errors

Clear cache and reinstall dependencies:

```bash
rm -rf node_modules .nuxt
pnpm install
```

### TypeScript Errors

Run type checking to see detailed error information:

```bash
pnpm typecheck
```

## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.

## Contact

If you have any questions or suggestions, please contact us through:

- Submit an [Issue](../../issues)
- Start a [Discussion](../../discussions)

---

<div align="center">
**[⬆ Back to Top](#nkctf-frontend)**

Made with ❤️ by NKCTF Team

</div>
