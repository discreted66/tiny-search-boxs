import { isVue2 } from 'vue-demi'
import { emitter as tinyEmitter } from '@opentiny/vue-common'

/**
 * Vue2 兼容性工具
 * 确保组件在Vue2环境中正确工作
 */
export class Vue2Compatibility {
  private static instance: Vue2Compatibility
  private emitter: any
  private initialized = false

  static getInstance(): Vue2Compatibility {
    if (!Vue2Compatibility.instance) {
      Vue2Compatibility.instance = new Vue2Compatibility()
    }
    return Vue2Compatibility.instance
  }

  constructor() {
    if (isVue2) {
      this.init()
    }
  }

  private init() {
    if (this.initialized) return
    
    this.emitter = tinyEmitter()
    this.initialized = true
  }

  /**
   * 获取emitter实例
   */
  getEmitter() {
    if (!isVue2) return null
    return this.emitter
  }

  /**
   * 为Vue2组件实例设置必要的属性
   */
  setupComponentInstance(instance: any) {
    if (!isVue2 || !instance) return

    // 确保根实例有必要的属性
    if (instance.$root) {
      if (!instance.$root.$emitter) {
        instance.$root.$emitter = this.emitter
      }
      if (!instance.$root.tiny_mode) {
        instance.$root.tiny_mode = 'pc'
      }
      if (!instance.$root.tiny_theme) {
        instance.$root.tiny_theme = 'tiny'
      }
    }
    
    // 确保当前实例有必要的属性
    if (!instance.$emitter) {
      instance.$emitter = instance.$root?.$emitter || this.emitter
    }
    if (!instance.tiny_mode) {
      instance.tiny_mode = instance.$root?.tiny_mode || 'pc'
    }
    if (!instance.tiny_theme) {
      instance.tiny_theme = instance.$root?.tiny_theme || 'tiny'
    }
  }

  /**
   * 创建Vue2兼容的beforeCreate钩子
   */
  createBeforeCreateHook() {
    if (!isVue2) return () => {}
    
    const self = this
    return function(this: any) {
      self.setupComponentInstance(this)
    }
  }
}

/**
 * 获取Vue2兼容性实例
 */
export const getVue2Compatibility = () => Vue2Compatibility.getInstance()

/**
 * 创建Vue2兼容的组件选项
 */
export const createVue2CompatibleOptions = (options: any) => {
  if (!isVue2) return options

  const compatibility = getVue2Compatibility()
  
  // 添加beforeCreate钩子
  if (!options.beforeCreate) {
    options.beforeCreate = compatibility.createBeforeCreateHook()
  } else {
    const originalBeforeCreate = options.beforeCreate
    options.beforeCreate = function(this: any) {
      compatibility.setupComponentInstance(this)
      originalBeforeCreate.call(this)
    }
  }

  return options
}
