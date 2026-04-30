import { useEffect, useRef } from 'react'

interface UseAutoScrollOptions {
  /** 是否正在流式输出 */
  loading: boolean
  /** 消息数量，数量变化时立即滚动到底部 */
  messageCount: number
  /** 流式期间持续滚动的间隔（ms），默认 100 */
  interval?: number
}

interface UseAutoScrollReturn {
  bottomRef: React.RefObject<HTMLDivElement | null>
  containerRef: React.RefObject<HTMLDivElement | null>
}

/**
 * 自动滚动到底部，同时支持流式输出期间用户主动滚动时中断自动滚动。
 *
 * 行为：
 * - 新消息加入时立即滚动到底部
 * - 流式输出（loading=true）期间每隔 `interval` ms 滚动一次
 * - 流式输出期间用户向上滚动（wheel / touchmove / 方向键）时，取消后续自动滚动
 * - loading 变为 false 时：若用户未主动滚动则补滚一次确保按钮露出，再重置标志供下次使用
 */
export function useAutoScroll({
  loading,
  messageCount,
  interval = 100,
}: UseAutoScrollOptions): UseAutoScrollReturn {
  const bottomRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  // 用 ref 记录，避免触发不必要的重渲染
  const userScrolledRef = useRef(false)

  // 监听用户主动向上滚动，设置中断标志
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const onWheel = (e: WheelEvent) => {
      if (loading && e.deltaY < 0) userScrolledRef.current = true
    }
    const onTouchMove = () => {
      if (loading) userScrolledRef.current = true
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (loading && (e.key === 'ArrowUp' || e.key === 'PageUp')) {
        userScrolledRef.current = true
      }
    }

    container.addEventListener('wheel', onWheel, { passive: true })
    container.addEventListener('touchmove', onTouchMove, { passive: true })
    container.addEventListener('keydown', onKeyDown)
    return () => {
      container.removeEventListener('wheel', onWheel)
      container.removeEventListener('touchmove', onTouchMove)
      container.removeEventListener('keydown', onKeyDown)
    }
  }, [loading])

  // 新消息加入时立即滚动
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messageCount])

  // 流式输出期间持续滚动；
  // loading 结束时：若用户未主动滚动则补滚一次确保按钮露出，最后重置标志
  useEffect(() => {
    if (!loading) {
      if (!userScrolledRef.current) {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
      }
      // 重置放在滚动判断之后，确保本次 loading 的用户意图被完整保留
      userScrolledRef.current = false
      return
    }
    const id = setInterval(() => {
      if (userScrolledRef.current) return
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, interval)
    return () => clearInterval(id)
  }, [loading, interval])

  return { bottomRef, containerRef }
}
