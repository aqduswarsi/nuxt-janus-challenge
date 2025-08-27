<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'

declare global {
  interface Window { Janus?: any }
}

// Janus client and plugin state
const janus = ref<any>(null)
const pluginHandle = ref<any>(null)
const localStream = ref<MediaStream | null>(null)
const videoEl = ref<HTMLVideoElement | null>(null)
const connected = ref(false)
const publishing = ref(false)

const ROOM_ID = 1234
const JANUS_SERVER = 'https://janus.conf.meetecho.com/janus'

/** Initialize Janus */
function initJanus() {
  if (!window.Janus) return console.error('Janus not found')

  window.Janus.init({
    debug: true,
    callback: () => {
      janus.value = new window.Janus({
        server: JANUS_SERVER,
        success: attachPlugin,
        error: (err: any) => console.error('Janus connection error:', err),
        destroyed: () => { connected.value = false }
      })
    }
  })
}

/** Attach to VideoRoom plugin */
function attachPlugin() {
  janus.value.attach({
    plugin: 'janus.plugin.videoroom',
    success: (handle: any) => {
      pluginHandle.value = handle
      connected.value = true
      console.log('📌 Attached to VideoRoom plugin')
    },
    error: (err: any) => console.error('Plugin attach error:', err)
  })
}

/** Start publishing local webcam/mic */
async function startPublishing() {
  if (!pluginHandle.value) return alert('Plugin not attached yet')

  try {
    localStream.value = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    if (videoEl.value) videoEl.value.srcObject = localStream.value

    pluginHandle.value.createOffer({
      media: { video: true, audio: true },
      success: (jsep: any) => {
        pluginHandle.value.send({
          message: { request: 'join', room: ROOM_ID, ptype: 'publisher', display: 'Nuxt Publisher' },
          jsep
        })
        publishing.value = true
        console.log('📡 Publishing started')
      },
      error: (err: any) => console.error('createOffer error:', err)
    })
  } catch (err) {
    console.error('Error accessing webcam/mic', err)
  }
}

/** Stop publishing */
function stopPublishing() {
  if (pluginHandle.value) {
    try { pluginHandle.value.send({ message: { request: 'unpublish' } }) } catch {}
    try { pluginHandle.value.detach() } catch {}
  }

  if (localStream.value) {
    localStream.value.getTracks().forEach(t => t.stop())
    localStream.value = null
  }

  publishing.value = false
}

onMounted(() => {
  if (window.Janus) initJanus()
  else {
    const check = setInterval(() => { if (window.Janus) { clearInterval(check); initJanus() } }, 200)
    setTimeout(() => clearInterval(check), 10000)
  }
})

onBeforeUnmount(() => {
  stopPublishing()
  if (janus.value) janus.value.destroy()
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col items-center justify-start py-10">
    <!-- Header -->
    <h1 class="text-3xl md:text-4xl font-bold text-gray-800 mb-8 text-center">🎥 VideoRoom Publisher</h1>

    <!-- Status Card -->
    <div class="w-full max-w-xl bg-white shadow-md rounded-lg p-6 mb-6 text-center">
      <div class="text-lg font-medium mb-2">
        Status: 
        <span :class="connected ? 'text-green-600' : 'text-red-600'">
          {{ connected ? '🟢 Connected' : '🔴 Not Connected' }}
        </span>
      </div>
      <div class="flex justify-center gap-4 mt-4">
        <button @click="startPublishing" :disabled="publishing || !connected"
                class="px-6 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 disabled:opacity-50">
          {{ publishing ? '📡 Publishing...' : '🚀 Start Publishing' }}
        </button>
        <button @click="stopPublishing" :disabled="!publishing"
                class="px-6 py-2 bg-red-600 text-white rounded-lg shadow hover:bg-red-700 disabled:opacity-50">
          ⏹ Stop Publishing
        </button>
      </div>
    </div>

    <!-- Video Card -->
    <div class="w-full max-w-xl bg-white shadow-md rounded-lg p-4">
      <h2 class="text-xl font-semibold mb-4">📹 Your Camera</h2>
      <div class="border rounded-lg overflow-hidden bg-black aspect-video">
        <video ref="videoEl" class="w-full h-full object-cover" autoplay playsinline muted></video>
      </div>
      <p class="mt-2 text-center font-medium" :class="publishing ? 'text-green-600' : 'text-gray-500'">
        {{ publishing ? '✅ Publishing live' : '⏸ Not publishing' }}
      </p>
    </div>

    <!-- Footer -->
    <p class="mt-6 text-sm text-gray-500 text-center">Check DevTools console for Janus logs and status.</p>
  </div>
</template>