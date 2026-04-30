import { create } from 'zustand'
import type { Model, ModelConfig } from '@/types'
import { isOfflineMode } from '@/lib/detectOffline'
import { LOCAL_MODELS, LOCAL_MODEL_CONFIG } from '@/lib/localMode'
import { logger } from '@shared/utils'

const log = logger.withPrefix('[ModelStore]')

interface ModelState {
  models: Model[]
  current: ModelConfig | null
  loading: boolean
}

interface ModelActions {
  fetchConfig: () => Promise<void>
  switchModel: (modelId: string) => Promise<void>
}

export const useModelStore = create<ModelState & ModelActions>((set, get) => ({
  models: [],
  current: null,
  loading: false,

  fetchConfig: async () => {
    // ── 本地模式 ──
    if (isOfflineMode()) {
      set({ models: LOCAL_MODELS, current: LOCAL_MODEL_CONFIG })
      return
    }

    // ── 在线模式 ──
    try {
      const data: { current: ModelConfig; models: Model[] } = await fetch('/api/config').then(r =>
        r.json()
      )
      set({ models: data.models, current: data.current })
    } catch (e) {
      log.error('fetchConfig failed', e)
      // 接口失败时降级为本地模式配置
      set({ models: LOCAL_MODELS, current: LOCAL_MODEL_CONFIG })
    }
  },

  switchModel: async (modelId: string) => {
    // ── 本地模式：不支持切换 ──
    if (isOfflineMode()) return

    const prev = get().current
    const target = get().models.find(m => m.id === modelId)
    if (!target) return

    set({ current: { modelId: target.id, provider: target.provider }, loading: true })

    try {
      const data: { success: boolean; current: ModelConfig } = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ modelId }),
      }).then(r => r.json())

      set({ current: data.current, loading: false })
    } catch (e) {
      log.error('switchModel failed', e)
      set({ current: prev, loading: false })
    }
  },
}))
