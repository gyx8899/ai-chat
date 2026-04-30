import React, {
  createContext,
  memo,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

// ─── Context ──────────────────────────────────────────────────────────────────

export interface PreloadContextType {
  /** 设置需要预加载的图片 URL 列表，自动去重并过滤空值 */
  setPreloadUrls: (urls: string[]) => void
}

const PreloadContext = createContext<PreloadContextType | null>(null)

// ─── Provider ─────────────────────────────────────────────────────────────────

export interface PreloadProviderProps {
  children: React.ReactNode
}

/**
 * 图片预加载 Provider
 *
 * 通过 `new Image()` 在浏览器后台预加载图片，不渲染任何 DOM 节点。
 * 子组件通过 `usePreload()` 动态注册待预加载的 URL。
 *
 * 特性：
 * - 零 DOM：不插入隐藏元素，对布局无任何影响
 * - 自动去重：相同 URL 只创建一次 Image 对象
 * - 增量加载：已加载过的 URL 不会重复触发
 * - SSR 安全：在无 `window` 环境下静默跳过
 *
 * @example
 * // 根节点注册
 * <PreloadProvider>
 *   <App />
 * </PreloadProvider>
 *
 * // 子组件按需预加载
 * const { setPreloadUrls } = usePreload()
 * useEffect(() => {
 *   setPreloadUrls([banner1, banner2, avatar])
 * }, [])
 */
export const PreloadProvider = memo(({ children }: PreloadProviderProps) => {
  const [urls, setUrls] = useState<string[]>([])

  const setPreloadUrls = useCallback((newUrls: string[]) => {
    const unique = Array.from(new Set(newUrls.filter(Boolean)))
    setUrls(unique)
  }, [])

  const value = useMemo(() => ({ setPreloadUrls }), [setPreloadUrls])

  return (
    <PreloadContext.Provider value={value}>
      {children}
      <Preloader urls={urls} />
    </PreloadContext.Provider>
  )
})

PreloadProvider.displayName = 'PreloadProvider'

// ─── Preloader（内部实现）──────────────────────────────────────────────────────

/**
 * 内部组件：仅负责触发预加载，不渲染任何节点
 */
const Preloader = memo(({ urls }: { urls: string[] }) => {
  // 记录已加载过的 URL，避免重复触发
  const loadedRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    if (typeof window === 'undefined') return

    for (const url of urls) {
      if (loadedRef.current.has(url)) continue
      loadedRef.current.add(url)
      const img = new window.Image()
      img.src = url
    }
  }, [urls])

  return null
})

Preloader.displayName = 'Preloader'

// ─── usePreload ────────────────────────────────────────────────────────────────

/**
 * 获取 `PreloadProvider` 注入的预加载控制器。
 *
 * 必须在 `PreloadProvider` 内部使用，否则返回 `null`。
 *
 * @example
 * const { setPreloadUrls } = usePreload() ?? {}
 * setPreloadUrls?.([img1, img2])
 */
export function usePreload(): PreloadContextType | null {
  return useContext(PreloadContext)
}
