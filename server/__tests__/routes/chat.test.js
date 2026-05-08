const { describe, test, expect, vi, beforeEach, afterEach } = require('vitest')
const request = require('supertest')
const express = require('express')

describe('chat route', () => {
  let app

  beforeEach(() => {
    app = express()
    app.use(express.json())
    process.env.TEST_DB = ':memory:'
    const chatRouter = require('../../routes/chat')
    app.use('/api/chat', chatRouter)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  test('POST /api/chat 缺少请求体返回 400', async () => {
    const res = await request(app).post('/api/chat')
    expect(res.status).toBe(400)
    expect(res.body.error).toBe('缺少请求体')
  })

  test('POST /api/chat 缺少 query 返回 400', async () => {
    const res = await request(app).post('/api/chat').send({ sessionId: 'test-session' })
    expect(res.status).toBe(400)
    expect(res.body.error).toContain('query')
  })

  test('POST /api/chat sessionId 格式非法返回 400', async () => {
    const res = await request(app)
      .post('/api/chat')
      .send({ query: 'test', sessionId: 'invalid@session' })
    expect(res.status).toBe(400)
    expect(res.body.error).toContain('sessionId')
  })

  test('POST /api/chat query 超过最大长度返回 400', async () => {
    const longQuery = 'a'.repeat(5000)
    const res = await request(app)
      .post('/api/chat')
      .send({ query: longQuery, sessionId: 'valid-session' })
    expect(res.status).toBe(400)
    expect(res.body.error).toContain('长度')
  })

  test('POST /api/chat 正常请求返回 SSE 流式响应', async () => {
    const res = await request(app)
      .post('/api/chat')
      .send({ query: 'hello', sessionId: 'valid-session-123' })
      .set('Accept', 'text/event-stream')
    
    expect(res.status).toBe(200)
    expect(res.headers['content-type']).toContain('text/event-stream')
    expect(res.text).toContain('data: ')
    expect(res.text).toContain('[DONE]')
  })

  test('POST /api/chat 返回的 SSE 数据包含内容', async () => {
    const res = await request(app)
      .post('/api/chat')
      .send({ query: 'react hooks', sessionId: 'test-session-id' })
      .set('Accept', 'text/event-stream')
    
    expect(res.status).toBe(200)
    const lines = res.text.split('\n').filter(line => line.startsWith('data: '))
    expect(lines.length).toBeGreaterThan(1)
    
    const contentLines = lines.filter(line => !line.includes('[DONE]'))
    expect(contentLines.length).toBeGreaterThan(0)
    
    const firstContent = contentLines[0].replace('data: ', '')
    expect(firstContent).toBeTruthy()
  })
})