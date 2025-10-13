
import { isVue2, isVue3, Vue2, set } from 'vue-demi'

let apps: any

// 兼容 Vue 2 和 Vue 3 的 install 方法
TinySearchBox.install = function (app: any) {
  apps = app
  if (isVue3) {
    app.component(TinySearchBox.name, TinySearchBox)
  } else if (isVue2 && app && app.component) {
    app.component(TinySearchBox.name, TinySearchBox)
  }
}

// 支持 Vue 2 的全局注册（Vue.use）
if (isVue2 && typeof window !== 'undefined' && window.Vue) {
  window.Vue.use(TinySearchBox)
}

export const t = (key: string) => {
  const array = key.split('.')
  // Vue 3
  if (apps?.config?.globalProperties?.$t) {
    return apps.config.globalProperties.$t(key)
  }
  // Vue 2
  if (apps?.prototype?.$t) {
    return apps.prototype.$t(key)
  }
  return zhCN?.[array?.[0]]?.[array?.[1]]?.[array?.[2]]
}

export { zhCN, enUS, TinySearchBoxFirstLevelPanel, TinySearchBoxSecondLevelPanel }

export default TinySearchBox
