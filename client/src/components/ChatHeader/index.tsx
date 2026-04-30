import { useEffect } from 'react'
import { Moon, Sun, Menu, Languages, WifiOff, Sparkles } from 'lucide-react'
import { useUIStore } from '@/store/uiStore'
import { useChatStore } from '@/store/chatStore'
import { useModelStore } from '@/store/modelStore'
import { useTranslation } from '@/hooks/useTranslation'
import { ModelSelector } from '@/components/ModelSelector'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Badge } from '@/components/ui/badge'

export function ChatHeader() {
  const { isDark, toggleDark, toggleSidebar, toggleLang, lang } = useUIStore()
  const ragHint = useChatStore(s => s.ragHint)
  const fetchConfig = useModelStore(s => s.fetchConfig)
  const current = useModelStore(s => s.current)
  const { t } = useTranslation()

  const offline = current?.provider === 'local'

  useEffect(() => {
    fetchConfig()
  }, [fetchConfig])

  return (
    <header
      className="relative flex items-center justify-between gap-2 px-4 py-3 sm:px-6 border-b border-border/60 bg-background/70 backdrop-blur-xl backdrop-saturate-150"
      style={{ WebkitBackdropFilter: 'blur(24px) saturate(180%)' }}
    >
      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="min-[900px]:hidden h-9 w-9 text-muted-foreground shrink-0"
          aria-label={t('header.openSidebar')}
        >
          <Menu className="w-5 h-5" />
        </Button>

        <div className="flex items-center gap-2 min-w-0">
          <span
            className="hidden sm:flex h-8 w-8 items-center justify-center rounded-md shrink-0"
            style={{
              background: 'var(--primary-soft)',
              color: 'var(--primary-deep)',
            }}
            aria-hidden
          >
            <Sparkles className="w-4 h-4" />
          </span>
          <div className="min-w-0">
            <h1 className="font-display text-sm sm:text-base font-semibold text-foreground truncate leading-tight">
              {t('header.title')}
            </h1>
            <p className="text-xs text-muted-foreground truncate leading-tight mt-0.5">
              {offline ? (
                <span className="inline-flex items-center gap-1 text-yellow-600 dark:text-yellow-400">
                  <WifiOff className="w-3 h-3" />
                  {t('header.offlineMode')}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5">
                  <span
                    className="inline-block h-1.5 w-1.5 rounded-full animate-pulse-dot"
                    style={{ backgroundColor: 'var(--success)' }}
                    aria-hidden
                  />
                  {t('header.subtitle')}
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {ragHint && (
          <Badge
            variant="secondary"
            className="hidden sm:inline-flex font-mono text-[10px] tracking-wider"
            style={{
              background: 'var(--primary-soft)',
              color: 'var(--primary-deep)',
              borderColor: 'transparent',
            }}
          >
            RAG
          </Badge>
        )}

        <ModelSelector />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleLang}
              className="hidden sm:inline-flex h-9 px-2.5 text-muted-foreground text-xs font-medium gap-1"
              aria-label={t('header.switchLang')}
            >
              <Languages className="w-3.5 h-3.5" />
              {lang === 'zh' ? 'EN' : '中'}
            </Button>
          </TooltipTrigger>
          <TooltipContent>{t('header.switchLang')}</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleDark}
              className="h-9 w-9 text-muted-foreground"
              aria-label={isDark ? t('header.toLight') : t('header.toDark')}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>{isDark ? t('header.toLight') : t('header.toDark')}</TooltipContent>
        </Tooltip>
      </div>
    </header>
  )
}
