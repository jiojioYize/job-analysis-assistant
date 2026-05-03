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

  for (let match = thinkRegex.exec(content); match !== null; match = thinkRegex.exec(content)) {
    // 添加 think 标签之前的文本
    if (match.index > lastIndex) {
      const text = content.slice(lastIndex, match.index).trim()
      if (text)
      { parts.push({ type: 'text', content: text }) }
    }
    // 添加 think 内容
    const thinkContent = match[1].trim()
    if (thinkContent)
    { parts.push({ type: 'think', content: thinkContent }) }

    lastIndex = match.index + match[0].length
  }

  // 添加剩余的文本
  if (lastIndex < content.length) {
    const text = content.slice(lastIndex).trim()
    if (text)
    { parts.push({ type: 'text', content: text }) }
  }

  return parts
}

// 检查是否有未闭合的 think 标签（流式输出时）
function hasUnclosedThinkTag(content: string): { hasUnclosed: boolean, thinkContent: string, beforeContent: string } {
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

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function getReportSection(content: string, title: string) {
  const headingPattern = new RegExp(`^##\\s*.*${escapeRegExp(title)}.*$`, 'm')
  const headingMatch = content.match(headingPattern)

  if (!headingMatch || headingMatch.index === undefined)
  { return null }

  const start = headingMatch.index
  const headingEnd = start + headingMatch[0].length
  const rest = content.slice(headingEnd)
  const nextSectionMatch = rest.match(/\n##\s+/)
  const end = nextSectionMatch?.index === undefined
    ? content.length
    : headingEnd + nextSectionMatch.index

  return {
    start,
    end,
    body: content.slice(headingEnd, end),
  }
}

function removeSection(content: string, start: number, end: number) {
  return `${content.slice(0, start).trimEnd()}\n\n${content.slice(end).trimStart()}`.trim()
}

function hasCompletionLabel(content: string) {
  return /【\s*⚠️?\s*(?:完全补全|部分补全)\s*】/.test(content)
}

function isEmptyDifficultItemsBody(body: string) {
  const normalized = body
    .replace(/这些要求并非广泛认知知识，请仔细核查[:：]?/g, '')
    .replace(/[`\s>_*|:：.,，。-]/g, '')
    .trim()

  return /^(?:无|暂无|没有|无疑难项|暂无疑难项|没有疑难项)?$/.test(normalized)
}

export function cleanReportMarkdown(content: string) {
  let result = content

  const labelSection = getReportSection(result, '标注含义说明')
  if (labelSection) {
    const bodyBeforeLabelSection = result.slice(0, labelSection.start)

    if (!hasCompletionLabel(bodyBeforeLabelSection))
    { result = removeSection(result, labelSection.start, labelSection.end) }
  }

  const difficultItemsSection = getReportSection(result, '疑难项')
  if (difficultItemsSection && isEmptyDifficultItemsBody(difficultItemsSection.body))
  { result = removeSection(result, difficultItemsSection.start, difficultItemsSection.end) }

  return result
}

export function StreamdownMarkdown({ content, className = '' }: StreamdownMarkdownProps) {
  const unclosedCheck = hasUnclosedThinkTag(content)

  if (unclosedCheck.hasUnclosed) {
    const beforeContent = cleanReportMarkdown(unclosedCheck.beforeContent)

    // 流式输出时有未闭合的 think 标签，显示正在思考
    return (
      <div className={`markdown-body streamdown-markdown overflow-hidden break-words ${className}`}>
        {beforeContent && (
          <Streamdown>{beforeContent}</Streamdown>
        )}
        <ThinkBlock content={`${unclosedCheck.thinkContent} ...`} defaultExpanded={true} isStreaming />
      </div>
    )
  }

  // 解析已完成的内容
  const parts = parseContent(content)

  return (
    <div className={`markdown-body streamdown-markdown overflow-hidden break-words ${className}`}>
      {parts.map((part, index) => (
        part.type === 'think'
          ? (
            <ThinkBlock key={index} content={part.content} />
          )
          : (
            <Streamdown key={index}>{cleanReportMarkdown(part.content)}</Streamdown>
          )
      ))}
    </div>
  )
}

export default StreamdownMarkdown
