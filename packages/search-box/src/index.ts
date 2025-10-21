import TinySearchBox from './index.vue'
import TinySearchBoxFirstLevelPanel from './components/first-level-panel.vue'
import TinySearchBoxSecondLevelPanel from './components/second-level-panel.vue'
import zhCN from './utils/zh_CN'
import enUS from './utils/en_US'
import './index.less'
export * from './index.type'
import { install, isVue2, isVue3, getCurrentInstance} from 'vue-demi'
install() // 强制 vue-demi 初始化环境检测

console.info('isVue2', isVue2, 'isVue3', isVue3)
let apps = null
TinySearchBox.install = async function (app) {
  apps = app
  // 兼容name不存在的情况
  const name = TinySearchBox.name || 'TinySearchBox'
  if (isVue2) { 
    app.component(name, TinySearchBox)
  } else  {
    app.component(name, TinySearchBox)
  }
  console.info('安装', app, isVue2, getCurrentInstance())

}

export const t = (key) => {
  const array = key.split('.')
  return apps?.config?.globalProperties?.$t
    ? apps?.config?.globalProperties?.$t(key)
    : zhCN?.[array?.[0]]?.[array?.[1]]?.[array?.[2]]
}

export { zhCN, enUS, TinySearchBoxFirstLevelPanel, TinySearchBoxSecondLevelPanel }

export default TinySearchBox
