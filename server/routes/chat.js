const express = require('express')
const router = express.Router()
const { streamChat, SYSTEM_PROMPT } = require('../services/llmService')
const { retrieveContext } = require('../services/ragService')
const { addMessage, summarizeHistory } = require('../services/memoryService')

const MAX_QUERY_LENGTH = 4000
const SESSION_ID_PATTERN = /^[A-Za-z0-9_-]{1,128}$/

/**
 * 校验 /api/chat 入参
 * @param {unknown} body
 * @returns {{ ok: true, query: string, sessionId: string } | { ok: false, error: string }}
 */
function validateChatParams(body) {
  if (!body || typeof body !== 'object') {
    return { ok: false, error: '缺少请求体' }
  }
  const { query, sessionId, attachments } = body
  if (typeof query !== 'string' || query.length > MAX_QUERY_LENGTH) {
    return { ok: false, error: `query 长度需在 0-${MAX_QUERY_LENGTH} 字符之间` }
  }
  if (typeof sessionId !== 'string' || !SESSION_ID_PATTERN.test(sessionId)) {
    return { ok: false, error: 'sessionId 格式非法（仅允许字母/数字/_/-，长度 1-128）' }
  }
  return { ok: true, query, sessionId, attachments }
}

/**
 * 仅在 res 仍可写时写入，避免 client 断开后报 "write after end"
 * @param {import('express').Response} res
 * @param {string} chunk
 */
function safeWrite(res, chunk) {
  if (res.writableEnded || res.destroyed) return false
  return res.write(chunk)
}

/**
 * POST /api/chat - 流式对话接口（SSE）
 * 协议：data: {content|error|meta} 帧 + data: [DONE] 结束标志
 * 详见项目 SSE 流式接口规范（.ai/project/rules.md §2.4）
 */
router.post('/', async (req, res) => {
  const validation = validateChatParams(req.body)
  if (!validation.ok) {
    return res.status(400).json({ error: validation.error })
  }
  const { query, sessionId, attachments } = validation

  // ── SSE 响应头（R7.1） ──
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8')
  res.setHeader('Cache-Control', 'no-cache, no-transform')
  res.setHeader('Connection', 'keep-alive')
  res.setHeader('X-Accel-Buffering', 'no')
  res.flushHeaders()

  // ── 客户端断开感知（R4.1） ──
  const controller = new AbortController()
  let clientClosed = false
  const onClose = () => {
    if (clientClosed) return
    clientClosed = true
    controller.abort()
  }
  res.on('close', onClose)

  let fullContent = ''

  try {
    // 1. RAG 检索
    const ragResult = retrieveContext(query)

    // 2. 历史对话
    const history = await summarizeHistory(sessionId)

    // 3. 先保存用户消息（确保中断时不丢失）
    addMessage(sessionId, 'user', query)

    // 4. 组装 messages
    let userContent = query
    if (attachments && Array.isArray(attachments) && attachments.length > 0) {
      const names = attachments.map(a => a.name || '图片').join('、')
      userContent += `\n\n[用户上传了 ${attachments.length} 张图片：${names}]`
    }
    if (ragResult) {
      userContent += `\n\n[参考资料]\n${ragResult.context}`
    }

    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...history,
      { role: 'user', content: userContent },
    ]

    // 5. RAG hint 作为独立 meta 首帧（R8.2）
    if (ragResult && !clientClosed) {
      safeWrite(res, `data: ${JSON.stringify({ meta: { ragHint: ragResult.hint } })}\n\n`)
    }

    // 6. 流式调用 LLM；signal 透传由 T4 在 llmService 内消费
    for await (const token of streamChat({ messages, signal: controller.signal })) {
      if (clientClosed) break
      fullContent += token
      safeWrite(res, `data: ${JSON.stringify({ content: token })}\n\n`)
    }

    // 7. 正常结束：[DONE] + end
    if (!clientClosed) {
      safeWrite(res, 'data: [DONE]\n\n')
      res.end()
    }

    // 8. 持久化 assistant：中断标识区分（R4.3）
    const finalContent = clientClosed ? `${fullContent}\n\n[已中断]` : fullContent
    if (finalContent) {
      addMessage(sessionId, 'assistant', finalContent)
    }
  } catch (err) {
    console.error('[chat error]', err.message)
    if (!clientClosed) {
      safeWrite(res, `data: ${JSON.stringify({ error: err.message })}\n\n`)
      safeWrite(res, 'data: [DONE]\n\n')
      res.end()
    }
    // 异常时仍尝试持久化已生成的部分
    if (fullContent) {
      try {
        addMessage(sessionId, 'assistant', `${fullContent}\n\n[发生错误]`)
      } catch (saveErr) {
        console.error('[chat persist error]', saveErr.message)
      }
    }
  } finally {
    req.off('close', onClose)
  }
})

module.exports = router
