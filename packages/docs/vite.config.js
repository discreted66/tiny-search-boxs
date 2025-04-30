import { defineConfig } from 'vite'
import Pages from 'vite-plugin-pages'
import VueRouter from 'unplugin-vue-router/vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [
    vue(),
    VueRouter({
      routesFolder: 'src/search-box', // 指定扫描目
      extensions: ['.vue']
    })
  ],
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
})
