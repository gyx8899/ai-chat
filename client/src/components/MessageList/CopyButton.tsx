import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'
import { copyToClipboard } from '@shared/utils'
import { cn } from '@/lib/utils'

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const { t } = useTranslation()

  const handleCopy = async () => {
    await copyToClipboard(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      title={t('message.copyCode')}
      className={cn(
        'inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono',
        'text-muted-foreground hover:text-foreground transition-colors'
      )}
    >
      {copied ? (
        <Check className="w-3 h-3" style={{ color: 'var(--success)' }} />
      ) : (
        <Copy className="w-3 h-3" />
      )}
      {copied ? t('message.copied') : t('message.copyCode')}
    </button>
  )
}
