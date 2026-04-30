# 通用测试规范 (Testing Standards)

> 跨项目通用的测试策略与编写规范，适用于 React + TypeScript + Node.js 技术栈。

> ✅ **当前项目现状**：`ai-chat-demo` 已引入 Vitest 4 作为统一测试框架。三包（shared / client / server）均已配置独立的 `vitest.config`，并安装了 React Testing Library、Supertest 等测试工具。
> - 技能文档：[`.ai/system/skills/test-doctor/SKILL.md`](../skills/test-doctor/SKILL.md)
> - 运行命令：`npm run test:all`（根目录聚合） / 各包 `npm test`

## 核心原则

1. **测试先于修复**：修复 Bug 前必须先写能重现该 Bug 的测试
2. **关键路径覆盖**：优先测试核心业务逻辑，而非追求 100% 覆盖率
3. **测试即文档**：测试用例名称应清晰描述「给定条件 + 预期行为」
4. **测试独立性**：每个测试用例不依赖其他用例的执行顺序或状态

---

## 测试分层策略

```
单元测试 (Unit)     → 工具函数、纯逻辑、Hooks
集成测试 (Integration) → 组件交互、API 接口
E2E 测试 (End-to-End)  → 关键用户流程（按需）
```

**原则**：底层多测、顶层少测；优先测单元，集成测边界，E2E 测主干。

---

## 前端测试规范（React / TypeScript）

### 工具选择

| 场景 | 推荐工具 |
|------|---------|
| 单元测试 / 组件测试 | Vitest + React Testing Library |
| 端到端测试 | Playwright |
| 快照测试 | 避免使用（维护成本高，信噪比低） |

### 组件测试规范

```tsx
// 命名规范：describe 描述组件，it/test 描述行为
describe('Button', () => {
  it('点击时触发 onClick 回调', async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>提交</Button>);
    await userEvent.click(screen.getByRole('button', { name: '提交' }));
    expect(handleClick).toHaveBeenCalledOnce();
  });

  it('禁用状态下点击不触发回调', async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick} disabled>提交</Button>);
    await userEvent.click(screen.getByRole('button'));
    expect(handleClick).not.toHaveBeenCalled();
  });
});
```

**规范**：
- 使用 `screen.getByRole` 等语义化查询，而非 `querySelector`
- 测试用户行为结果，而非组件内部状态
- 异步操作使用 `await userEvent` 或 `waitFor`，禁止 `act()` 裸调用

### Hook 测试规范

```typescript
import { renderHook, act } from '@testing-library/react';

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
});
```

---

## 后端测试规范（Node.js）

### 工具选择

| 场景 | 推荐工具 |
|------|---------|
| 单元测试 | Jest / Vitest |
| API 集成测试 | Supertest + Jest |
| 数据库 Mock | 内存 SQLite / jest.mock |

### Service 层单元测试

```javascript
// 测试业务逻辑，隔离外部依赖
jest.mock('../db', () => ({ query: jest.fn() }));

describe('sessionService.create', () => {
  it('新建会话时返回带 id 的对象', async () => {
    db.query.mockReturnValue({ lastInsertRowid: 42 });
    const session = await sessionService.create('新会话');
    expect(session).toMatchObject({ id: 42, title: '新会话' });
  });
});
```

### API 集成测试

```javascript
const request = require('supertest');
const app = require('../index');

describe('POST /api/sessions', () => {
  it('返回 201 并携带新会话数据', async () => {
    const res = await request(app)
      .post('/api/sessions')
      .send({ title: '测试会话' });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
  });

  it('缺少 title 时返回 400', async () => {
    const res = await request(app).post('/api/sessions').send({});
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_FAILED');
  });
});
```

---

## 测试文件组织

采用 `__tests__/` 集中管理模式，按源码模块分子目录镜像源码结构：

```
src/
├── utils/
│   └── cn.ts
├── hooks/
│   └── useChat.ts
├── components/
│   └── Button/
│       └── index.tsx
└── __tests__/                   ← 测试统一入口
    ├── utils/
    │   └── cn.test.ts           → 测试 ../../utils/cn
    ├── hooks/
    │   └── useChat.test.ts      → 测试 ../../hooks/useChat
    ├── components/
    │   └── Button.test.tsx      → 测试 ../../components/Button
    └── helpers/                 ← 公共 mock / fixture / test utils
        └── setup.ts

server/
├── services/
│   └── sessionService.js
├── routes/
│   └── sessions.js
└── __tests__/
    ├── services/
    │   └── sessionService.test.js
    └── routes/
        └── sessions.test.js
```

**规范**：
- 测试文件统一放置在 `__tests__/` 目录下，使用 `.test.ts` / `.test.tsx` / `.test.js` 后缀
- 子目录镜像源码模块结构（`utils/` / `hooks/` / `store/` / `components/`）
- 测试辅助函数放 `__tests__/helpers/` 目录
- 共享 Mock 数据放 `__mocks__/` 目录

---

## 禁止事项

- 禁止测试实现细节（内部状态、私有方法）
- 禁止在测试中使用 `setTimeout` 模拟异步（使用 `vi.useFakeTimers`）
- 禁止测试用例之间共享可变状态（每个 test 使用独立实例）
- 禁止为了提高覆盖率写无意义的测试（测试必须能发现真实 Bug）
