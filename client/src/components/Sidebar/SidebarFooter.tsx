import { User, ExternalLink } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { useTranslation } from '@/hooks/useTranslation'

const GITHUB_REPO = 'https://github.com/gyx8899/ai-chat'
const AVATAR_URL = 'https://avatars.githubusercontent.com/u/2103745?s=48&v=4'

function PortfolioCTA() {
  const { t } = useTranslation()
  return (
    <>
      <Separator className="bg-border/60 mb-3" />
      <div className="mx-4 mb-3 px-3.5 py-4 rounded-[18px] text-center transition-all duration-base ease-smooth border hover:border-[var(--primary-oklch)] hover:shadow-glow"
        style={{
          background: 'linear-gradient(135deg, var(--surface) 0%, var(--bg-subtle) 100%)',
          borderColor: 'var(--border-2)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <img
          src={AVATAR_URL}
          alt="GitHub"
          className="w-9 h-9 mx-auto mb-2.5 rounded-md object-cover transition-all duration-base ease-smooth hover:scale-105"
          style={{
            boxShadow: '0 4px 12px -2px oklch(0.62 0.18 var(--brand-h) / 0.45)',
          }}
        />
        <a
          href={GITHUB_REPO}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block font-mono text-[13px] font-medium tracking-[0.01em] transition-all duration-fast ease-smooth hover:underline"
          style={{ color: 'var(--primary-oklch)' }}
        >
          gyx8899/ai-chat
        </a>
        <span className="block font-mono text-[10px] mt-0.5 mb-2.5" style={{ color: 'var(--text-faint)' }}>
          github.com
        </span>
        <a
          href={GITHUB_REPO}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-4 py-[7px] rounded-[var(--r-md)] text-white text-xs font-semibold transition-all duration-fast ease-smooth hover:-translate-y-[1px]"
          style={{
            background: 'linear-gradient(135deg, var(--primary-oklch), var(--primary-glow))',
            boxShadow: '0 2px 8px -2px oklch(0.62 0.18 var(--brand-h) / 0.4)',
          }}
        >
          <ExternalLink className="w-[13px] h-[13px]" />
          {t('sidebar.viewSource')}
        </a>
      </div>
    </>
  )
}

export function SidebarFooter() {
  const { t } = useTranslation()
  return (
    <div className="shrink-0">
      <PortfolioCTA />
      <Separator className="bg-border/60" />
      <div className="flex items-center gap-3 px-4 py-3">
        <Avatar className="h-8 w-8 border border-border/60">
          <AvatarFallback
            className="text-[11px] font-semibold"
            style={{
              background: 'linear-gradient(135deg, var(--primary-oklch), var(--primary-glow))',
              color: '#fff',
            }}
          >
            <User className="w-4 h-4" />
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-foreground truncate leading-tight">
            {t('sidebar.footerTitle')}
          </p>
          <p className="font-mono text-[10px] text-muted-foreground/70 truncate leading-tight mt-0.5 tracking-wide">
            {t('sidebar.footerSubtitle')}
          </p>
        </div>
      </div>
    </div>
  )
}
