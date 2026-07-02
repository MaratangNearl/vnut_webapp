import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { devApiPlugin } from './vite.dev-api.js'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), devApiPlugin()],
})
