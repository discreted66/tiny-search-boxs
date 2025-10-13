import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'node:path'

export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/custom-element.ts'),
      name: 'SearchBoxElement',
      fileName: () => 'search-box-web-component.js',
      formats: ['iife']
    },
    outDir: 'dist/web-component',
    rollupOptions: {
      external: ['vue'],
      output: {
        globals: { vue: 'Vue' }
      }
    }
  }
})
