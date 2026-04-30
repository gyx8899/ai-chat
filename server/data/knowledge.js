/**
 * 预设前端知识库
 * 每条记录含 id、keywords（关键词数组）、content（Markdown 格式内容）
 */
const knowledgeBase = [
  {
    id: 'react-hooks',
    keywords: ['react', 'hooks', 'useState', 'useEffect', 'useRef', 'useMemo', 'useCallback', '钩子', '组件'],
    content: `## React Hooks 核心概念

**useState** - 状态管理
\`\`\`jsx
const [count, setCount] = useState(0);
\`\`\`

**useEffect** - 副作用处理
\`\`\`jsx
useEffect(() => {
  // 组件挂载或依赖变化时执行
  return () => { /* 清理函数 */ };
}, [dependency]);
\`\`\`

**useMemo / useCallback** - 性能优化，避免不必要的重计算和重渲染。

**规则**：只在函数组件顶层调用 Hook，不在循环、条件或嵌套函数中调用。`
  },
  {
    id: 'webpack-config',
    keywords: ['webpack', '打包', 'bundle', 'loader', 'plugin', '构建', '配置', 'vite', '工程化'],
    content: `## Webpack 核心配置

\`\`\`js
module.exports = {
  entry: './src/index.js',
  output: { path: path.resolve(__dirname, 'dist'), filename: '[name].[contenthash].js' },
  module: {
    rules: [
      { test: /\\.tsx?$/, use: 'ts-loader' },
      { test: /\\.css$/, use: ['style-loader', 'css-loader'] }
    ]
  },
  plugins: [new HtmlWebpackPlugin({ template: './public/index.html' })],
  optimization: { splitChunks: { chunks: 'all' } }
};
\`\`\`

**关键概念**：Entry（入口）、Output（输出）、Loader（转换器）、Plugin（插件）、Code Splitting（代码分割）。`
  },
  {
    id: 'typescript-basics',
    keywords: ['typescript', 'ts', '类型', 'interface', 'type', '泛型', 'generic', '类型推断'],
    content: `## TypeScript 核特性

**接口与类型别名**
\`\`\`ts
interface User { id: number; name: string; email?: string; }
type Status = 'active' | 'inactive' | 'pending';
\`\`\`

**泛型**
\`\`\`ts
function identity<T>(arg: T): T { return arg; }
const result = identity<string>('hello');
\`\`\`

**常用工具类型**：\`Partial<T>\`、\`Required<T>\`、\`Pick<T, K>\`、\`Omit<T, K>\`、\`Record<K, V>\``
  },
  {
    id: 'css-layout',
    keywords: ['css', 'flex', 'grid', '布局', 'flexbox', '响应式', 'tailwind', '样式'],
    content: `## CSS 现代布局

**Flexbox**
\`\`\`css
.container {
  display: flex;
  justify-content: space-between; /* 主轴对齐 */
  align-items: center;            /* 交叉轴对齐 */
  gap: 16px;
}
\`\`\`

**CSS Grid**
\`\`\`css
.grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
\`\`\`

**响应式**：使用 \`@media (max-width: 768px)\` 断点，或 Tailwind 的 \`sm:\`、\`md:\`、\`lg:\` 前缀。`
  },
  {
    id: 'vue-composition',
    keywords: ['vue', 'vue3', 'composition', 'ref', 'reactive', 'computed', '组合式', '选项式'],
    content: `## Vue 3 组合式 API

\`\`\`vue
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';

const count = ref(0);
const doubled = computed(() => count.value * 2);

onMounted(() => console.log('组件已挂载'));
</script>
\`\`\`

**ref vs reactive**：基本类型用 \`ref\`，对象用 \`reactive\`。访问 ref 需要 \`.value\`，在模板中自动解包。`
  },
  {
    id: 'performance',
    keywords: ['性能', '优化', '懒加载', 'lazy', '虚拟列表', '缓存', 'memo', '首屏', 'lighthouse'],
    content: `## 前端性能优化

**代码层面**
- React：\`React.memo\`、\`useMemo\`、\`useCallback\` 避免不必要渲染
- 路由懒加载：\`const Page = React.lazy(() => import('./Page'))\`
- 虚拟列表：大量数据使用 \`react-virtual\` 或 \`vue-virtual-scroller\`

**资源层面**
- 图片：WebP 格式、懒加载 \`loading="lazy"\`、CDN 加速
- JS：Tree Shaking、Code Splitting、Gzip/Brotli 压缩

**指标**：关注 LCP（最大内容绘制）< 2.5s、FID < 100ms、CLS < 0.1`
  }
];

module.exports = knowledgeBase;