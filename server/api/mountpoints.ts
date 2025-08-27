import { defineEventHandler, readBody, getMethod } from 'h3'

interface Mountpoint {
  id: number
  description: string
  roomId: number | null
  createdAt: string
}

let mountpoints: Mountpoint[] = []
let nextId = 1

export default defineEventHandler(async (event) => {
  const method = getMethod(event)

  if (method === 'GET') {
    // return all mountpoints
    return mountpoints
  }

  if (method === 'POST') {
    const body = await readBody<{ description?: string; roomId?: number }>(event)
    const newMountpoint: Mountpoint = {
      id: nextId++,
      description: body.description || `Mountpoint ${nextId}`,
      roomId: body.roomId ?? null,
      createdAt: new Date().toISOString()
    }
    mountpoints.push(newMountpoint)
    return newMountpoint
  }

  // If method not supported
  return { error: 'Method not allowed' }
})