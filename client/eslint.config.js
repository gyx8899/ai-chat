import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import prettier from 'eslint-config-prettier'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
      prettier, // 必须放最后，关闭与 Prettier 冲突的 ESLint 规则
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
      'no-restricted-syntax': [
        'error',
        {
          selector:
            "Literal[value=/^https?:\\/\\/(localhost|127\\.0\\.0\\.1)(:\\d+)?/], TemplateElement[value.raw=/^https?:\\/\\/(localhost|127\\.0\\.0\\.1)(:\\d+)?/]",
          message: '禁止硬编码后端地址（http://localhost:3001 等），统一使用相对路径 /api 经 Vite 代理。',
        },
      ],
    },
  },
  {
    files: ['**/*.test.{ts,tsx}'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
  {
    // vite.config.ts 是构建工具配置，需要配置代理 target 指向本地后端
    files: ['vite.config.ts'],
    rules: {
      'no-restricted-syntax': 'off',
    },
  },
])
