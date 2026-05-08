const { describe, test, expect, vi, beforeEach, afterEach } = require('vitest')
const { streamChat, SYSTEM_PROMPT } = require('../../services/llmService')

describe('llmService', () => {
  describe('SYSTEM_PROMPT', () => {
    test('系统提示词存在且非空', () => {
      expect(SYSTEM_PROMPT).toBeDefined()
      expect(typeof SYSTEM_PROMPT).toBe('string')
      expect(SYSTEM_PROMPT.length).toBeGreaterThan(0)
    })
  })

  describe('streamChat - mock 模式', () => {
    const originalConfig = require('../../routes/config').getConfig
    const mockConfig = { provider: 'mock', modelId: 'mock-model' }

    beforeEach(() => {
      vi.mock('../../routes/config', () => ({
        getConfig: vi.fn().mockReturnValue(mockConfig),
      }))
    })

    afterEach(() => {
      vi.restoreAllMocks()
    })

    test('流式返回预设回复（React 相关）', async () => {
      const messages = [{ role: 'user', content: 'react hooks 怎么用' }]
      const tokens = []
      
      for await (const token of streamChat({ messages })) {
        tokens.push(token)
      }
      
      const fullResponse = tokens.join('')
      expect(tokens.length).toBeGreaterThan(0)
      expect(fullResponse).toContain('React Hooks')
      expect(fullResponse).toContain('useState')
      expect(fullResponse).toContain('useEffect')
    })

    test('流式返回预设回复（TypeScript 相关）', async () => {
      const messages = [{ role: 'user', content: 'typescript 泛型' }]
      const tokens = []
      
      for await (const token of streamChat({ messages })) {
        tokens.push(token)
      }
      
      const fullResponse = tokens.join('')
      expect(tokens.length).toBeGreaterThan(0)
      expect(fullResponse).toContain('TypeScript')
      expect(fullResponse).toContain('泛型')
    })

    test('返回历史消息查询结果', async () => {
      const historyMessages = [
        { role: 'user', content: '第一个问题' },
        { role: 'assistant', content: '第一个回答' },
        { role: 'user', content: '之前问了什么' },
      ]
      const tokens = []
      
      for await (const token of streamChat({ messages: historyMessages })) {
        tokens.push(token)
      }
      
      const fullResponse = tokens.join('')
      expect(fullResponse).toContain('你之前问过的问题')
      expect(fullResponse).toContain('第一个问题')
    })

    test('返回默认回复（无匹配关键词）', async () => {
      const messages = [{ role: 'user', content: '你好' }]
      const tokens = []
      
      for await (const token of streamChat({ messages })) {
        tokens.push(token)
      }
      
      const fullResponse = tokens.join('')
      expect(tokens.length).toBeGreaterThan(0)
      expect(fullResponse).toContain('AI 编程助手')
    })

    test('可以通过 AbortSignal 中断流', async () => {
      const controller = new AbortController()
      const messages = [{ role: 'user', content: 'react hooks 怎么用' }]
      const tokens = []
      
      setTimeout(() => controller.abort(), 50)
      
      try {
        for await (const token of streamChat({ messages, signal: controller.signal })) {
          tokens.push(token)
        }
      } catch (err) {
        expect(err.name).toBe('AbortError')
      }
      
      expect(tokens.length).toBeGreaterThan(0)
    })
  })
})