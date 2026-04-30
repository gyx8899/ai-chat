/**
 * useAutoScroll Hook 测试套件
 *
 * 测试用例:
 *  1. 返回 bottomRef 和 containerRef - ✅
 *  2. messageCount 变化时调用 scrollIntoView - ✅
 *  3. loading 为 true 时启动定时滚动 - ✅
 *  4. loading 为 false 时停止定时滚动并补滚 - ✅
 *  5. loading 为 false 且用户已滚动时不补滚 - ✅
 *  6. 组件卸载时清理事件监听和定时器 - ✅
 *  7. 可自定义 interval - ✅
 *
 * 覆盖率: Stmts 55.26%, Branch 30%, Funcs 60%, Lines 57.57%
 * 未覆盖: 41-59
 */
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAutoScroll } from '../../hooks/useAutoScroll'

describe('useAutoScroll', () => {
  let scrollIntoViewMock: ReturnType<typeof vi.fn>
  let addEventListenerMock: ReturnType<typeof vi.fn>
  let removeEventListenerMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    scrollIntoViewMock = vi.fn()
    addEventListenerMock = vi.fn()
    removeEventListenerMock = vi.fn()

    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.clearAllMocks()
  })

  function createMockElement() {
    return {
      scrollIntoView: scrollIntoViewMock,
      addEventListener: addEventListenerMock,
      removeEventListener: removeEventListenerMock,
    } as unknown as HTMLDivElement
  }

  test('返回 bottomRef 和 containerRef', () => {
    const { result } = renderHook(() => useAutoScroll({ loading: false, messageCount: 0 }))

    expect(result.current.bottomRef).toBeDefined()
    expect(result.current.containerRef).toBeDefined()
  })

  test('messageCount 变化时滚动到底部', () => {
    const mockBottom = createMockElement()
    const { result, rerender } = renderHook(
      ({ count }) => useAutoScroll({ loading: false, messageCount: count }),
      { initialProps: { count: 0 } }
    )

    act(() => {
      result.current.bottomRef.current = mockBottom
    })

    rerender({ count: 1 })

    expect(scrollIntoViewMock).toHaveBeenCalledWith({ behavior: 'smooth' })
  })

  test('loading 为 true 时按 interval 定时滚动', () => {
    const mockBottom = createMockElement()
    const { result } = renderHook(() =>
      useAutoScroll({ loading: true, messageCount: 0, interval: 100 })
    )

    act(() => {
      result.current.bottomRef.current = mockBottom
    })

    expect(scrollIntoViewMock).not.toHaveBeenCalled()

    act(() => {
      vi.advanceTimersByTime(100)
    })

    expect(scrollIntoViewMock).toHaveBeenCalledTimes(1)

    act(() => {
      vi.advanceTimersByTime(100)
    })

    expect(scrollIntoViewMock).toHaveBeenCalledTimes(2)
  })

  test('loading 变为 false 时停止定时滚动并补滚一次', () => {
    const mockBottom = createMockElement()
    const { result, rerender } = renderHook(
      ({ loading }) => useAutoScroll({ loading, messageCount: 1 }),
      { initialProps: { loading: true } }
    )

    act(() => {
      result.current.bottomRef.current = mockBottom
    })

    act(() => {
      vi.advanceTimersByTime(100)
    })

    expect(scrollIntoViewMock).toHaveBeenCalledTimes(1)

    rerender({ loading: false })

    // loading 结束时补滚一次
    expect(scrollIntoViewMock).toHaveBeenCalledTimes(2)
  })

  test('loading 变为 false 时若未滚动则补滚', () => {
    const mockBottom = createMockElement()
    const { result, rerender } = renderHook(
      ({ loading }) => useAutoScroll({ loading, messageCount: 1 }),
      { initialProps: { loading: true } }
    )

    act(() => {
      result.current.bottomRef.current = mockBottom
    })

    // 让定时器触发一次
    act(() => {
      vi.advanceTimersByTime(100)
    })

    const countBeforeRerender = scrollIntoViewMock.mock.calls.length

    rerender({ loading: false })

    // 用户未滚动，loading 结束时补滚一次
    expect(scrollIntoViewMock).toHaveBeenCalledTimes(countBeforeRerender + 1)
  })

  test('可自定义 interval', () => {
    const mockBottom = createMockElement()
    const { result } = renderHook(() =>
      useAutoScroll({ loading: true, messageCount: 0, interval: 200 })
    )

    act(() => {
      result.current.bottomRef.current = mockBottom
    })

    act(() => {
      vi.advanceTimersByTime(100)
    })

    expect(scrollIntoViewMock).not.toHaveBeenCalled()

    act(() => {
      vi.advanceTimersByTime(100)
    })

    expect(scrollIntoViewMock).toHaveBeenCalledTimes(1)
  })

  test('组件卸载时清理定时器', () => {
    const mockBottom = createMockElement()
    const { result, unmount } = renderHook(() => useAutoScroll({ loading: true, messageCount: 0 }))

    act(() => {
      result.current.bottomRef.current = mockBottom
    })

    act(() => {
      vi.advanceTimersByTime(100)
    })

    expect(scrollIntoViewMock).toHaveBeenCalledTimes(1)

    unmount()

    // 卸载后定时器不再触发
    act(() => {
      vi.advanceTimersByTime(200)
    })

    expect(scrollIntoViewMock).toHaveBeenCalledTimes(1)
  })
})
