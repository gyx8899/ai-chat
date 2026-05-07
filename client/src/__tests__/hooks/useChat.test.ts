import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useChat } from '@/hooks/useChat'
import { useChatStore } from '@/store/chatStore'
import { useSessionStore } from '@/store/sessionStore'

vi.mock('@/lib/detectOffline', () => ({
  isOfflineMode: vi.fn().mockReturnValue(false),
  markOffline: vi.fn(),
  markOnline: vi.fn(),
  detectOffline: vi.fn().mockResolvedValue(false),
}))

vi.mock('@/lib/localMode', () => ({
  localGenerateReply: vi.fn().mockReturnValue('local reply'),
  localAppendMessages: vi.fn(),
  LOCAL_MODELS: [],
  LOCAL_MODEL_CONFIG: {},
}))

vi.mock('@/lib/sseClient', () => ({
  streamSSE: vi.fn().mockImplementation(function* () {
    yield { content: 'test' }
  }),
  SSEHttpError: class extends Error {
    constructor(public status: number, statusText: string, body: string) {
      super(`SSE HTTP ${status} ${statusText}: ${body}`)
    }
  },
}))

vi.mock('@/hooks/useTranslation', () => ({
  useTranslation: vi.fn().mockReturnValue({ t: (key: string) => key }),
}))

describe('useChat', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    useChatStore.getState().setLoading(false)
    useChatStore.getState().setRagHint(null)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  test('返回正确的初始状态', () => {
    const { result } = renderHook(() => useChat())
    expect(result.current.loading).toBe(false)
    expect(result.current.ragHint).toBeNull()
    expect(typeof result.current.send).toBe('function')
    expect(typeof result.current.stopGeneration).toBe('function')
    expect(typeof result.current.regenerate).toBe('function')
  })

  test('send 函数存在且为函数类型', () => {
    const { result } = renderHook(() => useChat())
    expect(typeof result.current.send).toBe('function')
  })

  test('stopGeneration 函数存在且为函数类型', () => {
    const { result } = renderHook(() => useChat())
    expect(typeof result.current.stopGeneration).toBe('function')
  })

  test('regenerate 函数存在且为函数类型', () => {
    const { result } = renderHook(() => useChat())
    expect(typeof result.current.regenerate).toBe('function')
  })
})