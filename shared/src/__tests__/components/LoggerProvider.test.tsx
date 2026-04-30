/**
 * LoggerProvider 组件测试套件
 *
 * 测试用例:
 *  1. useLogger 返回 Logger 实例 - ✅
 *  2. useLogger 无 Provider 时返回默认实例 - ✅
 *  3. useLogger 支持子前缀 - ✅
 *  4. LoggerProvider 配置生效（prefix 传入 transport） - ✅
 *  5. useLogger 子前缀变更时返回不同实例 - ✅
 *  6. 自定义 transports - ✅
 *
 * 覆盖率: Stmts 100%, Branch 100%, Funcs 100%, Lines 100%
 * 未覆盖: 无
 */
import { describe, test, expect, vi } from 'vitest'
import { render, renderHook, act } from '@testing-library/react'
import '@testing-library/jest-dom'
import { LoggerProvider, useLogger } from '../../components/LoggerProvider'
import { Logger } from '../../utils/Logger'

describe('LoggerProvider', () => {
  test('useLogger 返回 Logger 实例', () => {
    const { result } = renderHook(() => useLogger(), {
      wrapper: LoggerProvider,
    })

    expect(result.current).toBeInstanceOf(Logger)
  })

  test('useLogger 无 Provider 时返回默认实例', () => {
    const { result } = renderHook(() => useLogger())

    expect(result.current).toBeInstanceOf(Logger)
  })

  test('useLogger 支持子前缀', () => {
    const { result } = renderHook(() => useLogger('[Test]'), {
      wrapper: LoggerProvider,
    })

    expect(result.current).toBeInstanceOf(Logger)
  })

  test('LoggerProvider 配置生效（prefix 传入 transport）', () => {
    const transport = vi.fn()

    function Inner() {
      const logger = useLogger()
      return (
        <button data-testid="btn" onClick={() => logger.info('hello')}>
          log
        </button>
      )
    }

    const { getByTestId } = render(
      <LoggerProvider prefix="[App]" transports={[transport]}>
        <Inner />
      </LoggerProvider>
    )

    act(() => {
      getByTestId('btn').click()
    })

    expect(transport).toHaveBeenCalledTimes(1)
    expect(transport).toHaveBeenCalledWith(
      expect.objectContaining({
        prefix: '[App]',
        message: 'hello',
      })
    )
  })

  test('useLogger 子前缀变更时返回不同实例', () => {
    const { result, rerender } = renderHook(
      (props: { childPrefix?: string }) => useLogger(props.childPrefix),
      {
        wrapper: LoggerProvider,
        initialProps: { childPrefix: undefined } as { childPrefix?: string },
      }
    )

    const firstLogger = result.current

    rerender({ childPrefix: '[Auth]' })

    expect(result.current).toBeInstanceOf(Logger)
    expect(result.current).not.toBe(firstLogger)
  })

  test('useLogger 支持自定义 transports', () => {
    const transport = vi.fn()

    const { result } = renderHook(() => useLogger(), {
      wrapper: ({ children }) => (
        <LoggerProvider transports={[transport]}>{children}</LoggerProvider>
      ),
    })

    expect(result.current).toBeInstanceOf(Logger)

    // 触发日志
    act(() => {
      result.current.info('测试消息')
    })

    // 验证 transport 被调用
    expect(transport).toHaveBeenCalledWith(
      expect.objectContaining({
        level: 'info',
        message: '测试消息',
      })
    )
  })
})
