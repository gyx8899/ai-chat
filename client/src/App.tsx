import { Sidebar } from '@/components/Sidebar'
import { ChatArea } from '@/components/ChatArea'
import { ToastContainer } from '@/components/ToastContainer'
import { BackgroundLayer } from '@/components/BackgroundLayer'
import { TweaksPanel } from '@/components/TweaksPanel'
import { TooltipProvider } from '@/components/ui/tooltip'

export default function App() {
  return (
    <TooltipProvider delayDuration={200}>
      <BackgroundLayer />
      <div className="relative z-10 flex h-screen overflow-hidden">
        <Sidebar />
        <ChatArea />
        <ToastContainer />
      </div>
      <TweaksPanel />
    </TooltipProvider>
  )
}
