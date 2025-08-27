# Nuxt Janus VideoRoom Project

This project is a simple **Nuxt 3 + Janus WebRTC** implementation that demonstrates a basic video publishing and viewing setup using the Janus VideoRoom plugin. It allows a user to publish their webcam/microphone stream and view remote streams from other publishers in the same room.

---

## Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Project Setup](#project-setup)
- [Available Pages](#available-pages)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Known Issues](#known-issues)

---

## Features

- Publisher page: Share webcam and microphone in a Janus VideoRoom.
- Viewer page: Watch remote streams automatically when a publisher is active.
- Activity logs for debugging Janus events.
- Basic responsive layout using Tailwind CSS.

---

## Prerequisites

- Node.js >= 18.x
- npm or yarn
- Janus WebRTC server running (here using the public demo server `https://janus.conf.meetecho.com/janus`)

---

## Project Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Access the app locally at: `http://localhost:3000`

---

## Available Pages

- `/videoroom` – Publisher page (publish webcam/mic)
- `/streaming` – Viewer page (watch remote streams)

> Note: `/test-videoroom` was a test page and can be deleted before submission.

---

## Usage

1. Open `/videoroom` page.
2. Click **Start Publishing** to share your webcam and mic.
3. Open `/streaming` page (or another browser tab) to watch your own stream or streams from other publishers.
4. Stop publishing or watching using **Stop Publishing** / **Stop Watching** buttons.
5. Check DevTools console for Janus logs and debug messages.

---

## Project Structure

```
pages/
 ├─ videoroom.vue   # Publisher page
 ├─ streaming.vue   # Viewer page
components/
 └─ (optional components)
assets/
 └─ (CSS / images)
```

- `videoroom.vue` handles webcam capture, publisher Janus plugin initialization, and publishing.
- `streaming.vue` handles automatic viewer subscription to available publisher feeds.

---

## Known Issues

- Some viewers may not connect immediately due to Janus feed availability delays.
- Only basic CSS and layout applied. Production styling and UX improvements are recommended.
- Public Janus server (`https://janus.conf.meetecho.com/janus`) may have occasional latency or session issues.

---

## Notes

- This project is intended for **submission / demo purposes**.
- For production, consider hosting your own Janus server and adding authentication / room management.

---

## License

This project is provided as-is for learning and demo purposes. No license specified.

