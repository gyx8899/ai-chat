import { useEffect, useMemo, useRef, useState } from 'react'
import { useShowHide } from './useShowHide'

export type CountDownDate = Date | number | string | undefined

export interface CountDownOptions {
  /** 目标时间点 */
  targetDate?: CountDownDate
  /** 更新间隔（ms），默认 1000 */
  interval?: number
  /** 是否补零（如 "09"），默认 false */
  fillZero?: boolean
  /** 倒计时结束回调 */
  onEnd?: () => void
}

export interface CountDownResult {
  days: string
  hours: string
  minutes: string
  seconds: string
}

// ─── 内部工具函数 ────────────────────────────────────────────────────────────

function pad(num: number, fill: boolean): string {
  return fill && num < 10 ? `0${num}` : String(num)
}

function calcLeft(target?: CountDownDate): number {
  if (!target) return 0
  const left = new Date(target).getTime() - Date.now()
  return left > 0 ? left : 0
}

function parseMs(ms: number, fillZero: boolean): CountDownResult {
  return {
    days: pad(Math.floor(ms / 86_400_000), false),
    hours: pad(Math.floor(ms / 3_600_000) % 24, fillZero),
    minutes: pad(Math.floor(ms / 60_000) % 60, fillZero),
    seconds: pad(Math.floor(ms / 1_000) % 60, fillZero),
  }
}

//─── 导出工具函数 ─────────────────────────────────────────────────────────────

/**
 * 静态计算目标时间剩余的格式化结果，无需挂载 Hook。
 * 适用于初始渲染前的一次性计算。
 */
export function getCountDownResult(target: CountDownDate, fillZero = false): CountDownResult {
  return parseMs(calcLeft(target), fillZero)
}

// ─── Hook ────────────────────────────────────────────────────────────────────

/**
 * 倒计时 Hook
 *
 * - 仅在页面可见（前台）时更新，切换到后台自动暂停，回到前台立即补偿时间差。
 * - 依赖 `useShowHide` 监听 `document.visibilitychange`。
 *
 * @returns `[timeLeftMs, formatted]`
 * - `timeLeftMs` 剩余毫秒数，为 0 时表示已结束
 * - `formatted` 格式化后的天/时/分/秒字符串对象
 *
 * @example
 * const [timeLeft, { days, hours, minutes, seconds }] = useCountDown({
 *   targetDate: '2025-12-31 23:59:59',
 *   onEnd: () => console.log('ended'),
 * })
 */
export function useCountDown(options?: CountDownOptions): readonly [number, CountDownResult] {
  const { targetDate, interval = 1000, fillZero = false, onEnd } = options ?? {}

  const [timeLeft, setTimeLeft] = useState(() => calcLeft(targetDate))
  const onEndRef = useRef(onEnd)

  // 在 effect 中同步 ref，避免在 render 中更新 ref
  useEffect(() => {
    onEndRef.current = onEnd
  })

  // 监听页面可见性，后台暂停、前台恢复
  const isVisible = useShowHide()

  useEffect(() => {
    if (!targetDate) {
      // 没有目标日期时，在下一帧重置为 0
      const raf = requestAnimationFrame(() => setTimeLeft(0))
      return () => cancelAnimationFrame(raf)
    }

    // 页面隐藏时暂停，不启动 interval
    if (!isVisible) return

    // 前台可见：立即同步一次（补偿后台流逝的时间），通过 requestAnimationFrame 避免级联渲染
    const left = calcLeft(targetDate)
    const raf = requestAnimationFrame(() => {
      setTimeLeft(left)
      // 已结束则触发回调
      if (left === 0) {
        onEndRef.current?.()
      }
    })

    // 已结束则不启动 interval
    if (left === 0) {
      return () => cancelAnimationFrame(raf)
    }

    const timer = setInterval(() => {
      const remaining = calcLeft(targetDate)
      setTimeLeft(remaining)
      if (remaining === 0) {
        clearInterval(timer)
        onEndRef.current?.()
      }
    }, interval)

    return () => {
      cancelAnimationFrame(raf)
      clearInterval(timer)
    }
  }, [targetDate, interval, isVisible])

  const formatted = useMemo(() => parseMs(timeLeft, fillZero), [timeLeft, fillZero])

  return [timeLeft, formatted] as const
}
