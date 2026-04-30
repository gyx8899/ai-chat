import { Sparkles, RotateCcw } from 'lucide-react'
import { translate } from '@/locales'
import type { Locale } from '@/locales'
import { cn } from '@/lib/utils'

export function AppFallback() {
  const lang = (localStorage.getItem('lang') as Locale) || 'zh'

  return (
    <div className="relative flex h-screen items-center justify-center overflow-hidden bg-background text-foreground">
      {/* 品牌光斑背景 */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(60% 50% at 50% 30%, oklch(0.62 0.18 var(--brand-h) / 0.18), transparent 70%)',
        }}
      />

      <div className="text-center space-y-4 px-6">
        <div
          className={cn(
            'relative mx-auto w-16 h-16 rounded-xl grid place-items-center',
            'shadow-glow'
          )}
          style={{
            background:
              'linear-gradient(140deg, var(--primary-oklch) 0%, var(--primary-glow) 100%)',
            boxShadow:
              '0 16px 40px -12px oklch(0.62 0.18 var(--brand-h) / 0.5), inset 0 1px 0 rgb(255 255 255 / 0.3)',
          }}
        >
          <Sparkles className="w-7 h-7 text-white" strokeWidth={2} />
        </div>

        <p className="font-display text-lg font-semibold tracking-tight">
          {translate(lang, 'fallback.title')}
        </p>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
          {translate(lang, 'fallback.desc')}
        </p>
        <button
          onClick={() => window.location.reload()}
          className={cn(
            'mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-md',
            'text-sm font-medium text-primary-foreground',
            'transition-all duration-base ease-smooth hover:-translate-y-0.5 hover:shadow-glow',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40'
          )}
          style={{
            background: 'linear-gradient(135deg, var(--primary-oklch), var(--primary-glow))',
          }}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          {translate(lang, 'fallback.reload')}
        </button>
      </div>
    </div>
  )
}
