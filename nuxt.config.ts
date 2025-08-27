// nuxt.config.ts
export default defineNuxtConfig({
  compatibilityDate: '2025-08-27',
  modules: ['@nuxt/ui'],

  app: {
    head: {
      script: [
        // Load adapter.js first (CDN)
        { src: 'https://webrtc.github.io/adapter/adapter-latest.js' },
        // Then load janus.js from public/
        { src: '/janus.js', defer: true }
      ]
    }
  }
})