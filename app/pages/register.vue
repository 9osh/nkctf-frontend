<template>
  <div class="register-page min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
    <!-- Background Effects -->
    <div class="absolute inset-0 bg-gradient-to-br from-gray-100 via-gray-50 to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950" />
    <div class="cyber-grid absolute inset-0 opacity-10 dark:opacity-20" />
    <div class="scan-line absolute inset-0 pointer-events-none" />

    <!-- Floating particles -->
    <div class="particles absolute inset-0 overflow-hidden pointer-events-none">
      <div
        v-for="i in 20"
        :key="i"
        class="particle"
        :style="{
          left: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 5}s`,
          animationDuration: `${5 + Math.random() * 10}s`
        }"
      />
    </div>

    <!-- Registration Card -->
    <div class="register-card relative z-10 w-full max-w-md">
      <!-- Logo -->
      <div class="text-center mb-8">
        <NuxtLink
          to="/"
          class="inline-flex items-center justify-center gap-3 group"
        >
          <div class="logo-glow relative">
            <svg
              width="56"
              height="56"
              viewBox="0 0 40 40"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              class="shrink-0"
            >
              <path
                d="M20 2L4 8V18C4 28.5 10.84 38.26 20 40C29.16 38.26 36 28.5 36 18V8L20 2Z"
                fill="var(--ui-primary)"
                fill-opacity="0.15"
                stroke="var(--ui-primary)"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M14 12V28M14 12L26 16L14 20"
                stroke="var(--ui-primary)"
                stroke-width="2.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            <div class="absolute inset-0 bg-primary-500/20 dark:bg-primary-500/30 blur-xl rounded-full scale-150" />
          </div>
          <span class="font-bold text-3xl tracking-tight text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
            NKCTF
          </span>
        </NuxtLink>
        <p class="mt-3 text-gray-500 dark:text-gray-400 text-sm font-mono h-5">
          <span class="typing-text">{{ displayedText }}</span><span class="cursor">|</span>
        </p>
      </div>

      <!-- Form Card -->
      <UCard
        :ui="{
          root: 'register-card-inner bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-200 dark:border-gray-800 shadow-xl dark:shadow-2xl shadow-gray-200/50 dark:shadow-primary-900/20',
          body: 'p-6 sm:p-8'
        }"
      >
        <UForm
          :state="formState"
          :validate="validate"
          class="space-y-5"
          @submit="onSubmit"
        >
          <!-- Username Field -->
          <UFormField
            label="用户名"
            name="username"
            required
          >
            <UInput
              v-model="formState.username"
              placeholder="选择你的黑客代号"
              icon="i-lucide-user"
              size="lg"
              autocomplete="username"
              class="form-input"
            />
          </UFormField>

          <!-- Email Field -->
          <UFormField
            label="邮箱"
            name="email"
            required
          >
            <UInput
              v-model="formState.email"
              type="email"
              placeholder="your@email.com"
              icon="i-lucide-mail"
              size="lg"
              autocomplete="email"
              class="form-input"
            />
          </UFormField>

          <!-- Password Field -->
          <UFormField
            label="密码"
            name="password"
            required
          >
            <UInput
              v-model="formState.password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="设置安全密码"
              icon="i-lucide-lock"
              size="lg"
              autocomplete="new-password"
              class="form-input"
            >
              <template #trailing>
                <UButton
                  :icon="showPassword ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                  color="neutral"
                  variant="ghost"
                  size="xs"
                  :aria-label="showPassword ? '隐藏密码' : '显示密码'"
                  @click="showPassword = !showPassword"
                />
              </template>
            </UInput>
            <!-- Password Strength Indicator -->
            <div
              v-if="formState.password"
              class="mt-2"
            >
              <div class="flex gap-1">
                <div
                  v-for="i in 4"
                  :key="i"
                  class="h-1 flex-1 rounded-full transition-colors duration-300"
                  :class="i <= passwordStrength ? strengthColors[passwordStrength - 1] : 'bg-gray-200 dark:bg-gray-700'"
                />
              </div>
              <p
                class="text-xs mt-1.5 font-medium"
                :class="strengthTextColors[passwordStrength - 1] || 'text-gray-400 dark:text-gray-500'"
              >
                {{ strengthLabels[passwordStrength] || '请输入密码' }}
              </p>
            </div>
          </UFormField>

          <!-- Confirm Password Field -->
          <UFormField
            label="确认密码"
            name="confirmPassword"
            required
          >
            <UInput
              v-model="formState.confirmPassword"
              :type="showConfirmPassword ? 'text' : 'password'"
              placeholder="再次输入密码"
              icon="i-lucide-shield-check"
              size="lg"
              autocomplete="new-password"
              class="form-input"
            >
              <template #trailing>
                <UButton
                  :icon="showConfirmPassword ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                  color="neutral"
                  variant="ghost"
                  size="xs"
                  :aria-label="showConfirmPassword ? '隐藏密码' : '显示密码'"
                  @click="showConfirmPassword = !showConfirmPassword"
                />
              </template>
            </UInput>
          </UFormField>

          <!-- Invite Code Field (Optional) -->
          <UFormField
            label="邀请码"
            name="inviteCode"
            hint="可选"
          >
            <UInput
              v-model="formState.inviteCode"
              placeholder="输入邀请码（可选）"
              icon="i-lucide-ticket"
              size="lg"
              class="form-input"
            />
          </UFormField>

          <!-- Terms Checkbox -->
          <UFormField name="acceptTerms">
            <UCheckbox v-model="formState.acceptTerms">
              <template #label>
                <span class="text-gray-600 dark:text-gray-400 text-sm">
                  我已阅读并同意
                  <NuxtLink
                    to="/terms"
                    class="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 underline underline-offset-2"
                  >
                    服务条款
                  </NuxtLink>
                  和
                  <NuxtLink
                    to="/privacy"
                    class="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 underline underline-offset-2"
                  >
                    隐私政策
                  </NuxtLink>
                </span>
              </template>
            </UCheckbox>
          </UFormField>

          <!-- Submit Button -->
          <UButton
            type="submit"
            block
            size="lg"
            :loading="isLoading"
            :disabled="!formState.acceptTerms"
            class="cyber-button mt-6"
          >
            <template #leading>
              <UIcon
                name="i-lucide-rocket"
                class="w-5 h-5"
              />
            </template>
            创建账户
          </UButton>
        </UForm>

        <!-- Divider -->
        <div class="relative my-6">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-gray-200 dark:border-gray-700" />
          </div>
          <div class="relative flex justify-center text-sm">
            <span class="px-4 bg-white dark:bg-gray-900 text-gray-400 dark:text-gray-500 font-mono">OR</span>
          </div>
        </div>

        <!-- Social Login -->
        <div class="space-y-3">
          <UButton
            block
            color="neutral"
            variant="outline"
            size="lg"
          >
            <template #leading>
              <UIcon
                name="i-simple-icons-github"
                class="w-5 h-5"
              />
            </template>
            使用 GitHub 注册
          </UButton>
        </div>

        <!-- Login Link -->
        <p class="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          已有账户？
          <NuxtLink
            to="/login"
            class="font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
          >
            立即登录
          </NuxtLink>
        </p>
      </UCard>

      <!-- Terminal-style decoration -->
      <div class="mt-6 text-center">
        <p class="text-xs text-gray-400 dark:text-gray-600 font-mono">
          <span class="text-primary-600 dark:text-primary-500">root@nkctf</span>:<span class="text-blue-500">~</span>$ ./join_the_elite.sh
        </p>
      </div>
    </div>

    <!-- Theme Toggle -->
    <div class="fixed top-4 right-4 z-20">
      <UColorModeButton />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { FormSubmitEvent } from '#ui/types'

interface FormState {
  username: string
  email: string
  password: string
  confirmPassword: string
  inviteCode: string
  acceptTerms: boolean
}

useSeoMeta({
  title: '注册 - NKCTF',
  description: '加入 NKCTF 网络安全竞赛训练平台，开始你的 CTF 之旅'
})

const formState = reactive<FormState>({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  inviteCode: '',
  acceptTerms: false
})

const showPassword = ref(false)
const showConfirmPassword = ref(false)
const isLoading = ref(false)

// Typewriter effect with multiple sentences
const sentences = [
  '// Hey, guy. I\'m so glad to see you again.',
  'echo "Ready to hack?"',
  'ls -la /',
  'cat /etc/passwd',
  'sudo rm -rf /boredom',
  'printf("bang~bang~bang!\\n")'
]
const displayedText = ref('')
const typingSpeed = 50
const deletingSpeed = 30
const pauseBeforeDelete = 2000
const pauseBeforeType = 500

onMounted(() => {
  let sentenceIndex = 0
  let charIndex = 0
  let isDeleting = false

  const tick = () => {
    const currentSentence = sentences[sentenceIndex]!

    if (isDeleting) {
      // Deleting characters
      displayedText.value = currentSentence.substring(0, charIndex - 1)
      charIndex--

      if (charIndex === 0) {
        isDeleting = false
        sentenceIndex = (sentenceIndex + 1) % sentences.length
        setTimeout(tick, pauseBeforeType)
      } else {
        setTimeout(tick, deletingSpeed)
      }
    } else {
      // Typing characters
      displayedText.value = currentSentence.substring(0, charIndex + 1)
      charIndex++

      if (charIndex === currentSentence.length) {
        isDeleting = true
        setTimeout(tick, pauseBeforeDelete)
      } else {
        setTimeout(tick, typingSpeed)
      }
    }
  }

  // Start typing after initial delay
  setTimeout(tick, pauseBeforeType)
})

const passwordStrength = computed(() => {
  const password = formState.password
  if (!password) return 0

  let strength = 0
  if (password.length >= 8) strength++
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++
  if (/\d/.test(password)) strength++
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++

  return strength
})

const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500']
const strengthTextColors = ['text-red-500', 'text-orange-500', 'text-yellow-500', 'text-green-500']
const strengthLabels = ['', '弱', '一般', '强', '非常强']

const validate = (state: FormState) => {
  const errors = []

  if (!state.username) {
    errors.push({ path: 'username', message: '请输入用户名' })
  } else if (state.username.length < 3) {
    errors.push({ path: 'username', message: '用户名至少需要3个字符' })
  } else if (!/^[a-zA-Z0-9_-]+$/.test(state.username)) {
    errors.push({ path: 'username', message: '用户名只能包含字母、数字、下划线和连字符' })
  }

  if (!state.email) {
    errors.push({ path: 'email', message: '请输入邮箱' })
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.email)) {
    errors.push({ path: 'email', message: '请输入有效的邮箱地址' })
  }

  if (!state.password) {
    errors.push({ path: 'password', message: '请输入密码' })
  } else if (state.password.length < 8) {
    errors.push({ path: 'password', message: '密码至少需要8个字符' })
  }

  if (!state.confirmPassword) {
    errors.push({ path: 'confirmPassword', message: '请确认密码' })
  } else if (state.password !== state.confirmPassword) {
    errors.push({ path: 'confirmPassword', message: '两次输入的密码不一致' })
  }

  if (!state.acceptTerms) {
    errors.push({ path: 'acceptTerms', message: '请同意服务条款和隐私政策' })
  }

  return errors
}

const onSubmit = async (event: FormSubmitEvent<FormState>) => {
  isLoading.value = true

  try {
    // TODO: 实现注册 API 调用
    console.log('Register data:', event.data)

    // 模拟 API 调用
    await new Promise(resolve => setTimeout(resolve, 1500))

    // 注册成功后跳转
    navigateTo('/login')
  } catch (error) {
    console.error('Registration failed:', error)
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
/* Cyber Grid Background */
.cyber-grid {
  background-image:
    linear-gradient(rgba(0, 180, 100, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 180, 100, 0.05) 1px, transparent 1px);
  background-size: 50px 50px;
  animation: grid-move 20s linear infinite;
}

:root.dark .cyber-grid {
  background-image:
    linear-gradient(rgba(0, 220, 130, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 220, 130, 0.03) 1px, transparent 1px);
}

@keyframes grid-move {
  0% {
    transform: translate(0, 0);
  }
  100% {
    transform: translate(50px, 50px);
  }
}

/* Scan Line Effect */
.scan-line {
  background: linear-gradient(
    to bottom,
    transparent 0%,
    rgba(0, 180, 100, 0.02) 50%,
    transparent 100%
  );
  background-size: 100% 8px;
  animation: scan 8s linear infinite;
}

:root.dark .scan-line {
  background: linear-gradient(
    to bottom,
    transparent 0%,
    rgba(0, 220, 130, 0.03) 50%,
    transparent 100%
  );
  background-size: 100% 8px;
}

@keyframes scan {
  0% {
    background-position: 0 -100vh;
  }
  100% {
    background-position: 0 100vh;
  }
}

/* Floating Particles */
.particle {
  position: absolute;
  width: 2px;
  height: 2px;
  background: var(--ui-primary);
  border-radius: 50%;
  opacity: 0.4;
  animation: float-up linear infinite;
}

:root.dark .particle {
  opacity: 0.6;
}

@keyframes float-up {
  0% {
    transform: translateY(100vh) scale(0);
    opacity: 0;
  }
  10% {
    opacity: 0.4;
  }
  90% {
    opacity: 0.4;
  }
  100% {
    transform: translateY(-100vh) scale(1);
    opacity: 0;
  }
}

:root.dark .particle {
  animation-name: float-up-dark;
}

@keyframes float-up-dark {
  0% {
    transform: translateY(100vh) scale(0);
    opacity: 0;
  }
  10% {
    opacity: 0.6;
  }
  90% {
    opacity: 0.6;
  }
  100% {
    transform: translateY(-100vh) scale(1);
    opacity: 0;
  }
}

/* Logo Glow Effect */
.logo-glow {
  position: relative;
}

.logo-glow::before {
  content: '';
  position: absolute;
  inset: -10px;
  background: radial-gradient(circle, rgba(0, 180, 100, 0.15) 0%, transparent 70%);
  border-radius: 50%;
  animation: pulse-glow 2s ease-in-out infinite;
}

:root.dark .logo-glow::before {
  background: radial-gradient(circle, rgba(0, 220, 130, 0.2) 0%, transparent 70%);
}

@keyframes pulse-glow {
  0%, 100% {
    opacity: 0.5;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.1);
  }
}

/* Typing Text Animation */
.typing-text {
  display: inline;
}

.cursor {
  display: inline-block;
  color: var(--ui-primary);
  font-weight: 400;
  animation: blink 1s step-end infinite;
  margin-left: 1px;
}

@keyframes blink {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0;
  }
}

/* Card hover effect */
.register-card-inner {
  transition: all 0.3s ease;
}

.register-card:hover .register-card-inner {
  box-shadow:
    0 0 0 1px rgba(0, 180, 100, 0.1),
    0 25px 50px -12px rgba(0, 0, 0, 0.15),
    0 0 60px -15px rgba(0, 180, 100, 0.1);
}

:root.dark .register-card:hover .register-card-inner {
  box-shadow:
    0 0 0 1px rgba(0, 220, 130, 0.1),
    0 25px 50px -12px rgba(0, 0, 0, 0.5),
    0 0 60px -15px rgba(0, 220, 130, 0.15);
}

/* Cyber Button Effect */
.cyber-button {
  position: relative;
  overflow: hidden;
}

.cyber-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.2),
    transparent
  );
  transition: left 0.5s;
}

.cyber-button:hover::before {
  left: 100%;
}

/* Form Input Styling */
.form-input {
  width: 100%;
}

.form-input :deep(input) {
  width: 100%;
}
</style>
