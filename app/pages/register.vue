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

          <!-- Email Field (Optional) -->
          <UFormField
            label="邮箱"
            name="email"
            hint="可选"
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

          <!-- Nickname Field (Optional) -->
          <UFormField
            label="昵称"
            name="nickname"
            hint="可选"
          >
            <UInput
              v-model="formState.nickname"
              placeholder="输入昵称（可选）"
              icon="i-lucide-smile"
              size="lg"
              class="form-input"
            />
          </UFormField>

          <!-- Captcha Field -->
          <UFormField
            label="验证码"
            name="captchaCode"
            required
          >
            <div class="flex gap-3">
              <UInput
                v-model="formState.captchaCode"
                placeholder="输入验证码"
                icon="i-lucide-shield"
                size="lg"
                class="form-input flex-1"
                autocomplete="off"
              />
              <div
                class="captcha-image-container flex-shrink-0 h-10 w-[130px] rounded-md border border-gray-200 dark:border-gray-700 overflow-hidden cursor-pointer hover:opacity-80 transition-opacity bg-white dark:bg-gray-800"
                :title="captchaLoading ? '加载中...' : '点击刷新验证码'"
                @click="refreshCaptcha"
              >
                <img
                  v-if="captchaImage"
                  :src="captchaImage"
                  alt="验证码"
                  class="h-full w-full object-fill"
                >
                <div
                  v-else
                  class="h-full w-full flex items-center justify-center bg-gray-100 dark:bg-gray-800"
                >
                  <UIcon
                    v-if="captchaLoading"
                    name="i-lucide-loader-2"
                    class="w-5 h-5 animate-spin text-gray-400"
                  />
                  <UIcon
                    v-else
                    name="i-lucide-refresh-cw"
                    class="w-5 h-5 text-gray-400"
                  />
                </div>
              </div>
            </div>
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

/**
 * API response interface
 */
interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T
}

/**
 * Captcha response data
 */
interface CaptchaData {
  captchaId: string
  image: string
}

/**
 * Register response data
 * Note: refreshToken is no longer in response body, it's set as HttpOnly cookie
 */
interface RegisterData {
  accessToken: string
  expiresIn: number
  userId: number
  username: string
  nickname: string
  role: 'USER' | 'ADMIN'
}

interface FormState {
  username: string
  email: string
  password: string
  nickname: string
  captchaCode: string
  acceptTerms: boolean
}

useSeoMeta({
  title: '注册 - NKCTF',
  description: '加入 NKCTF 网络安全竞赛训练平台，开始你的 CTF 之旅'
})

const toast = useToast()
const { setStoredUser } = useUser()

const formState = reactive<FormState>({
  username: '',
  email: '',
  password: '',
  nickname: '',
  captchaCode: '',
  acceptTerms: false
})

const showPassword = ref(false)
const isLoading = ref(false)

// Captcha state
const captchaId = ref('')
const captchaImage = ref('')
const captchaLoading = ref(false)

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
  // Fetch captcha on mount
  refreshCaptcha()

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
  if (password.length >= 6) strength++
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++
  if (/\d/.test(password)) strength++
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++

  return strength
})

const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500']
const strengthTextColors = ['text-red-500', 'text-orange-500', 'text-yellow-500', 'text-green-500']
const strengthLabels = ['', '弱', '一般', '强', '非常强']

/**
 * Fetch captcha image from server
 */
const refreshCaptcha = async () => {
  if (captchaLoading.value) return

  captchaLoading.value = true
  formState.captchaCode = ''

  try {
    const response = await $fetch<ApiResponse<CaptchaData>>('/api/auth/captcha')

    if (response.code === 200 && response.data) {
      captchaId.value = response.data.captchaId
      captchaImage.value = response.data.image
    } else {
      toast.add({
        title: '获取验证码失败',
        description: response.message || '请稍后重试',
        color: 'error'
      })
    }
  } catch (error: unknown) {
    const fetchError = error as { data?: ApiResponse }
    toast.add({
      title: '获取验证码失败',
      description: fetchError?.data?.message || '网络错误，请稍后重试',
      color: 'error'
    })
  } finally {
    captchaLoading.value = false
  }
}

const validate = (state: FormState) => {
  const errors = []

  if (!state.username) {
    errors.push({ path: 'username', message: '请输入用户名' })
  } else if (state.username.length < 3 || state.username.length > 50) {
    errors.push({ path: 'username', message: '用户名长度为 3-50 个字符' })
  } else if (!/^[a-zA-Z0-9_]+$/.test(state.username)) {
    errors.push({ path: 'username', message: '用户名只能包含字母、数字和下划线' })
  }

  if (state.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.email)) {
    errors.push({ path: 'email', message: '请输入有效的邮箱地址' })
  }

  if (!state.password) {
    errors.push({ path: 'password', message: '请输入密码' })
  } else if (state.password.length < 6 || state.password.length > 100) {
    errors.push({ path: 'password', message: '密码长度为 6-100 个字符' })
  }

  if (!state.captchaCode) {
    errors.push({ path: 'captchaCode', message: '请输入验证码' })
  } else if (state.captchaCode.length < 4 || state.captchaCode.length > 6) {
    errors.push({ path: 'captchaCode', message: '验证码为 4-6 个字符' })
  }

  if (!state.acceptTerms) {
    errors.push({ path: 'acceptTerms', message: '请同意服务条款和隐私政策' })
  }

  return errors
}

const onSubmit = async (event: FormSubmitEvent<FormState>) => {
  if (!captchaId.value) {
    toast.add({
      title: '请先获取验证码',
      color: 'warning'
    })
    return
  }

  isLoading.value = true

  try {
    const response = await $fetch<ApiResponse<RegisterData>>('/api/auth/register', {
      method: 'POST',
      credentials: 'include', // Receive HttpOnly cookie from server
      body: {
        username: event.data.username,
        password: event.data.password,
        email: event.data.email || undefined,
        nickname: event.data.nickname || undefined,
        captchaId: captchaId.value,
        captchaCode: event.data.captchaCode
      }
    })

    if (response.code === 200 && response.data) {
      // 注册成功后自动登录，保存 token 和用户信息到状态和 localStorage
      setStoredUser(response.data)

      toast.add({
        title: '注册成功',
        description: `欢迎加入，${response.data.nickname}`,
        color: 'success'
      })

      // 跳转到首页
      navigateTo('/')
    } else {
      toast.add({
        title: '注册失败',
        description: response.message || '未知错误',
        color: 'error'
      })
      // 刷新验证码
      refreshCaptcha()
    }
  } catch (error: unknown) {
    const fetchError = error as { data?: ApiResponse }
    const errorMessage = fetchError?.data?.message || '网络错误，请稍后重试'

    toast.add({
      title: '注册失败',
      description: errorMessage,
      color: 'error'
    })
    // 刷新验证码
    refreshCaptcha()
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
