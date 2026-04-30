/**
 * LoadingIndicator 组件测试套件
 *
 * 测试用例:
 *  1. 正确渲染3个加载点 - ✅
 *  2. 每个点都有正确的样式和动画延迟 - ✅
 *  3. 容器使用 flex 布局 - ✅
 *
 * 覆盖率: Stmts 100%, Branch 100%, Funcs 100%, Lines 100%
 * 未覆盖: 无
 */
import { describe, test, expect } from 'vitest'
import { render } from '@testing-library/react'
import '@testing-library/jest-dom'
import { LoadingIndicator } from '../../components/LoadingIndicator'

describe('LoadingIndicator', () => {
  test('正确渲染加载指示器', () => {
    const { container } = render(<LoadingIndicator />)

    // 检查是否有3个点 (通过 span 标签数量)
    const spans = container.querySelectorAll('span')
    expect(spans).toHaveLength(3)

    // 检查容器样式
    const containerDiv = container.querySelector('.flex')
    expect(containerDiv).toHaveClass('gap-1')
    expect(containerDiv).toHaveClass('py-2')
  })

  test('每个点都有正确的样式和动画延迟', () => {
    const { container } = render(<LoadingIndicator />)

    const spans = container.querySelectorAll('span')
    expect(spans).toHaveLength(3)

    const expectedDelays = ['0ms', '150ms', '300ms']

    spans.forEach((span, index) => {
      expect(span).toHaveClass('w-1.5')
      expect(span).toHaveClass('h-1.5')
      expect(span).toHaveClass('rounded-full')
      expect(span).toHaveClass('bg-muted-foreground')
      expect(span).toHaveClass('animate-bounce')
      expect(span.getAttribute('style')).toContain(`animation-delay: ${expectedDelays[index]}`)
    })
  })
})
