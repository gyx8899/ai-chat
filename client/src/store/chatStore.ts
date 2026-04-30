import { create } from 'zustand'

interface FailedQuery {
  query: string
  sessionId: string
}

interface ChatState {
  loading: boolean
  ragHint: string | null
  lastFailedQuery: FailedQuery | null
}

interface ChatActions {
  setLoading: (loading: boolean) => void
  setRagHint: (hint: string | null) => void
  setLastFailedQuery: (q: FailedQuery | null) => void
}

export const useChatStore = create<ChatState & ChatActions>(set => ({
  loading: false,
  ragHint: null,
  lastFailedQuery: null,

  setLoading: loading => set({ loading }),
  setRagHint: ragHint => set({ ragHint }),
  setLastFailedQuery: lastFailedQuery => set({ lastFailedQuery }),
}))
