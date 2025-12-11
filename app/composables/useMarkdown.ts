/**
 * Markdown rendering composable
 * Renders markdown content to HTML with syntax highlighting support
 */

import { marked } from 'marked'

export function useMarkdown() {
  // Configure marked options
  marked.setOptions({
    gfm: true,
    breaks: true
  })

  /**
   * Render markdown string to HTML
   */
  const render = (markdown: string): string => {
    if (!markdown) return ''

    try {
      return marked.parse(markdown) as string
    }
    catch (e) {
      console.error('Markdown rendering failed:', e)
      return markdown
    }
  }

  /**
   * Computed ref that renders markdown reactively
   */
  const renderRef = (markdownRef: Ref<string>) => {
    return computed(() => render(markdownRef.value))
  }

  return {
    render,
    renderRef
  }
}
