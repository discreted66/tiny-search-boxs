// Vue3 版本的入口文件
import TinySearchBox from './index.vue'

// 安装插件
TinySearchBox.install = (app) => {
  app.component(TinySearchBox.name, TinySearchBox)
}

// 导出
export { TinySearchBox }
export default TinySearchBox