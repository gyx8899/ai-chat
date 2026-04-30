import { useEffect, useState, useMemo } from 'react'
import { Plus, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSessionStore } from '@/store/sessionStore'
import { useUIStore } from '@/store/uiStore'
import { useTranslation } from '@/hooks/useTranslation'
import { SidebarHeader } from './SidebarHeader'
import { SessionItem } from './SessionItem'
import { SidebarFooter } from './SidebarFooter'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'

interface SidebarBodyProps {
  className?: string
}

type GroupKey = 'today' | 'yesterday' | 'earlier'

function groupOf(ts?: number): GroupKey {
  if (!ts) return 'earlier'
  const d = new Date(ts)
  const now = new Date()
  const sameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  if (sameDay) return 'today'
  const y = new Date(now)
  y.setDate(now.getDate() - 1)
  const sameYesterday =
    d.getFullYear() === y.getFullYear() &&
    d.getMonth() === y.getMonth() &&
    d.getDate() === y.getDate()
  if (sameYesterday) return 'yesterday'
  return 'earlier'
}

function SidebarBody({ className }: SidebarBodyProps) {
  const sessions = useSessionStore(s => s.sessions)
  const activeSessionId = useSessionStore(s => s.activeSessionId)
  const createSession = useSessionStore(s => s.createSession)
  const setSidebarOpen = useUIStore(s => s.setSidebarOpen)
  const { t } = useTranslation()

  const [searchQuery, setSearchQuery] = useState('')

  const filteredSessions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return sessions
    return sessions.filter(s => s.title.toLowerCase().includes(q))
  }, [sessions, searchQuery])

  const grouped = useMemo(() => {
    const today: typeof filteredSessions = []
    const yesterday: typeof filteredSessions = []
    const earlier: typeof filteredSessions = []
    for (const s of filteredSessions) {
      const g = groupOf(s.created_at)
      if (g === 'today') today.push(s)
      else if (g === 'yesterday') yesterday.push(s)
      else earlier.push(s)
    }
    return { today, yesterday, earlier }
  }, [filteredSessions])

  const handleNewSession = async () => {
    await createSession()
    setSidebarOpen(false)
  }

  const groupLabel = (key: GroupKey): string => {
    if (key === 'today') return t('sidebar.groupToday')
    if (key === 'yesterday') return t('sidebar.groupYesterday')
    return t('sidebar.groupEarlier')
  }

  const renderGroup = (key: GroupKey, list: typeof filteredSessions) => {
    if (list.length === 0) return null
    return (
      <div key={key} className="mb-2">
        <p className="px-4 pt-3 pb-1.5 font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground/70">
          {groupLabel(key)}
        </p>
        <div className="space-y-0.5">
          {list.map(session => (
            <SessionItem
              key={session.id}
              session={session}
              isActive={session.id === activeSessionId}
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'flex flex-col h-full bg-subtle border-r border-border/60 backdrop-blur-xl',
        className
      )}
    >
      <SidebarHeader />

      <div className="px-4 py-[16px] pb-3">
        <Button
          onClick={handleNewSession}
          className="group relative w-full gap-2 py-[11px] px-[14px] rounded-md font-medium text-[14px] transition-all duration-base ease-smooth hover:-translate-y-[1px] hover:shadow-glow overflow-hidden hover:!border-[var(--primary)] hover:!text-[var(--primary)] flex justify-start"
          style={{
            background: 'var(--surface)',
            color: 'var(--text)',
            border: '1px solid var(--border)',
          }}
        >
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-var(--primary-soft) to-transparent transition-transform duration-slow ease-smooth group-hover:translate-x-full"
            style={{ transform: 'translateX(-100%)' }}
          />
          <Plus className="w-4 h-4 transition-transform group-hover:rotate-90 duration-base ease-spring" />
          {t('sidebar.newChat')}
        </Button>
      </div>

      <div className="px-4 pb-3">
        <div className="relative">
          <Search className="absolute left-[11px] top-1/2 -translate-y-1/2 w-[14px] h-[14px] text-muted-foreground/70 pointer-events-none" />
          <Input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={t('sidebar.search')}
            className="pl-[34px] py-[9px] pr-3 h-auto text-[13px] rounded-md bg-transparent border border-border focus-visible:ring-1 focus-visible:ring-ring/40 focus:bg-background placeholder:text-muted-foreground/70"
          />
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 pb-4">
        {filteredSessions.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-8">
            {searchQuery.trim() ? t('sidebar.searchEmpty') : t('sidebar.empty')}
          </p>
        ) : (
          <>
            {renderGroup('today', grouped.today)}
            {renderGroup('yesterday', grouped.yesterday)}
            {renderGroup('earlier', grouped.earlier)}
          </>
        )}
      </nav>

      <SidebarFooter />
    </div>
  )
}

export function Sidebar() {
  const sessions = useSessionStore(s => s.sessions)
  const loadSessions = useSessionStore(s => s.loadSessions)
  const isOpen = useUIStore(s => s.sidebarOpen)
  const setSidebarOpen = useUIStore(s => s.setSidebarOpen)
  const { t } = useTranslation()

  useEffect(() => {
    loadSessions()
  }, [loadSessions])

  void sessions

  return (
    <>
      {/* 桌面端（≥900px）：常驻侧栏 */}
      <aside className="hidden min-[900px]:flex min-[900px]:w-[280px] shrink-0">
        <SidebarBody className="w-full" />
      </aside>

      {/* 移动端（<900px）：Sheet 抽屉 */}
      <Sheet open={isOpen} onOpenChange={setSidebarOpen}>
        <SheetContent
          side="left"
          className="min-[900px]:hidden w-[280px] p-0 border-r border-border/60 bg-background/95 backdrop-blur-xl"
        >
          <SheetTitle className="sr-only">{t('sidebar.title')}</SheetTitle>
          <SidebarBody />
        </SheetContent>
      </Sheet>
    </>
  )
}
