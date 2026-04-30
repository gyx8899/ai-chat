/**
 * useLockRef Hook 测试套件
 *
 * 测试用例:
 *  1. 返回 lockedRef 和 setLocked 函数 - ✅
 *  2. 初始锁定状态为 false - ✅
 *  3. setLocked(true) 上锁 - ✅
 *  4. setLocked(false) 解锁 - ✅
 *  5. 自动解锁计时器 - ✅
 *  6. 重复上锁重置计时器 - ✅
 *  7. 组件卸载时清理定时器 - ✅
 *  8. 可自定义 unLockDelay - ✅
 *
 * 覆盖率: Stmts 100%, Branch 100%, Funcs 100%, Lines 100%
 * 未覆盖: 无
 */
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useLockRef } from '../../hooks/useLockRef'

describe('useLockRef', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.clearAllMocks()
  })

  test('返回 lockedRef 和 setLocked', () => {
    const { result } = renderHook(() => useLockRef())

    expect(result.current[0]).toBeDefined()
    expect(result.current[0].current).toBe(false)
    expect(typeof result.current[1]).toBe('function')
  })

  test('初始锁定状态为 false', () => {
    const { result } = renderHook(() => useLockRef())

    expect(result.current[0].current).toBe(false)
  })

  test('setLocked(true) 上锁', () => {
    const { result } = renderHook(() => useLockRef())

    act(() => {
      result.current[1](true)
    })

    expect(result.current[0].current).toBe(true)
  })

  test('setLocked(false) 解锁', () => {
    const { result } = renderHook(() => useLockRef())

    act(() => {
      result.current[1](true)
    })

    expect(result.current[0].current).toBe(true)

    act(() => {
      result.current[1](false)
    })

    expect(result.current[0].current).toBe(false)
  })

  test('自动解锁计时器', () => {
    const { result } = renderHook(() => useLockRef({ unLockDelay: 500 }))

    act(() => {
      result.current[1](true)
    })

    expect(result.current[0].current).toBe(true)

    act(() => {
      vi.advanceTimersByTime(500)
    })

    expect(result.current[0].current).toBe(false)
  })

  test('重复上锁重置计时器', () => {
    const { result } = renderHook(() => useLockRef({ unLockDelay: 500 }))

    act(() => {
      result.current[1](true)
    })

    act(() => {
      vi.advanceTimersByTime(300)
    })

    expect(result.current[0].current).toBe(true)

    // 再次上锁，重置计时器
    act(() => {
      result.current[1](true)
    })

    act(() => {
      vi.advanceTimersByTime(300)
    })

    // 还没解锁，因为计时器被重置了
    expect(result.current[0].current).toBe(true)

    act(() => {
      vi.advanceTimersByTime(200)
    })

    expect(result.current[0].current).toBe(false)
  })

  test('主动解锁取消自动解锁计时器', () => {
    const { result } = renderHook(() => useLockRef({ unLockDelay: 500 }))

    act(() => {
      result.current[1](true)
    })

    act(() => {
      result.current[1](false)
    })

    act(() => {
      vi.advanceTimersByTime(1000)
    })

    expect(result.current[0].current).toBe(false)
  })

  test('组件卸载时清理定时器', () => {
    const { result, unmount } = renderHook(() => useLockRef({ unLockDelay: 500 }))

    act(() => {
      result.current[1](true)
    })

    unmount()

    act(() => {
      vi.advanceTimersByTime(1000)
    })

    // 卸载后不再变化
    expect(result.current[0].current).toBe(true)
  })

  test('可自定义 unLockDelay', () => {
    const { result } = renderHook(() => useLockRef({ unLockDelay: 200 }))

    act(() => {
      result.current[1](true)
    })

    act(() => {
      vi.advanceTimersByTime(100)
    })

    expect(result.current[0].current).toBe(true)

    act(() => {
      vi.advanceTimersByTime(100)
    })

    expect(result.current[0].current).toBe(false)
  })
})
