# 通用编码标准 (Coding Standards)

> 跨项目通用的编码规范，适用于 React + TypeScript + Node.js 技术栈。

## AI 辅助编码指导原则 (Karpathy Guidelines)

基于 Andrej Karpathy 对 LLM 编码常见问题的观察，制定以下行为准则以减少常见错误：

### 1. 编码前思考 (Think Before Coding)

**不要假设，不要隐藏困惑，明确权衡点。**

实施前：

- 明确陈述你的假设。如果不确定，询问。
- 如果存在多种解释，请呈现它们 - 不要默默选择。
- 如果存在更简单的方法，请说明。必要时提出异议。
- 如果有不清楚的地方，停止。指出困惑之处。询问。

### 2. 简化优先 (Simplicity First)

**解决问题的最少代码。不要推测性添加。**

- 不添加超出要求的功能。
- 不为单次使用代码创建抽象。
- 不添加未被要求的"灵活性"或"可配置性"。
- 不为不可能发生的场景添加错误处理。
- 如果你写了 200 行而它可以简化为 50 行，请重写。

问自己："资深工程师会说这过于复杂吗？"如果是，请简化。

### 3. 精确修改 (Surgical Changes)

**只触碰必须的部分。只清理自己造成的混乱。**

编辑现有代码时：

- 不要"改进"相邻代码、注释或格式。
- 不要重构没有损坏的东西。
- 匹配现有风格，即使你会做得不同。
- 如果你注意到无关的死代码，提及它 - 不要删除它。

当你的更改产生孤儿代码时：

- 移除你的更改导致的未使用的导入/变量/函数。
- 除非被要求，否则不要移除预先存在的死代码。

测试标准：每一行更改都应该直接追溯到用户的请求。

### 4. 目标驱动执行 (Goal-Driven Execution)

**定义成功标准。循环验证直到确认。**

将任务转化为可验证的目标：

- "添加验证" → "为无效输入编写测试，然后使其通过"
- "修复 bug" → "编写重现它的测试，然后使其通过"
- "重构 X" → "确保重构前后测试都通过"

对于多步骤任务，陈述简要计划：

```
1. [步骤] → 验证: [检查]
2. [步骤] → 验证: [检查]
3. [步骤] → 验证: [检查]
```

强有力的成功标准让你能够独立循环。弱标准（"让它工作"）需要不断澄清。

## React 组件规范

### 组件编写

- 使用**函数式组件 + Hooks**，不使用 Class 组件
- 组件文件使用 `.tsx` 扩展名，非 UI 逻辑使用 `.ts`
- 组件名使用 **PascalCase**，文件名与组件名一致
- Props 类型定义在组件文件顶部或单独的 `types.ts` 文件中

```tsx
// 正确示例
interface ButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({ label, onClick, disabled }) => {
  return <button onClick={onClick} disabled={disabled}>{label}</button>;
};
```

### Hooks 规范

- 自定义 Hook 以 `use` 开头
- Hook 只在组件顶层调用，不在条件或循环中调用
- 副作用（`useEffect`）必须处理清理函数（特别是 SSE、定时器、订阅）

```tsx
// SSE 清理示例
useEffect(() => {
  const controller = new AbortController();
  fetch('/api/stream', { method: 'POST', signal: controller.signal })
    .then((res) => res.body?.getReader())
    .catch((err) => {
      if (err.name !== 'AbortError') throw err;
    });
  return () => controller.abort(); // 必须清理
}, []);
```

> 注：AI Chat Demo 项目硬性禁用 `EventSource`（`EventSource` 仅支持 GET 且无法通过 `AbortController` 中断，不满足 POST 传参与停止生成需求），统一使用 `fetch` + `ReadableStream` 方案，详见 [`.ai/project/rules.md`](../../project/rules.md) § 2.4。

## TypeScript 规范

- 严格类型检查，禁止使用 `any`（使用 `unknown` 替代）
- 接口（Interface）用于对象类型，类型别名（Type）用于联合类型/工具类型
- 明确声明函数返回类型
- 使用可选链（`?.`）和空值合并（`??`）处理可能为 null 的值

```typescript
// 正确示例
function fetchData(id: string): Promise<ApiResponse> { ... }

// 禁止
function fetchData(id: any): any { ... }
```

## 样式规范（Tailwind CSS）

- 使用 **Tailwind CSS** 工具类，配合 `clsx` + `tailwind-merge` 处理条件样式
- 避免内联 `style` 属性（动态值除外）
- 响应式样式使用 Tailwind 断点前缀（`sm:`, `md:`, `lg:`）
- 暗模式使用 `dark:` 前缀

```tsx
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

// 使用示例
<div className={cn('base-class', isActive && 'active-class', className)} />
```

## Node.js 后端规范

- 后端使用 **CommonJS**（`require` / `module.exports`），不使用 ESM
- 路由文件只负责请求解析和响应，业务逻辑放 `services/` 层
- 环境变量通过 `.env` 文件管理，使用 `dotenv` 加载
- 错误处理使用 try/catch，向客户端返回标准错误格式

```javascript
// 路由层（薄）
router.post('/chat', async (req, res) => {
  try {
    await chatService.handleChat(req, res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 服务层（厚）
// services/chatService.js - 包含业务逻辑
```

## SSE 流式接口规范

```javascript
// 服务端标准 SSE 响应头
res.setHeader('Content-Type', 'text/event-stream');
res.setHeader('Cache-Control', 'no-cache');
res.setHeader('Connection', 'keep-alive');

// 发送数据格式
res.write(`data: ${JSON.stringify(chunk)}\n\n`);

// 结束标志
res.write('data: [DONE]\n\n');
res.end();
```

## 导入顺序规范

```typescript
// 1. Node.js 内置模块
import fs from 'fs';

// 2. 第三方依赖
import React from 'react';
import { clsx } from 'clsx';

// 3. 项目内部模块（绝对路径）
import { Button } from '@/components/ui/button';

// 4. 项目内部模块（相对路径）
import { useChat } from '../hooks/useChat';

// 5. 类型导入
import type { Message } from '../types';
```
