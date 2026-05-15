/// <reference types="vite/client" />

// Nuxt import.meta.client / import.meta.server (requires `nuxt prepare` for full types)
interface ImportMeta {
  readonly client: boolean
  readonly server: boolean
}

export {}
