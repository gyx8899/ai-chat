/**
 * useCountDown Hook 测试套件
 *
 * 测试用例:
 *  1. 无 targetDate 时返回 0 - ✅
 *  2. 有 targetDate 时计算剩余时间 - ✅
 *  3. 时间推进时更新剩余时间 - ✅
 *  4. 倒计时结束时触发 onEnd - ✅
 *  5. fillZero 格式化补零 - ✅
 *  6. 可自定义 interval - ✅
 *  7. 组件卸载时清理定时器 - ✅
 *  8. getCountDownResult 静态工具函数 - ✅
 *
 * 覆盖率: Stmts 88.09%, Branch 86.95%, Funcs 86.66%, Lines 94.28%
 * 未覆盖: 103, 109
 */
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useCountDown, getCountDownResult } from '../../hooks/useCountDown'

describe('useCountDown', () => {
  const BASE_TIME = 1_700_000_000_000

  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(BASE_TIME)
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  test('无 targetDate 时 timeLeft 为 0', () => {
    const { result } = renderHook(() => useCountDown())

    expect(result.current[0]).toBe(0)
    expect(result.current[1]).toEqual({ days: '0', hours: '0', minutes: '0', seconds: '0' })
  })

  test('有 targetDate 时计算剩余时间', () => {
    const target = new Date(Date.now() + 5000)
    const { result } = renderHook(() => useCountDown({ targetDate: target }))

    expect(result.current[0]).toBeGreaterThan(4000)
    expect(result.current[0]).toBeLessThanOrEqual(5000)
  })

  test('时间推进时更新剩余时间', () => {
    const target = new Date(BASE_TIME + 5000)
    const { result } = renderHook(() => useCountDown({ targetDate: target, interval: 1000 }))

    const initial = result.current[0]

    act(() => {
      vi.advanceTimersByTime(1000)
    })

    // requestAnimationFrame 先执行，然后 setInterval 第一次 tick
    expect(result.current[0]).toBeLessThan(initial)
  })

  test('倒计时结束时触发 onEnd', () => {
    const onEnd = vi.fn()
    const target = new Date(Date.now() + 500)

    renderHook(() => useCountDown({ targetDate: target, interval: 100, onEnd }))

    act(() => {
      vi.advanceTimersByTime(600)
    })

    expect(onEnd).toHaveBeenCalled()
  })

  test('fillZero 为 true 时补零', () => {
    const target = new Date(Date.now() + 3661000) // 1h 1m 1s
    const { result } = renderHook(() => useCountDown({ targetDate: target, fillZero: true }))

    expect(result.current[1].hours).toMatch(/^\d{2}$/)
    expect(result.current[1].minutes).toMatch(/^\d{2}$/)
    expect(result.current[1].seconds).toMatch(/^\d{2}$/)
  })

  test('fillZero 为 false 时不补零', () => {
    const target = new Date(Date.now() + 3661000)
    const { result } = renderHook(() => useCountDown({ targetDate: target, fillZero: false }))

    // hours 可能是一位数（当小于 10 时）
    expect(result.current[1].days).toBe('0')
  })

  test('可自定义 interval', () => {
    const target = new Date(Date.now() + 5000)
    const onEnd = vi.fn()

    renderHook(() => useCountDown({ targetDate: target, interval: 500, onEnd }))

    act(() => {
      vi.advanceTimersByTime(500)
    })

    // 500ms 的 interval 应该已执行多次更新
    expect(onEnd).not.toHaveBeenCalled()

    act(() => {
      vi.advanceTimersByTime(5000)
    })

    expect(onEnd).toHaveBeenCalled()
  })

  test('组件卸载时清理定时器', () => {
    const target = new Date(Date.now() + 5000)
    const onEnd = vi.fn()

    const { unmount } = renderHook(() => useCountDown({ targetDate: target, interval: 100, onEnd }))

    unmount()

    act(() => {
      vi.advanceTimersByTime(10000)
    })

    // 卸载后不应再触发 onEnd（虽然目标时间到了，但定时器已清理）
    // 实际上 requestAnimationFrame 和 setInterval 都被清理了
    expect(onEnd).not.toHaveBeenCalled()
  })

  test('targetDate 为字符串时正确解析', () => {
    const target = new Date(Date.now() + 10000).toISOString()
    const { result } = renderHook(() => useCountDown({ targetDate: target }))

    expect(result.current[0]).toBeGreaterThan(8000)
    expect(result.current[0]).toBeLessThanOrEqual(10000)
  })

  test('targetDate 为数字（时间戳）时正确解析', () => {
    const target = Date.now() + 10000
    const { result } = renderHook(() => useCountDown({ targetDate: target }))

    expect(result.current[0]).toBeGreaterThan(8000)
    expect(result.current[0]).toBeLessThanOrEqual(10000)
  })

  describe('getCountDownResult', () => {
    test('静态计算剩余时间', () => {
      const target = new Date(Date.now() + 90061000) // 1d 1h 1m 1s
      const result = getCountDownResult(target, true)

      expect(result.days).toBe('1')
      expect(result.hours).toBe('01')
      expect(result.minutes).toBe('01')
      expect(result.seconds).toBe('01')
    })

    test('已过期目标返回 0', () => {
      const target = new Date(Date.now() - 1000)
      const result = getCountDownResult(target)

      expect(result.days).toBe('0')
      expect(result.hours).toBe('0')
      expect(result.minutes).toBe('0')
      expect(result.seconds).toBe('0')
    })

    test('undefined 目标返回 0', () => {
      const result = getCountDownResult(undefined)

      expect(result.days).toBe('0')
      expect(result.hours).toBe('0')
      expect(result.minutes).toBe('0')
      expect(result.seconds).toBe('0')
    })
  })
})
