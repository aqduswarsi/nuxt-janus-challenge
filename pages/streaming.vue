<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'

declare global { interface Window { Janus?: any } }

const janus = ref<any>(null)
const pluginHandle = ref<any>(null)
const videoEl = ref<HTMLVideoElement | null>(null)
const connected = ref(false)
const watching = ref(false)

const ROOM_ID = 1234
const JANUS_SERVER = 'https://janus.conf.meetecho.com/janus'

/** Initialize Janus and attach plugin */
function initJanus() {
  if (!window.Janus) return console.error('Janus not found')

  window.Janus.init({
    debug: true,
    callback: () => {
      janus.value = new window.Janus({
        server: JANUS_SERVER,
        success: attachPlugin,
        error: (err: any) => console.error('Janus error', err),
        destroyed: () => { connected.value = false }
      })
    }
  })
}

function attachPlugin() {
  janus.value.attach({
    plugin: 'janus.plugin.videoroom',
    success: (handle: any) => {
      pluginHandle.value = handle
      connected.value = true
      console.log('📌 Viewer attached to VideoRoom plugin')
      joinRoom()
    },
    error: (err: any) => console.error('Attach error', err),
    onmessage: (msg: any, jsep: any) => {
      console.log('Viewer onmessage:', msg)

      // Automatically subscribe to first publisher
      if (msg.publishers && msg.publishers.length > 0) {
        const feed = msg.publishers[0].id
        pluginHandle.value.send({
          message: { request: 'join', room: ROOM_ID, ptype: 'subscriber', feed }
        })
        watching.value = true
      }

      // Handle remote SDP
      if (jsep && pluginHandle.value) {
        pluginHandle.value.createAnswer({
          jsep,
          media: { audioSend: false, videoSend: false },
          success: (answer: any) => pluginHandle.value.send({ message: { request: 'start' }, jsep: answer }),
          error: (err: any) => console.error('createAnswer error', err)
        })
      }
    },
    onremotestream: (stream: MediaStream) => {
      if (videoEl.value) {
        videoEl.value.srcObject = stream
        videoEl.value.play().catch(() => {})
        console.log('Remote stream playing!')
      }
    },
    detached: () => console.log('Detached from plugin')
  })
}

function joinRoom() {
  pluginHandle.value.send({ message: { request: 'join', room: ROOM_ID, ptype: 'subscriber' } })
}

function stopWatching() {
  if (pluginHandle.value) {
    try { pluginHandle.value.send({ message: { request: 'leave' } }) } catch {}
  }
  if (videoEl.value?.srcObject) {
    const stream = videoEl.value.srcObject as MediaStream
    stream.getTracks().forEach(t => t.stop())
    videoEl.value.srcObject = null
  }
  watching.value = false
}

onMounted(() => {
  initJanus()
})

onBeforeUnmount(() => {
  stopWatching()
  if (janus.value) janus.value.destroy()
})
</script>

<template>
  <div class="p-6 max-w-3xl mx-auto">
    <h1 class="text-2xl font-bold mb-4">🎥 Viewer (VideoRoom)</h1>

    <div class="flex gap-2 mb-4">
      <button @click="stopWatching" :disabled="!watching" class="px-4 py-2 bg-red-600 text-white rounded disabled:opacity-50">
        ⏹ Stop
      </button>
      <div class="ml-4 self-center">
        <span v-if="!connected" class="text-sm text-red-600">Janus disconnected</span>
        <span v-else-if="watching" class="text-sm text-green-600">Watching publisher...</span>
        <span v-else class="text-sm text-gray-600">Waiting for publisher...</span>
      </div>
    </div>

    <div class="border p-3 rounded bg-black">
      <video ref="videoEl" class="w-full" autoplay playsinline controls></video>
    </div>

    <p class="mt-3 text-sm text-gray-500">Check DevTools console for Janus logs.</p>
  </div>
</template>