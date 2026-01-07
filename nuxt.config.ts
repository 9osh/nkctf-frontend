// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui'
  ],

  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css'],

  // Runtime configuration - can be overridden by environment variables
  // NUXT_PUBLIC_API_BASE will override runtimeConfig.public.apiBase
  runtimeConfig: {
    public: {
      apiBase: 'http://localhost:8080/api'
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
        target: (process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:8080') + '/api',
        changeOrigin: true
      },
      '/ws': {
        target: (process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:8080').replace('/api', '') + '/ws',
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
  }
})
