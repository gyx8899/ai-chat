import { useState, useRef, useEffect } from 'react'
import { Paperclip } from 'lucide-react'
import { useChatStore } from '@/store/chatStore'
import { useChat } from '@/hooks/useChat'
import { useTranslation } from '@/hooks/useTranslation'
import { useImageUpload } from '@/hooks/useImageUpload'
import { ImageAttachmentList } from './ImageAttachmentList'
import { SendButton } from './SendButton'
import { cn } from '@/lib/utils'

const MAX_LENGTH = 4000

interface InputAreaProps {
  initialValue?: string
}

export function InputArea({ initialValue = '' }: InputAreaProps) {
  const loading = useChatStore(s => s.loading)
  const { send, stopGeneration } = useChat()
  const { t, tv } = useTranslation()

  const {
    attachments,
    hasAttachment,
    addFiles,
    removeAt,
    clearAll,
    dragOver,
    dragHandlers,
    fileInputRef,
    triggerFileSelect,
  } = useImageUpload()

  const [value, setValue] = useState(initialValue)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const overLimit = value.length > MAX_LENGTH

  useEffect(() => {
    if (initialValue) textareaRef.current?.focus()
  }, [initialValue])

  const handleSend = () => {
    const trimmed = value.trim()
    if ((!trimmed && !hasAttachment) || loading || overLimit) return
    // 确保 attachments 不为 undefined
    send(trimmed || ' ', attachments.length > 0 ? attachments : undefined)
    setValue('')
    clearAll()
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value)
    const el = e.target
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 240) + 'px'
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    addFiles(e.target.files)
    e.target.value = ''
  }

  const canSend: boolean =
    Boolean(value.trim() || (hasAttachment && attachments && attachments.length > 0)) &&
    !overLimit &&
    !loading

  return (
    <div className="relative px-4 sm:px-6 pt-3 pb-4 sm:pb-5 bg-gradient-to-t from-background via-background/85 to-transparent">
      <div className="max-w-[820px] mx-auto">
        <div
          className={cn(
            'group relative flex flex-col bg-card border border-border rounded-xl shadow-sm',
            'transition-all duration-base ease-smooth',
            'focus-within:border-[oklch(0.62_0.18_var(--brand-h))] focus-within:shadow-glow',
            dragOver && 'border-[oklch(0.62_0.18_var(--brand-h))] shadow-glow'
          )}
          {...dragHandlers}
        >
          <span
            aria-hidden
            className="absolute -inset-px rounded-xl opacity-0 group-focus-within:opacity-40 -z-10 blur-xl pointer-events-none transition-opacity duration-base ease-smooth"
            style={{
              background:
                'conic-gradient(from 0deg, var(--primary-oklch), var(--primary-glow), var(--primary-oklch))',
            }}
          />

          <ImageAttachmentList attachments={attachments} onRemove={removeAt} />

          <div className="flex items-start px-4 sm:px-5 pt-4 pb-1">
            <textarea
              ref={textareaRef}
              id="chat-input"
              name="chat-input"
              autoComplete="off"
              value={value}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              placeholder={t('input.placeholder')}
              rows={3}
              className={cn(
                'flex-1 resize-none bg-transparent text-[15px] leading-[1.65] text-foreground',
                'placeholder:text-muted-foreground/70 outline-none border-0',
                'min-h-[84px] md:min-h-[72px] max-h-[240px]'
              )}
            />
          </div>

          <div className="flex items-center justify-between px-3 sm:px-3.5 pb-3 pt-1">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={triggerFileSelect}
                disabled={loading || attachments.length >= 5}
                className={cn(
                  'group/upload inline-flex items-center justify-center w-8 h-8 rounded-md',
                  'text-muted-foreground transition-all duration-fast ease-smooth',
                  'hover:bg-muted hover:text-[oklch(0.62_0.18_var(--brand-h))]',
                  'disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-muted-foreground'
                )}
                aria-label={t('input.uploadImage')}
                title={t('input.uploadImage')}
              >
                <Paperclip className="w-4 h-4" />
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                multiple
                className="hidden"
                onChange={handleFileChange}
                aria-hidden="true"
              />

              <div className="text-[11px] font-mono text-muted-foreground/70 select-none px-1.5">
                <kbd className="hidden sm:inline-block mx-0.5 px-1.5 py-0.5 text-[10px] rounded border border-b-2 border-border bg-muted text-muted-foreground">
                  {t('input.hintEnter')}
                </kbd>
                <span className="hidden sm:inline">{t('input.hintSend')}</span>
                <span className="hidden sm:inline mx-1.5">·</span>
                <kbd className="hidden sm:inline-block mx-0.5 px-1.5 py-0.5 text-[10px] rounded border border-b-2 border-border bg-muted text-muted-foreground">
                  {t('input.hintShift')}
                </kbd>
                <kbd className="hidden sm:inline-block mx-0.5 px-1.5 py-0.5 text-[10px] rounded border border-b-2 border-border bg-muted text-muted-foreground">
                  {t('input.hintEnter')}
                </kbd>
                <span className="hidden sm:inline">{t('input.hintNewline')}</span>
              </div>
            </div>

            <SendButton
              loading={loading}
              canSend={canSend}
              onSend={handleSend}
              onStop={stopGeneration}
            />
          </div>
        </div>

        {overLimit && (
          <p className="mt-2 text-center text-xs text-red-500" role="alert">
            {tv('input.overLimit', { max: MAX_LENGTH })}
          </p>
        )}

        <p className="mt-2.5 text-center text-[11px] font-mono text-muted-foreground/70 tracking-wide">
          {t('input.disclaimer')}
        </p>
      </div>
    </div>
  )
}
