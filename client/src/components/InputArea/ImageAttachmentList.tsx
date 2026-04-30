import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTranslation } from '@/hooks/useTranslation'
import type { ImageAttachment } from '@/types'

interface ImageAttachmentListProps {
  attachments: ImageAttachment[]
  onRemove: (index: number) => void
}

export function ImageAttachmentList({ attachments, onRemove }: ImageAttachmentListProps) {
  const { t } = useTranslation()
  if (attachments.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2 px-4 sm:px-5 pt-3 pb-0">
      {attachments.map((att, idx) => (
        <div
          key={`${att.name}-${idx}`}
          className="relative group w-16 h-16 rounded-lg overflow-hidden border border-border bg-muted flex-shrink-0"
        >
          <img src={att.dataUrl} alt={att.name} className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={() => onRemove(idx)}
            className={cn(
              'absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-destructive text-destructive-foreground',
              'flex items-center justify-center opacity-0 group-hover:opacity-100',
              'transition-opacity duration-fast ease-smooth',
              'hover:scale-110 active:scale-95'
            )}
            aria-label={t('input.removeImage')}
            title={t('input.removeImage')}
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ))}
    </div>
  )
}
