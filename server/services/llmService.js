const { getConfig } = require('../routes/config')

const SYSTEM_PROMPT = `你是一名专业的 AI 编程助手，精通前端开发领域，包括 React、Vue、Webpack、TypeScript、CSS 等。
回答编程问题时，请从「设计思路」和「代码实现」两个维度输出，代码使用 Markdown 代码块格式。
非编程相关问题，请礼貌告知这超出你的专业范围。`

/** 预设模拟回复规则 */
const mockReplies = [
  {
    keywords: ['react', 'hooks', 'usestate', 'useeffect', '钩子'],
    reply: `## 关于 React Hooks

### 设计思路
React Hooks 让函数组件拥有状态和生命周期能力，替代了 class 组件的繁琐写法。核心思路是将逻辑按关注点拆分，而非按生命周期拆分。

### 代码实现
\`\`\`jsx
import { useState, useEffect } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    document.title = \`点击了 \${count} 次\`;
    return () => { document.title = 'AI Chat Demo'; };
  }, [count]);

  return <button onClick={() => setCount(c => c + 1)}>点击: {count}</button>;
}
\`\`\`

> **注意**：Hook 只能在函数组件的顶层调用，不能在条件语句或循环中调用。`,
  },
  {
    keywords: ['webpack', '打包', 'bundle', 'loader', 'plugin', '构建'],
    reply: `## 关于 Webpack 打包

### 设计思路
Webpack 是一个模块打包器，核心思路是从入口文件出发，递归构建依赖图，通过 Loader 转换各类资源，通过 Plugin 扩展功能。

### 代码实现
\`\`\`js
// webpack.config.js
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/index.js',
  output: {
    filename: '[name].[contenthash].js',
    clean: true,
  },
  module: {
    rules: [
      { test: /\\.tsx?$/, use: 'ts-loader', exclude: /node_modules/ },
      { test: /\\.css$/, use: ['style-loader', 'css-loader'] },
    ],
  },
  plugins: [new HtmlWebpackPlugin({ template: './public/index.html' })],
  optimization: {
    splitChunks: { chunks: 'all' }, // 代码分割
  },
};
\`\`\`

**性能优化**：开启 \`splitChunks\` 分割第三方库，使用 \`contenthash\` 利用浏览器缓存。`,
  },
  {
    keywords: ['typescript', 'ts', '类型', 'interface', '泛型'],
    reply: `## 关于 TypeScript

### 设计思路
TypeScript 通过静态类型系统在编译时发现错误，提升代码可维护性。核心是类型标注、接口定义和泛型复用。

### 代码实现
\`\`\`ts
// 接口定义
interface ApiResponse<T> {
  code: number;
  data: T;
  message: string;
}

// 泛型函数
async function fetchData<T>(url: string): Promise<ApiResponse<T>> {
  const res = await fetch(url);
  return res.json();
}

// 使用
const result = await fetchData<User[]>('/api/users');
result.data.forEach(user => console.log(user.name));
\`\`\`

**工具类型**：善用 \`Partial<T>\`、\`Pick<T, K>\`、\`Omit<T, K>\` 减少重复类型定义。`,
  },
  {
    keywords: ['css', 'flex', 'grid', '布局', '响应式', 'tailwind'],
    reply: `## 关于 CSS 布局

### 设计思路
现代 CSS 布局推荐优先使用 Flexbox（一维）和 Grid（二维），结合媒体查询实现响应式。

### 代码实现
\`\`\`css
/* Flexbox 导航栏 */
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
  height: 60px;
}

/* Grid 卡片布局 */
.cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

/* 响应式 */
@media (max-width: 768px) {
  .navbar { flex-direction: column; height: auto; }
}
\`\`\``,
  },
  {
    keywords: ['vue', 'vue3', 'composition', '组合式'],
    reply: `## 关于 Vue 3

### 设计思路
Vue 3 的组合式 API（Composition API）将相关逻辑集中在一起，通过 \`<script setup>\` 语法糖简化代码，配合 TypeScript 类型推断效果更佳。

### 代码实现
\`\`\`vue
<script setup lang="ts">
import { ref, computed, watch } from 'vue';

interface User { id: number; name: string; }

const users = ref<User[]>([]);
const searchQuery = ref('');

const filteredUsers = computed(() =>
  users.value.filter(u => u.name.includes(searchQuery.value))
);

watch(searchQuery, (newVal) => {
  console.log('搜索词变化:', newVal);
});
</script>
\`\`\``,
  },
]

/**
 * 流式对话（AsyncGenerator）
 * @param {{ messages: Array<{role: string, content: string}>, signal?: AbortSignal }} param
 * @yields {string} token - 每次 yield 一个字符或词
 */
async function* streamChat({ messages, signal }) {
  const { provider } = getConfig()
  if (provider === 'mock') {
    yield* mockStreamChat(messages, signal)
  } else {
    yield* realStreamChat(messages, signal)
  }
}

async function* mockStreamChat(messages, signal) {
  const lastUserMsg = [...messages].reverse().find(m => m.role === 'user')
  const query = lastUserMsg ? lastUserMsg.content.toLowerCase() : ''

  // 匹配预设回复
  let reply = null
  for (const rule of mockReplies) {
    if (rule.keywords.some(kw => query.includes(kw))) {
      reply = rule.reply
      break
    }
  }

  // 检查是否询问历史
  if (!reply && (query.includes('之前') || query.includes('历史') || query.includes('上一'))) {
    const historyMsgs = messages.filter(m => m.role === 'user').slice(0, -1)
    if (historyMsgs.length > 0) {
      reply = `## 你之前问过的问题\n\n${historyMsgs.map((m, i) => `${i + 1}. ${m.content}`).join('\n')}`
    }
  }

  // 默认回复
  if (!reply) {
    reply = `## AI 编程助手

你好！我是专注于前端开发的 AI 编程助手。

我可以帮你解答以下领域的问题：
- **React / Vue** - 组件开发、Hooks、状态管理
- **TypeScript** - 类型系统、接口设计、泛型
- **Webpack / Vite** - 构建配置、性能优化
- **CSS** - Flexbox、Grid、响应式布局

请告诉我你遇到的具体问题，我会从「设计思路」和「代码实现」两个维度为你解答！`
  }

  // 逐字推送，模拟打字机效果（每次 yield 前检查 abort 信号）
  for (const char of reply) {
    if (signal?.aborted) return
    yield char
    await new Promise(resolve => setTimeout(resolve, 25))
  }
}

async function* realStreamChat(messages, signal) {
  const { modelId } = getConfig()
  const apiKey = process.env.LLM_API_KEY
  const baseUrl = process.env.LLM_BASE_URL || 'https://api.openai.com/v1'

  if (!apiKey) {
    throw new Error(`模型 ${modelId} 需要配置 LLM_API_KEY，请在 .env 中设置`)
  }

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: modelId,
      messages,
      stream: true,
    }),
    signal,
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`LLM API error ${response.status}: ${err}`)
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    if (signal?.aborted) {
      try {
        await reader.cancel()
      } catch {
        // 忽略 cancel 异常
      }
      return
    }
    const { value, done } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() ?? ''

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue
      const data = line.slice(6).trim()
      if (data === '[DONE]') return
      try {
        const json = JSON.parse(data)
        const token = json.choices?.[0]?.delta?.content
        if (token) yield token
      } catch {
        // 忽略解析错误
      }
    }
  }
}

module.exports = { streamChat, SYSTEM_PROMPT }
