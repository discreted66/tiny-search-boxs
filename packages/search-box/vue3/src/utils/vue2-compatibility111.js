// Vue2 兼容性插件
import Vue from 'vue'
import { isVue2 } from 'vue-demi'

// 创建全局事件总线
const globalBus = new Vue()

// Vue2 兼容性配置
export function setupVue2Compatibility() {
  if (!isVue2) return

  // 设置全局事件总线
  Vue.prototype.$emitter = globalBus
  Vue.prototype.$onEmitter = (...args) => globalBus.$on(...args)
  Vue.prototype.$offEmitter = (...args) => globalBus.$off(...args)

  // 设置 OpenTiny 全局配置
  Vue.prototype.$TINY_MODE = 'saas'
  Vue.prototype.$TINY_THEME = 'tiny'
  // 兼容旧版本属性名
  Vue.prototype.tiny_mode = 'saas'
  Vue.prototype.tiny_theme = 'tiny'

  // 全局 mixin 确保所有组件实例都有必要的属性
  Vue.mixin({
    beforeCreate() {
      // 确保 $emitter 存在
      if (!this.$emitter) {
        this.$emitter = Vue.prototype.$emitter
      }
      
      // 确保 OpenTiny 配置存在
      if (!this.$TINY_MODE) this.$TINY_MODE = Vue.prototype.$TINY_MODE
      if (!this.$TINY_THEME) this.$TINY_THEME = Vue.prototype.$TINY_THEME
      if (!this.tiny_mode) this.tiny_mode = Vue.prototype.tiny_mode
      if (!this.tiny_theme) this.tiny_theme = Vue.prototype.tiny_theme
    }
  })

  // 为 Composition API 组件提供兼容性
  const originalMixin = Vue.mixin
  Vue.mixin = function(mixin) {
    if (mixin.beforeCreate) {
      const originalBeforeCreate = mixin.beforeCreate
      mixin.beforeCreate = function() {
        // 确保 $emitter 存在
        if (!this.$emitter) {
          this.$emitter = Vue.prototype.$emitter
        }
        // 确保 OpenTiny 配置存在
        if (!this.$TINY_MODE) this.$TINY_MODE = Vue.prototype.$TINY_MODE
        if (!this.$TINY_THEME) this.$TINY_THEME = Vue.prototype.$TINY_THEME
        if (!this.tiny_mode) this.tiny_mode = Vue.prototype.tiny_mode
        if (!this.tiny_theme) this.tiny_theme = Vue.prototype.tiny_theme
        
        // 调用原始的 beforeCreate
        originalBeforeCreate.call(this)
      }
    }
    return originalMixin.call(this, mixin)
  }
}

// 为 getCurrentInstance 提供 Vue2 兼容性
export function enhanceGetCurrentInstance() {
  if (!isVue2) return

  // 确保 getCurrentInstance 在 Vue2 中正确工作
  const originalGetCurrentInstance = Vue.prototype.$options.getCurrentInstance
  if (originalGetCurrentInstance) {
    Vue.prototype.$options.getCurrentInstance = function() {
      const instance = originalGetCurrentInstance.call(this)
      if (instance && instance.proxy) {
        // 确保 proxy 有必要的属性
        if (!instance.proxy.$emitter) {
          instance.proxy.$emitter = Vue.prototype.$emitter
        }
        if (!instance.proxy.$TINY_MODE) {
          instance.proxy.$TINY_MODE = Vue.prototype.$TINY_MODE
        }
        if (!instance.proxy.$TINY_THEME) {
          instance.proxy.$TINY_THEME = Vue.prototype.$TINY_THEME
        }
        if (!instance.proxy.tiny_mode) {
          instance.proxy.tiny_mode = Vue.prototype.tiny_mode
        }
        if (!instance.proxy.tiny_theme) {
          instance.proxy.tiny_theme = Vue.prototype.tiny_theme
        }
      }
      return instance
    }
  }
}

export default {
  install(Vue) {
    setupVue2Compatibility()
    enhanceGetCurrentInstance()
  }
}


