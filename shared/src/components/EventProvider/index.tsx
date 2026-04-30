import React, { createContext, useContext, useEffect, useState, useRef } from 'react'
import { EventBus } from '../../utils/EventBus'
import type { EventHandler } from '../../utils/EventBus'

// ─── Context ──────────────────────────────────────────────────────────────────

const EventContext = createContext<EventBus | null>(null)

// ─── Provider ─────────────────────────────────────────────────────────────────

export interface EventProviderProps {
  children: React.ReactNode
  /**
   * 外部传入已有的 EventBus 实例。
   * 不传时 Provider 内部创建独立实例，组件卸载时自动清理所有监听器。
   */
  bus?: EventBus
}

/**
 * EventBus 上下文 Provider
 *
 * 在组件树中注入一个共享的 `EventBus` 实例，子组件通过 `useEvent` 发布/订阅事件。
 *
 * - 不传 `bus` 时，内部自动创建实例，卸载时调用 `off()` 全量清理
 * - 传入外部 `bus` 时，生命周期由调用方管理
 *
 * @example
 * // 应用级共享总线
 * <EventProvider>
 *   <App />
 * </EventProvider>
 *
 * // 注入外部 bus（跨 Provider 共享）
 * const bus = new EventBus()
 * <EventProvider bus={bus}>
 *   <FeatureModule />
 * </EventProvider>
 */
export function EventProvider({ children, bus }: EventProviderProps) {
  // 内部创建时用 useState lazy initializer 保证引用稳定，不随 render 重建
  const [internalBus] = useState<EventBus | null>(() => (bus ? null : new EventBus()))

  const activeBus = bus ?? internalBus ?? DEFAULT_BUS

  // 仅清理内部创建的实例，外部传入的由调用方管理
  useEffect(() => {
    if (bus || !internalBus) return undefined
    return () => {
      internalBus.off()
    }
  }, [bus, internalBus])

  return <EventContext.Provider value={activeBus}>{children}</EventContext.Provider>
}

// ─── useEvent ─────────────────────────────────────────────────────────────────

/**
 * 获取最近一层 `EventProvider` 注入的 `EventBus` 实例。
 *
 * 若无 Provider，返回降级默认实例（不抛异常）。
 *
 * @example
 * const { emit, on, off } = useEvent()
 *
 * // 发布事件
 * emit('user:login', { userId: 123 })
 *
 * // 订阅事件（推荐配合 useEffect 自动取消订阅）
 * useEffect(() => {
 *   const handler = (payload: unknown) => { ... }
 *   on('user:login', handler)
 *   return () => off('user:login', handler)
 * }, [on, off])
 */
export function useEvent() {
  const bus = useContext(EventContext) ?? DEFAULT_BUS
  return bus
}

// ─── useEventListener ─────────────────────────────────────────────────────────

/**
 * 声明式事件订阅 Hook，自动在组件卸载时取消订阅。
 *
 * @param event  事件名称
 * @param handler 事件处理函数
 *
 * @example
 * useEventListener('user:login', (payload) => {
 *   console.log('登录成功', payload)
 * })
 */
export function useEventListener(event: string, handler: EventHandler): void {
  const bus = useContext(EventContext) ?? DEFAULT_BUS

  // 用 ref 持有最新 handler，避免频繁 off/on
  const handlerRef = useRef(handler)

  useEffect(() => {
    handlerRef.current = handler
  })

  useEffect(() => {
    const stable = (...args: unknown[]) => handlerRef.current(...args)
    bus.on(event, stable)
    return () => {
      bus.off(event, stable)
    }
  }, [bus, event])
}

// ─── 降级默认实例 ─────────────────────────────────────────────────────────────

const DEFAULT_BUS = new EventBus()
