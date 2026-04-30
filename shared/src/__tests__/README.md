# Shared 包单元测试

本文档列出了为 `@ai-chat/shared` 包创建的所有单元测试文件。

## 测试覆盖率

### 组件测试
- [ErrorBoundary 组件测试](./components/ErrorBoundary.test.tsx) - 测试错误边界组件的渲染和错误处理
- [EventProvider 组件测试](./components/EventProvider.test.tsx) - 测试事件总线提供者和相关 Hook
- [LoadingIndicator 组件测试](./components/LoadingIndicator.test.tsx) - 测试加载指示器的渲染
- [LoggerProvider 组件测试](./components/LoggerProvider.test.tsx) - 测试日志提供者和相关 Hook
- [PreloadProvider 组件测试](./components/PreloadProvider.test.tsx) - 测试图片预加载提供者和相关 Hook

### Hooks 测试
- [useAutoScroll Hook 测试](./hooks/useAutoScroll.test.ts) - 测试自动滚动 Hook
- [useClickCallback Hook 测试](./hooks/useClickCallback.test.ts) - 测试点击回调 Hook
- [useCountDown Hook 测试](./hooks/useCountDown.test.ts) - 测试倒计时 Hook
- [useDataChanged Hook 测试](./hooks/useDataChanged.test.ts) - 测试数据变化检测 Hook
- [useLockRef Hook 测试](./hooks/useLockRef.test.ts) - 测试锁定引用 Hook
- [useShowHide Hook 测试](./hooks/useShowHide.test.ts) - 测试显示/隐藏 Hook
- [useTimeout Hook 测试](./hooks/useTimeout.test.ts) - 测试超时 Hook

### 工具函数测试
- [EventBus 工具类测试](./utils/EventBus.test.ts) - 测试事件总线类
- [Logger 工具类测试](./utils/Logger.test.ts) - 测试日志工具类
- [cn 工具函数测试](./utils/cn.test.ts) - 测试类名合并工具函数
- [theme 工具函数测试](./utils/theme.test.ts) - 测试主题工具函数

## 运行测试

```bash
# 在 shared 目录下运行
npm test

# 或者运行特定测试文件
npm test -- __tests__/components/ErrorBoundary.test.tsx
```

## 测试特性

所有测试都遵循以下原则：
- 使用 Vitest 作为测试框架
- 使用 @testing-library/react 进行 React 组件测试
- 全面的边界情况测试
- 错误处理和异常测试
- SSR 环境兼容性测试
- 性能优化测试（定时器清理等）

## 测试质量

- ✅ 所有组件和 Hook 都有对应的测试文件
- ✅ 测试覆盖率包括正常流程、边界情况和错误处理
- ✅ 使用模拟（mock）技术确保测试的独立性
- ✅ 遵循测试驱动开发（TDD）原则
