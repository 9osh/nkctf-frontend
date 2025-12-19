/**
 * Auto-save composable for article drafts
 * Saves article content to localStorage periodically
 */

export interface ArticleDraftData {
  title: string
  summary: string
  content: string
  tagIds: number[]
  lastSaved?: string
}

const AUTOSAVE_INTERVAL = 30000 // 30 seconds
const STORAGE_KEY_PREFIX = 'article_draft_'

/**
 * Composable for auto-saving article drafts
 * @param draftKey - Unique key for the draft (e.g., 'new' or article ID)
 */
export function useAutoSave(draftKey: string = 'new') {
  const storageKey = STORAGE_KEY_PREFIX + draftKey
  const lastSaved = ref<Date | null>(null)
  const isSaving = ref(false)
  let autoSaveInterval: ReturnType<typeof setInterval> | null = null

  /**
   * Save draft to localStorage
   */
  const saveDraft = (data: ArticleDraftData) => {
    if (!import.meta.client) return

    isSaving.value = true
    try {
      const saveData: ArticleDraftData = {
        ...data,
        lastSaved: new Date().toISOString()
      }
      localStorage.setItem(storageKey, JSON.stringify(saveData))
      lastSaved.value = new Date()
    } catch (e) {
      console.error('Failed to save draft:', e)
    } finally {
      isSaving.value = false
    }
  }

  /**
   * Load draft from localStorage
   */
  const loadDraft = (): ArticleDraftData | null => {
    if (!import.meta.client) return null

    try {
      const saved = localStorage.getItem(storageKey)
      if (saved) {
        const data = JSON.parse(saved) as ArticleDraftData
        if (data.lastSaved) {
          lastSaved.value = new Date(data.lastSaved)
        }
        return data
      }
    } catch (e) {
      console.error('Failed to load draft:', e)
    }
    return null
  }

  /**
   * Check if a draft exists
   */
  const hasDraft = (): boolean => {
    if (!import.meta.client) return false
    return localStorage.getItem(storageKey) !== null
  }

  /**
   * Clear draft from localStorage
   */
  const clearDraft = () => {
    if (!import.meta.client) return

    try {
      localStorage.removeItem(storageKey)
      lastSaved.value = null
    } catch (e) {
      console.error('Failed to clear draft:', e)
    }
  }

  /**
   * Start auto-save interval
   */
  const startAutoSave = (getData: () => ArticleDraftData) => {
    if (autoSaveInterval) {
      clearInterval(autoSaveInterval)
    }

    autoSaveInterval = setInterval(() => {
      const data = getData()
      // Only save if there's actual content
      if (data.title || data.content) {
        saveDraft(data)
      }
    }, AUTOSAVE_INTERVAL)
  }

  /**
   * Stop auto-save interval
   */
  const stopAutoSave = () => {
    if (autoSaveInterval) {
      clearInterval(autoSaveInterval)
      autoSaveInterval = null
    }
  }

  /**
   * Format last saved time for display
   */
  const lastSavedText = computed(() => {
    if (!lastSaved.value) return null
    const now = new Date()
    const diff = now.getTime() - lastSaved.value.getTime()
    const seconds = Math.floor(diff / 1000)

    if (seconds < 60) return '刚刚保存'
    if (seconds < 3600) return `${Math.floor(seconds / 60)} 分钟前保存`
    return lastSaved.value.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit'
    }) + ' 保存'
  })

  // Cleanup on unmount
  onUnmounted(() => {
    stopAutoSave()
  })

  return {
    lastSaved,
    lastSavedText,
    isSaving,
    saveDraft,
    loadDraft,
    hasDraft,
    clearDraft,
    startAutoSave,
    stopAutoSave
  }
}
