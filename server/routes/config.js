const express = require('express')
const router = express.Router()
const { AVAILABLE_MODELS } = require('../data/models')

/**
 * 运行时当前配置（内存存储）
 * 初始值从环境变量读取，重启后重置
 */
let currentConfig = {
  modelId: process.env.LLM_MODEL || 'mock',
  provider: process.env.LLM_PROVIDER || 'mock',
}

/** 获取当前配置 */
function getConfig() {
  return currentConfig
}

/** GET /api/config - 返回当前模型 + 可用模型列表 */
router.get('/', (req, res) => {
  res.json({
    current: currentConfig,
    models: AVAILABLE_MODELS,
  })
})

/** POST /api/config - 切换模型 */
router.post('/', (req, res) => {
  const { modelId } = req.body
  if (!modelId) return res.status(400).json({ error: '缺少 modelId' })

  const model = AVAILABLE_MODELS.find(m => m.id === modelId)
  if (!model) return res.status(404).json({ error: `未知模型: ${modelId}` })

  currentConfig = {
    modelId: model.id,
    provider: model.provider,
  }

  console.log(`[config] 切换模型 → ${model.name} (${model.provider})`)
  res.json({ success: true, current: currentConfig })
})

module.exports = { router, getConfig }
