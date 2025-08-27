<template>
  <div class="p-6">
    <h1 class="text-xl font-bold">🎥 Nuxt + Janus WebRTC Challenge</h1>
    <p>✅ Janus + adapter.js loaded. Check DevTools → Console for logs.</p>

    <p class="mt-4">Click below to publish your webcam into room 1234:</p>

    <button @click="publishStream" class="px-4 py-2 bg-blue-600 text-white rounded mt-2">
      🚀 Start Publishing
    </button>

    <h2 class="mt-4 font-semibold">Your Stream:</h2>
    <video id="localvideo" autoplay playsinline muted class="mt-2 border rounded w-96 h-72"></video>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue"

let janus: any = null
let pluginHandle: any = null

// Initialize Janus when component loads
onMounted(() => {
  if (typeof window !== "undefined" && (window as any).Janus) {
    Janus.init({
      debug: "all",
      callback: () => {
        janus = new Janus({
          server: "https://janus.conf.meetecho.com/janus", // demo server
          success: () => {
            janus.attach({
              plugin: "janus.plugin.videoroom",
              success: (plugin: any) => {
                pluginHandle = plugin
                console.log("✅ Plugin attached")
              },
              error: (err: any) => console.error("❌ Plugin error:", err),
            })
          },
          error: (err: any) => console.error("❌ Janus init error:", err),
        })
      },
    })
  }
})

// Function to start publishing
const publishStream = async () => {
  try {
    // 1. Get webcam
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    const videoElement = document.getElementById("localvideo") as HTMLVideoElement
    videoElement.srcObject = stream

    // 2. Publish to Janus
    pluginHandle.createOffer({
      media: { audio: true, video: true },
      stream,
      success: (jsep: any) => {
        pluginHandle.send({
          message: { request: "publish", audio: true, video: true },
          jsep,
        })
      },
      error: (err: any) => console.error("❌ Offer error:", err),
    })

    // 3. Register mountpoint in backend
    const res = await fetch("/api/mountpoints", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        description: "My Webcam Stream",
        roomId: 1234,
      }),
    })
    const data = await res.json()
    console.log("✅ Mountpoint registered:", data)
  } catch (err) {
    console.error("❌ Publish error:", err)
  }
}
</script>