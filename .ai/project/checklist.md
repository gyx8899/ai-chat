# 项目特定检查清单 (Project Checklist)

> **当前项目**的特定验收标准。
> 必须同时通过系统层通用检查清单：[`.ai/system/checklist.md`](../system/checklist.md)

## 1. 架构一致性检查

- [ ] **分层规范**: routes 层只负责请求/响应与 SSE 响应头，业务逻辑在 services 层
- [ ] **LLM 抽象**: LLM 调用通过 `llmService.js` 封装，未直接在 routes�调用
- [ ] **DB 封装**: SQLite 操作通过 `memoryService.js` 封装，未直接在 routes 中操作
- [ ] **组件目录**: 业务组件放在 `client/src/components/` 下，每组件独立目录 + `index.tsx`
- [ ] **共享包优先**: 通用 Hook / 工具 / 组件优先从 `@ai-chat/shared`（`@shared/*`）引入，新增通用能力沉淀到 `shared/src/`
- [ ] **Store 分域**: 状态按 `chatStore` / `sessionStore` / `modelStore` / `uiStore` 分域，无跨域直接操纵

## 2. SSE 流式功能检查

- [ ] **fetch + ReadableStream**: 前端 SSE 使用 `fetch` 而非 `EventSource`
- [ ] **streamSSE 封装**: 前端 SSE 解析统一经 `client/src/lib/sseClient.ts` 的 `streamSSE` 入口，业务 hook / 组件未直接操作 `ReadableStream.getReader()` 或 `TextDecoder`
- [ ] **AbortController**: 停止生成功能已正确实现，可中断 SSE 请求
- [ ] **清理函数**: 组件卸载、会话切换、重复发送时调用 `abort()`，防止内存泄漏与消息串扰
- [ ] **[DONE] 标志**: 后端 SSE 结束时发送 `data: [DONE]`，前端正确识别并停止（**唯一**合法结束标志）
- [ ] **帧类型契约**: 帧类型仅使用 `{ content }` / `{ error }` / `{ meta: { ragHint? } }` 三类，未在 `content` 帧混入元数据，未使用 `{ status: ... }` 等状态帧
- [ ] **后端 SSE 规范**: `POST /api/chat` 已设置 `Content-Type: text/event-stream; charset=utf-8`、`Cache-Control: no-cache, no-transform`、`Connection: keep-alive`、`X-Accel-Buffering: no`，并调用 `res.flushHeaders()`
- [ ] **req.on('close')**: 后端监听客户端断开，通过 `AbortController` 取消下游 LLM 迭代
- [ ] **safeWrite**: 后端写入 SSE 前校验 `res.writableEnded || res.destroyed`，避免 "write after end" 异常
- [ ] **错误处理**: SSE 连接异常（网络中断、服务端错误）有用户可见的错误提示

## 3. 会话管理检查

- [ ] **会话隔离**: 消息按 `sessionId` 隔离，不同会话间数据不混用
- [ ] **本地持久化**: 当前会话 ID 已存储在 `localStorage`，刷新后可恢复
- [ ] **会话操作**: 新建/重命名/删除会话功能正常，UI 状态正确同步

## 4. UI 与样式检查

- [ ] **Tailwind 规范**: 样式使用 Tailwind 工具类，`cn()` 工具函数用于条件样式
- [ ] **暗色模式**: 新增组件支持 `dark:` 前缀，暗色下显示正常
- [ ] **移动端适配**: 在 `< 768px` 宽度下侧边栏以抽屉形式展示，不影响主内容区
- [ ] **图标来源**: 所有图标使用 `lucide-react`，未引入其他图标库
- [ ] **基础 UI**: 业务组件优先复用 `client/src/components/ui/` 下的 shadcn 原子件（`Button` / `Input` / `DropdownMenu` / `AlertDialog` / `Tooltip` / `Sonner`）；缺失原子件通过 `npx shadcn@latest add` 添加；未引入 CSS Modules / styled-components
- [ ] **UI 库黑名单**: 新增代码未 `import` 除 shadcn/ui 体系外的其他基础 UI 库（执行 `grep -RE "@mui|@chakra|antd|@headlessui" client/src shared/src` 验证，期望 0 命中）
- [ ] **shadcn 原子件齐全**: `client/src/components/ui/` 下至少包含 `button.tsx` / `input.tsx` / `dropdown-menu.tsx` / `alert-dialog.tsx` / `tooltip.tsx` / `sonner.tsx`
- [ ] **shared 包隔离**: `shared/src/` 内未引入任何 UI 库依赖（执行 `grep -RE "@radix-ui|class-variance-authority|sonner" shared/src` 验证，期望 0 命中）
- [ ] **ui 层纯净**: `client/src/components/ui/` 下不存在 store / hooks / API 引用（执行 `grep -RE "useUIStore|useChatStore|useSessionStore|useModelStore|/hooks/" client/src/components/ui` 验证，期望 0 命中）
- [ ] **国际化**: 新增文案已同步补齐 `client/src/locales/zh.ts` 与 `en.ts`

## 4.1 品牌视觉规范检查（[ui-design-system.md](./context/ui-design-system.md)）

- [ ] **色板合规**: 新增/修改样式只使用 `--brand-h`/`--primary*`/`--bg*`/`--surface*`/`--text*`/`--border*`/`--success`/`--warning`/`--danger` token；未出现手写色相或 `rgba()`（执行 `grep -RE "rgba\(|#[0-9a-fA-F]{6}" client/src/components --include="*.tsx" --include="*.css"` 核查，期望 0 命中）
- [ ] **字体合规**: 标题 `font-display`、正文 `font-body`、代码/数字 `font-mono`；未使用 Inter/Roboto/Arial/system-ui
- [ ] **圆角分级**: 所用圆角来自 `rounded-sm/md/lg/xl/full` 5 级之一，未一刀切
- [ ] **阴影主色染色**: 所用阴影来自 `shadow-sm/md/lg/glow`，未使用纯黑阴影
- [ ] **动效 token 化**: `transition-*` 使用 `ease-expo/spring/smooth` × `duration-fast/base/slow` 组合，无裸 `duration-300`
- [ ] **微交互完整**: 按钮 hover 上浮 + 主色微辉光，session hover 左侧高亮条，输入框聚焦外发光，消息入场 fadeUp — 均已实现
- [ ] **375px 压测**: 在 Chrome DevTools iPhone SE (375×667) 下，Header 不拥挤、标题正确截断、次要按钮已隐藏、输入框 min-height ≥ 84px、触控目标 ≥ 44×44px
- [ ] **背景装饰统一**: 极光光斑 + 网格纹理仅在应用级背景层出现一次，未在业务组件重复绘制
- [ ] **AI 套版自检**: 未出现紫粉蓝渐变、emoji 图标、卡片左侧色条、>3 种字体家族
- [ ] **prefers-reduced-motion**: 非必要动效已包裹 `@media (prefers-reduced-motion: no-preference)`

## 5. 安全与环境检查

- [ ] **密钥安全**: `server/.env` 中无密钥提交，`.gitignore` 已覆盖
- [ ] **数据库文件**: `server/data/` 下的 `*.sqlite` 文件未提交
- [ ] **硬编码地址**: 前端无硬编码后端地址，通过 Vite 代理 `/api` 转发
- [ ] **环境变量**: 新增配置项已同步更新 `server/.env.example`
- [ ] **终端命令**: 未使用 `2>&1`（AI 执行环境会将 `1` 误解析为文件名）
- [ ] **eslint-disable**: 未使用 `eslint-disable` 掩盖问题，已修复根因
- [ ] **实现简洁性**: 新功能采用最简单直接实现，未引入不必要设计模式与过度抽象
- [ ] **依赖引入审批**: 若新增技术栈外依赖，已有必要性说明与确认记录
- [ ] **外部调用超时**: 所有外部调用（HTTP/数据库/第三方 SDK）均设置超时
- [ ] **配置外化**: 配置项通过环境变量或配置文件管理，未硬编码
- [ ] **设计意图保护**: 修改前已核对模块设计意图，变更未与既有架构冲突
- [ ] **接口契约兼容**: 变更未破坏既有接口契约（入参/出参/语义）
- [ ] **用户输入校验**: 所有用户输入已校验长度（默认上限 `4000` 字符），超限时禁用提交按钮并显示明确错误文案
- [ ] **错误出口统一**: 所有用户可见的请求失败经 `toast` 或消息气泡 `isError` 两条出口之一，未使用 `alert` / `confirm` / `prompt` 等浏览器原生弹窗
- [ ] **最小影响原则**: 未删除或重排无关历史代码与注释

## 6. Markdown 渲染检查（如涉及消息渲染）

- [ ] **代码高亮**: 代码块有语法高亮（`react-syntax-highlighter`）
- [ ] **GFM 支持**: 支持表格、任务列表等 GitHub Flavored Markdown
- [ ] **复制功能**: 代码块有一键复制按钮

## 7. Git Hooks 与 CI 检查

- [ ] **pre-commit 通过**: `git commit` 时 lint-staged 自动运行，无 ESLint / Prettier 报错
- [ ] **CI 通过**: push/PR 触发 `.github/workflows/ci.yml`，lint + type-check + build 全部绿灯

## 完成标准（项目级）

```bash
✅ 通过所有系统层通用检查项
✅ 通过所有项目特定检查项
✅ npm run lint 无报错
✅ npm run type-check 无报错（shared + client）
✅ npm run format:check 通过
✅ npm run build:shared 构建成功
✅ npm run build:frontend 构建成功
✅ git commit 时 pre-commit hook 自动通过
```
