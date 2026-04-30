import { logger } from '@shared/utils'

const log = logger.withPrefix('[sseClient]')

/**
 * SSE 协议合法帧类型（三者互斥，对齐项目 SSE 流式接口规范）
 * - `content` 帧：正常 token 流
 * - `error`   帧：后端异常
 * - `meta`    帧：元数据（首帧 ragHint 等）
 */
export type SSEFrame = { content: string } | { error: string } | { meta: { ragHint?: string } }

export interface StreamSSEOptions {
  url: string
  body: unknown
  signal?: AbortSignal
  headers?: Record<string, string>
}

/** HTTP 4xx/5xx 或非 ok 响应抛出的错误 */
export class SSEHttpError extends Error {
  status: number
  statusText: string
  body: string

  constructor(status: number, statusText: string, body: string) {
    super(`SSE HTTP ${status} ${statusText}: ${body}`)
    this.name = 'SSEHttpError'
    this.status = status
    this.statusText = statusText
    this.body = body
  }
}

const DONE_MARKER = '[DONE]'
const DATA_PREFIX = 'data:'

function parseFrame(raw: string): SSEFrame | null {
  try {
    const parsed: unknown = JSON.parse(raw)
    if (parsed && typeof parsed === 'object') {
      const obj = parsed as Record<string, unknown>
      if (typeof obj['content'] === 'string') {
        return { content: obj['content'] }
      }
      if (typeof obj['error'] === 'string') {
        return { error: obj['error'] }
      }
      if (obj['meta'] && typeof obj['meta'] === 'object') {
        const meta = obj['meta'] as Record<string, unknown>
        const ragHint = typeof meta['ragHint'] === 'string' ? meta['ragHint'] : undefined
        return { meta: { ragHint } }
      }
    }
    log.warn('unknown SSE frame shape, skipped', raw)
    return null
  } catch (err) {
    log.warn('SSE JSON parse error', raw, err)
    return null
  }
}

/**
 * SSE 流消费器（async generator）
 *
 * 职责：fetch → 响应头校验 → ReadableStream 读取 → `\n\n` 分帧 →
 * `data:` 前缀剥离 → `[DONE]` 识别退出 → JSON 解析容错。
 *
 * 退出契约：
 * - 收到 `data: [DONE]` → 正常 return
 * - `response.body.read()` done → 正常 return（后端未按规范发 DONE 的兜底）
 * - signal.abort() → 抛出 AbortError
 * - `!response.ok` → 抛出 SSEHttpError
 *
 * @example
 * for await (const frame of streamSSE({ url: '/api/chat', body, signal })) {
 *   if ('content' in frame) append(frame.content)
 *   else if ('error' in frame) showError(frame.error)
 *   else if ('meta' in frame) setHint(frame.meta.ragHint)
 * }
 */
export async function* streamSSE(options: StreamSSEOptions): AsyncGenerator<SSEFrame, void, void> {
  const { url, body, signal, headers } = options

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: JSON.stringify(body),
    signal,
  })

  if (!response.ok) {
    let errBody = ''
    try {
      errBody = await response.text()
    } catch {
      // ignore
    }
    throw new SSEHttpError(response.status, response.statusText, errBody)
  }

  if (!response.body) {
    throw new Error('SSE response has no body')
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  try {
    while (true) {
      const { value, done } = await reader.read()
      if (done) return

      buffer += decoder.decode(value, { stream: true })

      let sepIdx: number
      while ((sepIdx = buffer.indexOf('\n\n')) !== -1) {
        const part = buffer.slice(0, sepIdx)
        buffer = buffer.slice(sepIdx + 2)

        const trimmed = part.trim()
        if (!trimmed) continue
        if (!trimmed.startsWith(DATA_PREFIX)) {
          log.warn('SSE frame missing "data:" prefix, skipped', trimmed)
          continue
        }

        const payload = trimmed.slice(DATA_PREFIX.length).trim()
        if (payload === DONE_MARKER) return

        const frame = parseFrame(payload)
        if (frame) yield frame
      }
    }
  } finally {
    try {
      reader.releaseLock()
    } catch {
      // releaseLock 在 reader 已释放时会抛错，忽略
    }
  }
}
