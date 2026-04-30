import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { streamSSE, SSEHttpError, type SSEFrame } from '@/lib/sseClient'

function mockSSEResponse(frames: string[], init?: { status?: number; statusText?: string }): void {
  const encoder = new TextEncoder()
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      for (const f of frames) controller.enqueue(encoder.encode(f))
      controller.close()
    },
  })
  const status = init?.status ?? 200
  const statusText = init?.statusText ?? 'OK'
  const ok = status >= 200 && status < 300
  vi.spyOn(globalThis, 'fetch').mockResolvedValue({
    ok,
    status,
    statusText,
    body: stream,
    text: async () => frames.join(''),
  } as unknown as Response)
}

async function collect(gen: AsyncGenerator<SSEFrame, void, void>): Promise<SSEFrame[]> {
  const out: SSEFrame[] = []
  for await (const f of gen) out.push(f)
  return out
}

describe('streamSSE', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('正常 content 序列：两帧 content 后 [DONE] 退出', async () => {
    mockSSEResponse(['data: {"content":"a"}\n\n', 'data: {"content":"b"}\n\n', 'data: [DONE]\n\n'])

    const frames = await collect(streamSSE({ url: '/api/chat', body: { q: 1 } }))

    expect(frames).toEqual([{ content: 'a' }, { content: 'b' }])
  })

  it('meta 首帧 + content：meta.ragHint 独立识别', async () => {
    mockSSEResponse([
      'data: {"meta":{"ragHint":"ref-X"}}\n\n',
      'data: {"content":"y"}\n\n',
      'data: [DONE]\n\n',
    ])

    const frames = await collect(streamSSE({ url: '/api/chat', body: {} }))

    expect(frames).toEqual([{ meta: { ragHint: 'ref-X' } }, { content: 'y' }])
  })

  it('error 帧后 [DONE]：yield error 后退出', async () => {
    mockSSEResponse(['data: {"error":"oops"}\n\n', 'data: [DONE]\n\n'])

    const frames = await collect(streamSSE({ url: '/api/chat', body: {} }))

    expect(frames).toEqual([{ error: 'oops' }])
  })

  it('非 JSON 帧：跳过后续 content 正常 yield（不中断流）', async () => {
    mockSSEResponse(['data: not-json\n\n', 'data: {"content":"ok"}\n\n', 'data: [DONE]\n\n'])

    const frames = await collect(streamSSE({ url: '/api/chat', body: {} }))

    expect(frames).toEqual([{ content: 'ok' }])
  })

  it('分包到达：buffer 跨 chunk 拼接后正确分帧', async () => {
    mockSSEResponse([
      'data: {"content":"he',
      'llo"}\n\ndata: {"content":"!"}\n\n',
      'data: [DONE]\n\n',
    ])

    const frames = await collect(streamSSE({ url: '/api/chat', body: {} }))

    expect(frames).toEqual([{ content: 'hello' }, { content: '!' }])
  })

  it('abort：signal.abort() 导致 fetch 抛 AbortError', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(
      (_url: RequestInfo | URL, init?: RequestInit) => {
        return new Promise<Response>((_, reject) => {
          const signal = init?.signal
          if (signal) {
            if (signal.aborted) {
              const err = new DOMException('Aborted', 'AbortError')
              reject(err)
              return
            }
            signal.addEventListener('abort', () => {
              const err = new DOMException('Aborted', 'AbortError')
              reject(err)
            })
          }
        })
      }
    )

    const controller = new AbortController()
    const genPromise = collect(streamSSE({ url: '/api/chat', body: {}, signal: controller.signal }))
    controller.abort()

    await expect(genPromise).rejects.toMatchObject({ name: 'AbortError' })
  })

  it('HTTP 4xx：抛 SSEHttpError 并携带 status / statusText / body', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
      body: null,
      text: async () => '{"error":"no token"}',
    } as unknown as Response)

    const gen = streamSSE({ url: '/api/chat', body: {} })

    try {
      await collect(gen)
      throw new Error('should have thrown')
    } catch (err) {
      expect(err).toBeInstanceOf(SSEHttpError)
      const e = err as SSEHttpError
      expect(e.status).toBe(401)
      expect(e.statusText).toBe('Unauthorized')
      expect(e.body).toContain('no token')
    }
  })

  it('response.body 缺失：抛通用错误', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      body: null,
      text: async () => '',
    } as unknown as Response)

    await expect(collect(streamSSE({ url: '/api/chat', body: {} }))).rejects.toThrow(/no body/i)
  })

  it('未以 "data:" 开头的行：跳过后 content 正常 yield', async () => {
    mockSSEResponse(['event: ping\n\n', 'data: {"content":"z"}\n\n', 'data: [DONE]\n\n'])

    const frames = await collect(streamSSE({ url: '/api/chat', body: {} }))

    expect(frames).toEqual([{ content: 'z' }])
  })
})
