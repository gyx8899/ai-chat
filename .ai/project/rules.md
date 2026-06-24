# 项目特定开发规则 (Project Rules)

> 本文档包含**当前项目**的特定开发规范。
> 通用开发规则遵循系统层标准：[`.ai/system/rules.md`](../system/rules.md)

## 1. 核心上下文索引

**项目层详细指南**（`context/` 目录）：

- **项目背景**: [project-guide.md](./context/project-guide.md) - 系统架构、技术栈、关键决策
- **UI 视觉规范**: [ui-design-system.md](./context/ui-design-system.md) - **品牌色板 / 字体 / 圆角 / 动效 / 响应式断点（所有 UI 改动必读）**
  - 视觉样品基线：[`design-demo/ai-chat-v0.html`](../../design-demo/ai-chat-v0.html)

## 2. 项目技术规范

### 2.1 前端技术约束

- **Node.js**: `>= 20`（根目录 `.nvmrc` 固定版本，用 `nvm use`）
- **前端端口**: `5173`（Vite dev server）
- **别名映射**: `@` → `client/src`，`@shared` → `shared/src`
- **React 版本**: React 19，使用最新的并发特性时注意兼容性
- **状态管理**: 使用 **Zustand 5**，按 `chatStore` / `sessionStore` / `modelStore` / `uiStore` 四个 Store 分域管理；禁止直接操作全局 `window` 对象存储状态
- **路由**: Vite 无路由，单页应用；如需路由请评估后添加 `react-router-dom`
- **图标**: 统一使用 **lucide-react**，禁止引入其他图标库
- **UI 组件**: 统一使用 **shadcn/ui** 作为基础 UI 库——shadcn 原子件落地 `client/src/components/ui/`（纯样式层，无业务逻辑），业务组件在 `client/src/components/<Biz>/` 下组合使用。缺失的原子件通过 `cd client && npx shadcn@latest add <name>` 按需添加；**禁止**引入除 shadcn/ui 外的其他基础 UI 库（MUI / AntD / Chakra / HeadlessUI 等）
- **Toast**: 使用 `sonner`（由 shadcn 提供，文件 `client/src/components/ui/sonner.tsx`）；业务层直接 `import { toast } from 'sonner'` 调用 `toast.success` / `toast.error` / `toast.info` / `toast.warning`，**禁止**在 `uiStore` 重新维护 toast 状态
- **共享包**: 通用组件 / Hook / 工具优先从 `@ai-chat/shared` 引入（`@shared/components`、`@shared/hooks`、`@shared/utils`）；新增通用能力应沉淀到 `shared/src/`，并先执行 `npm run build:shared`
- **国际化**: 词条集中于 `client/src/locales/`（`zh.ts` / `en.ts`），通过 `useTranslation` Hook 使用

### 2.2 样式规范

- 使用 **Tailwind CSS 3.4** + `clsx` + `tailwind-merge`
- 工具函数 `cn()` 已在 `client/src/lib/utils.ts` 中定义，直接导入使用（共享包亦从 `@shared/utils` 导出 `cn`）
- 暗色模式使用 `dark:` 前缀，**系统偏好自动跟随**（无需手动切换逻辑），启动时由 `@shared/utils` 的 `resolveInitialTheme` / `applyTheme` 同步注入，避免 FOUC
- 移动端适配阈值：`< 768px` 触发抽屉式侧边栏

### 2.2.1 品牌视觉硬性约束（必读）

> 完整规范见 [`context/ui-design-system.md`](./context/ui-design-system.md)，本节列出**强制门禁项**：

- **色彩**：仅允许从 `--brand-h` / `--primary*` / `--bg*` / `--surface*` / `--text*` / `--border*` / `--success` / `--warning` / `--danger` 派生，**禁止**手写新色相、禁止 `rgba()`（用 `oklch(... / 0.xx)`）
- **字体**：标题用 `font-display`(Space Grotesk)，正文用 `font-body`(Plus Jakarta Sans)，代码/数字/时间戳用 `font-mono`(JetBrains Mono)；**禁止** Inter / Roboto / Arial / Fraunces / system-ui 作为主字体
- **圆角**：必须从 `--r-sm/md/lg/xl/full` 5 级中选取，**禁止**全局统一圆角
- **阴影**：必须从 `--shadow-sm/md/lg/glow` 选取（自带主色微染），**禁止**纯黑 `rgba(0,0,0,...)` 阴影
- **动效**：必须从 `--ease-expo/spring/smooth` × `--dur-fast/base/slow` 组合中选取，**禁止**裸写 `transition-all duration-300`
- **响应式**：移动端 `< 640px` 触控目标 ≥ 44×44px；Header 隐藏次要按钮（语言/更多/状态副文本）；标题截断省略；输入框 min-h ≥ 84px
- **背景装饰**：极光光斑 + 网格纹理为应用级背景层，所有页面共用，业务组件**禁止**重复绘制大型装饰
- **AI 套版禁区**：紫粉蓝渐变 / emoji 当图标 / 卡片左侧色条 / 多于 3 种字体家族 — 一律拒收

### 2.3 后端架构约束

- **后端端口**: `3001`（Express）
- 后端使用 **CommonJS**（`require` / `module.exports`），不使用 ESM
- 三层结构严格分离：`routes/`（请求处理 / SSE 响应头）→ `services/`（业务逻辑）→ `data/`（知识库与 SQLite 文件）
- 数据库操作通过 `server/services/memoryService.js` 封装，**禁止在 routes 层直接操作 SQLite**
- LLM 调用通过 `server/services/llmService.js` 抽象，禁止在 routes 层直接调用 LLM API
- 全局错误中间件放在所有路由之后，且保留 4 个参数（`(err, req, res, next)`）

### 2.4 SSE 流式接口规范

- 前端使用 `fetch` + `ReadableStream` + `AbortController` 处理 SSE，**不使用** `EventSource`（`EventSource` 仅支持 GET、无法携带 JSON body，且不支持 `AbortController` 主动中断，无法满足 POST 传参与"停止生成"需求）
- 前端 SSE 解析必须经 [`client/src/lib/sseClient.ts`](../../client/src/lib/sseClient.ts) 的 `streamSSE` 统一封装；**禁止**在业务 hook / 组件直接操作 `ReadableStream.getReader()` 或 `TextDecoder`
- **帧类型契约**（三类互斥，单帧只能命中其一）：
  - `{ content: string }` —— 增量内容帧（最常用，逐 token 推送）
  - `{ error: string }` —— 错误帧（异常退出前最后一帧业务数据）
  - `{ meta: { ragHint?: string } }` —— 元数据帧（当前唯一允许的元数据字段为 `ragHint`，仅在流首部出现一次）
- 结束标志固定为 `data: [DONE]`（**唯一**合法结束标志，正常 / 异常 / 客户端断开三种路径都必须以此收口）
- **禁止**在 `content` 帧中混入 `ragHint` 等元数据；**禁止**使用 `{ status: 'started' | 'completed' }` 等状态帧
- 组件卸载、会话切换、重复发送时必须调用 `abort()`，防止内存泄漏与消息串扰
- 后端 `POST /api/chat` 必须设置：`Content-Type: text/event-stream; charset=utf-8`、`Cache-Control: no-cache, no-transform`、`Connection: keep-alive`、`X-Accel-Buffering: no`，并调用 `res.flushHeaders()`
- 后端必须监听 `req.on('close')`，通过 `AbortController` 取消下游 LLM 迭代（`streamChat({ messages, signal })` 透传至 `fetch` / reader 循环），避免客户端断开后继续消耗算力
- 后端写入前必须经 `safeWrite(res, chunk)`（先校验 `res.writableEnded || res.destroyed`），避免 "write after end" 异常

### 2.5 数据持久化

- 会话数据存储在 `server/data/` 目录下的 SQLite 文件（**不提交 Git**）
- 会话 ID 通过 `localStorage` 在前端持久化
- 多会话按 `sessionId` 隔离，禁止跨会话读取消息

## 3. 仓库结构与目录规范

```
ai/
├── client/                    # React 前端（Vite + TS）
│   └── src/
│       ├── components/        # 业务组件（每组件独立目录 + index.tsx）
│       │   ├── ui/            # shadcn/ui 原子件（纯样式 + a11y，无业务逻辑）
│       │   ├── AppFallback/ ChatArea/ ChatHeader/ EmptyState/
│       │   ├── InputArea/ LoadingIndicator/ MessageList/
│       │   ├── ModelSelector/ Sidebar/ ToastContainer/
│       ├── hooks/             # 自定义 Hook（useChat.ts 等）
│       ├── store/             # Zustand stores（chatStore / sessionStore / modelStore / uiStore）
│       ├── lib/               # 工具函数（utils.ts 含 cn()、detectOffline、localMode）
│       ├── locales/           # i18n 词条（zh.ts / en.ts / index.ts）
│       └── types/             # TypeScript 类型定义
├── server/                    # Node.js 后端（CommonJS + Express）
│   ├── index.js               # Express 入口（端口 3001）
│   ├── routes/                # 路由层：chat.js / sessions.js / config.js
│   ├── services/              # 业务层：llmService / memoryService / ragService
│   └── data/                  # 知识库 + SQLite 文件（SQLite 文件不提交 Git）
├── shared/                    # 共享 React 工具包 @ai-chat/shared（tsup 打包）
│   └── src/{components,hooks,utils}
├── .ai/                       # 规约体系文档（project/system 分层）
└── .github/workflows/         # CI：ci.yml / deploy-frontend.yml
```

### 3.1 组件目录规范

```
client/src/components/
├── ui/                 # shadcn/ui 原子件（纯样式 + a11y，无业务逻辑）
│   ├── button.tsx / input.tsx / dropdown-menu.tsx
│   ├── alert-dialog.tsx / tooltip.tsx / sonner.tsx
├── AppFallback/        # ErrorBoundary 兜底 UI
├── ChatArea/           # 对话区（含整体布局）
├── ChatHeader/         # 对话顶栏（模型切换 / 会话标题）
├── EmptyState/         # 空状态引导（示例问题）
├── InputArea/          # 输入框（发送 / 停止 / 重新生成）
├── LoadingIndicator/   # 加载指示器
├── MessageList/        # 消息列表（Markdown 渲染 + 代码高亮 + 复制）
├── ModelSelector/      # 模型选择下拉
├── Sidebar/            # 会话列表（新建 / 重命名 / 删除）
└── ToastContainer/     # 全局 Toast 挂载点（仅渲染 <Toaster />）
```

- 业务组件放 `client/src/components/<Biz>/` 下，按功能模块命名（PascalCase）
- 每个业务组件目录包含：`index.tsx`（主组件）、可选的子组件文件（PascalCase，如 `MessageItem.tsx`、`SessionItem.tsx`）
- shadcn 原子件统一放 `client/src/components/ui/`，文件名遵循 shadcn 官方约定（小写 + 短横线，如 `dropdown-menu.tsx`）
- 通用可复用能力优先放入 `shared/src/{components,hooks,utils}`，并通过 `@shared/*` 子路径对外导出
- 不引入 CSS Modules / styled-components，统一使用 Tailwind CSS

## 4. 架构模式与数据流

### 4.1 前端数据流

```
main.tsx → detectOffline() → App.tsx
                                ├── <Sidebar>       （sessionStore + uiStore）
                                ├── <ChatArea>      （chatStore + useChat）
                                │     ├── <ChatHeader> + <ModelSelector>（modelStore）
                                │     ├── <MessageList> / <EmptyState>
                                │     └── <InputArea>
                                └── <ToastContainer>（uiStore）
```

- **状态管理**: 四个 Zustand Store 各司其职 —— `sessionStore`（会话 CRUD 与持久化）、`chatStore`（当前消息流）、`modelStore`（模型选择）、`uiStore`（主题/Toast/抽屉）
- **错误兜底**: 顶层 `@shared/components` 的 `ErrorBoundary` + 自定义 `AppFallback`
- **本地模式**: `lib/detectOffline.ts` 3s 超时探测后端，失败则进入 `localMode`

### 4.2 后端调用链

```
POST /api/chat
  └── routes/chat.js
        ├── memoryService.getHistory(sessionId)
        ├── ragService.retrieve(query)            # 关键词命中注入提示词
        ├── llmService.stream(prompt, onToken)    # SSE 分片回传
        └── memoryService.appendMessage(...)
```

### 4.3 新增组件/接口的决策顺序

1. 先在 `shared/` 中查找可复用的组件/Hook/工具（`EventProvider`、`useAutoScroll`、`Logger` 等）
2. 前端业务 UI 优先复用 `client/src/components/ui/` 下 shadcn 原子件（`Button` / `Input` / `DropdownMenu` / `AlertDialog` / `Tooltip` / `Sonner`）；缺失的原子件通过 `cd client && npx shadcn@latest add <name>` 添加，**禁止**从其他基础 UI 库（MUI / AntD / Chakra / HeadlessUI 等）手动引入
3. 新接口先补充 `services/` 能力，再在 `routes/` 暴露；错误统一走 Express 全局错误中间件

## 5. 开发约束与禁止项

### 5.1 强制要求

- 修改代码前先读需求/上下文（`.ai/project/context/project-guide.md`等）
- 单次任务**修改文件 > 3 个**时先停下拆分任务
- 列表渲染使用稳定唯一 `key`，禁止使用数组索引
- 新增依赖前评估维护状态与体积，避免轻量替代品被替换
- 所有用户输入必须校验；禁止使用 `innerHTML` 渲染用户内容
- **用户输入长度上限必须校验**（默认 `4000` 字符，可按业务调整但不得无上限）；超限时禁用提交按钮 + 显示明确错误文案（参考 [`InputArea`](../../client/src/components/InputArea/index.tsx) 的 `MAX_LENGTH` / `overLimit` 实现）
- **所有用户可见的请求失败必须经 `toast` 或消息气泡 `isError` 两条出口之一**，禁止 `alert` / `confirm` / `prompt` 等浏览器原生弹窗
- 提交前本地必跑：`npm run lint` / `npm run type-check` / `npm run format:check`
- 每个功能优先使用最简单、最直接的实现方式，避免为“可能的未来需求”预埋复杂结构
- 未经明确要求，不引入额外设计模式，不做过度抽象
- 引入技术栈之外的新依赖前，必须先评估必要性并获得确认
- 所有外部调用（HTTP、数据库、第三方 SDK）必须设置超时，禁止无超时等待
- 配置项通过环境变量或项目配置文件统一管理，禁止硬编码
- 修改已有模块前先理解原有设计意图，避免与现有架构冲突
- 新功能实现不得破坏既有接口契约（入参、出参、语义与兼容性）

### 5.2 禁止项

- **禁止**在 `routes/` 层直接操作 SQLite 或调用 LLM API
- **禁止**修改 `shared/` 对外导出 API 的签名前不同步调用方
- **禁止**引入新的图标库（仅 `lucide-react`）或 CSS Modules / styled-components
- **禁止**硬编码后端地址、密钥、PII；`server/.env` 与 `server/data/*.sqlite` **不得**提交 Git
- **禁止**在终端命令中使用 `2>&1`（AI 执行环境会将 `1` 误解析为文件名）
- **禁止**使用 `eslint-disable` 掩盖问题；必须修复根因
- **禁止**删除或重排无关历史代码与注释（最小影响原则）
- **禁止**使用 `EventSource`（仅支持 GET 且无法 abort，不满足 POST 传参与停止生成需求）；该禁令由 [`client/eslint.config.js`](../../client/eslint.config.js) 与 [`shared/eslint.config.js`](../../shared/eslint.config.js) 的 `no-restricted-globals` 规则强制守护
- **禁止**在 `useChat` / 业务组件 / 业务 Hook 内直接操作 `ReadableStream.getReader()` 或 `TextDecoder`；SSE 解析统一经 [`client/src/lib/sseClient.ts`](../../client/src/lib/sseClient.ts) 的 `streamSSE` 入口
- **禁止**在 `shared/src/` 中引入 Radix / CVA / shadcn / sonner 等任何 UI 库依赖（共享包保持纯工具 / Hook / 无样式组件）
- **禁止**在 `client/src/components/ui/` 下引入业务逻辑（store 调用 / hooks / API 请求）；该目录只承载 shadcn 原子件的样式与 a11y 实现

## 6. 常用命令与工作流

### 6.1 开发命令（根目录执行）

```bash
npm run install:all      # 一次性安装 root / shared / server / client 依赖
npm run dev              # 并行启动前后端（concurrently）
npm run dev:server       # 仅启动后端（node --watch，端口 3001）
npm run dev:client       # 仅启动前端（vite，端口 5173）
```

### 6.2 质量门禁

```bash
npm run lint             # ESLint 顺序串联：shared → client → server（任一 error 阻断）
npm run lint:fix         # ESLint 自动修复（同样三子包顺序）
npm run format           # Prettier 批量格式化
npm run format:check     # Prettier 校验
npm run type-check       # shared + client TypeScript 类型检查
npm run test:all         # 三子包测试套件（vitest run）
```

> **提交前本地必跑**：`npm run lint` + `npm run type-check` + `npm run format:check`；任意子包（shared / client / server）的 ESLint error 都会阻断合并。`shared` 因 React 19 升级遗留少量 react-hooks v7 warning，**仅允许 warning，error 必须为 0**；`client` / `server` 必须 `--max-warnings=0`。

### 6.3 构建与部署

```bash
npm run build:shared     # 构建共享包（tsup 输出 dist/）
npm run build:frontend   # 构建前端（依赖 shared 构建）
npm run build:static     # gh-pages 静态构建（base=/ai/）
npm run deploy:frontend  # 静态构建并 gh-pages 发布
```

### 6.4 Git Hooks 与 CI

- 本地：`husky` 在 `prepare` 阶段自动安装；`pre-commit` 触发 `lint-staged`，对暂存文件执行 ESLint + Prettier，失败则阻断提交
- CI（`.github/workflows/ci.yml`）：install:all → lint → type-check → format:check → test:all → build:frontend，任一失败则 PR 不可合并
- 禁止使用 `--no-verify` 绕过 hooks，禁止对 `main`/`master` 执行 `push --force`

### 6.5 规约驱动开发（Spec-Driven）

- 规约文档位于 `[spec folder]/specs/<feature>/`，包含 `requirements.md` / `design.md` / `tasks.md`
- 开发新功能：读取需求 → 确认设计 → 按 `tasks.md` 分步实现 → 每步跑质量门禁
- 规则/规范沉淀仅限**系统性问题**，一次性修正不得写入规则

## 7. 快速上手检查清单（AI 助手执行前必读）

1. 明确当前任务是"规约规划"还是"规约执行"；执行类任务必须匹配 `Execute Task(<project>): <id>. <name>` 格式
2. 修改前先用搜索工具定位代码，再用 `read_file` 读取，避免臆测路径
3. 变更涉及 SSE / LLM / 数据库时，严格走 `services/` 封装，不跨层
4. 新建/修改前端组件时确认是否已在 `shared/` 或 `client/src/components/` 存在可复用实现
5. 提交产物时附带修改文件的链接证据，并确认 lint / type-check / format:check 全部通过
