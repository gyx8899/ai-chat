# 项目特定测试配置

> 本文档记录 `ai-chat-demo` 项目的测试基础设施细节，为 test-doctor 技能提供项目级指导。

## 1. 三包测试配置

| 包 | 配置文件 | 环境 | include glob | 注意事项 |
|---|---------|------|-------------|---------|
| shared | `vitest.config.ts` | jsdom | `src/__tests__/**/*.test.{ts,tsx}` | globals + passWithNoTests |
| client | `vitest.config.ts` | jsdom | `src/__tests__/**/*.test.{ts,tsx}` | `@/` + `@shared` 别名 + setupFiles |
| server | `vitest.config.mjs` | node | `__tests__/**/*.test.{js,mjs}` | `.mjs` 后缀（server 为 CJS 项目） |

### client setupFiles

```typescript
// client/src/test-setup.ts
import '@testing-library/jest-dom/vitest';
```

## 2. 路径别名映射

| 别名 | 实际路径 | 适用范围 |
|:-----|:---------|:---------|
| `@/` | `client/src/` | client 包 |
| `@shared/` | `shared/src/` | client 包 |

client 的 `vitest.config.ts` 已配置对应 `resolve.alias`：

```typescript
resolve: {
  alias: {
    '@': path.resolve(__dirname, './src'),
    '@shared': path.resolve(__dirname, '../shared/src'),
  },
},
```

## 3. 数据库隔离

server 的 `memoryService.js` 支持环境变量切换 DB 路径：

```javascript
const DB_PATH = process.env.TEST_DB || path.join(__dirname, '../data/chat.db');
```

测试中使用内存数据库：

```javascript
beforeAll(() => { process.env.TEST_DB = ':memory:'; });
afterAll(() => { delete process.env.TEST_DB; });
```

## 4. ESLint 测试文件豁免

`client/eslint.config.js` 已为测试文件关闭 `react-refresh/only-export-components` 规则：

```javascript
{
  files: ['**/*.test.{ts,tsx}'],
  rules: {
    'react-refresh/only-export-components': 'off',
  },
},
```

## 5. 运行命令

```bash
# 单包运行
cd shared && npm test
cd client && npm test
cd server && npm test

# 监听模式
cd <package> && npm run test:watch

# 全量运行（根目录）
npm run test:all
```

## 6. 依赖清单

### shared devDependencies
- `vitest` — 测试运行器
- `jsdom` — DOM 环境
- `@testing-library/react` — 组件/Hook 测试
- `@testing-library/jest-dom` — DOM 断言扩展

### client devDependencies
- 同 shared +
- `@testing-library/user-event` — 用户交互模拟

### server devDependencies
- `vitest` — 测试运行器
- `supertest` — HTTP 集成测试

## 7. 已知项目特定陷阱

| 陷阱 | 表现 | 解决方案 |
|------|------|---------|
| Logger `console.bind()` 缓存 | `vi.spyOn(console, 'debug')` 无效 | 使用 Logger 的 transport 回调作为 spy |
| server CJS + vitest config | `.js` 后缀配置文件语法报错 | 使用 `.mjs` 后缀 |
| Zustand Store 单例泄漏 | 上个 test 的 state 影响下个 | `beforeEach` 中 `useStore.setState(初始值)` |
| SSE 流式接口测试 | fetch + ReadableStream 难以 mock | 使用 `vi.mock` 替换 fetch，返回可控的 ReadableStream |
| `@/` 别名在测试中找不到 | vitest.config 缺少 alias | 确认 resolve.alias 包含 `@` 和 `@shared` |

## 8. CI 集成

`.github/workflows/ci.yml` 中测试步骤位于 `format-check` 之后、`build` 之前：

```yaml
- name: Test shared
  run: cd shared && npm test

- name: Test client
  run: cd client && npm test

- name: Test server
  run: cd server && npm test
```
