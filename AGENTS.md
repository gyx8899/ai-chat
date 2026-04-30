# AI Agent 助手手册

> AI Agent 交互指南 - 规约编程体系使用手册（入口导航 / 不含重复细则）

## 角色定位

你是一个精通全栈开发的 AI 专家，通过**规约编程 (Specification-Driven Development)** 体系来交付高质量代码。

- **核心方法论**: 遵循**规约驱动开发 (Spec-Driven)** 的闭环工作流。
- **项目上下文**: 基于 [`.ai/project/context/`](.ai/project/context/) 理解当前项目。

## 项目概览

**AI Chat Demo** - 基于 SSE 流式输出的 AI 对话应用，演示 AI 应用的核心架构与技术方案。

- **前端**: React 19 + Vite 7 + TypeScript 5.9 + Tailwind CSS 3.4 + **shadcn/ui**（Radix + CVA，原子件落地 `client/src/components/ui/`）+ Zustand 5
- **后端**: Node.js 18+ + Express 4（CommonJS）+ SQLite（better-sqlite3）
- **共享包**: `@ai-chat/shared`（tsup 构建为 ESM，导出 utils / hooks / components）
- **通信**: SSE（Server-Sent Events）流式接口（`fetch` + `ReadableStream` + `AbortController`）

> 详细项目结构、命令、技术决策见 [`.ai/project/context/project-guide.md`](.ai/project/context/project-guide.md)

## 开发核心原则（简版）

| # | 原则 | 详细条款 |
|---|------|---------|
| 1 | 方案先行 | [`.ai/system/rules.md`](.ai/system/rules.md) § 1 |
| 2 | 任务拆分（>3 文件停下拆分） | [`.ai/project/rules.md`](.ai/project/rules.md) |
| 3 | 最小影响原则 | [`.ai/system/rules.md`](.ai/system/rules.md) § 3 |
| 4 | 测试驱动修复 | [`.ai/system/rules.md`](.ai/system/rules.md) § 5 |
| 5 | 规则沉淀（仅系统性问题） | [`.ai/system/rules.md`](.ai/system/rules.md) 底部 |

> 硬性约束的权威来源按优先级：**用户指令 > [`.ai/project/rules.md`](.ai/project/rules.md) > [`.ai/system/rules.md`](.ai/system/rules.md)**

## 常用指令与工作流

### 1. 开发新功能（规约驱动）

> "根据规约 `.ai/project/requirements/<feature>.md` 执行任务"

- **触发格式**（规约编程模式）：`Execute Task(<project>): <id>. <name>`
- **执行逻辑**: 读取 requirements / design → 识别 Task → 编写代码 → 质量门禁 → 更新 Task 状态

### 2. 规约规划（新功能立项）

> "为 [功能描述] 生成规约"

- 使用 `spec_plan` 工具生成规约文档（requirements.md / design.md / tasks.md）

### 3. 问题修复（Debug）

> "定位并修复 [问题描述]"

- **执行逻辑**: 复现 → 先写测试还原 → 最小化修复 → 验证门禁 → 必要时沉淀到规约

### 4. 代码评审（Review）

> "评审 [组件 / PR / 变更范围]"

- **评审维度**: 与规约一致性、最小影响原则、a11y / 安全 / 性能、质量门禁通过情况
- **输出**: 按 P0/P1/P2 分级问题清单 + 修改建议

### 5. 文档同步（Doc as Code）

> "根据代码同步到 `.ai/` 文档"

- **执行逻辑**: 以源码 `import` 为真相来源（非 `package.json` 声明）→ 同步四大规约层

## 资源导航

### 规约层（硬性约束）

- [**项目准则**](.ai/project/rules.md) - 业务特定规范（优先遵循）
- **任务级规约** - 功能级需求文档（requirements / design / tasks）

### 体系层（人读规范）

- [**体系总索引**](.ai/README.md) - 分层架构与优先级说明
- [**项目准则**](.ai/project/rules.md) - 业务特定规范（优先遵循）
- [**项目清单**](.ai/project/checklist.md) - 业务验收标准
- [**项目上下文**](.ai/project/context/project-guide.md) - 架构 / 技术栈 / 决策
- [**通用准则**](.ai/system/rules.md) - 跨项目基础规范
- [**通用清单**](.ai/system/checklist.md) - 跨项目质量验证
- [**通用上下文**](.ai/system/context/) - 编码 / 错误 / 测试标准

## 快速检查清单

提交代码前，请确保通过以下检查：

1. **Checklist**: 100% 通过 [`.ai/project/checklist.md`](.ai/project/checklist.md)（包含通用清单）
2. **Lint**: `npm run lint`（0 errors）
3. **Format**: `npm run format:check`（格式符合规范）
4. **TypeScript**: `npm run type-check`（无编译错误）

> Git Hooks 已配置：`git commit` 时自动对暂存文件执行 lint-staged（ESLint + Prettier），无需手动运行。首次克隆执行 `npm run install:all` 后 husky 自动初始化。

## 关键约束（摘要）

> 完整条款见 [`.ai/project/rules.md`](.ai/project/rules.md)

- **Node.js >= 18**（`.nvmrc` 固定版本）；前端默认 5173（VITE_PORT）/ 后端默认 3001（PORT）；别名 `@` / `@shared`
- SSE：前端用 `fetch` + `ReadableStream` + `AbortController`，**禁用 `EventSource`**（仅支持 GET 且无法 abort，不满足 POST 传参与停止生成需求）
- 图标仅 `lucide-react`；UI 基础件统一使用 **shadcn/ui**（`client/src/components/ui/`）；**禁止**引入除 shadcn/ui 外的其他基础 UI 库（MUI / AntD / Chakra / HeadlessUI 等）
- 后端严格 `routes/` → `services/` → `data/` 三层分离；SQLite 与 LLM 调用必须走 `services/` 封装
- `server/.env` 与 `server/data/*.sqlite` **不提交 Git**
- 终端命令中**禁止**使用 `2>&1`（AI 执行环境会将 `1` 误解析为文件名）

## LLM 接入方式

项目默认使用 **mock 模式**，接入真实 LLM 需修改 `server/.env`：

```env
LLM_PROVIDER=openai        # openai / ollama / volcano
LLM_API_KEY=your-api-key
LLM_MODEL=gpt-4o
LLM_BASE_URL=https://api.openai.com/v1
```

真实模式实现骨架在 [`server/services/llmService.js`](server/services/llmService.js) 中，按注释填充 fetch 调用即可。
