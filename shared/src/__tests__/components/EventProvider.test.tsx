/**
 * EventProvider 组件测试套件
 *
 * 测试用例:
 *  1. 正常渲染子组件 - ✅
 *  2. useEvent 返回 EventBus 实例 - ✅
 *  3. useEvent 无 Provider 时返回默认实例 - ✅
 *  4. useEventListener 自动订阅和取消订阅 - ✅
 *  5. EventProvider 接受外部 bus 实例 - ✅
 *  6. 内部创建的 bus 在 Provider 卸载时清理所有监听器 - ✅
 *
 * 覆盖率: Stmts 100%, Branch 84.61%, Funcs 100%, Lines 100%
 * 未覆盖: 44, 96
 */
import { describe, test, expect, vi } from 'vitest'
import { render, act } from '@testing-library/react'
import { useEffect } from 'react'
import '@testing-library/jest-dom'
import { EventProvider, useEvent, useEventListener } from '../../components/EventProvider'
import { EventBus } from '../../utils/EventBus'

describe('EventProvider', () => {
  test('正常渲染子组件', () => {
    const { container } = render(
      <EventProvider>
        <div>测试内容</div>
      </EventProvider>
    )

    expect(container.textContent).toBe('测试内容')
  })

  test('useEvent 返回 EventBus 实例', () => {
    let busRef: EventBus | null = null
    function Inner() {
      busRef = useEvent()
      return <div />
    }
    render(
      <EventProvider>
        <Inner />
      </EventProvider>
    )
    expect(busRef).toBeInstanceOf(EventBus)
  })

  test('useEvent 无 Provider 时返回默认实例', () => {
    // 无 Provider 时 useEvent 返回 DEFAULT_BUS
    function Inner() {
      const bus = useEvent()
      return <div data-testid="type">{bus.constructor.name}</div>
    }
    const { getByTestId } = render(<Inner />)
    expect(getByTestId('type').textContent).toBe('EventBus')
  })

  test('useEventListener 自动订阅和取消订阅', () => {
    const handler = vi.fn()
    let busRef: EventBus | null = null

    function TestComponent() {
      busRef = useEvent()
      useEventListener('test-event', handler)
      return <div>测试组件</div>
    }

    const { unmount } = render(
      <EventProvider>
        <TestComponent />
      </EventProvider>
    )

    // 触发事件
    act(() => {
      busRef!.emit('test-event', 'payload')
    })
    expect(handler).toHaveBeenCalledWith('payload')

    // 卸载组件
    unmount()

    // 再次触发事件，handler 应该只被调用一次
    act(() => {
      busRef!.emit('test-event', 'payload2')
    })
    expect(handler).toHaveBeenCalledTimes(1)
  })

  test('EventProvider 接受外部 bus 实例', () => {
    const externalBus = new EventBus()
    const handler = vi.fn()

    externalBus.on('test-event', handler)

    render(
      <EventProvider bus={externalBus}>
        <div>测试</div>
      </EventProvider>
    )

    // 触发事件
    act(() => {
      externalBus.emit('test-event', 'payload')
    })

    expect(handler).toHaveBeenCalledWith('payload')
  })

  test('内部创建的 bus 在 Provider 卸载时清理所有监听器', () => {
    const handler = vi.fn()
    let busRef: EventBus | null = null

    function TestComponent() {
      const bus = useEvent()
      useEffect(() => {
        busRef = bus
        bus.on('test-event', handler)
      }, [bus])
      return <div>测试</div>
    }

    const { unmount } = render(
      <EventProvider>
        <TestComponent />
      </EventProvider>
    )

    expect(busRef).not.toBeNull()

    // 触发事件，验证监听器有效
    act(() => {
      busRef!.emit('test-event', 'payload1')
    })
    expect(handler).toHaveBeenCalledTimes(1)

    // 卸载 Provider
    unmount()

    // 再次触发事件，监听器应该已被清理
    act(() => {
      busRef!.emit('test-event', 'payload2')
    })
    expect(handler).toHaveBeenCalledTimes(1)
  })
})
