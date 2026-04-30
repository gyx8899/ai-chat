/**
 * 可用模型配置（假数据）
 * 真实环境可替换为从 DB 或远程接口读取
 */
const AVAILABLE_MODELS = [
  {
    id: 'mock',
    name: 'Mock 模型',
    provider: 'mock',
    description: '本地预设规则，无需 API Key，适合开发调试',
    icon: '🤖',
  },
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'openai',
    description: 'OpenAI 旗舰多模态模型，综合能力强',
    icon: '✨',
  },
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    provider: 'openai',
    description: 'GPT-4o 轻量版，速度快、成本低',
    icon: '⚡',
  },
  {
    id: 'deepseek-v3',
    name: 'DeepSeek V3',
    provider: 'openai', // OpenAI 兼容接口
    description: '深度求索最新模型，代码能力突出',
    icon: '🔍',
  },
  {
    id: 'qwen-max',
    name: 'Qwen Max',
    provider: 'openai',
    description: '阿里通义千问旗舰版，中文理解强',
    icon: '🌟',
  },
  {
    id: 'llama3:8b',
    name: 'Llama 3 (8B)',
    provider: 'ollama',
    description: '本地 Ollama 部署，数据不出本机',
    icon: '🦙',
  },
]

module.exports = { AVAILABLE_MODELS }
