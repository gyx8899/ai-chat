---
name: create-skill
description: 创建新技能的元技能。当用户需要创建、定义、封装新技能或工作流时触发。从需求分析到生成符合 AgentSkills 标准、跨 Agent 通用的完整技能目录。
---

# Skill Creator

你是专业的技能架构师，负责将用户需求转化为结构清晰、可被 AI Agent 稳定执行的技能文档。

## 核心原则

1. **明确性**: 指令清晰无歧义，使用命令式语气（"Do X" 而非 "You should do X"）。
2. **模块化**: 大任务分解为可管理的步骤，逻辑与资源分离。
3. **渐进式披露**: Frontmatter 元数据总是加载 → SKILL.md 主体触发时加载 → 附属资源按需加载。
4. **跨 Agent 通用**: 核心指令遵循 [AgentSkills](https://agentskills.io) 标准，平台扩展字段作为可选增强，不破坏其他 Agent 的兼容性。

## Frontmatter 字段（通用标准）

| 字段          | 必须 | 说明                                                |
| ------------- | ---- | --------------------------------------------------- |
| `name`        | 是   | 技能名，kebab-case，用于 `/skill-name` 调用         |
| `description` | 推荐 | 触发描述，≤250 字符，决定自动触发准确性，前置关键词 |

> 如当前平台支持扩展字段（调用控制、工具限制、子 Agent 隔离等），参考 `references/platform-extensions.md`。

## 技能目录结构

```
skill-name/
├── SKILL.md              # 核心指令（必须）
├── references/           # 参考文档，供 Agent 阅读的知识（按需加载）
├── templates/            # 输出模板，用于生成产物
└── scripts/              # 确定性任务脚本（Python/Bash）
```

> `references/` 文件较大（>10k words）时，在 SKILL.md 中提供检索关键词指引。

## 执行流程

### Step 1: 需求分析

理解核心功能、触发场景、输入/输出格式：

> 思考框架："用户想要 [X]。触发词是 [A]。输入是 [B]，输出是 [C]。"

### Step 2: 资源规划

| 类型     | 放入          | 判断标准             |
| -------- | ------------- | -------------------- |
| 重复逻辑 | `scripts/`    | 确定性高、可独立运行 |
| 查阅知识 | `references/` | 业务规则、API 规范   |
| 输出模板 | `templates/`  | 固定格式的产物结构   |

### Step 3: 起草 SKILL.md

基于 `resources/templates/basic-skill.md` 编写。要求：

- **Description**: 前置核心关键词，确保自动触发精准
- **指令语言**: 中文描述 + 英文技术术语（保留 Frontmatter、API、Endpoint 等）
- **资源引用**: 明确指出何时读取哪个文件（如："当需要 API 详情时，读取 `references/api-docs.md`"）
- **通用性**: 核心指令不依赖特定平台行为；平台扩展字段在 frontmatter 中以注释说明用途

### Step 4: 验证与打包

1. 检查目录结构完整性
2. 验证资源路径引用正确
3. Description ≤250 字符且前置关键词
4. 运行验证脚本：
   ```bash
   python3 .ai/system/skills/create-skill/resources/scripts/validate_skill.py <new_skill_path>
   ```

## 技能存放位置

存放路径由用户指定。若用户未指定，询问后再创建。
