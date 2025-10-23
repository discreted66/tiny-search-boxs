// 版本无关的简易事件总线，实现 on/off/emit
export type Emitter = {
  on: (event: string, cb: (...args: any[]) => void) => void
  off: (event: string, cb?: (...args: any[]) => void) => void
  emit: (event: string, ...args: any[]) => void
}

export const EMITTER_KEY: unique symbol = Symbol('TINY_SEARCHBOX_EMITTER')

export function createSimpleEmitter(): Emitter {
  const listenersByEvent = new Map<string, Set<Function>>()

  function on(event: string, cb: (...args: any[]) => void) {
    if (!listenersByEvent.has(event)) listenersByEvent.set(event, new Set())
    listenersByEvent.get(event)!.add(cb)
  }

  function off(event: string, cb?: (...args: any[]) => void) {
    if (!listenersByEvent.has(event)) return
    if (!cb) {
      listenersByEvent.delete(event)
      return
    }
    listenersByEvent.get(event)!.delete(cb)
  }

  function emit(event: string, ...args: any[]) {
    const set = listenersByEvent.get(event)
    if (!set) return
    for (const cb of Array.from(set)) {
      try {
        ;(cb as any)(...args)
      } catch (_err) {
        // 忽略监听器内部错误，避免破坏其他监听器
      }
    }
  }

  return { on, off, emit }
}


