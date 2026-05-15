// https://nuxt.com/docs/api/configuration/nuxt-config

/** Backend API origin for dev proxy only (not the browser-facing apiBase). */
const backendApiTarget = process.env.NUXT_PUBLIC_API_BASE?.startsWith('http')
  ? process.env.NUXT_PUBLIC_API_BASE.replace(/\/$/, '')
  : 'http://localhost:8080/api'

export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui' ,
    '@nuxt/fonts'
  ],

  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css'],

  // Runtime configuration - can be overridden by environment variables
  // NUXT_PUBLIC_API_BASE will override runtimeConfig.public.apiBase
  runtimeConfig: {
    public: {
      // Same-origin /api in dev (nitro proxy) so HttpOnly refresh cookies work
      apiBase: process.env.NUXT_PUBLIC_API_BASE || '/api'
    }
  },

  routeRules: {
    '/': { prerender: true }
  },

  compatibilityDate: '2025-01-15',

  // Proxy API and WebSocket requests to backend server
  nitro: {
    devProxy: {
      '/api': {
        target: backendApiTarget,
        changeOrigin: true
      },
      '/ws': {
        target: backendApiTarget.replace(/\/api$/, '') + '/api/ws',
        changeOrigin: true,
        ws: true
      }
    }
  },

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  },
  fonts: {
    provider: 'local'
  }
})
