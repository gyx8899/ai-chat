import { RotateCcw } from 'lucide-react'
import { useChatStore } from '@/store/chatStore'
import { useSessionStore } from '@/store/sessionStore'
import { useChat } from '@/hooks/useChat'
import { useTranslation } from '@/hooks/useTranslation'
import { useAutoScroll } from '@/hooks/useAutoScroll'
import { MessageItem } from './MessageItem'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

export function MessageList() {
  const messages = useSessionStore(s => s.activeMessages)
  const loading = useChatStore(s => s.loading)
  const { regenerate } = useChat()
  const { t } = useTranslation()

  const { bottomRef, containerRef } = useAutoScroll({
    loading,
    messageCount: messages.length,
  })

  const lastAssistantMsg = [...messages].reverse().find(m => m.role === 'assistant')
  const showRegenerate = !loading && lastAssistantMsg?.content
  const lastAssistantId = lastAssistantMsg?.id

  return (
    <ScrollArea className="flex-1" viewportRef={containerRef}>
      <div className="px-4 sm:px-6 py-6">
        <div className="max-w-[820px] mx-auto">
          {messages.map(msg => (
            <MessageItem
              key={msg.id}
              message={msg}
              isStreaming={loading && msg.id === lastAssistantId && msg.role === 'assistant'}
            />
          ))}

          {showRegenerate && (
            <div className="flex justify-center mt-2 mb-4">
              <button
                type="button"
                onClick={regenerate}
                className={cn(
                  'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full',
                  'text-xs font-medium text-muted-foreground',
                  'bg-card border border-border shadow-sm',
                  'hover:text-foreground hover:border-[oklch(0.62_0.18_var(--brand-h)/0.3)] hover:shadow-glow',
                  'transition-all duration-base ease-smooth'
                )}
              >
                <RotateCcw className="w-3 h-3" />
                {t('message.regenerate')}
              </button>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>
    </ScrollArea>
  )
}
