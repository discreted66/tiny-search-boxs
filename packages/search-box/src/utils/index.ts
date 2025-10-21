import { getCurrentInstance , isVue2 } from 'vue-demi'

export const debounce = (func: Function, delay = 200) => {
    let timer: ReturnType<typeof setTimeout> | null = null;

    return function (this: any, ...args: any) {
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => {
            func.apply(this, args);
            timer = null;
        }, delay);
    };
}

export function useEmitter() {
  const instance = getCurrentInstance()
  
  return (event, ...args) => {
    if (isVue2) {
      // Vue 2.7+ 兼容模式
      if (instance && instance.proxy) {
        return instance.proxy.$emit(event, ...args)
      }
    } else {
      // Vue 3 模式
      if (instance && instance.emit) {
        return instance.emit(event, ...args)
      }
    }
    // 默认情况下，如果 instance 不存在或不完整，不执行任何操作
    return undefined
  }
}