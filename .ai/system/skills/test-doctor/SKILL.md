---
name: test-doctor
description: >
  通用 JavaScript / TypeScript 全栈项目的单元测试全生命周期管理——创建、完整性检查、覆盖率分析、通过率验证及修复。
  适用于前端（React / Vue 等）、后端（Node.js / Express 等）和共享工具库。
  Use when 需要为模块创建测试、覆盖率不达标需要分析补全、测试失败需要排查修复、审查测试代码质量、
  或需要用 test.failing 显式标记源码 Bug。
  适用于: (1) 新模块创建测试 (2) 覆盖率分析与补全 (3) 失败用例排查修复
  (4) 测试代码质量审查 (5) Bug 暴露与 test.failing 闭环标记
---

# Test Doctor

本技能用于 **JS/TS 全栈项目** 的测试全生命周期管理，确保测试代码符合行为驱动、独立可重复的质量标准。

## 测试认知澄清

> ⚠️ **常见误区警示**
> 
> 很多团队将单元测试覆盖率硬性绑定KPI，导致开发者为了冲覆盖率写大量无效测试（如无脑测getter/setter、强行凑分支覆盖率），最终只得到漂亮的数字，既浪费开发精力，也没真正提升代码可靠性。
> 
> **核心认知**：覆盖率只能证明「代码被测试运行过」，不能证明「代码被正确验证了」，不该作为衡量测试质量的核心指标。

## 快速开始

1. **创建测试**：告诉 Agent 源文件路径 → 自动分析源码并按 [testing-guide.md](references/testing-guide.md) 生成测试文件
2. **检查质量**：运行 `npm test -- --coverage` → Agent 按覆盖率目标分析差距并补全用例
3. **修复失败**：提供失败日志 → Agent 区分逻辑错误 / 稳定性问题并给出修复方案

## 技能目标

### 1. 覆盖率目标（量化门槛）

| 指标 | 普通模块 | 关键业务模块 | 说明 |
|:-----|:---------|:-------------|:-----|
| **Branch** | ≥ 70% | ≥ 80% | **最优先**，覆盖所有 if/else 分支 |
| Statements | ≥ 80% | ≥ 90% | 每条语句被执行 |
| Functions | ≥ 80% | ≥ 90% | 每个函数被调用 |

### 2. 质量目标（行为契约保障）

- **行为导向**：断言公开状态、可见 UI、副作用，不断言内部变量
- **Mock 策略合规**：不重复全局 Mock，局部覆盖时不污染其他用例
- **稳定可重复**：禁止硬编码等待时间，用 `waitFor` / `advanceTimersByTime` 替代
- **独立性**：每个 test 不依赖其他 test 的执行顺序或状态

### 3. 可维护目标

- 每个 `describe` 结构清晰，按场景分组
- 每个 `it` 描述"给定条件 + 预期行为"
- Mock 清理策略统一（`beforeEach` 中 `clearAllMocks`）
- 每个测试文件包含文件级 JSDoc 概述（用例清单、覆盖率、未覆盖说明）
- 每个 `it` 前标注 `// TEST-00X ✅` 状态标记，便于快速预览

> **判断标准**：Branch ≥ 目标值 + 0 个 Critical 级违规 = 目标达成

### 4. 测试核心原则

真正可靠的单元测试要符合3个核心原则：

- **测「对外行为」，不是测「内部实现」**：只验证代码对外输出的逻辑是否符合预期，不绑定内部实现细节，避免重构时逻辑没改、测试却大量失效的问题。

- **测「核心+边界」，不是测「所有分支」**：重点投入精力在业务核心逻辑、容易出错的边界场景（空输入、异常值、临界条件），不用为了覆盖无意义分支硬凑用例。

- **好测试要满足三个特质**：可信任（失败一定对应代码问题，极少误报）、可维护（业务变更时改测试成本低）、运行快（不阻塞开发流程）。

## 核心工作流

### 1. 创建测试 (Create)

当需要为 `[文件路径]` 创建测试时：

1. **分析源码**：识别导出的函数/类/组件/Hook、内部副作用和外部依赖
2. **确定位置**：测试文件放入对应 `__tests__/` 子目录（参见 [testing-conventions.md](references/testing-conventions.md)）
3. **生成脚手架**：
   - 导入测试框架原语（`describe` / `it` / `expect`）
   - 主动识别并 Mock 外部依赖
   - 按模块类型套用对应模式（参见 [testing-guide.md](references/testing-guide.md)）
   - 添加文件级 JSDoc 概述：

     ```typescript
     /**
      * [模块名] 测试套件
      *
      * 测试用例:
      *  1. [TEST-001] 场景描述 - ✅
      *  2. [TEST-002] 场景描述 - ✅
      *
      * 覆盖率: Stmts __% | Branch __% | Funcs __% | Lines __%
      * 未覆盖: (运行后填写)
      */
     ```
4. **必测场景清单**：

   **工具函数**：正常输入 / 边界值 / 空值兜底 / 异常输入

   **Hook**：
   | 场景 | 说明 |
   |------|------|
   | 返回值结构 | 验证所有返回字段存在且类型正确 |
   | 初始状态 | 验证 useState/useRef 初始值 |
   | 状态更新 | 验证 dispatch / setter 后的新状态 |
   | 副作用触发 | 验证 useEffect 依赖变更后行为 |
   | 清理逻辑 | unmount 后确认定时器/监听已移除 |
   | 引用稳定性 | useCallback 包裹的函数跨 rerender 引用不变 |
   | 异常分支 | 依赖 API 抛出或返回异常时的兜底行为 |

   **组件**：渲染正确 / 交互响应 / 条件渲染 / Loading 态 / Error 兜底 / Empty 空状态

   **Node.js Service**：正常调用 / 异常抛出 / 边界参 / 依赖隔离

   **REST API**：成功响应 / 参数校验失败 / 错误处理

### 2. 完整性检查 (Completeness Check)

1. **分支扫描**：识别源码中的 `if/else`、三元、`switch`、`&&`、`??` 分支
2. **场景对比**：检查是否覆盖所有逻辑路径
3. **输出报告**：列出缺失的 `it` 用例场景

### 3. 覆盖率分析 (Coverage Analysis)

1. **运行覆盖率**：执行 `npm test -- --coverage`（或项目专用命令）
2. **解读指标**（按优先级）：Branch > Stmts > Funcs > Lines
3. **定位未覆盖代码**：从 `Uncovered Lines` 列定位行号
4. **输出分析报告**：按模块列出当前值、目标值、差距

### 4. 通过率与稳定性 (Pass Rate & Stability)

1. **分析报错**：区分 `AssertionError`（逻辑错误）和 `Timeout/Async`（稳定性）
2. **识别污染**：检查是否有 `clearAllMocks` 清理逻辑
3. **识别竞态**：检查是否使用硬编码等待而非 `waitFor`，标记为 Flaky Test

### 5. 修复与重构 (Fix & Refactor)

1. **自动修复**：根据源码变更修正过时的 Mock 数据和导入路径
2. **稳定性重构**：将不稳定的异步逻辑替换为 `advanceTimersByTime` 或 `waitFor`
3. **Bug 暴露规范**：

   发现源码 Bug 时，**禁止修改断言适配 Bug**，应使用 `test.failing`（Jest）或 `it.fails`（Vitest）显式标记：

   ```typescript
   // ❌ 修改断言掩盖 Bug
   it('should return 0', () => {
     expect(Number.isNaN(getValue())).toBe(true); // 适配 NaN，掩盖问题
   });

   // ✅ 显式标记 Bug，源码修复后测试自动提醒改回
   test.failing('should return 0 when input missing', () => {
     // 期望: 安全兜底返回 0
     // 实际: 返回 NaN（源码 Bug）
     expect(getValue()).toBe(0);
   });
   ```

   **`test.failing` 行为机制**：
   - Bug 存在（断言失败）→ `test.failing` 本身**通过**，套件正常运行
   - Bug 修复（断言通过）→ `test.failing` **报错**，提示改回普通 `it`，形成闭环

## 测试策略建议

### 测试优先级排序
- **复杂逻辑模块**：优先编写完整测试
- **线上出过bug的模块**：重点覆盖问题场景
- **频繁变更的模块**：确保核心路径稳定
- **简单稳定的代码**：可以少写甚至不写测试

### 等价类划分
把逻辑一致的输入归为一类测试，不用给每个可能的输入写单独用例，避免测试膨胀。

### 理性看待低覆盖率
如果核心逻辑都测试完覆盖率仍不达标，大概率是存在无用的死代码，直接删掉比硬补测试价值更高。

### 分层测试原则
单元测试只测当前模块的逻辑，外部依赖统一用Mock隔离，不要把单元测试写成集成测试。

## 审查准则

| 级别 | 违规场景 | 处理要求 |
|:-----|:---------|:---------|
| **Critical** | Mock 数据与源码不符；异步竞争导致 Flaky；修改断言适配 Bug 而非暴露 | 必须立即修复 |
| **Error** | 核心路径未测试；未清理 Mock 环境；关键模块 Branch < 60% | 必须修复 |
| **Warning** | 逻辑分支未覆盖；普通模块 Branch < 70%；测试描述模糊；测试了实现细节；使用快照测试 | 建议优化 |

## 禁止事项

- 禁止快照测试（维护成本高、信噪比低）
- 禁止测试实现细节（内部 state / 私有方法）
- 禁止 `setTimeout` 模拟异步（使用 fake timers）
- 禁止测试间共享可变状态
- 禁止为提高覆盖率写无意义测试
- 禁止 `eslint-disable` 掩盖测试文件问题
- 禁止修改断言去适配源码 Bug

## 快速参考

- **组件查询**：优先 `screen.getByRole` / `getByText`；调试用 `screen.debug()`
- **异步处理**：API 请求用例必须 `await waitFor(() => expect(...))`
- **Mock 清理**：`beforeEach` 中 `clearAllMocks()`，再设 `mockReturnValue`，顺序不可颠倒
- **Timer 配对**：`beforeEach` 中 `useFakeTimers()`，`afterEach` 中 `useRealTimers()`
- **行为不测实现**：断言公开状态、可见 UI、副作用，不断言内部变量或私有方法
- **禁止 Snapshot**：用文本 / 角色 / testId 断言替代 `toMatchSnapshot()`

## 已知陷阱

| 陷阱 | 表现 | 解决方案 |
|------|------|---------|
| `spyOn` 对 `.bind()` 缓存无效 | spy 调用次数始终为 0 | 使用 transport / callback spy |
| `document is not defined` | Node 环境缺 DOM | 检查 test config environment 为 jsdom |
| Store 状态在测试间泄漏 | 上一个 test 的状态影响下一个 | 每个 test 前重置 Store |
| Timer 测试不稳定 | 真实 setTimeout 时序不可控 | 改用 `useFakeTimers()` |
| 路径别名找不到模块 | `@/` 前缀报 Cannot find module | test config 添加 resolve.alias |
| DB 测试并发冲突 | 多测试写同一文件 | 使用内存数据库（`:memory:`） |
| CJS 项目 config 语法报错 | ESM 语法写在 CJS 上下文 | 配置文件用 `.mjs` 后缀 |
| Mock 路径层级错误 | `__tests__/` 子目录多一层 | 注意相对路径 `../../` vs `../` |

## 详细指南

- [测试代码模式指南](references/testing-guide.md) — 各模块类型完整代码示例
- [项目特定配置](references/project-specifics.md) — Mock 策略、路径别名、DB 隔离
- [测试目录规范](references/testing-conventions.md) — `__tests__/` 目录结构与命名
