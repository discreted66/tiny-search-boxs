import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import '@opentiny/vue-search-box/dist/index.css'
import '@opentiny/vue-theme/dark-theme-index.css'

// 自动注册所有示例组件
const exampleComponents = import.meta.glob('./search-box/*.vue')
// console.info(exampleComponents)

const app = createApp(App)

// Object.fromEntries(
Object.entries(exampleComponents).map(([path, component]) => {
  const name = path
    .split('/')
    .pop()
    .replace(/\.vue$/, '')
  //   console.info(name, component)
  // return [name, component]
  app.component(name, component)
})
// )
// console.info(app)
app.mount('#app')
