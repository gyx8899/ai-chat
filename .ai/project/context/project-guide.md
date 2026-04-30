# 项目背景指南 (Project Guide)

> 当前项目 - 开发必知背景信息

## 项目核心信息

**项目名**: AI Chat Demo（Monorepo：`client` / `server` / `shared`）
**技术栈**:
- 前端：React 19 + Vite 7 + TypeScript 5.9 + Tailwind CSS 3.4 + Zustand 5（**未使用基础 UI 组件库**，业务组件用 Tailwind 原子类 + 原生 HTML + `cn()` 手写）
- 后端：Node.js 18+ + Express 4（CommonJS）+ SQLite（better-sqlite3）
- 共享包：`@ai-chat/shared`（tsup 构建为 ESM）

**用途**: AI 对话应用演示，展示 SSE 流式输出、RAG 检索、多会话管理等核心 AI 应用技术

## 关键架构

### 前后端分离

- **前端**: `client/`（React + Vite，端口 5173）
- **后端**: `server/`（Express，端口 3001）
- **共享包**: `shared/`（构建产物在 `shared/dist/`，前端通过 `@shared/*`��路径导入）
- **通信**: 前端通过 Vite 代理将 `/api` 请求转发到 `localhost:3001`
- **别名**: `@` → `client/src`，`@shared` → `shared/src`

### 后端服务分层

```
server/
├── index.js            # Express 入口，挂载路由、全局错误中间件
├── routes/
│   ├── chat.js         # POST /api/chat（SSE 流式接口）
│   ├── sessions.js     # GET/POST/PATCH/DELETE /api/sessions
│   └── config.js       # GET /api/config（模型列表 / 配置）
├── services/
│   ├── llmService.js   # LLM 抽象层（mock / 真实 LLM 统一接口）
│   ├── memoryService.js# SQLite 会话与消息 CRUD
│   └── ragService.js   # 知识库关键词检索，注入 prompt
└── data/
    ├── knowledge.js    # 预设前端知识库（6 条）
    ├── models.js       # 模型元数据
    └── *.sqlite        # 运行时生成（不提交 Git）
```

### 前端组件结构

```
client/src/
├── components/         # 业务组件（每组件独立目录 + index.tsx）
│   ├── AppFallback/    # ErrorBoundary 兜底 UI
│   ├── ChatArea/       # 对话区（整体布局）
│   ├── ChatHeader/     # 顶栏（含模型选择）
│   ├── EmptyState/     # 空状态引导（示例问题）
│   ├── InputArea/      # 输入框（发送 / 停止 / 重新生成）
│   ├── LoadingIndicator/
│   ├── MessageList/    # 消息列表（Markdown 渲染 + 代码高亮）
│   ├── ModelSelector/  # 模型下拉
│   ├── Sidebar/        # 会话列表（新建 / 重命名 / 删除）
│   └── ToastContainer/ # 全局 Toast
├── hooks/              # useChat / useAutoScroll / useTranslation
├── store/              # Zustand：chatStore / sessionStore / modelStore / uiStore
├── lib/                # utils(cn) / detectOffline / localMode
├── locales/            # i18n：zh.ts / en.ts / index.ts
└── types/
    └── index.ts        # 全局 TypeScript 类型定义（Message / Session / Model / ModelConfig）
```

### 共享包结构（`@ai-chat/shared`）

```
shared/src/
├── components/   # ErrorBoundary / EventProvider / LoggerProvider / PreloadProvider / LoadingIndicator
├── hooks/        # useAutoScroll / useClickCallback / useCountDown / useDataChanged / useLockRef / useShowHide / useStateRef / useTimeout
└── utils/        # cn / clipboard / EventBus / Logger / theme（resolveInitialTheme / applyTheme）
```

> 前端/服务端引用前需先执行 `npm run build:shared`；`npm run build:frontend` 已内置该步骤。

## 核心功能说明

### SSE 流式输出

前端通过 `fetch` + `ReadableStream` 发送 POST 请求，以 SSE 格式接收 AI 回复并实时更新 UI。使用 `AbortController` 支持停止生成。

### 模拟 RAG 检索

`ragService.js` 对用户输入进行关键词匹配，命中预设知识库后将相关内容注入 System Prompt，模拟检索增强生成。

### 历史对话记忆

SQLite（`better-sqlite3`）持久化存储会话和消息，`memoryService.js` 提供 CRUD 接口。每次请求前 N 条历史消息拼接到 messages 数组传给 LLM。

### 多会话管理

前端 Sidebar 管理会话列表，支持新建、重命名、删除。当前 sessionId 存储在 `localStorage`。会话 CRUD 由 `store/sessionStore.ts` 统一维护；消息流收敛到 `store/chatStore.ts`；模型选择在 `store/modelStore.ts`；全局 UI 态（主题 / Toast / 抽屉）在 `store/uiStore.ts`。

### 本地模式（离线兜底）

启动时 `lib/detectOffline.ts` 以 3s 超时探测后端 `/health`，失败则进入 `localMode`，由 `lib/localMode.ts` 在前端模拟会话/响应，保证 Demo 可纯前端运行。

### 国际化（i18n）

词条集中于 `client/src/locales/`（`zh.ts` / `en.ts`），通过 `useTranslation` Hook 调用。新增文案必须同时补齐两语言。

### 暗色模式

系统偏好自动跟随。启动时在 `main.tsx` 中由 `@shared/utils` 的 `resolveInitialTheme` / `applyTheme` 同步注入 `html.dark` class，避免 FOUC；组件内统一通过 Tailwind `dark:` 前缀实现样式分叉。

## LLM 接入方式

默认使用 **mock 模式**（无需 API Key），通过 `server/.env` 切换真实 LLM：

| 变量 | 说明 | 示例 |
|------|------|------|
| `LLM_PROVIDER` | 提供商 | `openai` / `ollama` / `volcano` |
| `LLM_API_KEY` | API 密钥 | `sk-xxx` |
| `LLM_MODEL` | 模型名 | `gpt-4o` |
| `LLM_BASE_URL` | 接口地址 | `https://api.openai.com/v1` |

## 关键 API 接口

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/chat` | SSE 流式对话（携带 sessionId） |
| GET | `/api/sessions` | 获取所有会话列表 |
| POST | `/api/sessions` | 新建会话 |
| PATCH | `/api/sessions/:id` | 重命名会话 |
| DELETE | `/api/sessions/:id` | 删除会话 |

## 开发命令

```bash
npm run install:all    # 安装所有依赖（root / shared / server / client）
npm run dev            # 同时启动前后端
npm run dev:server     # 仅启动后端
npm run dev:client     # 仅启动前端
npm run lint           # ESLint 检查
npm run format         # Prettier 格式化
npm run type-check     # TypeScript 类型检查（shared + client）
npm run build:shared   # 构建共享包（tsup）
npm run build:frontend # 构建前端（自动先构建 shared）
npm run build:static   # 静态构建（gh-pages，base=/ai/）
npm run deploy:frontend# 部署到 gh-pages
```

## 注意事项

- Node.js 版本要求 >= 18（推荐 Node 20），项目根目录有 `.nvmrc`
- `server/.env` 和 `server/data/*.sqlite` 不提交 Git
- 前端无单独的路由配置，所有状态通过 Zustand + props 传递
- 共享包改动后必须重新 `npm run build:shared`，否则前端/服务端拿到的是旧产物
- SSE 前端必须使用 `fetch` + `ReadableStream` + `AbortController`，**禁用 `EventSource`**（仅支持 GET 且无法 abort，不满足 POST 传参与停止生成需求）
- 终端命令中**禁止**使用 `2>&1`（AI 执行环境会将 `1` 误解析为文件名）
