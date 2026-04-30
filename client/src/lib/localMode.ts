/**
 * 本地模式（Local Mode）
 * 当后端接口不可用时，前端自动降级为纯本地模式：
 * - 会话/消息存储在 localStorage
 * - 回复逻辑：重复用户问题并追加数字后缀
 * - 模型配置使用本地固定 mock 数据
 */

import type { Session, Message, Model, ModelConfig } from '@/types'
import { logger } from '@shared/utils'
import { translate } from '@/locales'
import type { Locale } from '@/locales'

const log = logger.withPrefix('[LocalMode]')

// ─── 常量 ───────────────────────────────────────────────────────────────────
const STORAGE_KEY = 'local_sessions'
const LOCAL_MODEL_ID = 'local-mock'

export const LOCAL_MODELS: Model[] = [
  {
    id: LOCAL_MODEL_ID,
    name: 'Local Mock',
    provider: 'local',
    description: '离线本地模式，模型当前不可用',
    icon: '🔌',
  },
]

export const LOCAL_MODEL_CONFIG: ModelConfig = {
  modelId: LOCAL_MODEL_ID,
  provider: 'local',
}

// ─── 持久化工具 ──────────────────────────────────────────────────────────────
function loadRaw(): Session[] {
  try {
    // 检查 localStorage 是否可用
    if (typeof localStorage === 'undefined') {
      log.warn('localStorage is not available')
      return []
    }

    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []

    // 验证数据格式
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) {
      log.warn('Invalid data format in localStorage')
      return []
    }

    return parsed as Session[]
  } catch (error) {
    log.error('Failed to load sessions from localStorage:', error)
    // 数据损坏时清理存储
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      // 清理失败时静默处理
    }
    return []
  }
}

function saveRaw(sessions: Session[]): void {
  try {
    // 检查 localStorage 是否可用
    if (typeof localStorage === 'undefined') {
      log.warn('localStorage is not available')
      return
    }

    const serialized = JSON.stringify(sessions)

    // 检查存储配额
    const estimatedSize = new Blob([serialized]).size
    const maxSize = 5 * 1024 * 1024 // 5MB 限制

    if (estimatedSize > maxSize) {
      log.warn('Data size exceeds limit, truncating sessions')
      // 保留最近 50 个会话
      const truncatedSessions = sessions.slice(0, 50)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(truncatedSessions))
      return
    }

    localStorage.setItem(STORAGE_KEY, serialized)
  } catch (error) {
    log.error('Failed to save sessions to localStorage:', error)

    // 如果是配额超限错误，尝试清理旧数据
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      log.warn('Storage quota exceeded, attempting cleanup')
      try {
        const existing = loadRaw()
        if (existing.length > 0) {
          // 只保留最近 10 个会话
          const reduced = existing.slice(0, 10)
          localStorage.setItem(STORAGE_KEY, JSON.stringify(reduced))
        }
      } catch (cleanupError) {
        log.error('Failed to cleanup storage:', cleanupError)
      }
    }
  }
}

// ─── 会话 CRUD ───────────────────────────────────────────────────────────────
export function localLoadSessions(): Session[] {
  return loadRaw()
}

export function localCreateSession(): Session {
  try {
    // 检查存储空间
    const { available } = checkStorageUsage()
    if (available < 1024 * 1024) {
      // 小于 1MB
      log.warn('Low storage space, cleaning up old sessions')
      cleanupStorage()
    }

    const sessions = loadRaw()
    const session: Session = {
      id: crypto.randomUUID(),
      title: '新对话',
      created_at: Date.now(),
      messages: [],
    }

    // 限制总会话数，防止无限增长
    const maxSessions = 100
    const updatedSessions = [session, ...sessions].slice(0, maxSessions)

    saveRaw(updatedSessions)
    return session
  } catch (error) {
    log.error('Failed to create session:', error)
    // 返回一个最小化的会话对象作为降级方案
    return {
      id: `fallback-${Date.now()}`,
      title: '新对话',
      created_at: Date.now(),
      messages: [],
    }
  }
}

export function localGetMessages(sessionId: string): Message[] {
  return loadRaw().find(s => s.id === sessionId)?.messages ?? []
}

export function localRenameSession(sessionId: string, title: string): void {
  const sessions = loadRaw().map(s => (s.id === sessionId ? { ...s, title } : s))
  saveRaw(sessions)
}

export function localDeleteSession(sessionId: string): void {
  saveRaw(loadRaw().filter(s => s.id !== sessionId))
}

export function localGetSession(sessionId: string): Session | undefined {
  return loadRaw().find(s => s.id === sessionId)
}

// ─── 消息写入 ─────────────────────────────────────────────────────────────────
export function localAppendMessages(sessionId: string, messages: Message[]): void {
  const sessions = loadRaw().map(s =>
    s.id === sessionId ? { ...s, messages: [...s.messages, ...messages] } : s
  )
  saveRaw(sessions)
}

export function localUpdateLastAssistantMessage(sessionId: string, content: string): void {
  const sessions = loadRaw().map(s => {
    if (s.id !== sessionId) return s
    const msgs = [...s.messages]
    const lastIdx = msgs.length - 1
    if (lastIdx >= 0 && msgs[lastIdx].role === 'assistant') {
      msgs[lastIdx] = { ...msgs[lastIdx], content }
    }
    return { ...s, messages: msgs }
  })
  saveRaw(sessions)
}

/** 自动更新会话标题（取第一条用户消息前 20 字） */
export function localSyncSessionTitle(sessionId: string): string {
  const sessions = loadRaw()
  const session = sessions.find(s => s.id === sessionId)
  if (!session) return ''
  const firstUser = session.messages.find(m => m.role === 'user')
  if (!firstUser) return session.title
  const title = firstUser.content.slice(0, 20) || '新对话'
  const updated = sessions.map(s => (s.id === sessionId ? { ...s, title } : s))
  saveRaw(updated)
  return title
}

// ─── 存储管理工具 ─────────────────────────────────────────────────────────────
/**
 * 检查存储空间使用情况
 */
export function checkStorageUsage(): { used: number; limit: number; available: number } {
  try {
    if (typeof localStorage === 'undefined') {
      return { used: 0, limit: 0, available: 0 }
    }

    const serialized = localStorage.getItem(STORAGE_KEY)
    const used = serialized ? new Blob([serialized]).size : 0
    const limit = 5 * 1024 * 1024 // 5MB
    const available = Math.max(0, limit - used)

    return { used, limit, available }
  } catch {
    return { used: 0, limit: 0, available: 0 }
  }
}

/**
 * 清理旧数据以释放空间
 */
export function cleanupStorage(): void {
  try {
    const sessions = loadRaw()
    if (sessions.length > 10) {
      // 只保留最近 10 个会话
      const recentSessions = sessions.slice(0, 10)
      saveRaw(recentSessions)
      log.info(`Cleaned up storage, kept ${recentSessions.length} sessions`)
    }
  } catch (error) {
    log.error('Failed to cleanup storage:', error)
  }
}

// ─── 本地回复生成 ─────────────────────────────────────────────────────────────
/**
 * 生成本地 mock 回复：固定提示当前模型/网络不可用
 */
export function localGenerateReply(): string {
  const lang = (localStorage.getItem('lang') as Locale) || 'zh'
  return translate(lang, 'localMode.reply')
}
