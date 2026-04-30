import { useCallback, useEffect, useRef } from 'react'

/**
 * 安全序列化，捕获循环引用等异常
 * @returns 序列化字符串，序列化失败返回 undefined
 */
export function safeStringify(data: unknown): string | undefined {
  try {
    return JSON.stringify(data)
  } catch (error) {
    console.error('[safeStringify]', error)
    return undefined
  }
}

/**
 * 数据变化检测 Hook
 *
 * 通过 JSON 序列化深比较数据是否变化，避免引用地址不稳定导致的误判。
 *
 * @param data 可选初始值，变化时自动同步到内部 ref
 * @returns `{ checkDataChanged }` — 传入新数据，返回是否发生变化
 *
 * @example
 * const { checkDataChanged } = useDataChanged<MyData>()
 *
 * useEffect(() => {
 *   if (checkDataChanged(data)) {
 *     setFloorData(prev => ({ ...prev, ...data }))
 *   }
 * }, [data])
 */
export function useDataChanged<T>(data?: T) {
  const snapshot = useRef<string | undefined>(undefined)

  useEffect(() => {
    if (data !== undefined) {
      snapshot.current = safeStringify(data)
    }
  }, [data])

  const checkDataChanged = useCallback((next: T): boolean => {
    const nextStr = safeStringify(next)

    // 序列化失败视为无变化，跳过更新
    if (nextStr === undefined) return false

    // 首次检查视为有变化
    if (snapshot.current === undefined) {
      snapshot.current = nextStr
      return true
    }

    const changed = snapshot.current !== nextStr
    if (changed) snapshot.current = nextStr
    return changed
  }, [])

  return { checkDataChanged }
}
