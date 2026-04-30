# 测试代码模式指南

> 各模块类型的标准测试模式与完整代码示例。框架无关——示例中 `vi.fn()` 可替换为 `jest.fn()`。

## 1. 核心原则

### 测试行为，而非实现

```typescript
// ❌ 测试内部状态（实现细节）
expect(result.current._internalFlag).toBe(false);

// ✅ 测试可观测的行为
expect(result.current.loading).toBe(false);        // 公开状态
expect(screen.getByRole('button')).toBeDisabled();  // 可见 UI
expect(onSubmit).toHaveBeenCalledWith({ name: 'test' }); // 副作用
```

### 命名规范

```typescript
describe('模块名 / 函数名', () => {
  describe('当某条件成立时', () => {
    it('应该产生某行为', () => { ... });
  });
});
```

## 2. 工具函数测试

```typescript
import { mergeClassNames } from '../../utils/mergeClassNames';

describe('mergeClassNames', () => {
  it('无参数时返回空字符串', () => {
    expect(mergeClassNames()).toBe('');
  });

  it('冲突类名后者覆盖前者', () => {
    expect(mergeClassNames('p-2', 'p-4')).toBe('p-4');
  });

  it('falsy 值被跳过', () => {
    expect(mergeClassNames('base', false && 'hidden', null, 'extra')).toBe('base extra');
  });
});
```

**要点**：正常输入 → 边界值 → 空值/falsy → 异常输入。

## 3. Hook 测试

### 3.1 同步 Hook

```typescript
import { renderHook, act } from '@testing-library/react';
import { useCounter } from '../../hooks/useCounter';

describe('useCounter', () => {
  it('初始值为 0', () => {
    const { result } = renderHook(() => useCounter());
    expect(result.current.count).toBe(0);
  });

  it('increment 后值加 1', () => {
    const { result } = renderHook(() => useCounter());
    act(() => result.current.increment());
    expect(result.current.count).toBe(1);
  });

  it('支持自定义初始值', () => {
    const { result } = renderHook(() => useCounter(10));
    expect(result.current.count).toBe(10);
  });
});
```

### 3.2 异步 Hook（API 请求）

```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { useFetchUser } from '../../hooks/useFetchUser';
import { getUser } from '../../services/userService';

vi.mock('../../services/userService');

describe('useFetchUser', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('请求成功时返回数据并关闭 loading', async () => {
    vi.mocked(getUser).mockResolvedValue({ id: '1', name: 'Alice' });

    const { result } = renderHook(() => useFetchUser('1'));
    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual({ id: '1', name: 'Alice' });
    expect(result.current.error).toBeNull();
  });

  it('请求失败时返回错误并关闭 loading', async () => {
    vi.mocked(getUser).mockRejectedValue(new Error('Network'));

    const { result } = renderHook(() => useFetchUser('1'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeInstanceOf(Error);
  });
});
```

### 3.3 Timer Hook（Fake Timers）

```typescript
import { renderHook, act } from '@testing-library/react';
import { useDebounce } from '../../hooks/useDebounce';

describe('useDebounce', () => {
  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(() => { vi.useRealTimers(); });

  it('延迟到期后执行回调', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useDebounce());

    act(() => result.current.run(callback, 300));
    expect(callback).not.toHaveBeenCalled();

    act(() => vi.advanceTimersByTime(300));
    expect(callback).toHaveBeenCalledOnce();
  });

  it('取消后回调不再执行', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useDebounce());

    act(() => result.current.run(callback, 300));
    act(() => result.current.cancel());
    act(() => vi.advanceTimersByTime(500));
    expect(callback).not.toHaveBeenCalled();
  });

  it('组件卸载后定时器被清理', () => {
    const callback = vi.fn();
    const { result, unmount } = renderHook(() => useDebounce());

    act(() => result.current.run(callback, 300));
    unmount();
    act(() => vi.advanceTimersByTime(500));
    expect(callback).not.toHaveBeenCalled();
  });
});
```

### 3.4 引用稳定性测试

```typescript
it('useCallback 包裹的方法跨 rerender 引用不变', () => {
  const { result, rerender } = renderHook(() => useDebounce());
  const ref1 = result.current.run;
  rerender();
  expect(result.current.run).toBe(ref1);
});
```

### 3.5 需要 Context / Provider 的 Hook

```typescript
import React from 'react';

const wrapper = ({ children }: { children: React.ReactNode }) =>
  React.createElement(ThemeContext.Provider, { value: mockTheme }, children);

renderHook(() => useTheme(), { wrapper });
```

## 4. 组件测试

### 4.1 渲染与交互

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('SubmitButton', () => {
  it('点击时触发 onSubmit', async () => {
    const handleSubmit = vi.fn();
    render(<SubmitButton onSubmit={handleSubmit}>提交</SubmitButton>);

    await userEvent.click(screen.getByRole('button', { name: '提交' }));
    expect(handleSubmit).toHaveBeenCalledOnce();
  });

  it('禁用状态下不触发回调', async () => {
    const handleSubmit = vi.fn();
    render(<SubmitButton onSubmit={handleSubmit} disabled>提交</SubmitButton>);

    await userEvent.click(screen.getByRole('button'));
    expect(handleSubmit).not.toHaveBeenCalled();
  });
});
```

### 4.2 错误与空状态

```typescript
it('数据为空时渲染空状态', () => {
  render(<DataList items={[]} />);
  expect(screen.getByText('暂无数据')).toBeInTheDocument();
});

it('加载失败时渲染兜底 UI', async () => {
  vi.mocked(fetchData).mockRejectedValue(new Error('Network'));
  render(<DataView />);
  expect(await screen.findByText('加载失败')).toBeInTheDocument();
});
```

### 4.3 查询优先级

```
getByRole > getByText > getByLabelText > getByTestId > querySelector
```

## 5. Store 测试（Zustand / Redux）

```typescript
import { useAppStore } from '../../store/appStore';

describe('appStore', () => {
  beforeEach(() => {
    // 每个 test 前重置，避免单例泄漏
    useAppStore.setState({ items: [], loading: false });
  });

  it('setLoading 更新 loading 状态', () => {
    useAppStore.getState().setLoading(true);
    expect(useAppStore.getState().loading).toBe(true);
  });

  it('addItem 追加元素', () => {
    useAppStore.getState().addItem({ id: '1', name: 'test' });
    expect(useAppStore.getState().items).toHaveLength(1);
  });
});
```

## 6. Node.js Service 测试

### 6.1 纯逻辑 Service

```javascript
const searchService = require('../../services/searchService');

describe('searchService.search', () => {
  it('关键词命中时返回匹配结果', () => {
    const result = searchService.search('javascript');
    expect(result).not.toBeNull();
    expect(result.items.length).toBeGreaterThan(0);
  });

  it('无匹配时返回 null', () => {
    const result = searchService.search('zzzzzzzzz');
    expect(result).toBeNull();
  });
});
```

### 6.2 数据库隔离（内存 DB）

```javascript
beforeAll(() => { process.env.TEST_DB = ':memory:'; });
afterAll(() => { delete process.env.TEST_DB; });

describe('userService', () => {
  it('create 返回含 id 的对象', () => {
    const user = userService.create('Alice');
    expect(user).toHaveProperty('id');
    expect(user.name).toBe('Alice');
  });

  it('delete 后 get 返回 undefined', () => {
    const user = userService.create('Bob');
    userService.delete(user.id);
    expect(userService.get(user.id)).toBeUndefined();
  });
});
```

## 7. REST API 集成测试

```javascript
const request = require('supertest');
const app = require('../../app');

describe('POST /api/users', () => {
  it('返回 201 并携带新用户', async () => {
    const res = await request(app)
      .post('/api/users')
      .send({ name: 'Alice' });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
  });

  it('缺少必要参数时返回 400', async () => {
    const res = await request(app).post('/api/users').send({});
    expect(res.status).toBe(400);
  });
});
```

## 8. Mock 策略

### 8.1 清理模式

```typescript
// 标准：清理调用记录，保留 mockReturnValue
beforeEach(() => { vi.clearAllMocks(); });

// 完整重置：清理记录并重置返回值
beforeEach(() => { vi.resetAllMocks(); });

// 恢复原始实现
afterEach(() => { vi.restoreAllMocks(); });
```

### 8.2 条件 Mock

```typescript
const mockFetch = vi.fn().mockImplementation((id) => {
  if (id === 'error') return Promise.reject(new Error('fail'));
  return Promise.resolve({ id, data: 'ok' });
});
```

### 8.3 Transport / Callback Spy

当 `spyOn` 因 `.bind()` 缓存失效时，使用回调注入：

```typescript
function createLoggerWithSpy(level = 'debug') {
  const spy = vi.fn();
  const logger = new Logger({ level, transports: [spy] });
  return { logger, spy };
}
```

## 9. 调试技巧

```typescript
// 打印 DOM 结构
screen.debug();

// 打印特定节点
screen.debug(screen.getByTestId('container'));

// 查看所有可访问角色
screen.logTestingPlaygroundURL();
```
