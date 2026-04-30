import React, { createContext, useContext, useMemo, useState } from 'react'
import { Logger } from '../../utils/Logger'
import type { LoggerOptions, LogLevelName } from '../../utils/Logger'

// ─── Context ──────────────────────────────────────────────────────────────────

const LoggerContext = createContext<Logger | null>(null)

// ─── Provider ─────────────────────────────────────────────────────────────────

export interface LoggerProviderProps {
  children: React.ReactNode
  /**
   * 日志前缀，用于标识来源模块
   * @example '[App]', '[Feature:Cart]'
   */
  prefix?: string
  /**
   * 最低输出级别
   * @default 'debug'（开发环境） / 'warn'（生产环境）
   */
  level?: LogLevelName
  /**
   * 是否附加时间戳
   * @default false
   */
  timestamp?: boolean
  /**
   * 自定义 transport 列表，变更时重新创建 Logger 实例
   */
  transports?: LoggerOptions['transports']
}

/**
 * Logger 上下文 Provider
 *
 * 在组件树中注入一个共享的 `Logger` 实例，子组件通过 `useLogger()` 取用。
 * 配置变更时（level / prefix / transports）自动重建 Logger 实例。
 *
 * @example
 * // 入口处配置
 * <LoggerProvider prefix="[App]" level="info" transports={[sentryTransport]}>
 *   <App />
 * </LoggerProvider>
 *
 * // 子模块覆盖（嵌套使用）
 * <LoggerProvider prefix="[Auth]" level="debug">
 *   <LoginForm />
 * </LoggerProvider>
 */
export function LoggerProvider({
  children,
  prefix,
  level,
  timestamp,
  transports,
}: LoggerProviderProps) {
  const [transportsSnapshot] = useState(transports)

  const loggerInstance = useMemo(
    () =>
      new Logger({
        prefix,
        level,
        timestamp,
        transports: transportsSnapshot,
      }),
    [prefix, level, timestamp, transportsSnapshot]
  )

  return <LoggerContext.Provider value={loggerInstance}>{children}</LoggerContext.Provider>
}

// ─── useLogger ────────────────────────────────────────────────────────────────

/**
 * 获取最近一层 `LoggerProvider` 注入的 `Logger` 实例。
 *
 * 若当前组件树中无 Provider，返回一个默认 Logger（不抛出异常，保证降级可用）。
 *
 * @example
 * function MyComponent() {
 *   const logger = useLogger()
 *   logger.info('组件挂载')
 * }
 *
 * // 需要子模块前缀时
 * function CartService() {
 *   const logger = useLogger('[Cart]')
 *   logger.debug('加入购物车', item)
 * }
 */
export function useLogger(childPrefix?: string): Logger {
  const ctx = useContext(LoggerContext)

  // 无 Provider 时降级为默认实例
  const base = ctx ?? DEFAULT_LOGGER

  // 使用 useMemo 缓存 child logger，避免每次渲染重复创建
  return useMemo(() => {
    if (childPrefix !== undefined) {
      return base.child({ prefix: childPrefix })
    }
    return base
  }, [base, childPrefix])
}

// ─── 降级默认实例 ─────────────────────────────────────────────────────────────

const DEFAULT_LOGGER = new Logger()
