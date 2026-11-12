import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

import handler from './api/event'

// Samme endepunkt i dev som på Vercel.
const calendarApi: Plugin = {
  name: 'calendar-api',
  configureServer(server) {
    server.middlewares.use('/api/event', (req, res) => handler(req as { url?: string }, res))
  },
}

export default defineConfig({
  // Relative base so the build works under a GitHub Pages project path (/LastCall/).
  // Safe because routing is hash-based.
  base: './',
  plugins: [react(), tailwindcss(), calendarApi],
})
