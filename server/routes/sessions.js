const express = require('express')
const router = express.Router()
const {
  getSessions,
  getSession,
  createSession,
  renameSession,
  deleteSession,
  getAllMessages,
} = require('../services/memoryService')

/** GET /api/sessions - 获取会话列表 */
router.get('/', (req, res) => {
  try {
    res.json(getSessions())
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

/** POST /api/sessions - 新建会话 */
router.post('/', (req, res) => {
  try {
    const session = createSession()
    res.json(session)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

/** PATCH /api/sessions/:id - 重命名会话 */
router.patch('/:id', (req, res) => {
  const { title } = req.body
  if (!title) return res.status(400).json({ error: '缺少 title' })
  try {
    renameSession(req.params.id, title)
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

/** DELETE /api/sessions/:id - 删除会话 */
router.delete('/:id', (req, res) => {
  try {
    deleteSession(req.params.id)
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

/** GET /api/sessions/:id - 获取单条会话 */
router.get('/:id', (req, res) => {
  try {
    const session = getSession(req.params.id)
    if (!session) return res.status(404).json({ error: '会话不存在' })
    res.json(session)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

/** GET /api/sessions/:id/messages - 获取会话消息 */
router.get('/:id/messages', (req, res) => {
  try {
    res.json(getAllMessages(req.params.id))
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
