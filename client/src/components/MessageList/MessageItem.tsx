import { useState } from 'react'
import { Copy, Check, Sparkles, User, AlertCircle, RotateCcw, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUIStore } from '@/store/uiStore'
import { useTranslation } from '@/hooks/useTranslation'
import { useChat } from '@/hooks/useChat'
import { MarkdownContent } from './MarkdownContent'
import { LoadingIndicator } from '@/components/LoadingIndicator'
import { Badge } from '@/components/ui/badge'
import type { Message } from '@/types'

interface MessageItemProps {
  message: Message
  isStreaming?: boolean
}

export function MessageItem({ message, isStreaming = false }: MessageItemProps) {
  const [msgCopied, setMsgCopied] = useState(false)
  const isDark = useUIStore(s => s.isDark)
  const { t } = useTranslation()
  const { loading, regenerate } = useChat()
  const isUser = message.role === 'user'

  const handleMsgCopy = async () => {
    await navigator.clipboard.writeText(message.content)
    setMsgCopied(true)
    setTimeout(() => setMsgCopied(false), 2000)
  }

  return (
    <div
      className={cn('flex gap-3 mb-6 animate-fade-up', isUser ? 'flex-row-reverse' : 'flex-row')}
    >
      {/* Avatar */}
      <div
        className={cn(
          'relative w-9 h-9 rounded-full grid place-items-center shrink-0 mt-0.5',
          isUser ? 'text-white' : 'bg-card border border-border text-foreground shadow-sm'
        )}
        style={
          isUser
            ? {
                background: 'linear-gradient(135deg, var(--primary-oklch), var(--primary-glow))',
                boxShadow: '0 4px 14px -4px oklch(0.62 0.18 var(--brand-h) / 0.45)',
              }
            : undefined
        }
      >
        {isUser ? (
          <User className="w-4 h-4" />
        ) : (
          <Sparkles className="w-4 h-4" style={{ color: 'var(--primary-oklch)' }} />
        )}
      </div>

      <div
        className={cn('flex flex-col max-w-[82%] min-w-0', isUser ? 'items-end' : 'items-start')}
      >
        {/* RAG hint badge */}
        {message.ragHint && (
          <Badge
            variant="secondary"
            className="mb-1.5 gap-1 font-mono text-[11px] tracking-wide uppercase border"
            style={{
              background: 'oklch(0.62 0.18 var(--brand-h) / 0.12)',
              color: 'var(--primary-oklch)',
              borderColor: 'oklch(0.62 0.18 var(--brand-h) / 0.2)',
            }}
          >
            <BookOpen className="w-3 h-3" />
            {t('message.ragPrefix')}
            {message.ragHint}
          </Badge>
        )}

        {/* 消息气泡 */}
        <div
          className={cn(
            'rounded-lg px-4 py-3 text-sm leading-relaxed transition-shadow duration-base ease-smooth',
            isUser
              ? 'text-white rounded-tr-sm shadow-md'
              : 'bg-card border border-border text-foreground rounded-tl-sm prose prose-sm max-w-none dark:prose-invert shadow-sm'
          )}
          style={
            isUser
              ? {
                  background: 'linear-gradient(135deg, var(--primary-oklch), var(--primary-glow))',
                  boxShadow: '0 4px 16px -4px oklch(0.62 0.18 var(--brand-h) / 0.35)',
                }
              : undefined
          }
        >
          {isUser ? (
            <div className="flex flex-col gap-2">
              {message.content?.trim() && <p className="whitespace-pre-wrap">{message.content}</p>}
              {message.attachments && message.attachments.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-1">
                  {message.attachments.map((att, idx) => (
                    <a
                      key={`${att.name}-${idx}`}
                      href={att.dataUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="relative w-20 h-20 rounded-md overflow-hidden border border-white/20 bg-white/10 flex-shrink-0 hover:opacity-90 transition-opacity"
                    >
                      <img
                        src={att.dataUrl}
                        alt={att.name}
                        className="w-full h-full object-cover"
                      />
                    </a>
                  ))}
                </div>
              )}
            </div>
          ) : message.isError ? (
            loading ? (
              <LoadingIndicator />
            ) : (
              <div className="not-prose flex flex-col gap-2">
                <div className="flex items-center gap-1.5 text-destructive">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{message.errorText ?? t('message.errorDefault')}</span>
                </div>
                <button
                  onClick={regenerate}
                  disabled={loading}
                  className="self-start flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  {t('message.retry')}
                </button>
              </div>
            )
          ) : (
            <>
              <MarkdownContent content={message.content} isDark={isDark} />
              {!message.content && <LoadingIndicator />}
              {isStreaming && message.content && <LoadingIndicator />}
            </>
          )}
        </div>

        {/* 复制消息（仅 AI 正常内容显示） */}
        {!isUser && !message.isError && message.content && (
          <button
            onClick={handleMsgCopy}
            className="mt-1.5 flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
          >
            {msgCopied ? (
              <Check className="w-3 h-3" style={{ color: 'var(--success)' }} />
            ) : (
              <Copy className="w-3 h-3" />
            )}
            {msgCopied ? t('message.copied') : t('message.copy')}
          </button>
        )}
      </div>
    </div>
  )
}
