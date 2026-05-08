const { describe, test, expect, beforeEach, afterEach } = require('vitest')

describe('memoryService', () => {
  let memoryService

  beforeEach(() => {
    process.env.TEST_DB = ':memory:'
    memoryService = require('../../services/memoryService')
  })

  afterEach(() => {
    delete require.cache[require.resolve('../../services/memoryService')]
  })

  describe('session operations', () => {
    test('createSession 创建会话成功', () => {
      const session = memoryService.createSession('测试会话')
      expect(session).toHaveProperty('id')
      expect(session.title).toBe('测试会话')
      expect(session).toHaveProperty('created_at')
    })

    test('createSession 默认标题为空', () => {
      const session = memoryService.createSession()
      expect(session.title).toBe('')
    })

    test('getSession 获取会话', () => {
      const created = memoryService.createSession('测试')
      const found = memoryService.getSession(created.id)
      expect(found).not.toBeNull()
      expect(found.id).toBe(created.id)
      expect(found.title).toBe('测试')
    })

    test('getSession 获取不存在的会话返回 undefined', () => {
      const found = memoryService.getSession('non-existent-id')
      expect(found).toBeUndefined()
    })

    test('getSessions 返回所有会话', () => {
      memoryService.createSession('会话1')
      memoryService.createSession('会话2')
      const sessions = memoryService.getSessions()
      expect(sessions.length).toBeGreaterThanOrEqual(2)
    })

    test('renameSession 重命名会话', () => {
      const session = memoryService.createSession('旧标题')
      memoryService.renameSession(session.id, '新标题')
      const updated = memoryService.getSession(session.id)
      expect(updated.title).toBe('新标题')
    })

    test('deleteSession 删除会话', () => {
      const session = memoryService.createSession('要删除的会话')
      const id = session.id
      memoryService.deleteSession(id)
      const found = memoryService.getSession(id)
      expect(found).toBeUndefined()
    })
  })

  describe('message operations', () => {
    test('addMessage 添加消息', () => {
      const session = memoryService.createSession('测试会话')
      const message = memoryService.addMessage(session.id, 'user', 'Hello')
      
      expect(message).toHaveProperty('id')
      expect(message.session_id).toBe(session.id)
      expect(message.role).toBe('user')
      expect(message.content).toBe('Hello')
      expect(message).toHaveProperty('created_at')
    })

    test('addMessage 第一条用户消息自动更新会话标题', () => {
      const session = memoryService.createSession()
      expect(session.title).toBe('')
      
      memoryService.addMessage(session.id, 'user', '这是第一条消息')
      const updated = memoryService.getSession(session.id)
      expect(updated.title).toBe('这是第一条消息')
    })

    test('getAllMessages 获取会话所有消息', () => {
      const session = memoryService.createSession('测试')
      memoryService.addMessage(session.id, 'user', '消息1')
      memoryService.addMessage(session.id, 'assistant', '回复1')
      memoryService.addMessage(session.id, 'user', '消息2')
      
      const messages = memoryService.getAllMessages(session.id)
      expect(messages.length).toBe(3)
      expect(messages[0].content).toBe('消息1')
      expect(messages[1].content).toBe('回复1')
      expect(messages[2].content).toBe('消息2')
    })

    test('getHistory 获取会话历史（用于 LLM）', () => {
      const session = memoryService.createSession('测试')
      for (let i = 0; i < 25; i++) {
        memoryService.addMessage(session.id, i % 2 === 0 ? 'user' : 'assistant', `消息${i}`)
      }
      
      const history = memoryService.getHistory(session.id)
      expect(history.length).toBe(20)
    })

    test('summarizeHistory 返回历史消息', async () => {
      const session = memoryService.createSession('测试')
      memoryService.addMessage(session.id, 'user', 'Hello')
      memoryService.addMessage(session.id, 'assistant', 'Hi')
      
      const history = await memoryService.summarizeHistory(session.id)
      expect(Array.isArray(history)).toBe(true)
      expect(history.length).toBe(2)
    })
  })
})