import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import tseslint from 'typescript-eslint'
import prettier from 'eslint-config-prettier'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', 'node_modules']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      prettier,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', ignoreRestSiblings: true },
      ],
      'no-restricted-globals': [
        'error',
        {
          name: 'EventSource',
          message:
            '禁止使用 EventSource：仅支持 GET 且无法 abort，请通过 client/src/lib/sseClient.ts 的 streamSSE 处理 SSE。',
        },
      ],
      // react-hooks v7 严格规则：以下属于 React 19 升级中的语义收紧，
      // 现有 shared 组件/Hook 采用「ref 持有最新值」「展开 deps」等历史模式。
      // 短期内降级为 warning，避免阻塞门禁；长期通过独立任务统一重构。
      'react-hooks/refs': 'warn',
      'react-hooks/use-memo': 'warn',
      'react-hooks/set-state-in-effect': 'warn',
    },
  },
  {
    files: ['src/__tests__/**/*.{ts,tsx}'],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node, ...globals.jest, ...globals.vitest },
    },
    rules: {
      // 测试中 `false && 'x'` 是为了验证 falsy 过滤行为，属于测试夹具
      'no-constant-binary-expression': 'off',
    },
  },
])
