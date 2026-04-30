# 平台扩展字段参考（Claude Code）

本文档记录 Claude Code 对 AgentSkills 标准的扩展字段。其他 Agent 会忽略这些字段，不影响兼容性。

## 扩展字段一览

| 字段                       | 默认值 | 说明                                                      |
| -------------------------- | ------ | --------------------------------------------------------- |
| `disable-model-invocation` | false  | `true` = 禁止 Claude 自动触发，仅允许手动 `/skill-name`   |
| `user-invocable`           | true   | `false` = 对用户隐藏，仅 Claude 自动调用                  |
| `allowed-tools`            | 全部   | 限制可用工具，如 `Read, Grep, Bash(git *)`                |
| `context`                  | -      | `fork` = 在独立子 Agent 中隔离执行                        |
| `agent`                    | -      | 配合 `context:fork`，指定子 Agent 类型（如 `Explore`）    |
| `argument-hint`            | -      | 手动调用时显示的参数提示，如 `"[issue-number]"`           |
| `model`                    | 继承   | 覆盖模型，如 `claude-opus-4-6`                            |
| `effort`                   | -      | 推理力度：`low / medium / high / max`                     |
| `paths`                    | -      | 仅对匹配路径生效，如 `"src/**/*.ts"`                      |
| `hooks`                    | -      | 技能生命周期 hooks，格式同 `settings.json`                |
| `shell`                    | `bash` | `!反引号` 内联命令使用的 shell，Windows 可选 `powershell` |

## 调用控制矩阵

| 配置                             | 用户可 `/invoke` | Claude 可自动触发 |
| -------------------------------- | ---------------- | ----------------- |
| 默认                             | ✅               | ✅                |
| `disable-model-invocation: true` | ✅               | ❌                |
| `user-invocable: false`          | ❌               | ✅                |

## 高级特性

### $ARGUMENTS — 参数传递

```markdown
---
name: fix-issue
argument-hint: '[issue-number]'
---

修复 GitHub Issue $ARGUMENTS，遵循项目编码规范。

# 位置参数：$0 $1 $2 ...
```

调用：`/fix-issue 123`

### 动态上下文注入

`!` 前缀的反引号命令在技能加载时执行，输出注入到上下文：

```markdown
---
name: pr-review
allowed-tools: Bash(gh *)
---

当前 PR 内容：!`gh pr diff`
PR 评论：!`gh pr view --comments`

审查以上 PR，关注...
```

### 隔离子 Agent 执行

```markdown
---
name: deep-research
context: fork
agent: Explore
---

在代码库中深度搜索 $ARGUMENTS 相关实现，汇总发现。
```
