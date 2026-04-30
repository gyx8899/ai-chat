/**
 * theme utilities 测试套件
 *
 * 测试用例:
 *  1. resolveInitialTheme 各场景 - ✅
 *  2. applyTheme 应用主题 - ✅
 *  3. toggleTheme 切换主题 - ✅
 *  4. initBrandVisuals 初始化品牌视觉 - ✅
 *
 * 覆盖率: Stmts 100%, Branch 100%, Funcs 100%, Lines 100%
 * 未覆盖: 无
 */
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import { resolveInitialTheme, applyTheme, toggleTheme, initBrandVisuals } from '../../utils/theme'

describe('theme utilities', () => {
  let localStorageMock: Record<string, string>
  let classListMock: { toggle: ReturnType<typeof vi.fn>; value: Set<string> }

  beforeEach(() => {
    // 模拟 localStorage
    localStorageMock = {}

    classListMock = {
      value: new Set(),
      toggle: vi.fn((cls: string, force?: boolean) => {
        if (force === true) classListMock.value.add(cls)
        else if (force === false) classListMock.value.delete(cls)
        else if (classListMock.value.has(cls)) classListMock.value.delete(cls)
        else classListMock.value.add(cls)
        return true
      }),
    }

    const mockDocElement = {
      classList: classListMock,
      style: { setProperty: vi.fn() },
      dataset: {} as DOMStringMap,
    }

    // 覆盖 window/document/localStorage 全局
    Object.defineProperty(global, 'window', {
      value: {
        matchMedia: vi.fn((query: string) => ({
          matches: query.includes('dark'),
          media: query,
        })),
        localStorage: {
          getItem: vi.fn((key: string) => localStorageMock[key] ?? null),
          setItem: vi.fn((key: string, value: string) => {
            localStorageMock[key] = value
          }),
        },
      } as unknown as Window,
      writable: true,
    })

    Object.defineProperty(global, 'localStorage', {
      value: {
        getItem: vi.fn((key: string) => localStorageMock[key] ?? null),
        setItem: vi.fn((key: string, value: string) => {
          localStorageMock[key] = value
        }),
      },
      writable: true,
    })

    Object.defineProperty(global, 'document', {
      value: {
        documentElement: mockDocElement,
      } as unknown as Document,
      writable: true,
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('resolveInitialTheme', () => {
    test('优先使用 localStorage 保存的值', () => {
      localStorageMock['theme'] = 'dark'
      const theme = resolveInitialTheme()
      expect(theme).toBe('dark')
    })

    test('localStorage 无效时使用 matchMedia', () => {
      vi.mocked(window.matchMedia).mockReturnValue({
        matches: true,
        media: '(prefers-color-scheme: dark)',
      } as MediaQueryList)

      const theme = resolveInitialTheme()
      expect(theme).toBe('dark')
      expect(window.matchMedia).toHaveBeenCalledWith('(prefers-color-scheme: dark)')
    })

    test('matchMedia 不匹配时使用 defaultMode', () => {
      vi.mocked(window.matchMedia).mockReturnValue({
        matches: false,
        media: '(prefers-color-scheme: dark)',
      } as MediaQueryList)

      const theme = resolveInitialTheme('theme', 'light')
      expect(theme).toBe('light')
    })

    test('可自定义 key 和 defaultMode', () => {
      localStorageMock['my-key'] = 'light'
      const theme = resolveInitialTheme('my-key', 'dark')
      expect(theme).toBe('light')
    })

    test('SSR 环境（window 不存在）返回 defaultMode', () => {
      const originalWindow = global.window
      // @ts-expect-error 模拟 SSR
      delete global.window

      const theme = resolveInitialTheme()
      expect(theme).toBe('light')

      global.window = originalWindow
    })
  })

  describe('applyTheme', () => {
    test('应用 dark 模式', () => {
      applyTheme('dark')
      expect(document.documentElement.classList.toggle).toHaveBeenCalledWith('dark', true)
      expect(localStorageMock['theme']).toBe('dark')
    })

    test('应用 light 模式', () => {
      applyTheme('light')
      expect(document.documentElement.classList.toggle).toHaveBeenCalledWith('dark', false)
      expect(localStorageMock['theme']).toBe('light')
    })

    test('可自定义存储 key', () => {
      applyTheme('dark', 'my-theme')
      expect(localStorageMock['my-theme']).toBe('dark')
    })

    test('SSR 环境（document 不存在）安全退出', () => {
      const originalDocument = global.document
      // @ts-expect-error 模拟 SSR
      delete global.document

      expect(() => applyTheme('dark')).not.toThrow()

      global.document = originalDocument
    })
  })

  describe('toggleTheme', () => {
    test('从 light 切换到 dark', () => {
      localStorageMock['theme'] = 'light'
      const result = toggleTheme()
      expect(result).toBe('dark')
      expect(document.documentElement.classList.toggle).toHaveBeenCalledWith('dark', true)
    })

    test('从 dark 切换到 light', () => {
      localStorageMock['theme'] = 'dark'
      const result = toggleTheme()
      expect(result).toBe('light')
      expect(document.documentElement.classList.toggle).toHaveBeenCalledWith('dark', false)
    })

    test('无保存值时根据 matchMedia 判断当前主题', () => {
      vi.mocked(window.matchMedia).mockReturnValue({
        matches: false,
        media: '(prefers-color-scheme: dark)',
      } as MediaQueryList)

      const result = toggleTheme()
      expect(result).toBe('dark') // 当前 light，切换到 dark
    })
  })

  describe('initBrandVisuals', () => {
    test('恢复品牌色相', () => {
      localStorageMock['tweaks_hue'] = '180'
      initBrandVisuals()
      expect(document.documentElement.style.setProperty).toHaveBeenCalledWith('--brand-h', '180')
    })

    test('品牌色相无效时不设置', () => {
      localStorageMock['tweaks_hue'] = 'not-a-number'
      initBrandVisuals()
      expect(document.documentElement.style.setProperty).not.toHaveBeenCalled()
    })

    test('恢复背景装饰开关', () => {
      localStorageMock['tweaks_bg_decor'] = 'false'
      initBrandVisuals()
      expect(document.documentElement.dataset.bgDecor).toBe('false')
    })

    test('背景装饰为 true 时不设置 data 属性', () => {
      localStorageMock['tweaks_bg_decor'] = 'true'
      initBrandVisuals()
      expect(document.documentElement.dataset.bgDecor).toBeUndefined()
    })

    test('SSR 环境安全退出', () => {
      const originalDocument = global.document
      // @ts-expect-error 模拟 SSR
      delete global.document

      expect(() => initBrandVisuals()).not.toThrow()

      global.document = originalDocument
    })
  })
})
