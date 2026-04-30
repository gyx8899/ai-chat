# 通用错误处理规范 (Error Handling Standards)

> 跨项目通用的错误处理策略，适用于 React + TypeScript + Node.js 技术栈。

## 核心原则

1. **明确失败**：错误应在最接近根因的层级被捕获和记录
2. **用户可感知**：所有面向用户的错误必须有友好提示，禁止暴露技术堆栈
3. **可恢复性**：区分可恢复错误（网络超时）与不可恢复错误（数据损坏），采取不同策略
4. **统一格式**：同一项目内错误对象结构保持一致

---

## 前端错误处理

### 1. Error Boundary（React）

为关键渲染区域包裹 Error Boundary，防止局部错误导致整页白屏：

```tsx
// components/ErrorBoundary.tsx
class ErrorBoundary extends React.Component<Props, State> {
  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // 上报至监控系统（如 Sentry）
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? <div>页面出现异常，请刷新重试</div>;
    }
    return this.props.children;
  }
}
```

**使用规范**：
- 顶层路由/页面级别必须有 Error Boundary
- 第三方组件或高风险渲染区域单独包裹

### 2. 异步请求错误处理

```typescript
// 统一的请求错误类型
interface ApiError {
  code: string;       // 业务错误码，如 "AUTH_EXPIRED"
  message: string;    // 人类可读的错误描述
  status?: number;    // HTTP 状态码
}

// 标准请求封装
async function fetchApi<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  if (!res.ok) {
    const err: ApiError = await res.json().catch(() => ({
      code: 'UNKNOWN',
      message: `请求失败 (${res.status})`,
      status: res.status,
    }));
    throw err;
  }
  return res.json();
}
```

### 3. Hook 内错误状态管理

```typescript
// 错误状态标准模式
const [error, setError] = useState<string | null>(null);

const handleAction = async () => {
  setError(null); // 重置上次错误
  try {
    await someAsyncOperation();
  } catch (err) {
    const message = err instanceof Error ? err.message : '操作失败，请重试';
    setError(message);
  }
};
```

**规范**：
- 错误状态随新操作发起时清空（避免残留旧错误）
- 错误信息面向用户，不暴露内部细节

### 4. SSE / 流式接口错误

```typescript
// 流读取中的错误处理
try {
  for await (const chunk of readStream(response.body)) {
    // 处理数据
  }
} catch (err) {
  if ((err as Error).name === 'AbortError') return; // 用户主动中止，忽略
  setError('连接中断，请重新发送');
} finally {
  setIsStreaming(false);
}
```

---

## 后端错误处理（Node.js / Express）

### 1. 标准错误响应格式

```javascript
// 统一错误响应结构
{
  "error": {
    "code": "VALIDATION_FAILED",   // 机器可读的错误码
    "message": "参数 sessionId 不能为空", // 人类可读描述
    "details": {}                   // 可选：附加调试信息（仅开发环境）
  }
}
```

### 2. 自定义错误类

```javascript
class AppError extends Error {
  constructor(message, code = 'INTERNAL_ERROR', statusCode = 500) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

// 具体错误类型
class NotFoundError extends AppError {
  constructor(resource) {
    super(`${resource} 不存在`, 'NOT_FOUND', 404);
  }
}

class ValidationError extends AppError {
  constructor(message) {
    super(message, 'VALIDATION_FAILED', 400);
  }
}
```

### 3. 全局错误中间件

```javascript
// 必须注册在所有路由之后
app.use((err, req, res, next) => {
  const statusCode = err.statusCode ?? 500;
  const isDev = process.env.NODE_ENV === 'development';

  console.error(`[${req.method} ${req.path}]`, err);

  res.status(statusCode).json({
    error: {
      code: err.code ?? 'INTERNAL_ERROR',
      message: statusCode < 500 ? err.message : '服务器内部错误',
      ...(isDev && { stack: err.stack }),
    },
  });
});
```

### 4. 异步路由包装

```javascript
// 避免在每个路由中重复 try/catch
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

router.get('/sessions', asyncHandler(async (req, res) => {
  const sessions = await sessionService.getAll();
  res.json(sessions);
}));
```

---

## 错误日志规范

| 级别 | 场景 | 示例 |
|------|------|------|
| `ERROR` | 需要立即处理的故障 | 数据库连接失败、未捕获异常 |
| `WARN` | 可接受但需关注的异常 | 请求参数缺失使用默认值 |
| `INFO` | 关键业务操作记录 | 用户创建会话、发送消息 |
| `DEBUG` | 调试信息（仅开发环境） | SQL 查询语句、LLM 请求参数 |

**规范**：
- 生产环境禁止输出 `DEBUG` 级别日志
- 日志中禁止输出完整的用户消息内容或敏感字段（脱敏处理）
- 错误日志必须包含 `requestId` 或 `sessionId` 便于追踪
