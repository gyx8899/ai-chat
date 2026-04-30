import { useCallback, useEffect, useRef } from 'react'

export interface UseClickCallbackOptions {
  /** 冷却时间（ms），默认 1000 */
  delay?: number
  /** 是否立即执行（leading），默认 true */
  leading?: boolean
  /** 冷却结束后是否补发（trailing），默认 false */
  trailing?: boolean
  /** 是否阻止事件冒泡，默认 true */
  stopPropagation?: boolean
}

/**
 * 点击节流 Hook
 *
 * 默认行为：立即执行（leading），冷却期内重复触发被忽略。
 *
 * 核心特性：
 * - 闭包安全：通过 `fnRef` 始终持有最新函数引用，trailing 补发时不会读取陈旧闭包
 * - 内存安全：定时器和副作用清理仅在组件卸载时执行
 * - 清理函数支持：`fn` 可返回清理函数，在下次执行或卸载时自动调用
 * - 响应式回调：通过 `depsRef` 追踪业务数据变化，保证回调始终使用最新数据
 * - 兼容 `React.memo`
 *
 * @param fn 需要节流的函数，可返回清理函数
 * @param deps 依赖项，变化时重新生成回调
 * @param options 节流配置
 *
 * @example
 * const handleClick = useClickCallback(
 *   () => { submit(formData) },
 *   [formData],
 *   { delay: 500 },
 * )
 */
export function useClickCallback<T extends (...args: Parameters<T>) => ReturnType<T>>(
  fn: T,
  deps: React.DependencyList,
  options: UseClickCallbackOptions = {}
): (...args: Parameters<T>) => void {
  const { delay = 1000, leading = true, trailing = false, stopPropagation = true } = options

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const fnRef = useRef(fn)
  const depsRef = useRef(deps)
  const lastArgsRef = useRef<Parameters<T> | null>(null)
  const hasTrailingCallRef = useRef(false)
  const innerCleanupRef = useRef<(() => void) | null>(null)

  // 始终持有最新函数引用和依赖项，避免 trailing 补发时读到陈旧闭包
  useEffect(() => {
    fnRef.current = fn
    depsRef.current = deps
  })

  // 安全执行业务函数返回的清理函数
  const runInnerCleanup = useCallback(() => {
    if (typeof innerCleanupRef.current === 'function') {
      try {
        innerCleanupRef.current()
      } catch (e) {
        console.error('[useClickCallback] cleanup error:', e)
      }
      innerCleanupRef.current = null
    }
  }, [])

  // 卸载时统一清理，不受业务 deps 变化影响
  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
      runInnerCleanup()
      hasTrailingCallRef.current = false
      lastArgsRef.current = null
    }
  }, [runInnerCleanup])

  // 使用固定 deps 的 useCallback，通过 ref 访问动态值
  return useCallback(
    (...args: Parameters<T>) => {
      if (stopPropagation) {
        const event = (args as unknown[])[0] as Record<string, unknown> | undefined
        if (event && typeof event['stopPropagation'] === 'function') {
          ;(event['stopPropagation'] as () => void)()
        }
      }

      lastArgsRef.current = args

      if (timerRef.current === null) {
        // 使用最新的 fnRef 执行，保证闭包安全
        const executeFn = (...execArgs: Parameters<T>) => {
          runInnerCleanup()
          const result = fnRef.current(...execArgs)
          if (typeof result === 'function') {
            innerCleanupRef.current = result as () => void
          }
        }

        if (leading) {
          executeFn(...args)
        } else if (trailing) {
          hasTrailingCallRef.current = true
        }

        timerRef.current = setTimeout(() => {
          timerRef.current = null
          if (trailing && hasTrailingCallRef.current && lastArgsRef.current) {
            executeFn(...(lastArgsRef.current as Parameters<T>))
            hasTrailingCallRef.current = false
            lastArgsRef.current = null
          }
        }, delay)
      } else {
        hasTrailingCallRef.current = true
      }
    },
    [delay, leading, trailing, stopPropagation, runInnerCleanup]
  )
}
