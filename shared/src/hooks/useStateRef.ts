import { useCallback, useRef, useState } from 'react'

type Dispatch<T> = (action: T | ((prev: T) => T)) => void

/**
 * useState + useRef 的组合 Hook
 *
 * 解决异步回调中读取到 state 陈旧值的问题：
 * - `state` 用于驱动渲染（与 useState 一致）
 * - `ref.current` 始终是最新值，可在闭包/异步中安全读取
 *
 * @returns `[state, dispatch, ref]`
 */
export function useStateRef<T>(initial: T): [T, Dispatch<T>, React.RefObject<T>] {
  const [state, setState] = useState<T>(initial)
  const ref = useRef<T>(state)

  const dispatch = useCallback<Dispatch<T>>(action => {
    const next = typeof action === 'function' ? (action as (prev: T) => T)(ref.current) : action
    if (ref.current === next) return
    ref.current = next
    setState(next)
  }, [])

  return [state, dispatch, ref]
}
