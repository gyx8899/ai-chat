/**
 * 检测后端 API 是否可用
 * 通过请求 /api/config 来判断，失败则认为处于离线/本地模式
 */

let _isOffline: boolean | null = null

// 检查是否为静态部署模式
const isStaticDeploy = import.meta.env.VITE_DEPLOY_TARGET === 'static'

/**
 * 探测后端可用性（带缓存，仅首次真实请求）
 * @param force 强制重新检测，忽略缓存
 */
export async function detectOffline(force = false): Promise<boolean> {
  if (!force && _isOffline !== null) return _isOffline

  // 静态部署模式下直接标记为离线
  if (isStaticDeploy) {
    _isOffline = true
    return _isOffline
  }

  try {
    const res = await fetch('/api/config', {
      method: 'GET',
      signal: AbortSignal.timeout(3000), // 3s 超时
    })
    _isOffline = !res.ok
  } catch {
    _isOffline = true
  }

  return _isOffline
}

/** 直接读取缓存状态（同步，未检测时返回 false） */
export function isOfflineMode(): boolean {
  return _isOffline === true || isStaticDeploy
}

/** 标记为离线模式（接口请求失败时主动调用） */
export function markOffline(): void {
  _isOffline = true
}

/** 标记为在线模式（供手动恢复使用） */
export function markOnline(): void {
  _isOffline = false
}
