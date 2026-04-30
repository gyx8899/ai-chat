import { useEffect } from 'react'
import { SlidersHorizontal } from 'lucide-react'
import { useUIStore } from '@/store/uiStore'
import { cn } from '@/lib/utils'
import { useTranslation } from '@/hooks/useTranslation'

const HUE_PRESETS: { hue: number; color: string }[] = [
  { hue: 200, color: 'oklch(0.62 0.18 200)' },
  { hue: 270, color: 'oklch(0.58 0.2 270)' },
  { hue: 155, color: 'oklch(0.6 0.18 155)' },
  { hue: 30, color: 'oklch(0.64 0.2 30)' },
  { hue: 330, color: 'oklch(0.6 0.22 330)' },
]

export function TweaksPanel() {
  const {
    isDark,
    toggleDark,
    tweaksOpen,
    setTweaksOpen,
    tweaksHue,
    setHue,
    bgDecor,
    toggleBgDecor,
  } = useUIStore()

  const { t } = useTranslation()

  useEffect(() => {
    document.documentElement.style.setProperty('--brand-h', String(tweaksHue))
  }, [tweaksHue])

  return (
    <>
      {/* Panel */}
      <div
        className={cn(
          'fixed bottom-5 right-5 z-[100] w-[220px] rounded-2xl border border-white/[0.08] bg-[oklch(0.14_0.012_235/0.92)] p-4 text-white shadow-[0_20px_60px_-10px_rgba(0,0,0,0.5)] backdrop-blur-md transition-transform',
          tweaksOpen ? 'translate-y-0' : 'translate-y-[calc(100%+30px)]'
        )}
        style={{ transitionDuration: '480ms', transitionTimingFunction: 'var(--ease-expo)' }}
      >
        <h4 className="mb-3 font-mono text-[11px] font-semibold uppercase tracking-[0.1em] opacity-80">
          {t('tweaks.title')}
        </h4>

        <div className="space-y-0">
          <div className="flex items-center justify-between border-t border-white/[0.06] py-[7px] first:border-t-0">
            <label className="text-xs opacity-80">{t('tweaks.brandHue')}</label>
            <div className="flex gap-1.5">
              {HUE_PRESETS.map(h => (
                <button
                  key={h.hue}
                  className={cn(
                    'h-5 w-5 rounded-full border-2 border-transparent transition-transform duration-150 hover:scale-[1.15]',
                    tweaksHue === h.hue && 'border-white shadow-[0_0_0_2px_rgba(0,0,0,0.4)]'
                  )}
                  style={{ backgroundColor: h.color }}
                  onClick={() => setHue(h.hue)}
                  aria-label={`${t('tweaks.brandHue')} ${h.hue}`}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-white/[0.06] py-[7px]">
            <label className="text-xs opacity-80">{t('tweaks.darkMode')}</label>
            <button
              className={cn(
                'relative h-5 w-[34px] rounded-full transition-colors',
                isDark ? 'bg-[var(--primary)]' : 'bg-white/15'
              )}
              onClick={toggleDark}
              aria-label={isDark ? t('tweaks.toLight') : t('tweaks.toDark')}
            >
              <span
                className="absolute top-[2px] h-4 w-4 rounded-full bg-white transition-[left]"
                style={{
                  left: isDark ? '16px' : '2px',
                  transitionDuration: '260ms',
                  transitionTimingFunction: 'var(--ease-spring)',
                }}
              />
            </button>
          </div>

          <div className="flex items-center justify-between border-t border-white/[0.06] py-[7px]">
            <label className="text-xs opacity-80">{t('tweaks.bgDecor')}</label>
            <button
              className={cn(
                'relative h-5 w-[34px] rounded-full transition-colors',
                bgDecor ? 'bg-[var(--primary)]' : 'bg-white/15'
              )}
              onClick={toggleBgDecor}
              aria-label={bgDecor ? t('tweaks.hideBg') : t('tweaks.showBg')}
            >
              <span
                className="absolute top-[2px] h-4 w-4 rounded-full bg-white transition-[left]"
                style={{
                  left: bgDecor ? '16px' : '2px',
                  transitionDuration: '260ms',
                  transitionTimingFunction: 'var(--ease-spring)',
                }}
              />
            </button>
          </div>

          <div className="border-t border-white/[0.06] pt-2.5">
            <button
              onClick={() => setTweaksOpen(false)}
              className="w-full rounded-md bg-white/[0.08] py-1.5 font-mono text-[11px] font-medium tracking-wider text-white transition-colors hover:bg-white/[0.14]"
            >
              {t('tweaks.collapse')}
            </button>
          </div>
        </div>
      </div>

      {/* FAB */}
      <button
        className={cn(
          'fixed bottom-5 right-5 z-[99] grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-[oklch(0.14_0.012_235/0.92)] text-white shadow-[0_8px_24px_-6px_rgba(0,0,0,0.4)] backdrop-blur-md transition-all',
          tweaksOpen ? 'pointer-events-none scale-75 opacity-0' : 'opacity-100 hover:scale-[1.08]'
        )}
        style={{ transitionDuration: '260ms', transitionTimingFunction: 'var(--ease-spring)' }}
        onClick={() => setTweaksOpen(true)}
        aria-label={t('tweaks.open')}
      >
        <SlidersHorizontal className="h-[18px] w-[18px]" />
      </button>
    </>
  )
}
