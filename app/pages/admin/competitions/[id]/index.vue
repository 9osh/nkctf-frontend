<template>
  <NuxtLayout name="dashboard">
    <template #header-left>
      <div class="flex items-center gap-3">
        <UButton
          icon="i-lucide-arrow-left"
          color="neutral"
          variant="ghost"
          size="sm"
          @click="router.push('/admin/competitions')"
        />
        <h1 class="text-xl font-semibold text-gray-900 dark:text-white">
          {{ isNew ? '创建竞赛' : '编辑竞赛' }}
        </h1>
      </div>
    </template>

    <template #header-right>
      <div class="flex items-center gap-3">
        <!-- Status Badge -->
        <UBadge
          v-if="!isNew"
          :label="getStatusLabel(currentStatus)"
          :color="getStatusColor(currentStatus)"
          variant="subtle"
        />
        <UButton
          icon="i-lucide-save"
          :loading="isSaving"
          @click="handleSave"
        >
          {{ isNew ? '创建' : '保存' }}
        </UButton>
      </div>
    </template>

    <div class="p-6">
      <!-- Loading State -->
      <div
        v-if="isLoadingDetail"
        class="space-y-6"
      >
        <UCard>
          <div class="space-y-4">
            <USkeleton class="h-10 w-full" />
            <USkeleton class="h-10 w-1/2" />
            <USkeleton class="h-32 w-full" />
          </div>
        </UCard>
      </div>

      <!-- Form -->
      <div
        v-else
        class="space-y-6"
      >
        <!-- Basic Info -->
        <UCard>
          <template #header>
            <h2 class="text-lg font-semibold">
              基本信息
            </h2>
          </template>

          <div class="space-y-4">
            <!-- Name -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                竞赛名称 <span class="text-red-500">*</span>
              </label>
              <UInput
                v-model="formData.name"
                placeholder="输入竞赛名称..."
                size="lg"
                class="w-full"
              />
            </div>

            <!-- Description -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                竞赛简介
              </label>
              <UTextarea
                v-model="formData.description"
                placeholder="输入竞赛简介..."
                :rows="3"
                class="w-full"
              />
            </div>

            <!-- Rules -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                竞赛规则
              </label>
              <ClientOnly>
                <MdEditor
                  v-model="formData.rules"
                  :theme="editorTheme"
                  language="zh-CN"
                  :preview="false"
                  :toolbars-exclude="['github', 'save']"
                  style="height: 250px"
                />
                <template #fallback>
                  <UTextarea
                    v-model="formData.rules"
                    placeholder="输入竞赛规则 (支持 Markdown)..."
                    :rows="8"
                  />
                </template>
              </ClientOnly>
            </div>
          </div>
        </UCard>

        <!-- Schedule -->
        <UCard>
          <template #header>
            <h2 class="text-lg font-semibold">
              时间安排
            </h2>
          </template>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Start Time -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                开始时间 <span class="text-red-500">*</span>
              </label>
              <UPopover>
                <UButton
                  block
                  color="neutral"
                  variant="outline"
                  icon="i-lucide-calendar"
                  :label="formatDisplayDateTime(formData.startTime) || '选择开始时间'"
                  class="justify-start"
                />
                <template #content>
                  <div class="p-4 min-w-[320px]">
                    <div class="grid grid-cols-4 gap-2 mb-3">
                      <!-- Year -->
                      <USelectMenu
                        v-model="startDateTime.year"
                        :items="yearOptions"
                        placeholder="年"
                        value-key="value"
                        class="col-span-1"
                      />
                      <!-- Month -->
                      <USelectMenu
                        v-model="startDateTime.month"
                        :items="monthOptions"
                        placeholder="月"
                        value-key="value"
                        class="col-span-1"
                      />
                      <!-- Day -->
                      <USelectMenu
                        v-model="startDateTime.day"
                        :items="getStartDayOptions"
                        placeholder="日"
                        value-key="value"
                        class="col-span-1"
                      />
                      <!-- Hour -->
                      <USelectMenu
                        v-model="startDateTime.hour"
                        :items="hourOptions"
                        placeholder="时"
                        value-key="value"
                        class="col-span-1"
                      />
                    </div>
                    <div class="text-xs text-gray-500 dark:text-gray-400 text-center">
                      24小时制
                    </div>
                  </div>
                </template>
              </UPopover>
            </div>

            <!-- End Time -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                结束时间 <span class="text-red-500">*</span>
              </label>
              <UPopover>
                <UButton
                  block
                  color="neutral"
                  variant="outline"
                  icon="i-lucide-calendar"
                  :label="formatDisplayDateTime(formData.endTime) || '选择结束时间'"
                  class="justify-start"
                />
                <template #content>
                  <div class="p-4 min-w-[320px]">
                    <div class="grid grid-cols-4 gap-2 mb-3">
                      <!-- Year -->
                      <USelectMenu
                        v-model="endDateTime.year"
                        :items="yearOptions"
                        placeholder="年"
                        value-key="value"
                        class="col-span-1"
                      />
                      <!-- Month -->
                      <USelectMenu
                        v-model="endDateTime.month"
                        :items="monthOptions"
                        placeholder="月"
                        value-key="value"
                        class="col-span-1"
                      />
                      <!-- Day -->
                      <USelectMenu
                        v-model="endDateTime.day"
                        :items="getEndDayOptions"
                        placeholder="日"
                        value-key="value"
                        class="col-span-1"
                      />
                      <!-- Hour -->
                      <USelectMenu
                        v-model="endDateTime.hour"
                        :items="hourOptions"
                        placeholder="时"
                        value-key="value"
                        class="col-span-1"
                      />
                    </div>
                    <div class="text-xs text-gray-500 dark:text-gray-400 text-center">
                      24小时制
                    </div>
                  </div>
                </template>
              </UPopover>
            </div>
          </div>
        </UCard>

        <!-- Competition Settings -->
        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <h2 class="text-lg font-semibold">
                参赛设置
              </h2>
            </div>
          </template>

          <div class="space-y-4">
            <!-- Competition Type -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                竞赛类型
              </label>
              <UButtonGroup>
                <UButton
                  :color="!formData.isTeamCompetition ? 'primary' : 'neutral'"
                  :variant="!formData.isTeamCompetition ? 'solid' : 'outline'"
                  icon="i-lucide-user"
                  @click="formData.isTeamCompetition = false"
                >
                  个人赛
                </UButton>
                <UButton
                  :color="formData.isTeamCompetition ? 'primary' : 'neutral'"
                  :variant="formData.isTeamCompetition ? 'solid' : 'outline'"
                  icon="i-lucide-users"
                  @click="formData.isTeamCompetition = true"
                >
                  团队赛
                </UButton>
              </UButtonGroup>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">
                {{ formData.isTeamCompetition ? '参赛者需要组队参加' : '参赛者以个人身份参加' }}
              </p>
            </div>

            <div
              v-if="formData.isTeamCompetition"
              class="pt-4 border-t border-gray-200 dark:border-gray-700"
            >
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                最大队伍人数
              </label>
              <UInput
                v-model.number="formData.maxTeamSize"
                type="number"
                min="2"
                max="10"
                placeholder="4"
                class="w-32"
              />
            </div>
          </div>
        </UCard>

        <!-- Status Change (only for existing) -->
        <UCard v-if="!isNew">
          <template #header>
            <h2 class="text-lg font-semibold">
              竞赛状态
            </h2>
          </template>

          <div class="flex items-center gap-4">
            <UButton
              v-for="status in statusOptions"
              :key="status.value"
              :color="currentStatus === status.value ? 'primary' : 'neutral'"
              :variant="currentStatus === status.value ? 'solid' : 'outline'"
              @click="handleStatusChange(status.value)"
            >
              {{ status.label }}
            </UButton>
          </div>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-3">
            当前状态: {{ getStatusLabel(currentStatus) }}
          </p>
        </UCard>

        <!-- Quick Links (only for existing) -->
        <UCard v-if="!isNew && competitionId">
          <template #header>
            <h2 class="text-lg font-semibold">
              快捷操作
            </h2>
          </template>

          <div class="flex items-center gap-4">
            <UButton
              icon="i-lucide-flag"
              variant="outline"
              @click="router.push(`/admin/competitions/${competitionId}/challenges`)"
            >
              管理题目
            </UButton>
            <UButton
              icon="i-lucide-users"
              variant="outline"
              @click="router.push(`/admin/competitions/${competitionId}/participants`)"
            >
              查看参赛者
            </UButton>
          </div>
        </UCard>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { MdEditor } from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'
import type { AdminCompetition, CompetitionFormData, CompetitionStatus } from '~/composables/useCompetitionAdmin'

// Use admin middleware for route protection
definePageMeta({
  middleware: 'admin'
})

const route = useRoute()
const router = useRouter()
const colorMode = useColorMode()

// Determine if this is a new competition or editing existing
const isNew = computed(() => route.params.id === 'new')
const competitionId = computed(() => isNew.value ? null : Number(route.params.id))

useSeoMeta({
  title: computed(() => isNew.value ? '创建竞赛 - NKCTF Admin' : '编辑竞赛 - NKCTF Admin'),
  description: '管理 CTF 竞赛'
})

// Composables
const {
  fetchCompetitionDetail,
  createCompetition,
  updateCompetition,
  changeCompetitionStatus
} = useCompetitionAdmin()

// Editor theme
const editorTheme = computed(() => colorMode.value === 'dark' ? 'dark' : 'light')

// State
const isLoadingDetail = ref(false)
const isSaving = ref(false)
const currentStatus = ref<CompetitionStatus>('inactive')

// Form data with string dates for datetime-local input
const formData = reactive({
  name: '',
  description: '',
  rules: '',
  isTeamCompetition: false,
  maxTeamSize: 4,
  startTime: '',
  endTime: ''
})

// DateTime picker state
interface DateTimeState {
  year: number | undefined
  month: number | undefined
  day: number | undefined
  hour: number | undefined
}

// Get current date for default values
const now = new Date()
const defaultYear = now.getFullYear()
const defaultMonth = now.getMonth() + 1

const startDateTime = reactive<DateTimeState>({
  year: defaultYear,
  month: defaultMonth,
  day: undefined,
  hour: undefined
})

const endDateTime = reactive<DateTimeState>({
  year: defaultYear,
  month: defaultMonth,
  day: undefined,
  hour: undefined
})

// DateTime picker options
const currentYear = defaultYear

const yearOptions = computed(() => {
  const options = []
  for (let y = currentYear; y <= currentYear + 5; y++) {
    options.push({ label: `${y}年`, value: y })
  }
  return options
})

const monthOptions = computed(() => {
  const options = []
  for (let m = 1; m <= 12; m++) {
    options.push({ label: `${m}月`, value: m })
  }
  return options
})

const hourOptions = computed(() => {
  const options = []
  for (let h = 0; h <= 23; h++) {
    options.push({ label: `${String(h).padStart(2, '0')}:00`, value: h })
  }
  return options
})

/**
 * Get days in month
 */
const getDaysInMonth = (year: number | undefined, month: number | undefined): number => {
  if (!year || !month) return 31
  return new Date(year, month, 0).getDate()
}

const getStartDayOptions = computed(() => {
  const days = getDaysInMonth(startDateTime.year, startDateTime.month)
  const options = []
  for (let d = 1; d <= days; d++) {
    options.push({ label: `${d}日`, value: d })
  }
  return options
})

const getEndDayOptions = computed(() => {
  const days = getDaysInMonth(endDateTime.year, endDateTime.month)
  const options = []
  for (let d = 1; d <= days; d++) {
    options.push({ label: `${d}日`, value: d })
  }
  return options
})

/**
 * Format display date time
 */
const formatDisplayDateTime = (dateStr: string): string => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return ''
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  return `${year}年${month}月${day}日 ${String(hour).padStart(2, '0')}:00`
}

/**
 * Sync datetime state to formData
 */
const syncDateTimeToFormData = (
  state: DateTimeState,
  target: 'startTime' | 'endTime'
) => {
  if (state.year && state.month && state.day !== undefined && state.hour !== undefined) {
    const date = new Date(state.year, state.month - 1, state.day, state.hour, 0, 0)
    formData[target] = date.toISOString()
  }
}

/**
 * Parse formData date to datetime state
 */
const parseDateToState = (dateStr: string, state: DateTimeState) => {
  if (!dateStr) return
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return
  state.year = date.getFullYear()
  state.month = date.getMonth() + 1
  state.day = date.getDate()
  state.hour = date.getHours()
}

// Watch datetime changes and sync to formData
watch(startDateTime, () => {
  syncDateTimeToFormData(startDateTime, 'startTime')
}, { deep: true })

watch(endDateTime, () => {
  syncDateTimeToFormData(endDateTime, 'endTime')
}, { deep: true })

// Status options
const statusOptions = [
  { label: '未开始', value: 'inactive' as CompetitionStatus },
  { label: '进行中', value: 'active' as CompetitionStatus },
  { label: '已结束', value: 'ending' as CompetitionStatus }
]

/**
 * Get status display label
 */
const getStatusLabel = (status: CompetitionStatus): string => {
  const labels: Record<CompetitionStatus, string> = {
    inactive: '未开始',
    active: '进行中',
    ending: '已结束'
  }
  return labels[status]
}

/**
 * Get status color
 */
const getStatusColor = (status: CompetitionStatus): 'neutral' | 'success' | 'warning' => {
  const colors: Record<CompetitionStatus, 'neutral' | 'success' | 'warning'> = {
    inactive: 'neutral',
    active: 'success',
    ending: 'warning'
  }
  return colors[status]
}

/**
 * Load competition data for editing
 */
const loadCompetition = async () => {
  if (isNew.value || !competitionId.value) return

  isLoadingDetail.value = true

  const competition = await fetchCompetitionDetail(competitionId.value)
  if (competition) {
    formData.name = competition.name
    formData.description = competition.description
    formData.rules = competition.rules || ''
    formData.isTeamCompetition = competition.isTeamCompetition
    formData.maxTeamSize = competition.maxTeamSize || 4
    formData.startTime = competition.startTime
    formData.endTime = competition.endTime
    // Parse dates to datetime picker states
    parseDateToState(competition.startTime, startDateTime)
    parseDateToState(competition.endTime, endDateTime)
    currentStatus.value = competition.status
  } else {
    // Competition not found, redirect back
    router.push('/admin/competitions')
  }

  isLoadingDetail.value = false
}

/**
 * Handle save
 */
const handleSave = async () => {
  // Validation
  if (!formData.name.trim()) {
    alert('请输入竞赛名称')
    return
  }
  if (!formData.startTime) {
    alert('请选择开始时间')
    return
  }
  if (!formData.endTime) {
    alert('请选择结束时间')
    return
  }
  if (new Date(formData.endTime) <= new Date(formData.startTime)) {
    alert('结束时间必须晚于开始时间')
    return
  }

  isSaving.value = true

  const data: CompetitionFormData = {
    name: formData.name,
    description: formData.description,
    rules: formData.rules || undefined,
    isTeamCompetition: formData.isTeamCompetition,
    startTime: new Date(formData.startTime).toISOString(),
    endTime: new Date(formData.endTime).toISOString()
  }

  if (formData.isTeamCompetition) {
    data.maxTeamSize = formData.maxTeamSize
  }

  let result: AdminCompetition | null = null

  if (isNew.value) {
    result = await createCompetition(data)
  } else if (competitionId.value) {
    result = await updateCompetition(competitionId.value, data)
  }

  isSaving.value = false

  if (result) {
    if (isNew.value) {
      // Redirect to edit page
      router.push(`/admin/competitions/${result.id}`)
    } else {
      alert('保存成功')
    }
  }
}

/**
 * Handle status change
 */
const handleStatusChange = async (status: CompetitionStatus) => {
  if (!competitionId.value || status === currentStatus.value) return

  const success = await changeCompetitionStatus(competitionId.value, status)
  if (success) {
    currentStatus.value = status
  }
}

// Initialize
onMounted(() => {
  loadCompetition()
})
</script>
