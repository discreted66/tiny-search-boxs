import path from 'node:path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    extensions: ['.js', '.ts', '.tsx', '.vue'],
    alias: {
      'vue': path.resolve('node_modules/vue'),
      "@opentiny/vue-button": path.resolve('node_modules/@opentiny/vue-button'),
      "@opentiny/vue-button-group": path.resolve('node_modules/@opentiny/vue-button-group'),
      "@opentiny/vue-checkbox": path.resolve('node_modules/@opentiny/vue-checkbox'),
      "@opentiny/vue-checkbox-group": path.resolve('node_modules/@opentiny/vue-checkbox-group'),
      "@opentiny/vue-date-picker": path.resolve('node_modules/@opentiny/vue-date-picker'),
      "@opentiny/vue-dropdown": path.resolve('node_modules/@opentiny/vue-dropdown'),
      "@opentiny/vue-dropdown-item": path.resolve('node_modules/@opentiny/vue-dropdown-item'),
      "@opentiny/vue-dropdown-menu": path.resolve('node_modules/@opentiny/vue-dropdown-menu'),
      "@opentiny/vue-form": path.resolve('node_modules/@opentiny/vue-form'),
      "@opentiny/vue-form-item": path.resolve('node_modules/@opentiny/vue-form-item'),
      "@opentiny/vue-icon": path.resolve('node_modules/@opentiny/vue-icon'),
      "@opentiny/vue-input": path.resolve('node_modules/@opentiny/vue-input'),
      "@opentiny/vue-loading": path.resolve('node_modules/@opentiny/vue-loading'),
      "@opentiny/vue-option": path.resolve('node_modules/@opentiny/vue-option'),
      "@opentiny/vue-popover": path.resolve('node_modules/@opentiny/vue-popover'),
      "@opentiny/vue-select": path.resolve('node_modules/@opentiny/vue-select'),
      "@opentiny/vue-tag": path.resolve('node_modules/@opentiny/vue-tag'),
      "@opentiny/vue-tooltip": path.resolve('node_modules/@opentiny/vue-tooltip'),
      "@opentiny/vue-common": path.resolve('node_modules/@opentiny/vue-common'),
    }
  },
})
