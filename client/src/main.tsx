import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from '@/App'
import { detectOffline } from '@/lib/detectOffline'
import { ErrorBoundary } from '@shared/components'
import { resolveInitialTheme, applyTheme, initBrandVisuals } from '@shared/utils'
import { AppFallback } from '@/components/AppFallback'
import { onAppError } from '@/components/AppFallback/onAppError'

// 在 React 渲染前同步初始化所有视觉状态，避免 FOUC
// 顺序：品牌色相/背景装饰 → 暗色模式 class
initBrandVisuals()
applyTheme(resolveInitialTheme())

// 启动时检测后端可用性（3s 超时），超时/失败则标记为离线模式
detectOffline().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <ErrorBoundary fallback={<AppFallback />} onError={onAppError}>
        <App />
      </ErrorBoundary>
    </StrictMode>
  )
})
