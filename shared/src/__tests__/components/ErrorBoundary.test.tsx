/**
 * ErrorBoundary 组件测试套件
 *
 * 测试用例:
 *  1. 正常渲染子组件 - ✅
 *  2. 捕获错误并显示降级内容 - ✅
 *  3. 捕获错误并显示默认降级内容（null） - ✅
 *  4. 调用 onError 回调 - ✅
 *  5. withErrorBoundary HOC 正常工作 - ✅
 *
 * 覆盖率: Stmts 100%, Branch 85.71%, Funcs 100%, Lines 100%
 * 未覆盖: 74
 */
import { describe, test, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { ErrorBoundary, withErrorBoundary } from '../../components/ErrorBoundary'

// 测试用组件：会抛出错误的组件
const ErrorThrowingComponent = ({ shouldThrow = false }: { shouldThrow?: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error')
  }
  return <div>Normal content</div>
}

describe('ErrorBoundary', () => {
  test('正常渲染子组件', () => {
    render(
      <ErrorBoundary>
        <div>正常内容</div>
      </ErrorBoundary>
    )

    expect(screen.getByText('正常内容')).toBeInTheDocument()
  })

  test('捕获错误并显示降级内容', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    render(
      <ErrorBoundary fallback={<div>错误发生了</div>}>
        <ErrorThrowingComponent shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.getByText('错误发生了')).toBeInTheDocument()

    consoleSpy.mockRestore()
  })

  test('捕获错误并显示默认降级内容（null）', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    render(
      <ErrorBoundary>
        <ErrorThrowingComponent shouldThrow={true} />
      </ErrorBoundary>
    )

    // 默认 fallback 是 null，所以应该没有内容显示
    expect(screen.queryByText('Normal content')).not.toBeInTheDocument()

    consoleSpy.mockRestore()
  })

  test('调用 onError 回调', () => {
    const onError = vi.fn()
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    render(
      <ErrorBoundary onError={onError}>
        <ErrorThrowingComponent shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(onError).toHaveBeenCalledTimes(1)
    expect(onError).toHaveBeenCalledWith(expect.any(Error), expect.any(Object))

    consoleSpy.mockRestore()
  })

  test('withErrorBoundary HOC 正常工作', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const TestComponent = () => <div>测试组件</div>
    const EnhancedComponent = withErrorBoundary(TestComponent, {
      fallback: <div>HOC 错误边界</div>,
    })

    render(<EnhancedComponent />)

    expect(screen.getByText('测试组件')).toBeInTheDocument()

    consoleSpy.mockRestore()
  })
})
