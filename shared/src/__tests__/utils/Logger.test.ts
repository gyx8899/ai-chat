/**
 * Logger 测试套件
 *
 * 测试用例:
 *  1. 实例创建与基础属性 - ✅
 *  2. 默认级别配置 - ✅
 *  3. 自定义前缀输出 - ✅
 *  4. 自定义日志级别 - ✅
 *  5. setLevel 动态调整 - ✅
 *  6. 各级别日志输出行为 - ✅
 *  7. 级别过滤（debug/info/warn/error/silent） - ✅
 *  8. 时间戳功能 - ✅
 *  9. child 子 Logger 创建与继承 - ✅
 *  10. withPrefix 代理创建与实时同步 - ✅
 *  11. transport 回调触发 - ✅
 *  12. transport 异常兜底 - ✅
 *  13. 多个 transports 并发触发 - ✅
 *  14. LogLevel 枚举值校验 - ✅
 *  15. 默认单例 logger - ✅
 *  16. 空参数与复杂参数处理 - ✅
 *  17. 前缀和时间戳组合 - ✅
 *
 * 覆盖率: Stmts 95.34%, Branch 90.9%, Funcs 82.35%, Lines 94.73%
 * 未覆盖: 192-193 (transport error catch)
 */
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import { Logger, LogLevel, logger as defaultLogger } from '../../utils/Logger'

describe('Logger', () => {
  let transportSpy: ReturnType<
    typeof vi.fn<
      Parameters<import('../../utils/Logger').LogTransport>,
      ReturnType<import('../../utils/Logger').LogTransport>
    >
  >

  beforeEach(() => {
    transportSpy = vi.fn()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  /** 创建带 spy transport 的 Logger，用于断言输出内容 */
  function createLogger(options?: ConstructorParameters<typeof Logger>[0]) {
    return new Logger({ transports: [transportSpy], ...options })
  }

  test('创建 Logger 实例', () => {
    const instance = new Logger()

    expect(instance).toBeInstanceOf(Logger)
    expect(typeof instance.debug).toBe('function')
    expect(typeof instance.info).toBe('function')
    expect(typeof instance.warn).toBe('function')
    expect(typeof instance.error).toBe('function')
  })

  test('默认配置', () => {
    const instance = createLogger()

    expect(instance.getLevel()).toBe('debug')
  })

  test('自定义前缀', () => {
    const instance = createLogger({ prefix: '[Test]' })

    instance.debug('test message')

    expect(transportSpy).toHaveBeenCalledOnce()
    expect(transportSpy).toHaveBeenCalledWith(
      expect.objectContaining({ prefix: '[Test]', message: 'test message' })
    )
  })

  test('自定义级别', () => {
    const instance = createLogger({ level: 'warn' })

    expect(instance.getLevel()).toBe('warn')
  })

  test('setLevel 方法', () => {
    const instance = createLogger()

    instance.setLevel('error')

    expect(instance.getLevel()).toBe('error')
  })

  test('debug 日志输出触发 transport', () => {
    const instance = createLogger()

    instance.debug('debug message', 'arg1', 'arg2')

    expect(transportSpy).toHaveBeenCalledWith(
      expect.objectContaining({ level: 'debug', message: 'debug message', args: ['arg1', 'arg2'] })
    )
  })

  test('info 日志输出触发 transport', () => {
    const instance = createLogger()

    instance.info('info message', 'arg1', 'arg2')

    expect(transportSpy).toHaveBeenCalledWith(
      expect.objectContaining({ level: 'info', message: 'info message', args: ['arg1', 'arg2'] })
    )
  })

  test('warn 日志输出触发 transport', () => {
    const instance = createLogger()

    instance.warn('warn message', 'arg1', 'arg2')

    expect(transportSpy).toHaveBeenCalledWith(
      expect.objectContaining({ level: 'warn', message: 'warn message', args: ['arg1', 'arg2'] })
    )
  })

  test('error 日志输出触发 transport', () => {
    const instance = createLogger()

    instance.error('error message', 'arg1', 'arg2')

    expect(transportSpy).toHaveBeenCalledWith(
      expect.objectContaining({ level: 'error', message: 'error message', args: ['arg1', 'arg2'] })
    )
  })

  test('级别过滤 - debug 级别允许所有日志', () => {
    const instance = createLogger({ level: 'debug' })

    instance.debug('msg')
    instance.info('msg')
    instance.warn('msg')
    instance.error('msg')

    expect(transportSpy).toHaveBeenCalledTimes(4)
  })

  test('级别过滤 - info 级别过滤 debug', () => {
    const instance = createLogger({ level: 'info' })

    instance.debug('msg')
    instance.info('msg')
    instance.warn('msg')
    instance.error('msg')

    expect(transportSpy).toHaveBeenCalledTimes(3)
  })

  test('级别过滤 - warn 级别过滤 debug 和 info', () => {
    const instance = createLogger({ level: 'warn' })

    instance.debug('msg')
    instance.info('msg')
    instance.warn('msg')
    instance.error('msg')

    expect(transportSpy).toHaveBeenCalledTimes(2)
  })

  test('级别过滤 - error 级别只保留 error', () => {
    const instance = createLogger({ level: 'error' })

    instance.debug('msg')
    instance.info('msg')
    instance.warn('msg')
    instance.error('msg')

    expect(transportSpy).toHaveBeenCalledTimes(1)
  })

  test('级别过滤 - silent 级别关闭所有日志', () => {
    const instance = createLogger({ level: 'silent' })

    instance.debug('msg')
    instance.info('msg')
    instance.warn('msg')
    instance.error('msg')

    expect(transportSpy).not.toHaveBeenCalled()
  })

  test('时间戳功能', () => {
    const instance = createLogger({ timestamp: true })

    const before = new Date()
    instance.debug('test message')
    const after = new Date()

    expect(transportSpy).toHaveBeenCalledOnce()
    const entry = transportSpy.mock.calls[0][0] as import('../../utils/Logger').LogEntry
    expect(entry.timestamp).toBeInstanceOf(Date)
    expect(entry.timestamp.getTime()).toBeGreaterThanOrEqual(before.getTime())
    expect(entry.timestamp.getTime()).toBeLessThanOrEqual(after.getTime())
  })

  test('child 方法创建子 Logger', () => {
    const parentLogger = new Logger({ prefix: '[Parent]', level: 'info' })
    const childLogger = parentLogger.child({ prefix: '[Child]', level: 'debug' })

    expect(childLogger).toBeInstanceOf(Logger)
    expect(childLogger.getLevel()).toBe('debug')
  })

  test('child 方法继承父级配置', () => {
    const parentLogger = new Logger({ prefix: '[Parent]', level: 'info', timestamp: true })
    const childLogger = parentLogger.child({})

    expect(childLogger.getLevel()).toBe('info')
  })

  test('withPrefix 方法创建代理', () => {
    const instance = new Logger({ prefix: '[Parent]' })
    const proxy = instance.withPrefix('[Child]')

    expect(proxy).toBeDefined()
    expect(typeof proxy.debug).toBe('function')
    expect(typeof proxy.info).toBe('function')
    expect(typeof proxy.warn).toBe('function')
    expect(typeof proxy.error).toBe('function')
  })

  test('withPrefix 代理实时反映父级配置', () => {
    const instance = createLogger({ prefix: '[Parent]', level: 'debug' })
    const proxy = instance.withPrefix('[Child]')

    proxy.debug('debug message')

    expect(transportSpy).toHaveBeenCalledTimes(1)
    expect(transportSpy).toHaveBeenCalledWith(
      expect.objectContaining({ prefix: '[Child]', message: 'debug message' })
    )

    // 改变父级级别
    instance.setLevel('error')

    // 代理应该反映新的级别
    proxy.debug('should not appear')
    proxy.error('should appear')

    expect(transportSpy).toHaveBeenCalledTimes(2)
  })

  test('transport 功能', () => {
    const instance = createLogger()

    instance.info('test message', 'arg1')

    expect(transportSpy).toHaveBeenCalledWith({
      level: 'info',
      prefix: '',
      message: 'test message',
      args: ['arg1'],
      timestamp: expect.any(Date),
    })
  })

  test('transport 异常处理', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const errorTransport = vi.fn(() => {
      throw new Error('Transport error')
    })
    const instance = new Logger({ transports: [errorTransport] })

    instance.info('test message')

    expect(errorTransport).toHaveBeenCalled()
    expect(consoleErrorSpy).toHaveBeenCalledWith('[Logger] transport error:', expect.any(Error))

    consoleErrorSpy.mockRestore()
  })

  test('多个 transports', () => {
    const transport1 = vi.fn()
    const transport2 = vi.fn()
    const instance = new Logger({ transports: [transport1, transport2] })

    instance.info('test message')

    expect(transport1).toHaveBeenCalled()
    expect(transport2).toHaveBeenCalled()
  })

  test('LogLevel 枚举', () => {
    expect(LogLevel.debug).toBe(0)
    expect(LogLevel.info).toBe(1)
    expect(LogLevel.warn).toBe(2)
    expect(LogLevel.error).toBe(3)
    expect(LogLevel.silent).toBe(4)
  })

  test('默认 Logger 实例', () => {
    expect(defaultLogger).toBeInstanceOf(Logger)
  })

  test('子 Logger 的级别独立于父级', () => {
    const parentLogger = new Logger({ level: 'info' })
    const childLogger = parentLogger.child({ level: 'debug' })

    // 改变父级级别不影响子级
    parentLogger.setLevel('error')

    expect(parentLogger.getLevel()).toBe('error')
    expect(childLogger.getLevel()).toBe('debug')
  })

  test('withPrefix 代理的级别实时同步', () => {
    const instance = createLogger({ level: 'info' })
    const proxy = instance.withPrefix('[Test]')

    instance.setLevel('error')

    // 代理应该使用新的级别
    proxy.debug('should not appear')
    proxy.error('should appear')

    expect(transportSpy).toHaveBeenCalledTimes(1)
  })

  test('允许空消息字符串', () => {
    const instance = createLogger()

    instance.debug('')
    instance.info('')
    instance.warn('')
    instance.error('')

    expect(transportSpy).toHaveBeenCalledTimes(4)
  })

  test('复杂参数处理', () => {
    const instance = createLogger()

    const obj = { key: 'value' }
    const arr = [1, 2, 3]
    const func = () => 'test'

    instance.info('message', obj, arr, func)

    expect(transportSpy).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'message', args: [obj, arr, func] })
    )
  })

  test('前缀和时间戳组合', () => {
    const instance = createLogger({ prefix: '[Test]', timestamp: true })

    instance.debug('test message')

    expect(transportSpy).toHaveBeenCalledWith(
      expect.objectContaining({ prefix: '[Test]', message: 'test message' })
    )
    const entry = transportSpy.mock.calls[0][0] as import('../../utils/Logger').LogEntry
    expect(entry.timestamp).toBeInstanceOf(Date)
  })
})
