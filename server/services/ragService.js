const knowledgeBase = require('../data/knowledge.js')

/**
 * 根据用户查询从知识库中检索相关内容
 * 通过关键词交集匹配，返回最相关的 1~2 条知识片段
 * @param {string} query - 用户输入
 * @returns {{ hint: string, context: string } | null}
 */
function retrieveContext(query) {
  const queryLower = query.toLowerCase()

  // 计算每条知识的匹配分数（关键词命中数量）
  const scored = knowledgeBase.map(item => {
    const matchCount = item.keywords.filter(kw => queryLower.includes(kw.toLowerCase())).length
    return { ...item, score: matchCount }
  })

  // 过滤出有匹配的条目，按分数降序取前 2 条
  const matched = scored
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 2)

  if (matched.length === 0) return null

  const hint = matched.map(item => item.id).join(', ')
  const context = matched.map(item => item.content).join('\n\n---\n\n')

  return { hint, context }
}

module.exports = { retrieveContext }
