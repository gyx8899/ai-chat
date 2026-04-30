import { Sparkles } from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'

export function SidebarHeader() {
  const { t } = useTranslation()

  return (
    <div className="flex items-center gap-[10px] px-5 py-[20px] pb-[18px] border-b border-border/60">
      <div
        className="relative w-[34px] h-[34px] rounded-[10px] flex items-center justify-center shrink-0"
        style={{
          background: 'linear-gradient(135deg, var(--primary-oklch), var(--primary-glow))',
          boxShadow: '0 4px 16px -4px oklch(0.62 0.18 var(--brand-h) / 0.5)',
        }}
      >
        <Sparkles className="w-[18px] h-[18px] text-white relative z-[1]" />
        <span
          aria-hidden
          className="absolute inset-[2px] rounded-[8px]"
          style={{
            background: 'linear-gradient(135deg, transparent 40%, oklch(1 0 0 / 0.25))',
          }}
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-display text-[16px] font-bold text-foreground truncate leading-tight tracking-[-0.01em]">
          {t('sidebar.title')}
        </p>
        <p className="text-[11px] text-muted-foreground truncate leading-tight mt-0.5 font-mono tracking-[0.02em]">
          {t('sidebar.subtitle')}
        </p>
      </div>
    </div>
  )
}
