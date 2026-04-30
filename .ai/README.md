# AI Agent 资源索引与行为宪章

> 本目录是 AI Agent 的"大脑"与"法律"，定义了 Agent 的知识边界、行为准则及优先级体系。

## 优先级与继承原则

AI Agent 在执行任务时，必须严格遵循以下优先级（从高到低）：

1. **用户明确指示 (User Commands)** - 当前会话中用户的直接指令具有最高效力
2. **项目准则 ([`.ai/project/rules.md`](project/rules.md))** - 项目特定规范（优先遵循）
3. **项目层规约 ([`.ai/project/`](project/))** - 针对当前仓库的特定约束（人读详细版）
4. **系统层规范 ([`.ai/system/`](system/))** - 跨项目通用的底层准则

**冲突处理**：
- 用户指令与任何规约冲突时，以用户为准
- `project` 与 `system` 冲突时，以 `project` 为准
- [`.ai/project/rules.md`](project/rules.md) 与 [`.ai/system/rules.md`](system/rules.md) 冲突时，以 project 为准

---

## 分层职责与隔离

| 层 | 路径 | 定位 | 写给谁 | 加载方式 |
|----|------|------|--------|----------|
| **项目准则层** | [`.ai/project/rules.md`](project/rules.md) | 项目特定规范与约束 | Agent / 人 | 手动引用 |
| **规约驱动层** | `.ai/project/requirements/` | 需求 / 设计 / 任务三件套 | 当前功能的 Agent / 人 | `spec_plan` / `spec_task` 按需加载 |
| **项目上下文层** | [`.ai/project/`](project/) | 项目特化规范、验收清单、背景知识 | 人读 + Agent 参考 | 手动引用 |
| **系统通用层** | [`.ai/system/`](system/) | 跨项目元规范、编码/错误/测试标准、技能库 | 人读 + Agent 参考 | 手动引用 |

### System (通用系统层) - "底座"

**定位**: 跨项目通用的元规范。
**隔离原则**: 禁止包含任何项目特定的路径、业务名或硬编码。

- [**Rules**](system/rules.md) & [**Checklist**](system/checklist.md): 核心行为准则与通用验收标准（含安全、性能、可访问性）
- [**Context**](system/context/): 通用编码规范 — [编码标准](system/context/coding-standards.md) / [错误处理](system/context/error-handling.md) / [测试规范](system/context/testing-standards.md)
- [**Skills**](system/skills/): 通用任务执行技能库

### Project (项目上下文层) - "插件"

**定位**: 当前仓库的特化逻辑与业务背景。
**职责**: 补全或覆盖系统层规则，处理项目特有的约束。

- [**Rules**](project/rules.md) & [**Checklist**](project/checklist.md): 项目特定规则与质量门禁
- [**Context**](project/context/): [项目指南](project/context/project-guide.md)（架构决策、技术栈、特殊场景）

---

## Agent 维护手册

- **主动预防机制**: 每当修复一个因"缺乏上下文"导致的 Bug 时，Agent 必须判断该知识属于通用（System）还是特化（Project），并更新对应文档
- **隔离性检查**: 更新 `system/` 文档时，严禁引入具体路径或业务名，应使用抽象化表达
- **事实来源原则**: 技术栈判断以源码 `import` 为准，而非 `package.json` 声明（僵尸依赖不算真实采用）
- **最小影响原则**: 文档更新仅针对具体问题，禁止对无关段落进行结构性改动

## 相关系统

- [**`.ai/project/rules.md`**](project/rules.md): 项目特定规范与约束
- [**AGENTS.md**](../AGENTS.md): Agent 角色定义与启动入口
