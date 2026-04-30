import { create } from 'zustand'
import type { Locale } from '@/locales'
import { resolveInitialTheme, toggleTheme } from '@shared/utils'

interface UIState {
  isDark: boolean
  sidebarOpen: boolean
  lang: Locale
  tweaksOpen: boolean
  tweaksHue: number
  bgDecor: boolean
}

interface UIActions {
  toggleDark: () => void
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  toggleLang: () => void
  setTweaksOpen: (open: boolean) => void
  setHue: (hue: number) => void
  toggleBgDecor: () => void
}

function getInitialLang(): Locale {
  const saved = localStorage.getItem('lang')
  if (saved === 'zh' || saved === 'en') return saved
  return navigator.language.startsWith('zh') ? 'zh' : 'en'
}

function getHue(): number {
  const saved = Number(localStorage.getItem('tweaks_hue'))
  return Number.isFinite(saved) ? saved : 200
}

function getBgDecor(): boolean {
  return localStorage.getItem('tweaks_bg_decor') !== 'false'
}

export const useUIStore = create<UIState & UIActions>(set => ({
  isDark: resolveInitialTheme() === 'dark',
  sidebarOpen: false,
  lang: getInitialLang(),
  tweaksOpen: false,
  tweaksHue: getHue(),
  bgDecor: getBgDecor(),

  toggleDark: () => set(() => ({ isDark: toggleTheme() === 'dark' })),

  toggleSidebar: () => set(state => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: open => set({ sidebarOpen: open }),

  toggleLang: () =>
    set(state => {
      const next: Locale = state.lang === 'zh' ? 'en' : 'zh'
      localStorage.setItem('lang', next)
      return { lang: next }
    }),

  setTweaksOpen: open => set({ tweaksOpen: open }),
  setHue: hue => {
    localStorage.setItem('tweaks_hue', String(hue))
    set({ tweaksHue: hue })
  },
  toggleBgDecor: () =>
    set(state => {
      const next = !state.bgDecor
      localStorage.setItem('tweaks_bg_decor', String(next))
      return { bgDecor: next }
    }),
}))
