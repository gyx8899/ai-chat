/**
 * EventBus - 轻量级事件总线，带重放缓存机制解决生命周期不同步问题
 *
 * 与标准 EventEmitter 的差异：
 * - 事件重放为「单次模式」：只有第一个订阅该事件的监听器会收到重放
 * - 重放后缓存立即清除，后续订阅者不会收到历史事件
 * - 适用于「初始化状态同步」场景，而非「历史事件回放」场景
 *
 * 设计约束：
 * - 专注同步事件分发，不处理异步事件处理器
 * - once 触发后自动清理，如需手动取消建议改用 on + off 组合
 */

export type EventHandler = (...args: unknown[]) => void

export class EventBus {
  private _events: Record<string, EventHandler[]> = {}
  private _buffer: Record<string, unknown[]> = {}

  on(event: string, handler: EventHandler): this {
    if (typeof handler !== 'function') return this
    ;(this._events[event] || (this._events[event] = [])).push(handler)

    // 重放缓存并立即清除（单次重放，后续订阅者不再收到）
    const buffered = this._buffer[event]
    if (buffered) {
      try {
        handler(...buffered)
      } catch (e) {
        console.error('[EventBus] replay error:', e)
      }
      delete this._buffer[event]
    }

    return this
  }

  once(event: string, handler: EventHandler): this {
    if (typeof handler !== 'function') return this

    const wrapper = (...args: unknown[]) => {
      this.off(event, wrapper)
      handler(...args)
    }
    return this.on(event, wrapper)
  }

  off(event?: string, handler?: EventHandler): this {
    if (!event) {
      this._events = {}
      this._buffer = {}
      return this
    }

    const handlers = this._events[event]
    if (!handlers) return this

    if (!handler) {
      delete this._events[event]
      delete this._buffer[event]
      return this
    }

    const index = handlers.indexOf(handler)
    if (index > -1) {
      handlers.splice(index, 1)
      if (!handlers.length) {
        delete this._events[event]
        delete this._buffer[event]
      }
    }

    return this
  }

  emit(event: string, ...args: unknown[]): this {
    const handlers = this._events[event]

    if (!handlers?.length) {
      // 无监听者时缓存，等待首个订阅者重放
      this._buffer[event] = args
      return this
    }

    // 快照避免 handler 内调用 off 导致索引错位
    const callbacks = handlers.slice()
    for (let i = 0; i < callbacks.length; i++) {
      try {
        callbacks[i](...args)
      } catch (e) {
        console.error('[EventBus] emit error:', e)
      }
    }

    return this
  }
}
