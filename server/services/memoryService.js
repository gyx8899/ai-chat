const Database = require('better-sqlite3')
const path = require('path')
const { randomUUID } = require('crypto')

const DB_PATH = process.env.TEST_DB || path.join(__dirname, '../data/chat.db')
const db = new Database(DB_PATH)

// 初始化数据库表
db.exec(`
  CREATE TABLE IF NOT EXISTS sessions (
    id         TEXT PRIMARY KEY,
    title      TEXT NOT NULL DEFAULT '新对话',
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS messages (
    id         TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    role       TEXT NOT NULL,
    content    TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
  );
`)

/** 获取所有会话列表（按创建时间倒序） */
function getSessions() {
  return db.prepare('SELECT * FROM sessions ORDER BY created_at DESC').all()
}

/** 获取单条会话 */
function getSession(id) {
  return db.prepare('SELECT * FROM sessions WHERE id = ?').get(id)
}

/** 新建会话 */
function createSession(title = '') {
  const id = randomUUID()
  const now = Date.now()
  db.prepare('INSERT INTO sessions (id, title, created_at) VALUES (?, ?, ?)').run(id, title, now)
  return { id, title, created_at: now }
}

/** 重命名会话 */
function renameSession(id, title) {
  db.prepare('UPDATE sessions SET title = ? WHERE id = ?').run(title, id)
}

/** 删除会话（CASCADE 自动删除消息） */
function deleteSession(id) {
  db.prepare('DELETE FROM sessions WHERE id = ?').run(id)
}

/**
 * 获取会话历史消息（用于传给 LLM）
 * 仅取最近 20 条（10 轮对话）
 */
function getHistory(sessionId) {
  return db
    .prepare('SELECT role, content FROM messages WHERE session_id = ? ORDER BY created_at ASC')
    .all(sessionId)
    .slice(-20) // 最多 20 条（10 轮）
}

/**
 * 获取会话全量消息（用于前端展示）
 */
function getAllMessages(sessionId) {
  return db
    .prepare(
      'SELECT id, session_id, role, content, created_at FROM messages WHERE session_id = ? ORDER BY created_at ASC'
    )
    .all(sessionId)
}

/** 添加一条消息 */
function addMessage(sessionId, role, content) {
  const id = randomUUID()
  const now = Date.now()
  db.prepare(
    'INSERT INTO messages (id, session_id, role, content, created_at) VALUES (?, ?, ?, ?, ?)'
  ).run(id, sessionId, role, content, now)
  // 第一条用户消息时自动更新会话标题（取完整内容，前端负责截断展示）
  if (role === 'user') {
    const session = db.prepare('SELECT title FROM sessions WHERE id = ?').get(sessionId)
    if (session && session.title === '') {
      db.prepare('UPDATE sessions SET title = ? WHERE id = ?').run(content, sessionId)
    }
  }
  return { id, session_id: sessionId, role, content, created_at: now }
}

/**
 * 历史摘要（预留接口）
 * mock 模式：直接返回 getHistory 结果
 * 真实模式：可替换为调用 LLM 对历史进行摘要压缩
 */
async function summarizeHistory(sessionId) {
  return getHistory(sessionId)
}

module.exports = {
  getSessions,
  getSession,
  createSession,
  renameSession,
  deleteSession,
  getHistory,
  getAllMessages,
  addMessage,
  summarizeHistory,
}
