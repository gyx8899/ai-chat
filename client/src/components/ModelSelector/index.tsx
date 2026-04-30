import { ChevronDown, Check, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useModelStore } from '@/store/modelStore'
import { useTranslation } from '@/hooks/useTranslation'
import { cn } from '@/lib/utils'

export function ModelSelector() {
  const models = useModelStore(s => s.models)
  const current = useModelStore(s => s.current)
  const loading = useModelStore(s => s.loading)
  const switchModel = useModelStore(s => s.switchModel)
  const { t } = useTranslation()

  const currentModel = models.find(m => m.id === current?.modelId)

  const handleSelect = async (modelId: string) => {
    if (modelId === current?.modelId || loading) return
    await switchModel(modelId)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={loading || models.length === 0}
          className="group h-9 gap-1.5 rounded-full border-border/60 bg-background/60 px-2.5 text-xs font-medium text-foreground hover:bg-background hover:shadow-glow transition-all"
          aria-label={t('model.switch')}
        >
          {loading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <span
              className="inline-block h-1.5 w-1.5 rounded-full shrink-0"
              style={{
                backgroundColor: 'var(--primary-oklch)',
                boxShadow: '0 0 6px var(--primary-glow)',
              }}
              aria-hidden
            />
          )}
          <span className="max-w-[80px] sm:max-w-[120px] truncate">
            {currentModel?.name ?? t('model.loading')}
          </span>
          <ChevronDown className="w-3 h-3 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-72 max-h-80 overflow-y-auto rounded-lg border-border/60 bg-popover/95 backdrop-blur-xl shadow-glow"
      >
        <DropdownMenuLabel className="font-display text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {t('model.selectTitle')}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {models.map(model => {
          const isActive = model.id === current?.modelId
          return (
            <DropdownMenuItem
              key={model.id}
              onSelect={() => handleSelect(model.id)}
              className={cn(
                'items-start gap-2.5 px-3 py-2.5 rounded-md cursor-pointer focus:bg-accent',
                isActive && 'bg-accent text-accent-foreground'
              )}
            >
              <span className="text-base mt-0.5 shrink-0" aria-hidden>
                {model.icon}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <span className="text-xs font-medium truncate">{model.name}</span>
                  {isActive && (
                    <Check className="w-3 h-3 shrink-0" style={{ color: 'var(--primary-oklch)' }} />
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                  {model.description}
                </p>
              </div>
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
