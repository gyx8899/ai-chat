import { useCallback, useEffect, useRef } from 'react'

/**
 * 内存安全的定时器 Hook
 *
 * - `set(fn, delay)` 设置定时器，自动清除上一个（支持"锁延长"场景）
 * - `clear()` 手动清除
 * - 组件卸载时自动清除，防止内存泄漏
 */
export function useTimeout() {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clear = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const set = useCallback(
    (fn: () => void, delay: number) => {
      clear()
      if (delay >= 0) {
        timerRef.current = setTimeout(fn, delay)
      }
    },
    [clear]
  )

  useEffect(() => clear, [clear])

  return { set, clear }
}
