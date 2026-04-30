import { Sparkles, Code2, Layers, Zap, Palette, Atom, Code, Database, Server, Layout, Box, GitBranch } from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { TranslationKey } from '@/locales'

const TECH_STACK = [
  { icon: Atom, label: 'React 19' },
  { icon: Zap, label: 'Vite 7' },
  { icon: Code, label: 'TypeScript' },
  { icon: Database, label: 'Zustand' },
  { icon: Server, label: 'SSE' },
  { icon: Layout, label: 'Tailwind' },
  { icon: Box, label: 'SQLite' },
  { icon: GitBranch, label: 'Monorepo' },
]

interface EmptyStateProps {
  onSuggest: (text: string) => void
}

const SUGGESTION_KEYS: ReadonlyArray<[TranslationKey, TranslationKey]> = [
  ['empty.s0Title', 'empty.s0Desc'],
  ['empty.s1Title', 'empty.s1Desc'],
  ['empty.s2Title', 'empty.s2Desc'],
  ['empty.s3Title', 'empty.s3Desc'],
]

const SUGGESTION_ICONS = [Code2, Layers, Zap, Palette]

export function EmptyState({ onSuggest }: EmptyStateProps) {
  const { t } = useTranslation()
  const suggestions = SUGGESTION_KEYS.map(([titleKey, descKey]) => ({
    title: t(titleKey),
    desc: t(descKey),
  }))

  return (
    <div className="relative flex flex-col items-center justify-center min-h-full px-4 py-10 text-center">
      {/* Hero Logo —— 渐变 + 发光 + 漂浮（错峰入场 60ms） */}
      <div
        className={cn(
          'relative w-[88px] h-[88px] mb-6 rounded-[26px] grid place-items-center',
          'shadow-glow animate-hero-float animate-fade-up'
        )}
        style={{
          background: 'linear-gradient(140deg, var(--primary-oklch) 0%, var(--primary-glow) 100%)',
          boxShadow:
            '0 20px 60px -20px oklch(0.62 0.18 var(--brand-h) / 0.55), inset 0 1px 0 rgb(255 255 255 / 0.3)',
          animationDelay: '60ms',
        }}
      >
        <span
          aria-hidden
          className="absolute -inset-2 rounded-[30px] opacity-25 blur-xl -z-10 animate-hero-glow"
          style={{
            background: 'linear-gradient(140deg, var(--primary-oklch), var(--primary-glow))',
          }}
        />
        <Sparkles className="w-10 h-10 text-white" strokeWidth={2} />
      </div>

      {/* Eyebrow 品牌小标签（错峰 120ms） */}
      <span
        className={cn(
          'inline-flex items-center gap-1.5 mb-3 px-3 py-1 rounded-full',
          'font-mono text-[11px] font-medium tracking-[0.08em] uppercase',
          'animate-fade-up'
        )}
        style={{
          background: 'oklch(0.62 0.18 var(--brand-h) / 0.12)',
          color: 'var(--primary-oklch)',
          border: '1px solid oklch(0.62 0.18 var(--brand-h) / 0.2)',
          animationDelay: '120ms',
        }}
      >
        <span
          className="w-1.5 h-1.5 rounded-full"
          style={{
            background: 'var(--primary-oklch)',
            boxShadow: '0 0 6px var(--primary-oklch)',
          }}
        />
        {t('empty.eyebrow')}
      </span>

      {/* 渐变标题（错峰 180ms） */}
      <h2
        className="font-display font-bold tracking-tight leading-[1.1] mb-3 text-[clamp(24px,4vw,40px)] bg-clip-text text-transparent bg-gradient-to-b from-foreground from-30% to-muted-foreground animate-fade-up"
        style={{ animationDelay: '180ms' }}
      >
        {t('empty.title')}
      </h2>

      <p
        className="text-sm sm:text-[15px] leading-relaxed text-muted-foreground max-w-xl mb-5 whitespace-pre-line animate-fade-up"
        style={{ animationDelay: '240ms' }}
      >
        {t('empty.desc')}
      </p>

      {/* Tech Stack Badges */}
      <div className="flex flex-wrap justify-center gap-2 max-w-[520px] mb-8 animate-fade-up" style={{ animationDelay: '280ms' }}>
        {TECH_STACK.map(({ icon: Icon, label }) => (
          <span
            key={label}
            className="inline-flex items-center gap-[5px] px-3 py-[5px] rounded-full font-mono text-[11px] font-medium tracking-[0.02em] transition-all duration-fast ease-smooth cursor-default hover:-translate-y-[1px]"
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              color: 'var(--text-muted)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'var(--primary-oklch)'
              e.currentTarget.style.color = 'var(--primary-oklch)'
              e.currentTarget.style.background = 'var(--primary-soft)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--border)'
              e.currentTarget.style.color = 'var(--text-muted)'
              e.currentTarget.style.background = 'var(--surface)'
            }}
          >
            <Icon className="w-3 h-3 opacity-70" />
            {label}
          </span>
        ))}
      </div>

      {/* Suggestion 卡片网格（从 320ms 起，每张错峰 60ms） */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full max-w-[640px]">
        {suggestions.map((sug, i) => {
          const Icon = SUGGESTION_ICONS[i]
          const handleActivate = () => onSuggest(sug.desc)
          return (
            <Card
              key={sug.title}
              role="button"
              tabIndex={0}
              onClick={handleActivate}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  handleActivate()
                }
              }}
              className={cn(
                'group relative flex items-start gap-3 p-4 text-left overflow-hidden cursor-pointer',
                'transition-all duration-base ease-smooth',
                'hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40',
                'animate-fade-up'
              )}
              style={{ animationDelay: `${320 + i * 60}ms` }}
            >
              <span
                aria-hidden
                className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-base ease-smooth pointer-events-none"
                style={{
                  padding: '1px',
                  background: 'linear-gradient(135deg, var(--primary-oklch) 0%, transparent 60%)',
                  WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
                  WebkitMaskComposite: 'xor',
                  maskComposite: 'exclude',
                }}
              />
              <div
                className={cn(
                  'w-8 h-8 rounded-md grid place-items-center shrink-0 transition-all duration-base ease-smooth',
                  'group-hover:scale-105'
                )}
                style={{
                  background: 'oklch(0.62 0.18 var(--brand-h) / 0.12)',
                }}
              >
                <Icon
                  className="w-4 h-4 transition-colors duration-base ease-smooth group-hover:text-white"
                  style={{ color: 'var(--primary-oklch)' }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-semibold text-foreground mb-1">{sug.title}</div>
                <div className="text-xs leading-relaxed text-muted-foreground line-clamp-2">
                  {sug.desc}
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
