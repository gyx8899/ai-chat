export interface ImageAttachment {
  type: 'image'
  name: string
  dataUrl: string
  size: number
}

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  created_at?: number
  ragHint?: string // RAG 检索到的知识标签
  isError?: boolean // 标记该消息为错误气泡（API 错误时替换空白 assistant 消息）
  errorText?: string // 错误描述文字
  attachments?: ImageAttachment[] // 用户上传的图片附件
}

export interface Session {
  id: string
  title: string
  created_at: number
  messages: Message[]
}

export interface Model {
  id: string
  name: string
  provider: string
  description: string
  icon: string
}

export interface ModelConfig {
  modelId: string
  provider: string
}
