import { create } from 'zustand'
import type { Session, Message } from '@/types'
import { logger } from '@shared/utils'
import { isOfflineMode } from '@/lib/detectOffline'

const log = logger.withPrefix('[SessionStore]')
import {
  localLoadSessions,
  localCreateSession,
  localGetMessages,
  localRenameSession,
  localDeleteSession,
  localSyncSessionTitle,
} from '@/lib/localMode'

interface SessionState {
  sessions: Session[]
  activeSessionId: string | null
  /** 当前活跃会话的消息列表（稳定引用，供组件 selector 直接订阅） */
  activeMessages: Message[]
}

interface SessionActions {
  loadSessions: () => Promise<void>
  createSession: () => Promise<Session>
  selectSession: (id: string) => Promise<void>
  renameSession: (id: string, title: string) => Promise<void>
  deleteSession: (id: string) => Promise<void>
  syncSessionTitle: (sessionId: string) => Promise<void>
  updateMessages: (sessionId: string, updater: (msgs: Message[]) => Message[]) => void
}

export type SessionStore = SessionState & SessionActions

/** 从 sessions 数组中提取当前活跃会话的消息（内部工具函数） */
function pickActiveMessages(sessions: Session[], activeSessionId: string | null): Message[] {
  return sessions.find(s => s.id === activeSessionId)?.messages ?? []
}

export const useSessionStore = create<SessionStore>((set, get) => ({
  sessions: [],
  activeSessionId: null,
  activeMessages: [],

  loadSessions: async () => {
    // ── 本地模式 ──
    if (isOfflineMode()) {
      const loaded = localLoadSessions()
      if (loaded.length === 0) {
        set({ sessions: loaded })
        return
      }
      const firstId = loaded[0].id
      set({
        sessions: loaded,
        activeSessionId: firstId,
        activeMessages: pickActiveMessages(loaded, firstId),
      })
      return
    }

    // ── 在线模式 ──
    try {
      const data: Array<{ id: string; title: string; created_at: number }> = await fetch(
        '/api/sessions'
      ).then(r => r.json())
      const loaded: Session[] = data.map(s => ({ ...s, messages: [] }))

      if (loaded.length === 0) {
        set({ sessions: loaded })
        return
      }

      const firstId = loaded[0].id
      set({
        sessions: loaded,
        activeSessionId: firstId,
        activeMessages: pickActiveMessages(loaded, firstId),
      })

      await get().selectSession(firstId)
    } catch (e) {
      log.error('loadSessions failed', e)
    }
  },

  createSession: async () => {
    // ── 本地模式 ──
    if (isOfflineMode()) {
      const newSession = localCreateSession()
      set(state => {
        const sessions = [newSession, ...state.sessions]
        return {
          sessions,
          activeSessionId: newSession.id,
          activeMessages: pickActiveMessages(sessions, newSession.id),
        }
      })
      return newSession
    }

    // ── 在线模式 ──
    const session = await fetch('/api/sessions', { method: 'POST' }).then(r => r.json())
    const newSession: Session = { ...session, messages: [] }
    set(state => {
      const sessions = [newSession, ...state.sessions]
      return {
        sessions,
        activeSessionId: newSession.id,
        activeMessages: pickActiveMessages(sessions, newSession.id),
      }
    })
    return newSession
  },

  selectSession: async (id: string) => {
    set(state => ({
      activeSessionId: id,
      activeMessages: pickActiveMessages(state.sessions, id),
    }))
    const session = get().sessions.find(s => s.id === id)
    if (session && session.messages.length === 0) {
      // ── 本地模式 ──
      if (isOfflineMode()) {
        const msgs = localGetMessages(id)
        set(state => {
          const sessions = state.sessions.map(s => (s.id === id ? { ...s, messages: msgs } : s))
          return {
            sessions,
            activeMessages: pickActiveMessages(sessions, state.activeSessionId),
          }
        })
        return
      }

      // ── 在线模式 ──
      try {
        const msgs: Array<{
          id: string
          role: 'user' | 'assistant'
          content: string
          created_at: number
        }> = await fetch(`/api/sessions/${id}/messages`).then(r => r.json())
        set(state => {
          const sessions = state.sessions.map(s =>
            s.id === id
              ? {
                  ...s,
                  messages: msgs.map(
                    (m): Message => ({
                      id: m.id,
                      role: m.role,
                      content: m.content,
                      created_at: m.created_at,
                    })
                  ),
                }
              : s
          )
          return {
            sessions,
            activeMessages: pickActiveMessages(sessions, state.activeSessionId),
          }
        })
      } catch (e) {
        log.error('selectSession fetch messages failed', e)
      }
    }
  },

  renameSession: async (id: string, title: string) => {
    const prevSessions = get().sessions
    set(state => {
      const sessions = state.sessions.map(s => (s.id === id ? { ...s, title } : s))
      return {
        sessions,
        activeMessages: pickActiveMessages(sessions, state.activeSessionId),
      }
    })

    // ── 本地模式 ──
    if (isOfflineMode()) {
      localRenameSession(id, title)
      return
    }

    // ── 在线模式 ──
    try {
      await fetch(`/api/sessions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      })
    } catch (e) {
      log.error('renameSession failed', e)
      set(state => ({
        sessions: prevSessions,
        activeMessages: pickActiveMessages(prevSessions, state.activeSessionId),
      }))
    }
  },

  deleteSession: async (id: string) => {
    // ── 本地模式 ──
    if (isOfflineMode()) {
      localDeleteSession(id)
      set(state => {
        const sessions = state.sessions.filter(s => s.id !== id)
        const activeSessionId =
          state.activeSessionId === id ? (sessions[0]?.id ?? null) : state.activeSessionId
        return {
          sessions,
          activeSessionId,
          activeMessages: pickActiveMessages(sessions, activeSessionId),
        }
      })
      return
    }

    // ── 在线模式：乐观更新，先更新 UI 再发请求，失败时回滚 ──
    const prevSessions = get().sessions
    const prevActiveSessionId = get().activeSessionId
    set(state => {
      const sessions = state.sessions.filter(s => s.id !== id)
      const activeSessionId =
        state.activeSessionId === id ? (sessions[0]?.id ?? null) : state.activeSessionId
      return {
        sessions,
        activeSessionId,
        activeMessages: pickActiveMessages(sessions, activeSessionId),
      }
    })

    try {
      await fetch(`/api/sessions/${id}`, { method: 'DELETE' })
    } catch (e) {
      log.error('deleteSession failed', e)
      set({
        sessions: prevSessions,
        activeSessionId: prevActiveSessionId,
        activeMessages: pickActiveMessages(prevSessions, prevActiveSessionId),
      })
    }
  },

  syncSessionTitle: async (sessionId: string) => {
    // ── 本地模式 ──
    if (isOfflineMode()) {
      const title = localSyncSessionTitle(sessionId)
      if (!title) return
      set(state => {
        const sessions = state.sessions.map(s => (s.id === sessionId ? { ...s, title } : s))
        return {
          sessions,
          activeMessages: pickActiveMessages(sessions, state.activeSessionId),
        }
      })
      return
    }

    // ── 在线模式 ──
    try {
      // 获取会话标题（优化：使用 PATCH 而不是 GET 整个会话）
      const { activeMessages } = get()
      const sessionMessages = activeMessages
      const firstUserMsg = sessionMessages.find(m => m.role === 'user')
      if (!firstUserMsg) return

      const newTitle = firstUserMsg.content.trim().slice(0, 20) || '新对话'

      // 使用 PATCH 请求只更新标题
      await fetch(`/api/sessions/${sessionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle }),
      })

      set(state => {
        const sessions = state.sessions.map(s =>
          s.id === sessionId ? { ...s, title: newTitle } : s
        )
        return {
          sessions,
          activeMessages: pickActiveMessages(sessions, state.activeSessionId),
        }
      })
    } catch (e) {
      log.error('syncSessionTitle failed', e)
    }
  },

  updateMessages: (sessionId, updater) => {
    set(state => {
      const sessions = state.sessions.map(s =>
        s.id === sessionId ? { ...s, messages: updater(s.messages) } : s
      )
      return {
        sessions,
        activeMessages: pickActiveMessages(sessions, state.activeSessionId),
      }
    })
  },
}))
