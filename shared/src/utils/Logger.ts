// ─── 日志级别 ─────────────────────────────────────────────────────────────────

/**
 * 日志级别枚举（数值越大越严重）
 *
 * | 值 | 名称   | 说明                   |
 * |----|--------|------------------------|
 * | 0  | debug  | 调试信息，开发环境使用  |
 * | 1  | info   | 常规信息                |
 * | 2  | warn   | 警告，可能的问题        |
 * | 3  | error  | 错误，需要关注          |
 * | 4  | silent | 关闭所有日志            |
 */
export const LogLevel = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  silent: 4,
} as const

export type LogLevelName = keyof typeof LogLevel

// ─── Transport ────────────────────────────────────────────────────────────────

export interface LogEntry {
  level: LogLevelName
  prefix: string
  message: string
  args: unknown[]
  timestamp: Date
}

/**
 * 自定义日志输出函数
 *
 * 用于对接外部上报 SDK（如 Sentry、日志平台等）
 *
 * @example
 * const transport: LogTransport = (entry) => {
 *   if (entry.level === 'error') Sentry.captureMessage(entry.message)
 * }
 */
export type LogTransport = (entry: LogEntry) => void

// ─── LoggerProxy ──────────────────────────────────────────────────────────────

/**
 * 轻量日志代理接口
 *
 * 由 `logger.withPrefix()` 返回，不创建新实例，
 * level 过滤和 transports 实时��托给原 Logger 实例。
 */
export interface LoggerProxy {
  debug(message: string, ...args: unknown[]): void
  info(message: string, ...args: unknown[]): void
  warn(message: string, ...args: unknown[]): void
  error(message: string, ...args: unknown[]): void
}

// ─── 配置 ─────────────────────────────────────────────────────────────────────

export interface LoggerOptions {
  /**
   * 日志前缀，用于区分模块来源
   * @example '[Auth]', '[API]'
   */
  prefix?: string
  /**
   * 最低输出级别，低于此级别的日志会被忽略
   * @default 'debug'（开发环境） / 'warn'（生产环境）
   */
  level?: LogLevelName
  /**
   * 是否在日志前附加时间戳
   * @default false
   */
  timestamp?: boolean
  /**
   * 自定义 transport，用于外部上报。
   * 仅在日志通过 level 过滤后触发。
   */
  transports?: LogTransport[]
}

// ─── Logger 类 ────────────────────────────────────────────────────────────────

/**
 * 轻量日志工具类
 *
 * 特性：
 * - 5 个级别：debug / info / warn / error / silent
 * - 前缀（prefix）区分模块
 * - 生产环境自动静默 debug/info（可通过 `level` 覆盖）
 * - 支持多 transport，解耦上报逻辑
 * - `child()` 创建继承父级配置的子 Logger
 *
 * @example
 * const logger = new Logger({ prefix: '[Auth]', level: 'debug' })
 * logger.info('用户登录', { userId: 123 })
 * logger.error('登录失败', error)
 */
export class Logger {
  private readonly prefix: string
  private readonly showTimestamp: boolean
  private readonly transports: LogTransport[]
  private minLevel: number

  constructor(options: LoggerOptions = {}) {
    const { prefix = '', level, timestamp = false, transports = [] } = options

    this.prefix = prefix
    this.showTimestamp = timestamp
    this.transports = transports

    // 未指定 level 时：生产环境默认 warn，开发环境默认 debug
    // 通过 globalThis 安全访问 process.env，兼容浏览器/Node/Vite，无需 @types/node
    const proc = (globalThis as Record<string, unknown>)['process'] as
      | { env?: Record<string, unknown> }
      | undefined
    const isProd = proc?.env?.['NODE_ENV'] === 'production'
    const defaultLevel: LogLevelName = isProd ? 'warn' : 'debug'
    this.minLevel = LogLevel[level ?? defaultLevel]
  }

  // ─── 公开方法 ──────────────────────────────────────────────────────────────

  /** 动态调整最低日志级别 */
  setLevel(level: LogLevelName): void {
    this.minLevel = LogLevel[level]
  }

  getLevel(): LogLevelName {
    const entry = Object.entries(LogLevel).find(([, v]) => v === this.minLevel)
    return (entry?.[0] ?? 'debug') as LogLevelName
  }

  debug(message: string, ...args: unknown[]): void {
    this._log('debug', message, args)
  }

  info(message: string, ...args: unknown[]): void {
    this._log('info', message, args)
  }

  warn(message: string, ...args: unknown[]): void {
    this._log('warn', message, args)
  }

  error(message: string, ...args: unknown[]): void {
    this._log('error', message, args)
  }

  /**
   * 创建继承当前配置的子 Logger，可覆盖 prefix 和 level。
   * 子实例拥有独立的 level，适合需要模块级独立过滤的场景。
   *
   * 若只需要附加前缀且希望完全共享父实例的 level/transports，
   * 请改用 `withPrefix()`。
   *
   * @example
   * const authLogger = logger.child({ prefix: '[Auth]', level: 'debug' })
   * authLogger.info('Token refreshed')
   */
  child(overrides: Pick<LoggerOptions, 'prefix' | 'level'>): Logger {
    return new Logger({
      prefix: overrides.prefix ?? this.prefix,
      level: overrides.level ?? this.getLevel(),
      timestamp: this.showTimestamp,
      transports: this.transports,
    })
  }

  /**
   * 创建一个轻量 Proxy，附加固定前缀，但 level 和 transports 实时委托给当前实例。
   *
   * 与 `child()` 的区别：
   * - `child()`：值拷贝，独立 level，调用 `setLevel()` 不影响子实例
   * - `withPrefix()`：引用委托，父实例 `setLevel()` 立即对所有 proxy 生效
   *
   * @example
   * // 模块顶层声明，零实例创建开销
   * const log = logger.withPrefix('[SessionStore]')
   * log.error('loadSessions failed', e)
   *
   * // 父实例调整 level，log 立即感知
   * logger.setLevel('debug')
   */
  withPrefix(prefix: string): LoggerProxy {
    return {
      debug: (message, ...args) => this._logWithPrefix('debug', prefix, message, args),
      info: (message, ...args) => this._logWithPrefix('info', prefix, message, args),
      warn: (message, ...args) => this._logWithPrefix('warn', prefix, message, args),
      error: (message, ...args) => this._logWithPrefix('error', prefix, message, args),
    }
  }

  // ─── 私有实现 ──────────────────────────────────────────────────────────────

  private _log(level: LogLevelName, message: string, args: unknown[]): void {
    this._logWithPrefix(level, this.prefix, message, args)
  }

  private _logWithPrefix(
    level: LogLevelName,
    prefix: string,
    message: string,
    args: unknown[]
  ): void {
    if (LogLevel[level] < this.minLevel) return

    const entry: LogEntry = {
      level,
      prefix,
      message,
      args,
      timestamp: new Date(),
    }

    // 输出到控制台
    const parts: unknown[] = []
    if (this.showTimestamp) parts.push(`[${entry.timestamp.toISOString()}]`)
    if (prefix) parts.push(prefix)
    parts.push(message)
    if (args.length > 0) parts.push(...args)

    const consoleFn = CONSOLE_MAP[level]
    consoleFn(...parts)

    // 触发自定义 transport
    for (const transport of this.transports) {
      try {
        transport(entry)
      } catch (e) {
        // transport 异常不应中断主流程
        console.error('[Logger] transport error:', e)
      }
    }
  }
}

// ─── 控制台方法映射 ───────────────────────────────────────────────────────────

const CONSOLE_MAP: Record<LogLevelName, (...args: unknown[]) => void> = {
  debug: console.debug.bind(console),
  info: console.info.bind(console),
  warn: console.warn.bind(console),
  error: console.error.bind(console),
  silent: () => {
    /* noop */
  },
}

// ─── 默认单例（模块级快速使用）────────────────────────────────────────────────

/**
 * 开箱即用的默认 Logger 实例
 *
 * 无需创建实例即可快速使用。若需要模块前缀或独立配置，请用 `new Logger()` 或 `logger.child()`。
 *
 * @example
 * import { logger } from '@shared/utils'
 * logger.info('App started')
 */
export const logger = new Logger()
