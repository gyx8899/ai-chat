import { useState, useCallback } from 'react'
import { ChatHeader } from '@/components/ChatHeader'
import { MessageList } from '@/components/MessageList'
import { InputArea } from '@/components/InputArea'
import { EmptyState } from '@/components/EmptyState'
import { useSessionStore } from '@/store/sessionStore'

export function ChatArea() {
  const hasMessages = useSessionStore(s => s.activeMessages.length > 0)

  // 使用单调递增 key 强制 InputArea 重挂载，避免 useEffect 内 setState
  const [seed, setSeed] = useState(0)
  const [prefill, setPrefill] = useState('')

  const handleSuggest = useCallback((text: string) => {
    setPrefill(text)
    setSeed(s => s + 1)
  }, [])

  return (
    <div className="flex flex-col flex-1 min-w-0 h-full">
      <ChatHeader />

      {!hasMessages ? (
        <div className="flex-1 overflow-y-auto">
          <EmptyState onSuggest={handleSuggest} />
        </div>
      ) : (
        <MessageList />
      )}

      <InputArea key={seed} initialValue={prefill} />
    </div>
  )
}
