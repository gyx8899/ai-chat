# UI Design System (品牌视觉规范)

> 当前项目（AI Chat Demo）的统一视觉语言，所有 UI 改动**必须**遵循。
> 视觉样品基线：[`design-demo/ai-chat-v0.html`](../../../design-demo/ai-chat-v0.html)

## 1. 设计定位

- **关键词**：科技感 / 大气 / 智能体感知 / 流动 / 沉浸
- **风格参照**：Linear、Vercel、Anthropic Claude、Perplexity 的克制精致视觉语言
- **避坑**：禁止使用紫粉渐变、emoji 当图标、Inter/Roboto 字体（AI 套版重灾区）

## 2. 色彩系统（oklch 色彩空间）

### 2.1 品牌主色：电光青 (Electric Cyan)

| Token | 值 | 用途 |
|-------|-----|------|
| `--brand-h` | `200` | 品牌色相基准（可被 Tweaks 覆盖） |
| `--primary` | `oklch(0.62 0.18 var(--brand-h))` | 主品牌色 / 按钮 / 链接 |
| `--primary-glow` | `oklch(0.72 0.22 var(--brand-h))` | hover/active 发光态、渐变高光 |
| `--primary-deep` | `oklch(0.42 0.16 calc(var(--brand-h) + 10))` | 暗色 hover、avatar 深底 |
| `--primary-soft` | `oklch(0.62 0.18 var(--brand-h) / 0.12)` | active 背景、badge、focus ring |

### 2.2 中性色（带 1% 主色色相，避免死灰）

| Token (Light) | 值 | Token (Dark) | 值 |
|---------------|-----|--------------|-----|
| `--bg` | `oklch(0.99 0.003 220)` | `--bg` | `oklch(0.145 0.012 235)` |
| `--bg-subtle` | `oklch(0.975 0.005 220)` | `--bg-subtle` | `oklch(0.165 0.014 235)` |
| `--surface` | `oklch(1 0 0)` | `--surface` | `oklch(0.185 0.014 235)` |
| `--surface-2` | `oklch(0.97 0.006 220)` | `--surface-2` | `oklch(0.21 0.016 235)` |
| `--border` | `oklch(0.92 0.008 220)` | `--border` | `oklch(0.26 0.018 235)` |
| `--border-strong` | `oklch(0.85 0.012 220)` | `--border-strong` | `oklch(0.32 0.02 235)` |
| `--text` | `oklch(0.18 0.012 235)` | `--text` | `oklch(0.96 0.006 220)` |
| `--text-muted` | `oklch(0.52 0.014 230)` | `--text-muted` | `oklch(0.68 0.012 225)` |
| `--text-faint` | `oklch(0.68 0.012 225)` | `--text-faint` | `oklch(0.5 0.014 230)` |

### 2.3 语义色

| Token | 值 | 用途 |
|-------|-----|------|
| `--success` | `oklch(0.68 0.16 155)` | 在线状态、成功提示 |
| `--warning` | `oklch(0.78 0.14 75)` | 离线模式、警告 |
| `--danger` | `oklch(0.62 0.22 25)` | 错误、删除 |

### 2.4 使用约束

- **严禁**手写新色相，所有颜色必须从上表 token 派生
- 派生方法：`oklch()` 调整 L/C，色相不变
- 透明度：用 `/ 0.xx` 语法，禁止 `rgba()`
- 与 Tailwind v3 的 HSL 桥接：参见下方 §6 Tailwind 适配

## 3. 字体系统

| 用途 | 字体 | Tailwind class | CSS var |
|------|------|----------------|---------|
| 品牌标题 / Hero | **Space Grotesk** | `font-display` | `--font-display` |
| 正文 / UI | **Plus Jakarta Sans** | `font-body`(默认) | `--font-body` |
| 代码 / 数字 / 时间 | **JetBrains Mono** | `font-mono` | `--font-mono` |

### 字号节奏（移动端友好）

| 用途 | size | weight | letter-spacing |
|------|------|--------|----------------|
| Hero 标题 | `clamp(28px, 4vw, 40px)` | 700 | -0.02em |
| H1 / 区域标题 | `15-16px` | 600 | -0.01em |
| 正文 | `14-15px` | 400-500 | 0 |
| 辅助文本 | `12-13px` | 400-500 | 0 |
| Mono 标签 | `10-11px` | 500 | 0.08-0.12em + UPPERCASE |

> **禁用**：Inter、Roboto、Arial、Fraunces、system-ui 作为主字体（AI 套版陷阱）。

## 4. 圆角与阴影

### 4.1 圆角（分级，禁止一刀切）

| Token | 值 | 用途 |
|-------|-----|------|
| `--r-sm` | `8px` | 小按钮、tag、tool-btn |
| `--r-md` | `12px` | 主按钮、input、卡片 |
| `--r-lg` | `18px` | 消息气泡、suggestion 卡片 |
| `--r-xl` | `24px` | 输入框 shell、大型容器 |
| `--r-full` | `999px` | pill、avatar、status dot |

### 4.2 阴影（主色微染，5 级 elevation）

```css
--shadow-sm:   0 1px 2px oklch(0.2 0.02 230 / 0.06);
--shadow-md:   0 4px 16px -4px oklch(0.2 0.02 230 / 0.08);
--shadow-lg:   0 12px 40px -12px oklch(0.2 0.02 230 / 0.14);
--shadow-glow: 0 0 0 1px var(--primary-soft),
               0 8px 32px -8px oklch(0.62 0.18 var(--brand-h) / 0.35);
```

- **禁止**纯黑阴影；必须带主色色相
- focus / hover 强调态统一使用 `--shadow-glow`

## 5. 动效系统（统一缓动语言）

### 5.1 缓动曲线

| Token | 值 | 用途 |
|-------|-----|------|
| `--ease-expo` | `cubic-bezier(0.16, 1, 0.3, 1)` | 入场动画、抽屉滑入 |
| `--ease-spring` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | 按钮按压、toggle 反馈 |
| `--ease-smooth` | `cubic-bezier(0.4, 0, 0.2, 1)` | 颜色/状态过渡（默认） |

### 5.2 时长

| Token | 值 | 用途 |
|-------|-----|------|
| `--dur-fast` | `150ms` | 颜色、icon-btn hover |
| `--dur-base` | `260ms` | 卡片 hover、focus ring |
| `--dur-slow` | `480ms` | 入场、抽屉、shine 扫光 |

### 5.3 关键微交互清单（必须实现）

- 消息气泡入场：`fadeUp` (translateY 8px → 0, 480ms expo)
- 流式光标：闪烁 cyan 竖线 + 主色辉光
- 按钮 hover：上浮 1px + 主色微辉光，active 下沉 + 缩放 0.98
- 侧栏 session：hover 时左侧浮现 cyan 高亮条（spring 弹出）
- 发送按钮：linear-gradient + 主色阴影 + spring 反馈
- AI 思考：3 圆点波浪 / pulse-dot
- AI Avatar：常驻呼吸光晕（hero-float + hero-glow）
- 在线状态点：pulse-dot 2s 循环
- New Chat 按钮：hover 时内部主色 shine 扫光（::before slide）
- 输入框聚焦：边框转主色 + 外发光 conic-gradient（opacity 0→0.4）

### 5.4 减弱动画

所有非必要动效必须包裹 `@media (prefers-reduced-motion: no-preference)`。

## 6. Tailwind 适配桥接

由于 shadcn/ui 默认使用 HSL CSS 变量，过渡期采用**双轨制**：

```css
/* index.css 同时维护两套 token */
:root {
  /* shadcn 兼容层（HSL，给现有 ui/ 原子件用） */
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  /* ...原 shadcn token */

  /* 品牌视觉层（oklch，给业务组件用） */
  --brand-h: 200;
  --primary-oklch: oklch(0.62 0.18 var(--brand-h));
  /* ...上述新 token */
}
```

`tailwind.config.js` 扩展示例：

```js
extend: {
  fontFamily: {
    display: ['"Space Grotesk"', 'sans-serif'],
    body:    ['"Plus Jakarta Sans"', 'sans-serif'],
    mono:    ['"JetBrains Mono"', 'monospace'],
  },
  borderRadius: {
    sm: '8px', md: '12px', lg: '18px', xl: '24px',
  },
  transitionTimingFunction: {
    expo:   'cubic-bezier(0.16, 1, 0.3, 1)',
    spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
  boxShadow: {
    glow: '0 0 0 1px var(--primary-soft), 0 8px 32px -8px oklch(0.62 0.18 var(--brand-h) / 0.35)',
  },
}
```

## 7. 响应式断点

| 断点 | 宽度 | 关键策略 |
|------|------|---------|
| Mobile | `< 640px` | Sidebar 抽屉化；Header 隐藏次要按钮（语言/更多）；标题截断；状态副文本 `display:none`；输入框 min-h=84px、发送按钮仅 icon |
| Tablet | `640-900px` | Sidebar 仍抽屉式；Header 完整显示；输入框正常 |
| Desktop | `≥ 900px` | Sidebar 常驻 280px；最大对话宽度 768px 居中 |
| Wide | `≥ 1440px` | 预留右侧"会话上下文"扩展位 |

### 7.1 移动端硬性约束

- 触控目标 ≥ **44×44px**（icon-btn 在 mobile 用 32px 时需保留 8px padding）
- Header 总高 ≤ 60px，padding `12px 14px`
- 输入框始终 sticky 在底部，min-height 不低于 84px（视觉富足感）

## 8. 背景装饰层

- **极光光斑**：固定层 + `conic-gradient` + `filter: blur(80-90px)` + 24-30s `drift` 动画
- **网格纹理**：56×56 dotted/grid + `mask: radial-gradient` 软边缘
- **玻璃拟态**：sticky header / 弹层使用 `backdrop-filter: blur(24px) saturate(180%)`
- **可关闭**：用户偏好（Tweaks 面板）控制 `display:none`

## 9. 组件标准化（shadcn/ui 补齐清单）

当前已有：`button` / `input` / `dropdown-menu` / `alert-dialog` / `tooltip` / `sonner`

**需补齐**（按 `npx shadcn@latest add <name>` 引入）：
- `card` — 消息容器、空态卡片
- `scroll-area` — 统一滚动条样式
- `separator` — 区域分隔
- `skeleton` — 加载占位
- `badge` — RAG 标记、模型 tag
- `avatar` — 用户/AI 头像
- `sheet` — 移动端侧栏抽屉

## 10. 命名约定

- CSS var 一律 `--kebab-case`，业务命名优先于实现细节（用 `--brand-h`，不用 `--cyan-200`）
- 动画 keyframe 用语义命名：`fadeUp` / `pulse-dot` / `hero-float` / `drift` / `hero-glow`
- 微交互 utility class：`animate-in` + `delay-1/2/3/4`（60/120/180/240ms 错峰入场）

## 11. 反例（AI 套版禁区）

- ❌ 紫粉蓝渐变背景（`from-purple-500 to-pink-500`）
- ❌ emoji 当图标占位（用 lucide-react，缺图标用占位框）
- ❌ 卡片左侧色条 + 大圆角组合（cookie-cutter）
- ❌ 多于 3 种字体家族
- ❌ 纯色阴影 `rgba(0,0,0,0.1)`（必须主色微染）
- ❌ 全局统一圆角（必须分级）
- ❌ `transition-all duration-300` 默认值（必须从 §5 token 选）
