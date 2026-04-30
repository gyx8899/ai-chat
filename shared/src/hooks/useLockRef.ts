import { useCallback } from 'react'
import { useStateRef } from './useStateRef'
import { useTimeout } from './useTimeout'

export interface UseLockOptions {
  /** 自动解锁延迟时间（ms）默认 1000 */
  unLockDelay?: number
}

/**
 * 防重复提交锁 Hook
 *
 * - `lockedRef.current` 实时锁定状态，可在异步闭包中安全读取
 * - `setLocked(true)` 上锁并启动自动解锁计时器
 * - `setLocked(true)` 在已锁定时再次调用，重置计时器（延长锁定时长）
 * - `setLocked(false)` 主动解锁并取消计时器
 * - 组件卸载时自动清理，防止内存泄漏
 *
 * @returns `[lockedRef, setLocked]`
 *
 * @example
 * const [lockedRef, setLocked] = useLockRef({ unLockDelay: 2000 })
 *
 * const handleSubmit = async () => {
 *   if (lockedRef.current) return
 *   setLocked(true)
 *   await submit()
 * }
 */
export function useLockRef(options: UseLockOptions = {}) {
  const { unLockDelay = 1000 } = options

  const [, setIsLocked, lockedRef] = useStateRef(false)
  const timer = useTimeout()

  const setLocked = useCallback(
    (locked: boolean) => {
      setIsLocked(locked)
      if (locked) {
        timer.set(() => setIsLocked(false), unLockDelay)
      } else {
        timer.clear()
      }
    },
    [setIsLocked, timer, unLockDelay]
  )

  return [lockedRef, setLocked] as const
}
