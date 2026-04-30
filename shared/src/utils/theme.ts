export type ThemeMode = 'dark' | 'light'

/* ── 主题模式 (dark / light) ─────────────────────────────── */

/**
 * 读取初始主题模式
 *
 * 优先级：`localStorage[key]` > `prefers-color-scheme` > `defaultMode`
 */
export function resolveInitialTheme(key = 'theme', defaultMode: ThemeMode = 'light'): ThemeMode {
  if (typeof window === 'undefined') return defaultMode

  const saved = localStorage.getItem(key)
  if (saved === 'dark' || saved === 'light') return saved

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

/**
 * 将主题模式应用到 `document.documentElement`
 *
 * - 切换 `dark` class（Tailwind dark mode）
 * - 持久化到 localStorage
 */
export function applyTheme(mode: ThemeMode, key = 'theme'): void {
  if (typeof document === 'undefined') return
  document.documentElement.classList.toggle('dark', mode === 'dark')
  localStorage.setItem(key, mode)
}

/**
 * 切换当前主题并持久化
 *
 * @returns 切换后的主题模式
 */
export function toggleTheme(key = 'theme'): ThemeMode {
  const current = resolveInitialTheme(key)
  const next: ThemeMode = current === 'dark' ? 'light' : 'dark'
  applyTheme(next, key)
  return next
}

/* ── 品牌视觉初始化 (在 React 挂载前调用，避免 FOUC) ─────── */

/** 从 localStorage 恢复品牌色相并设置 CSS 变量 `--brand-h` */
function initBrandHue(): void {
  if (typeof document === 'undefined') return
  const saved = Number(localStorage.getItem('tweaks_hue'))
  if (Number.isFinite(saved)) {
    document.documentElement.style.setProperty('--brand-h', String(saved))
  }
}

/** 从 localStorage 恢复背景装饰开关并设置 data 属性 */
function initBgDecor(): void {
  if (typeof document === 'undefined') return
  if (localStorage.getItem('tweaks_bg_decor') === 'false') {
    document.documentElement.dataset.bgDecor = 'false'
  }
}

/**
 * 同步初始化所有品牌视觉设置（在 React 渲染前调用）
 *
 * @example
 * // main.tsx 顶部
 * initBrandVisuals()
 * applyTheme(resolveInitialTheme())
 */
export function initBrandVisuals(): void {
  initBrandHue()
  initBgDecor()
}
