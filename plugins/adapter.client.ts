// plugins/adapter.client.ts
import { defineNuxtPlugin } from 'nuxt/app'
import adapter from 'webrtc-adapter'

export default defineNuxtPlugin(() => {
  if (typeof window !== 'undefined') {
    // @ts-ignore
    window.adapter = adapter
  }
})