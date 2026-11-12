import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  // Relative base so the build works under a GitHub Pages project path (/LastCall/).
  // Safe because routing is hash-based.
  base: './',
  plugins: [react(), tailwindcss()],
})
