import { useEffect, useRef, useCallback } from 'react'
import { toast } from 'sonner'
import { logger } from '@shared/utils'

const log = logger.withPrefix('[useChat]')

import { useChatStore } from '@/store/chatStore'
import { useSessionStore } from '@/store/sessionStore'
import { useModelStore } from '@/store/modelStore'
import { useTranslation } from '@/hooks/useTranslation'
import type { Message, ImageAttachment } from '@/types'
import { isOfflineMode, markOffline, markOnline, detectOffline } from '@/lib/detectOffline'
import {
  localGenerateReply,
  localAppendMessages,
  LOCAL_MODELS,
  LOCAL_MODEL_CONFIG,
} from '@/lib/localMode'
import { streamSSE, SSEHttpError } from '@/lib/sseClient'

/**
 * 聊天核心 Hook，处理消息发送、流式响应、错误处理和离线模式
 *
 * 功能特性：
 * - 支持 SSE 流式响应
 * - 自动处理离线模式降级
 * - 消息重试机制
 * - 会话切换时自动终止当前流
 * - 支持图片附件上传
 *
 * 使用示例：
 * ```tsx
 * const { loading, ragHint, send, stopGeneration, regenerate } = useChat()
 *
 * // 发送消息
 * const handleSend = () => {
 *   send(inputValue, attachments)
 * }
 *
 * // 停止生成
 * const handleStop = () => {
 *   stopGeneration()
 * }
 *
 * // 重新生成最后一条回复
 * const handleRegenerate = () => {
 *   regenerate()
 * }

 * ```
 *
 * @returns 包含聊天相关方法和状态的对象
 * @returns loading - 是否正在生成回复
 * @returns ragHint - RAG 检索提示信息
 * @returns send - 发送消息的函数
 * @returns stopGeneration - 停止当前生成的函数
 * @returns regenerate - 重新生成最后一条回复的函数
 */
export function useChat() {
  const loading = useChatStore(s => s.loading)
  const ragHint = useChatStore(s => s.ragHint)
  const activeSessionId = useSessionStore(s => s.activeSessionId)
  const { t } = useTranslation()

  const abortControllerRef = useRef<AbortController | null>(null)

  /** 切换会话 / 卸载时统一中止当前流（R3.1 / R3.2） */
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
        abortControllerRef.current = null
      }
    }
  }, [activeSessionId])

  /** 本地模式下的发送逻辑 */
  const sendMessageLocal = useCallback(
    async (query: string, targetSessionId: string, attachments?: ImageAttachment[]) => {
      const { setLoading } = useChatStore.getState()
      const { updateMessages, syncSessionTitle } = useSessionStore.getState()

      setLoading(true)

      const userMsgId = crypto.randomUUID()
      const assistantMsgId = crypto.randomUUID()
      const now = Date.now()

      const userMsg: Message = {
        id: userMsgId,
        role: 'user',
        content: query,
        created_at: now,
        attachments,
      }
      const assistantMsg: Message = {
        id: assistantMsgId,
        role: 'assistant',
        content: '',
        created_at: now + 1,
      }

      updateMessages(targetSessionId, msgs => [...msgs, userMsg, assistantMsg])
      localAppendMessages(targetSessionId, [
        { ...userMsg, attachments: attachments?.map(a => ({ ...a, dataUrl: '[IMAGE]' })) },
      ])

      const reply = localGenerateReply()

      await new Promise<void>(resolve => {
        let i = 0
        const tick = () => {
          if (i >= reply.length) {
            localAppendMessages(targetSessionId, [{ ...assistantMsg, content: reply }])
            syncSessionTitle(targetSessionId)
            resolve()
            return
          }
          updateMessages(targetSessionId, msgs =>
            msgs.map(m => (m.id === assistantMsgId ? { ...m, content: reply.slice(0, i + 1) } : m))
          )
          i++
          setTimeout(tick, 30)
        }
        tick()
      })

      setLoading(false)
    },
    []
  )

  /**
   * 发送消息的核心函数，支持在线模式和离线模式
   *
   * 工作流程：
   * 1. 检查是否有活跃会话，没有则自动创建
   * 2. 如果是离线模式，先尝试重新连接后端
   * 3. 终止任何正在进行的流式请求
   * 4. 添加用户消息和空白的助手消息到会话
   * 5. 在线模式：通过 SSE 流式获取回复
   * 6. 离线模式：使用本地 mock 回复
   * 7. 处理各种错误情况（网络错误、API 错误等）
   *
   * @param query - 用户输入的文本内容
   * @param overrideSessionId - 可选的会话 ID，如果不提供则使用当前活跃会话
   * @param attachments - 可选的图片附件数组
   */
  const sendMessage = useCallback(
    async (query: string, overrideSessionId?: string, attachments?: ImageAttachment[]) => {
      const { loading: currentLoading, setLoading, setRagHint } = useChatStore.getState()
      const {
        activeSessionId: currentActive,
        updateMessages,
        syncSessionTitle,
      } = useSessionStore.getState()

      const targetSessionId = overrideSessionId ?? currentActive
      if (!targetSessionId || currentLoading) return

      // ── 入口：清除上一条 isError 消息 ──
      updateMessages(targetSessionId, (msgs: Message[]) => msgs.filter(m => !m.isError))

      // ── 离线模式：先重新探测，若已恢复则切回在线 ──
      if (isOfflineMode()) {
        const stillOffline = await detectOffline(true)
        if (stillOffline) {
          await sendMessageLocal(query, targetSessionId, attachments)
          return
        }
        markOnline()
        await useModelStore.getState().fetchConfig()
        toast.success(t('message.onlineRestored'))
      }

      // ── R3.4：若已存在未完成 controller，先 abort 旧的再创建新的 ──
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
        abortControllerRef.current = null
      }

      setLoading(true)
      setRagHint(null)

      const controller = new AbortController()
      abortControllerRef.current = controller

      const userMsgId = crypto.randomUUID()
      const assistantMsgId = crypto.randomUUID()
      const now = Date.now()

      updateMessages(targetSessionId, (msgs: Message[]) => [
        ...msgs,
        {
          id: userMsgId,
          role: 'user' as const,
          content: query,
          created_at: now,
          attachments,
        },
        { id: assistantMsgId, role: 'assistant' as const, content: '', created_at: now + 1 },
      ])

      let titleSynced = false
      let aborted = false

      try {
        for await (const frame of streamSSE({
          url: '/api/chat',
          body: { query, sessionId: targetSessionId, attachments },
          signal: controller.signal,
        })) {
          // ── meta 帧：独立 ragHint（R8.3） ──
          if ('meta' in frame) {
            if (frame.meta.ragHint) setRagHint(frame.meta.ragHint)
            continue
          }

          // ── error 帧：标记 isError，但不弹 toast ──
          if ('error' in frame) {
            useChatStore.getState().setLastFailedQuery({ query, sessionId: targetSessionId })
            updateMessages(targetSessionId, (msgs: Message[]) =>
              msgs.map(m =>
                m.id === assistantMsgId ? { ...m, isError: true, errorText: frame.error } : m
              )
            )
            // 终止循环，由 finally 块统一处理状态复位和资源清理
            break
          }

          // ── content 帧：追加文本 ──
          if (!titleSynced) {
            titleSynced = true
            useSessionStore.getState().syncSessionTitle(targetSessionId)
          }
          updateMessages(targetSessionId, (msgs: Message[]) =>
            msgs.map((m: Message) =>
              m.id === assistantMsgId ? { ...m, content: m.content + frame.content } : m
            )
          )
        }

        // 请求成功，确保在线标记正确
        markOnline()
      } catch (err: unknown) {
        // ── R3.5：AbortError 不弹 toast、不标记 isError ──
        if (err instanceof Error && err.name === 'AbortError') {
          aborted = true
          log.debug('sendMessage aborted')
          return
        }

        // ── HTTP 4xx/5xx：错误气泡 ──
        if (err instanceof SSEHttpError) {
          useChatStore.getState().setLastFailedQuery({ query, sessionId: targetSessionId })
          updateMessages(targetSessionId, (msgs: Message[]) =>
            msgs.map(m =>
              m.id === assistantMsgId
                ? { ...m, isError: true, errorText: `请求失败（HTTP ${err.status}）` }
                : m
            )
          )
          useChatStore.getState().setLoading(false)
          return
        }

        // ── TypeError / 网络不可达 → 降级本地模式 ──
        log.warn('fetch /api/chat failed, switching to offline mode', err)
        markOffline()
        useModelStore.setState({ models: LOCAL_MODELS, current: LOCAL_MODEL_CONFIG })
        useChatStore.getState().setLastFailedQuery({ query, sessionId: targetSessionId })
        // 将助手消息标记为错误，保留消息以便用户可以重试
        updateMessages(targetSessionId, (msgs: Message[]) =>
          msgs.map(m =>
            m.id === assistantMsgId
              ? {
                  ...m,
                  isError: true,
                  errorText: t('message.offlineMode'),
                }
              : m
          )
        )
        toast.warning(t('message.offlineMode'), {
          position: 'top-center',
          className: 'bg-yellow-400 text-yellow-950 dark:bg-yellow-500 dark:text-yellow-950',
          duration: 4000,
        })
      } finally {
        useChatStore.getState().setLoading(false)
        abortControllerRef.current = null
        if (!titleSynced && !aborted) {
          syncSessionTitle(targetSessionId)
        }
      }
    },
    [sendMessageLocal]
  )

  /**
   * 停止当前正在进行的流式生成
   * 通过中止 AbortController 来终止网络请求
   */
  const stopGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
  }, [])

  /**
   * 重新生成最后一条助手回复
   * 删除最后一条助手消息，然后使用最后一条用户消息重新发送
   */
  const regenerate = useCallback(() => {
    const {
      activeSessionId: currentActive,
      activeMessages,
      updateMessages,
    } = useSessionStore.getState()
    const { loading: currentLoading } = useChatStore.getState()
    if (!currentActive || currentLoading) return

    const lastUserMsg = [...activeMessages].reverse().find(m => m.role === 'user')
    if (!lastUserMsg) return

    updateMessages(currentActive, (msgs: Message[]) => {
      const lastAssistantIdx = [...msgs].reverse().findIndex(m => m.role === 'assistant')
      if (lastAssistantIdx === -1) return msgs
      return msgs.filter((_, i) => i !== msgs.length - 1 - lastAssistantIdx)
    })

    setTimeout(() => sendMessage(lastUserMsg.content), 0)
  }, [sendMessage])



  /**
   * 发送消息的入口函数
   * 如果当前没有活跃会话，会自动创建一个新会话
   *
   * @param text - 要发送的文本内容
   * @param attachments - 可选的图片附件数组
   */
  const send = useCallback(
    async (text: string, attachments?: ImageAttachment[]) => {
      const { activeSessionId: currentActive, createSession } = useSessionStore.getState()
      if (currentActive) {
        sendMessage(text, undefined, attachments)
      } else {
        const newSession = await createSession()
        sendMessage(text, newSession.id, attachments)
      }
    },
    [sendMessage]
  )

  return { loading, ragHint, send, stopGeneration, regenerate }
}
