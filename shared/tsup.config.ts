import { defineConfig } from 'tsup'

export default defineConfig({
  // 多入口：顶层 + 各子路径
  entry: {
    index: 'src/index.ts',
    'utils/index': 'src/utils/index.ts',
    'hooks/index': 'src/hooks/index.ts',
    'components/index': 'src/components/index.ts',
  },
  format: ['esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  // React JSX 运行时，无需手动 import React
  esbuildOptions(options) {
    options.jsx = 'automatic'
  },
  // peerDependencies 不打入产物
  external: ['react', 'react-dom', 'clsx', 'tailwind-merge'],
  treeshake: true,
})
