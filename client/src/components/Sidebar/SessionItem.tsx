import { useState } from 'react'
import { MessageSquare, Trash2, Pencil, Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSessionStore } from '@/store/sessionStore'
import { useUIStore } from '@/store/uiStore'
import { useTranslation } from '@/hooks/useTranslation'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

interface SessionItemProps {
  session: { id: string; title: string; created_at?: number }
  isActive: boolean
}

export function SessionItem({ session, isActive }: SessionItemProps) {
  const renameSession = useSessionStore(s => s.renameSession)
  const deleteSession = useSessionStore(s => s.deleteSession)
  const selectSession = useSessionStore(s => s.selectSession)
  const setSidebarOpen = useUIStore(s => s.setSidebarOpen)
  const { t } = useTranslation()

  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState('')

  const handleSelect = () => {
    if (isEditing) return
    selectSession(session.id)
    setSidebarOpen(false)
  }

  const startEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsEditing(true)
    setEditTitle(session.title)
  }

  const confirmEdit = () => {
    if (editTitle.trim()) renameSession(session.id, editTitle.trim())
    setIsEditing(false)
  }

  const cancelEdit = () => setIsEditing(false)

  return (
    <div
      onClick={handleSelect}
      className={cn(
        'group relative flex items-center gap-2 px-3 py-2 pl-4 rounded-md cursor-pointer text-sm',
        'transition-all duration-base ease-spring',
        isActive
          ? 'text-foreground'
          : 'text-muted-foreground hover:bg-[var(--surface)] hover:text-foreground'
      )}
      style={isActive ? { backgroundColor: 'var(--primary-soft)' } : undefined}
    >
      <span
        aria-hidden
        className={cn(
          'absolute left-0 top-1/2 -translate-y-1/2 w-[3px] rounded-r-full transition-all duration-base ease-spring pointer-events-none',
          isActive
            ? 'h-[70%] opacity-100'
            : 'h-0 opacity-0 group-hover:h-[60%] group-hover:opacity-70'
        )}
        style={{ background: 'var(--primary-oklch)' }}
      />

      <MessageSquare className="w-[14px] h-[14px] shrink-0 opacity-70" />

      {isEditing ? (
        <div className="flex-1 flex items-center gap-1" onClick={e => e.stopPropagation()}>
          <input
            autoFocus
            value={editTitle}
            onChange={e => setEditTitle(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') confirmEdit()
              if (e.key === 'Escape') cancelEdit()
            }}
            className="flex-1 bg-background border border-border rounded px-1.5 py-0.5 text-xs text-foreground outline-none focus:ring-2 focus:ring-ring/40"
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={confirmEdit}
            className="h-5 w-5 text-primary hover:opacity-70 hover:bg-accent/40"
          >
            <Check className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={cancelEdit}
            className="h-5 w-5 text-muted-foreground hover:opacity-70 hover:bg-accent/40"
          >
            <X className="w-3.5 h-3.5" />
          </Button>
        </div>
      ) : (
        <>
          <span className="flex-1 truncate">{session.title || t('sidebar.untitled')}</span>
          <div className="hidden group-hover:flex items-center gap-1 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={startEdit}
              className="h-5 w-5 text-muted-foreground hover:text-foreground"
            >
              <Pencil className="w-3.5 h-3.5" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={e => e.stopPropagation()}
                  className="h-5 w-5 text-muted-foreground hover:text-red-500"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t('session.confirmDelete')}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {session.title || t('sidebar.untitled')}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t('session.deleteCancel')}</AlertDialogCancel>
                  <AlertDialogAction onClick={() => deleteSession(session.id)}>
                    {t('session.deleteConfirm')}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </>
      )}
    </div>
  )
}
