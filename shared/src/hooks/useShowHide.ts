import { useEffect, useRef, useState } from 'react'

export interface UseShowHideOptions {
  /**
   * 初始可见状态，默认 `true`。
   * 设为 `false` 可在首帧即视为隐藏（如页面默认后台加载场景）。
   */
  defaultVisible?: boolean
  /** 可见时回调 */
  onShow?: () => void
  /** 隐藏时回调 */
  onHide?: () => void
}

/**
 * 页面可见性 Hook
 *
 * 监听 `document.visibilitychange` 事件，追踪页面是否处于前台可见状态。
 * 可用于暂停后台不必要的定时器、动画、数据轮询等。
 *
 * @returns `isVisible` — 当前是否可见
 *
 * @example
 * const isVisible = useShowHide({ onHide: () => pause(), onShow: () => resume() })
 */
export function useShowHide(options: UseShowHideOptions = {}): boolean {
  const { defaultVisible = true, onShow, onHide } = options

  const [isVisible, setIsVisible] = useState<boolean>(() => {
    // SSR 环境或 document 不可用时，沿用默认值
    if (typeof document === 'undefined') return defaultVisible
    return document.visibilityState !== 'hidden'
  })

  const onShowRef = useRef(onShow)
  const onHideRef = useRef(onHide)

  // 在 effect 中同步 ref，避免在 render 中更新 ref
  useEffect(() => {
    onShowRef.current = onShow
    onHideRef.current = onHide
  })

  useEffect(() => {
    if (typeof document === 'undefined') return

    const handleVisibilityChange = () => {
      const visible = document.visibilityState !== 'hidden'
      setIsVisible(visible)
      if (visible) {
        onShowRef.current?.()
      } else {
        onHideRef.current?.()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  return isVisible
}
