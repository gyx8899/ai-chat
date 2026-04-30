/**
 * useClickCallback Hook 测试套件
 *
 * 测试用例:
 *  1. 返回函数 - ✅
 *  2. 立即执行回调（leading） - ✅
 *  3. 冷却期内忽略重复触发 - ✅
 *  4. trailing 补发最后一次调用 - ✅
 *  5. 阻止事件冒泡 - ✅
 *  6. 支持不阻止冒泡 - ✅
 *  7. deps 变化时更新回调 - ✅
 *  8. 组件卸载时清理定时器 - ✅
 *
 * 覆盖率: Stmts 89.36%, Branch 89.28%, Funcs 100%, Lines 89.36%
 * 未覆盖: 60-65, 100
 */
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useClickCallback } from '../../hooks/useClickCallback'

describe('useClickCallback', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.clearAllMocks()
  })

  test('返回函数', () => {
    const { result } = renderHook(() => useClickCallback(vi.fn(), []))

    expect(typeof result.current).toBe('function')
  })

  test('立即执行回调（leading 默认 true）', () => {
    const callback = vi.fn()
    const { result } = renderHook(() => useClickCallback(callback, []))

    act(() => {
      result.current()
    })

    expect(callback).toHaveBeenCalledTimes(1)
  })

  test('冷却期内忽略重复触发', () => {
    const callback = vi.fn()
    const { result } = renderHook(() => useClickCallback(callback, [], { delay: 1000 }))

    act(() => {
      result.current()
      result.current()
      result.current()
    })

    expect(callback).toHaveBeenCalledTimes(1)
  })

  test('冷却结束后可再次触发', () => {
    const callback = vi.fn()
    const { result } = renderHook(() => useClickCallback(callback, [], { delay: 500 }))

    act(() => {
      result.current()
    })

    expect(callback).toHaveBeenCalledTimes(1)

    act(() => {
      vi.advanceTimersByTime(500)
    })

    act(() => {
      result.current()
    })

    expect(callback).toHaveBeenCalledTimes(2)
  })

  test('trailing 为 true 时补发最后一次调用', () => {
    const callback = vi.fn()
    const { result } = renderHook(() =>
      useClickCallback(callback, [], { delay: 500, leading: false, trailing: true })
    )

    act(() => {
      result.current('arg1')
    })

    // leading 为 false，不立即执行
    expect(callback).not.toHaveBeenCalled()

    act(() => {
      vi.advanceTimersByTime(500)
    })

    // trailing 补发
    expect(callback).toHaveBeenCalledTimes(1)
    expect(callback).toHaveBeenCalledWith('arg1')
  })

  test('阻止事件冒泡（默认 true）', () => {
    const callback = vi.fn()
    const { result } = renderHook(() => useClickCallback(callback, []))

    const stopPropagation = vi.fn()
    const mockEvent = { stopPropagation } as unknown as Event

    act(() => {
      result.current(mockEvent)
    })

    expect(stopPropagation).toHaveBeenCalled()
  })

  test('支持不阻止冒泡', () => {
    const callback = vi.fn()
    const { result } = renderHook(() => useClickCallback(callback, [], { stopPropagation: false }))

    const stopPropagation = vi.fn()
    const mockEvent = { stopPropagation } as unknown as Event

    act(() => {
      result.current(mockEvent)
    })

    expect(stopPropagation).not.toHaveBeenCalled()
  })

  test('deps 变化时更新回调引用', () => {
    const callback1 = vi.fn()
    const callback2 = vi.fn()

    const { result, rerender } = renderHook(({ cb }) => useClickCallback(cb, [cb]), {
      initialProps: { cb: callback1 },
    })

    act(() => {
      result.current()
    })

    expect(callback1).toHaveBeenCalledTimes(1)

    rerender({ cb: callback2 })

    act(() => {
      vi.advanceTimersByTime(1000)
    })

    act(() => {
      result.current()
    })

    expect(callback2).toHaveBeenCalledTimes(1)
  })

  test('组件卸载时清理定时器', () => {
    const callback = vi.fn()
    const { result, unmount } = renderHook(() =>
      useClickCallback(callback, [], { delay: 500, trailing: true, leading: false })
    )

    act(() => {
      result.current()
    })

    unmount()

    act(() => {
      vi.advanceTimersByTime(1000)
    })

    // 卸载后 trailing 不应触发
    expect(callback).not.toHaveBeenCalled()
  })
})
