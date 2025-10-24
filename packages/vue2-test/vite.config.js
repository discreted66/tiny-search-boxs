import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import { createVuePlugin } from 'vite-plugin-vue2'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    createVuePlugin()
  ],
  optimizeDeps: {
    include: ['@opentiny/vue-icon', '@opentiny/vue-tag', '@opentiny/vue-form']
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  define: {
    'process.env': {}
  },
  server: {
    port: 8080,
    open: true
  }
})
