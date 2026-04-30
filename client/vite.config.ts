import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())
  const isStatic = env.VITE_DEPLOY_TARGET === 'static'

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@shared': path.resolve(__dirname, '../shared/src'),
      },
      dedupe: ['react', 'react-dom'],
    },
    server: {
      port: Number(env.VITE_PORT) || 5173,
      proxy: {
        '/api': {
          target: `http://localhost:${env.VITE_SERVER_PORT || 3001}`,
          changeOrigin: true,
        },
      },
    },
    optimizeDeps: {
      include: ['react', 'react-dom'],
    },
    // base: isStatic ? '/client/dist/' : '/',
    base: isStatic ? '/ai-chat/' : '/',
  }
})
