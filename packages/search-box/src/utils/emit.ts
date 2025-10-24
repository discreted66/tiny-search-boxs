import { getCurrentInstance } from 'vue'

/**
 * 获取当前实例的事件发射器
 * 兼容 Vue 2 和 Vue 3
 */
export const useEmitter = () => {
  const instance = getCurrentInstance()

  if (!instance) {
    throw new Error('useEmitter must be called within a component setup function')
  }

  // Vue 3 中直接返回 emit
  if (instance.emit) {
    return {
      emit: instance.emit
    }
  }

  // Vue 2 中通过 $emit 访问
  return {
    emit: instance.proxy?.$emit || instance.ctx.$emit
  }
}

/**
 * 兼容 Vue 2 和 Vue 3 的事件发射函数
 */
export const emitEvent = (event: string, ...args: any[]) => {
  const { emit } = useEmitter()
  return emit(event, ...args)
}