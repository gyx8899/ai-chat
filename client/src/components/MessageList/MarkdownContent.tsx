import { memo } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { CopyButton } from './CopyButton'

interface MarkdownContentProps {
  content: string
  isDark: boolean
}

export const MarkdownContent = memo(function MarkdownContent({
  content,
  isDark,
}: MarkdownContentProps) {
  if (!content) return null

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        code({ className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || '')
          if (!match) {
            return (
              <code className={className} {...props}>
                {children}
              </code>
            )
          }
          const codeText = String(children).replace(/\n$/, '')
          const lang = match[1]
          return (
            <div className="relative group not-prose my-3 rounded-md overflow-hidden border border-border bg-muted/40">
              {/* Code block header */}
              <div className="flex items-center justify-between px-3 py-1.5 border-b border-border bg-muted/50">
                <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  {lang}
                </span>
                <CopyButton text={codeText} />
              </div>
              <SyntaxHighlighter
                style={isDark ? oneDark : oneLight}
                language={lang}
                PreTag="div"
                codeTagProps={{
                  style: {
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                  },
                }}
                customStyle={{
                  margin: 0,
                  padding: '12px 14px',
                  background: 'transparent',
                  fontSize: '12.5px',
                  lineHeight: '1.6',
                }}
              >
                {codeText}
              </SyntaxHighlighter>
            </div>
          )
        },
      }}
    >
      {content}
    </ReactMarkdown>
  )
})

MarkdownContent.displayName = 'MarkdownContent'
