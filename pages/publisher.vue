<script setup lang="ts">
import { ref, onMounted } from 'vue'

const videoRef = ref<HTMLVideoElement | null>(null)

onMounted(async () => {
  // Show webcam preview
  const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
  if (videoRef.value) {
    videoRef.value.srcObject = stream
  }

  // TODO: Initialize Janus + publish stream
  // For now just preview works
})

async function registerMountpoint() {
  const res = await fetch('/api/mountpoints', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      description: 'My First Stream',
      roomId: 1234
    })
  })
  const data = await res.json()
  console.log('Registered mountpoint:', data)
}
</script>

<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-4">Publisher</h1>
    <video ref="videoRef" autoplay playsinline muted class="w-96 border rounded" />

    <div class="mt-4">
      <button @click="registerMountpoint" class="px-4 py-2 bg-blue-600 text-white rounded">
        Register Mountpoint
      </button>
    </div>
  </div>
</template>