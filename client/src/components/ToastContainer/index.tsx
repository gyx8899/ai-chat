import { useUIStore } from '@/store/uiStore'
import { Toaster } from '@/components/ui/sonner'

export function ToastContainer() {
  const isDark = useUIStore(s => s.isDark)
  return (
    <Toaster
      theme={isDark ? 'dark' : 'light'}
      position="bottom-right"
      visibleToasts={3}
      closeButton
      richColors
    />
  )
}
