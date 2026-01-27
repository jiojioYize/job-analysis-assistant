'use client'
import { Streamdown } from 'streamdown'
import 'katex/dist/katex.min.css'
import { ThinkBlock } from './think-block'

interface StreamdownMarkdownProps {
  content: string
  className?: string
}

// 解析内容，分离 think 标签和普通内容
interface ContentPart {
  type: 'think' | 'text'
  content: string
}

function parseContent(content: string): ContentPart[] {
  const parts: ContentPart[] = []
  const thinkRegex = /<think>([\s\S]*?)<\/think>/gi
  let lastIndex = 0
  let match

  while ((match = thinkRegex.exec(content)) !== null) {
    // 添加 think 标签之前的文本
    if (match.index > lastIndex) {
      const text = content.slice(lastIndex, match.index).trim()
      if (text)
        parts.push({ type: 'text', content: text })
    }
    // 添加 think 内容
    const thinkContent = match[1].trim()
    if (thinkContent)
      parts.push({ type: 'think', content: thinkContent })

    lastIndex = match.index + match[0].length
  }

  // 添加剩余的文本
  if (lastIndex < content.length) {
    const text = content.slice(lastIndex).trim()
    if (text)
      parts.push({ type: 'text', content: text })
  }

  return parts
}

// 检查是否有未闭合的 think 标签（流式输出时）
function hasUnclosedThinkTag(content: string): { hasUnclosed: boolean; thinkContent: string; beforeContent: string } {
  const openTag = '<think>'
  const closeTag = '</think>'
  const lastOpenIndex = content.lastIndexOf(openTag)
  const lastCloseIndex = content.lastIndexOf(closeTag)

  if (lastOpenIndex > lastCloseIndex) {
    // 有未闭合的 think 标签
    const beforeContent = content.slice(0, lastOpenIndex).trim()
    const thinkContent = content.slice(lastOpenIndex + openTag.length).trim()
    return { hasUnclosed: true, thinkContent, beforeContent }
  }

  return { hasUnclosed: false, thinkContent: '', beforeContent: content }
}

export function StreamdownMarkdown({ content, className = '' }: StreamdownMarkdownProps) {
  const unclosedCheck = hasUnclosedThinkTag(content)

  if (unclosedCheck.hasUnclosed) {
    // 流式输出时有未闭合的 think 标签，显示正在思考
    return (
      <div className={`markdown-body streamdown-markdown ${className}`}>
        {unclosedCheck.beforeContent && (
          <Streamdown>{unclosedCheck.beforeContent}</Streamdown>
        )}
        <ThinkBlock content={unclosedCheck.thinkContent + ' ...'} defaultExpanded={true} />
      </div>
    )
  }

  // 解析已完成的内容
  const parts = parseContent(content)

  return (
    <div className={`markdown-body streamdown-markdown ${className}`}>
      {parts.map((part, index) => (
        part.type === 'think'
          ? (
            <ThinkBlock key={index} content={part.content} />
          )
          : (
            <Streamdown key={index}>{part.content}</Streamdown>
          )
      ))}
    </div>
  )
}

export default StreamdownMarkdown
