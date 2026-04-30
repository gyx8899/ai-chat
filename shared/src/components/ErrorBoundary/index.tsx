import React, { Component } from 'react'
import type { ComponentType } from 'react'

export interface ErrorBoundaryProps {
  children: React.ReactNode
  /** 出错时渲染的降级内容，默认渲染空节点 */
  fallback?: React.ReactNode
  /** 捕获到错误时的回调，可用于外部上报 */
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

interface State {
  hasError: boolean
}

/**
 * 错误边界组件
 *
 * 捕获子树中的渲染异常，防止整页白屏。
 * 上报逻辑通过 `onError` 回调注入，与具体上报 SDK 解耦。
 *
 * @example
 * <ErrorBoundary
 *   fallback={<div>页面出现异常，请刷新重试</div>}
 *   onError={(err, info) => reportSdk.report(err, info)}
 * >
 *   <App />
 * </ErrorBoundary>
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.props.onError?.(error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? null
    }
    return this.props.children
  }
}

// ─── HOC ─────────────────────────────────────────────────────────────────────

export type WithErrorBoundaryOptions = Omit<ErrorBoundaryProps, 'children'>

/**
 * 高阶组件：为任意组件附加错边界
 *
 * @example
 * export default withErrorBoundary(MyComponent, {
 *   fallback: <ErrorPage />,
 *   onError: (err) => logger.error(err),
 * })
 */
export function withErrorBoundary<P extends object>(
  WrappedComponent: ComponentType<P>,
  options?: WithErrorBoundaryOptions
) {
  function Wrapper(props: P) {
    return (
      <ErrorBoundary {...options}>
        <WrappedComponent {...props} />
      </ErrorBoundary>
    )
  }

  const name = WrappedComponent.displayName || WrappedComponent.name || 'Component'
  Wrapper.displayName = `withErrorBoundary(${name})`

  return Wrapper
}

export default ErrorBoundary
