require('dotenv').config()
const express = require('express')
const cors = require('cors')

const chatRouter = require('./routes/chat')
const sessionsRouter = require('./routes/sessions')
const { router: configRouter } = require('./routes/config')

const app = express()
const PORT = process.env.PORT || 3001

// 中间件
app.use(cors())
app.use(express.json())

// 路由
app.use('/api/chat', chatRouter)
app.use('/api/sessions', sessionsRouter)
app.use('/api/config', configRouter)

// 健康检查
app.get('/health', (req, res) =>
  res.json({ status: 'ok', provider: process.env.LLM_PROVIDER || 'mock' })
)

// 全局错误处理（必须放在所有路由之后，且保留 4 个参数）
app.use((err, req, res, _next) => {
  console.error('[server error]', err.stack || err.message)
  res.status(err.status || 500).json({ error: err.message || '服务器内部错误' })
})

app.listen(PORT, () => {
  console.log(`🚀 AI Chat Demo 后端服务已启动: http://localhost:${PORT}`)
  console.log(`📦 LLM Provider: ${process.env.LLM_PROVIDER || 'mock'}`)
})
