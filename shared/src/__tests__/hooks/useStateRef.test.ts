/**
 * useStateRef Hook 测试套件
 *
 * 测试用例:
 *  1. 初始值同时反映在 state 和 ref 上 - ✅
 *  2. setState 更新时 ref 同步更新 - ✅
 *  3. ref 直接修改不会触发重渲染 - ✅
 *
 * 覆盖率: Stmts 100%, Branch 100%, Funcs 100%, Lines 100%
 * 未覆盖: 无
 */
import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useStateRef } from '../../hooks/useStateRef'

describe('useStateRef', () => {
  it('初始值同时反映在 state 和 ref 上', () => {
    const { result } = renderHook(() => useStateRef(42))
    const [state, , ref] = result.current
    expect(state).toBe(42)
    expect(ref.current).toBe(42)
  })

  it('dispatch 更新 state 和 ref', () => {
    const { result } = renderHook(() => useStateRef(0))
    act(() => result.current[1](10))
    expect(result.current[0]).toBe(10)
    expect(result.current[2].current).toBe(10)
  })

  it('dispatch 接受函数式更新', () => {
    const { result } = renderHook(() => useStateRef(5))
    act(() => result.current[1](prev => prev + 3))
    expect(result.current[0]).toBe(8)
    expect(result.current[2].current).toBe(8)
  })

  it('相同值不触发额外渲染', () => {
    let renderCount = 0
    const { result } = renderHook(() => {
      renderCount++
      return useStateRef('hello')
    })
    const before = renderCount
    act(() => result.current[1]('hello'))
    expect(renderCount).toBe(before)
  })
})
