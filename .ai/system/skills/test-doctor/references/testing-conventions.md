# 测试目录与命名规范

## 目录结构：`__tests__/` 集中管理

### 原则

- 测试文件统一放入 `__tests__/` 目录，**不与源码同级**
- `__tests__/` 下按源码模块分子目录，**镜像源码结构**
- 测试辅助工具（mock / fixture / helpers）集中于 `__tests__/helpers/`

### 前端包

```
src/
├── utils/
│   ├── format.ts
│   └── validate.ts
├── hooks/
│   ├── useCounter.ts
│   └── useDebounce.ts
├── store/
│   └── appStore.ts
├── components/
│   └── Button/
│       └── index.tsx
└── __tests__/                      ← 测试统一入口
    ├── utils/
    │   ├── format.test.ts          → 测试 ../../utils/format
    │   └── validate.test.ts        → 测试 ../../utils/validate
    ├── hooks/
    │   ├── useCounter.test.ts
    │   └── useDebounce.test.ts
    ├── store/
    │   └── appStore.test.ts
    ├── components/
    │   └── Button.test.tsx
    └── helpers/                    ← 公共测试工具
        ├── setup.ts
        └── mocks.ts
```

### 后端包

```
server/
├── services/
│   ├── userService.js
│   └── searchService.js
├── routes/
│   ├── users.js
│   └── search.js
└── __tests__/                      ← 测试统一入口
    ├── services/
    │   ├── userService.test.js
    │   └── searchService.test.js
    ├── routes/
    │   └── users.test.js
    └── helpers/
```

### Monorepo 场景

每个包独立维护自己的 `__tests__/`（前端包放 `src/__tests__/`，后端包放根级 `__tests__/`），各包的测试配置 `include` 路径匹配各自的 `__tests__/` 目录。

## 文件命名规范

| 规则 | 示例 |
|------|------|
| 后缀固定 `.test.` | `format.test.ts` / `Button.test.tsx` / `userService.test.js` |
| 文件名与源文件一致 | `useCounter.ts` → `useCounter.test.ts` |
| 组件目录用 `index.tsx` 时，测试用组件名 | `Button/index.tsx` → `Button.test.tsx` |

### 避免使用

- ❌ `*.spec.*` 后缀
- ❌ `test/` 目录（无下划线前缀）
- ❌ 测试文件与源码同级

## 导入路径

`__tests__/` 内的测试文件需要向上两级访问源码：

```typescript
// src/__tests__/utils/format.test.ts
import { formatDate } from '../../utils/format';

// src/__tests__/hooks/useCounter.test.ts
import { useCounter } from '../../hooks/useCounter';

// server/__tests__/services/userService.test.js
const userService = require('../../services/userService');
```

**注意**：相比同级放置多一层 `../`，重构时需同步更新。

## 测试配置 include

各包的 test runner 配置需匹配 `__tests__/` 路径：

```typescript
// 前端包（src 下）
include: ['src/__tests__/**/*.test.{ts,tsx}']

// 后端包（根级）
include: ['__tests__/**/*.test.{js,mjs}']
```

## helpers 目录

```
__tests__/helpers/
├── setup.ts          ← 公共 setup（如 DB 初始化、全局 Mock）
├── mocks.ts          ← 共享 mock 数据 / fixture
└── render.tsx        ← 自定义 render（如 Provider 包装）
```

按需创建，不强制预置。
