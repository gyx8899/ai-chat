import { Send, Square } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTranslation } from '@/hooks/useTranslation'

interface SendButtonProps {
  loading: boolean
  canSend: boolean
  onSend: () => void
  onStop: () => void
}

export function SendButton({ loading, canSend, onSend, onStop }: SendButtonProps) {
  const { t } = useTranslation()

  if (loading) {
    return (
      <button
        type="button"
        onClick={onStop}
        className={cn(
          'inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md',
          'text-xs font-semibold text-destructive-foreground bg-destructive',
          'transition-all duration-base ease-spring',
          'hover:opacity-90 active:scale-95'
        )}
      >
        <Square className="w-3.5 h-3.5 fill-current" />
        <span className="hidden sm:inline">{t('input.stop')}</span>
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={onSend}
      disabled={!canSend}
      className={cn(
        'inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md',
        'text-xs font-semibold text-white',
        'transition-all duration-base ease-spring',
        'hover:-translate-y-0.5 hover:scale-[1.02] active:translate-y-0 active:scale-[0.98]',
        'disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:scale-100 disabled:cursor-not-allowed'
      )}
      style={{
        background: 'linear-gradient(135deg, var(--primary-oklch), var(--primary-glow))',
        boxShadow: '0 2px 10px -2px oklch(0.62 0.18 var(--brand-h) / 0.5)',
      }}
    >
      <Send className="w-3.5 h-3.5" />
      <span className="hidden sm:inline">{t('input.send')}</span>
    </button>
  )
}
