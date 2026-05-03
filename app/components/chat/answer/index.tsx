'use client'
import type { FC } from 'react'
import type { FeedbackFunc } from '../type'
import type { ChatItem, MessageRating, VisionFile } from '@/types/app'
import type { Emoji } from '@/types/tools'
import { HandThumbDownIcon, HandThumbUpIcon } from '@heroicons/react/24/outline'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import StreamdownMarkdown, { cleanReportMarkdown } from '@/app/components/base/streamdown-markdown'
import Toast from '@/app/components/base/toast'
import Tooltip from '@/app/components/base/tooltip'
import WorkflowProcess from '@/app/components/workflow/workflow-process'
import { randomString } from '@/utils/string'
import ImageGallery from '../../base/image-gallery'
import LoadingAnim from '../loading-anim'
import s from '../style.module.css'
import Thought from '../thought'

function OperationBtn({ innerContent, onClick, className }: { innerContent: React.ReactNode, onClick?: () => void, className?: string }) {
  return (
    <div
      className={`relative box-border flex items-center justify-center h-7 w-7 p-0.5 rounded-lg bg-white cursor-pointer text-gray-500 hover:text-gray-800 ${className ?? ''}`}
      style={{ boxShadow: '0px 4px 6px -1px rgba(0, 0, 0, 0.1), 0px 2px 4px -2px rgba(0, 0, 0, 0.05)' }}
      onClick={onClick && onClick}
    >
      {innerContent}
    </div>
  )
}

const OpeningStatementIcon: FC<{ className?: string }> = ({ className }) => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" clipRule="evenodd" d="M6.25002 1C3.62667 1 1.50002 3.12665 1.50002 5.75C1.50002 6.28 1.58702 6.79071 1.7479 7.26801C1.7762 7.35196 1.79285 7.40164 1.80368 7.43828L1.80722 7.45061L1.80535 7.45452C1.79249 7.48102 1.77339 7.51661 1.73766 7.58274L0.911727 9.11152C0.860537 9.20622 0.807123 9.30503 0.770392 9.39095C0.733879 9.47635 0.674738 9.63304 0.703838 9.81878C0.737949 10.0365 0.866092 10.2282 1.05423 10.343C1.21474 10.4409 1.38213 10.4461 1.475 10.4451C1.56844 10.444 1.68015 10.4324 1.78723 10.4213L4.36472 10.1549C4.406 10.1506 4.42758 10.1484 4.44339 10.1472L4.44542 10.147L4.45161 10.1492C4.47103 10.1562 4.49738 10.1663 4.54285 10.1838C5.07332 10.3882 5.64921 10.5 6.25002 10.5C8.87338 10.5 11 8.37335 11 5.75C11 3.12665 8.87338 1 6.25002 1ZM4.48481 4.29111C5.04844 3.81548 5.7986 3.9552 6.24846 4.47463C6.69831 3.9552 7.43879 3.82048 8.01211 4.29111C8.58544 4.76175 8.6551 5.562 8.21247 6.12453C7.93825 6.47305 7.24997 7.10957 6.76594 7.54348C6.58814 7.70286 6.49924 7.78255 6.39255 7.81466C6.30103 7.84221 6.19589 7.84221 6.10436 7.81466C5.99767 7.78255 5.90878 7.70286 5.73098 7.54348C5.24694 7.10957 4.55867 6.47305 4.28444 6.12453C3.84182 5.562 3.92117 4.76675 4.48481 4.29111Z" fill="#667085" />
  </svg>
)

const RatingIcon: FC<{ isLike: boolean }> = ({ isLike }) => {
  return isLike ? <HandThumbUpIcon className="w-4 h-4" /> : <HandThumbDownIcon className="w-4 h-4" />
}

// 复制图标
const CopyIcon: FC<{ className?: string }> = ({ className }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5.33333 5.33333V3.46667C5.33333 2.71993 5.33333 2.34656 5.47866 2.06135C5.60649 1.81046 5.81046 1.60649 6.06135 1.47866C6.34656 1.33333 6.71993 1.33333 7.46667 1.33333H12.5333C13.2801 1.33333 13.6534 1.33333 13.9387 1.47866C14.1895 1.60649 14.3935 1.81046 14.5213 2.06135C14.6667 2.34656 14.6667 2.71993 14.6667 3.46667V8.53333C14.6667 9.28007 14.6667 9.65344 14.5213 9.93865C14.3935 10.1895 14.1895 10.3935 13.9387 10.5213C13.6534 10.6667 13.2801 10.6667 12.5333 10.6667H10.6667M3.46667 14.6667H8.53333C9.28007 14.6667 9.65344 14.6667 9.93865 14.5213C10.1895 14.3935 10.3935 14.1895 10.5213 13.9387C10.6667 13.6534 10.6667 13.2801 10.6667 12.5333V7.46667C10.6667 6.71993 10.6667 6.34656 10.5213 6.06135C10.3935 5.81046 10.1895 5.60649 9.93865 5.47866C9.65344 5.33333 9.28007 5.33333 8.53333 5.33333H3.46667C2.71993 5.33333 2.34656 5.33333 2.06135 5.47866C1.81046 5.60649 1.60649 5.81046 1.47866 6.06135C1.33333 6.34656 1.33333 6.71993 1.33333 7.46667V12.5333C1.33333 13.2801 1.33333 13.6534 1.47866 13.9387C1.60649 14.1895 1.81046 14.3935 2.06135 14.5213C2.34656 14.6667 2.71993 14.6667 3.46667 14.6667Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const PreviewIcon: FC<{ className?: string }> = ({ className }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M1.33334 8C1.33334 8 3.33334 4 8.00001 4C12.6667 4 14.6667 8 14.6667 8C14.6667 8 12.6667 12 8.00001 12C3.33334 12 1.33334 8 1.33334 8Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M8 9.5C8.82843 9.5 9.5 8.82843 9.5 8C9.5 7.17157 8.82843 6.5 8 6.5C7.17157 6.5 6.5 7.17157 6.5 8C6.5 8.82843 7.17157 9.5 8 9.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const DownloadIcon: FC<{ className?: string }> = ({ className }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 2V10M8 10L4.66667 6.66667M8 10L11.3333 6.66667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M2.66667 12.6667H13.3333" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
)

// 重新生成图标
const RegenerateIcon: FC<{ className?: string }> = ({ className }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M1.33333 6.66667C1.33333 6.66667 2.66891 4.84548 3.75736 3.75736C4.84582 2.66891 6.34315 2 8 2C11.3137 2 14 4.68629 14 8C14 11.3137 11.3137 14 8 14C5.28095 14 2.99072 12.1695 2.25469 9.66667M1.33333 6.66667V2.66667M1.33333 6.66667H5.33333" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const EditIcon: FC<{ className?: string }> = ({ className }) => {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M14 11.9998L13.3332 12.7292C12.9796 13.1159 12.5001 13.3332 12.0001 13.3332C11.5001 13.3332 11.0205 13.1159 10.6669 12.7292C10.3128 12.3432 9.83332 12.1265 9.33345 12.1265C8.83359 12.1265 8.35409 12.3432 7.99998 12.7292M2 13.3332H3.11636C3.44248 13.3332 3.60554 13.3332 3.75899 13.2963C3.89504 13.2637 4.0251 13.2098 4.1444 13.1367C4.27895 13.0542 4.39425 12.9389 4.62486 12.7083L13 4.33316C13.5523 3.78087 13.5523 2.88544 13 2.33316C12.4477 1.78087 11.5523 1.78087 11 2.33316L2.62484 10.7083C2.39424 10.9389 2.27894 11.0542 2.19648 11.1888C2.12338 11.3081 2.0695 11.4381 2.03684 11.5742C2 11.7276 2 11.8907 2 12.2168V13.3332Z" stroke="#6B7280" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export const EditIconSolid: FC<{ className?: string }> = ({ className }) => {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path fillRule="evenodd" clip-rule="evenodd" d="M10.8374 8.63108C11.0412 8.81739 11.0554 9.13366 10.8691 9.33747L10.369 9.88449C10.0142 10.2725 9.52293 10.5001 9.00011 10.5001C8.47746 10.5001 7.98634 10.2727 7.63157 9.8849C7.45561 9.69325 7.22747 9.59515 7.00014 9.59515C6.77271 9.59515 6.54446 9.69335 6.36846 9.88517C6.18177 10.0886 5.86548 10.1023 5.66201 9.91556C5.45853 9.72888 5.44493 9.41259 5.63161 9.20911C5.98678 8.82201 6.47777 8.59515 7.00014 8.59515C7.52251 8.59515 8.0135 8.82201 8.36867 9.20911L8.36924 9.20974C8.54486 9.4018 8.77291 9.50012 9.00011 9.50012C9.2273 9.50012 9.45533 9.40182 9.63095 9.20979L10.131 8.66276C10.3173 8.45895 10.6336 8.44476 10.8374 8.63108Z" fill="#6B7280" />
      <path fillRule="evenodd" clip-rule="evenodd" d="M7.89651 1.39656C8.50599 0.787085 9.49414 0.787084 10.1036 1.39656C10.7131 2.00604 10.7131 2.99419 10.1036 3.60367L3.82225 9.88504C3.81235 9.89494 3.80254 9.90476 3.79281 9.91451C3.64909 10.0585 3.52237 10.1855 3.3696 10.2791C3.23539 10.3613 3.08907 10.4219 2.93602 10.4587C2.7618 10.5005 2.58242 10.5003 2.37897 10.5001C2.3652 10.5001 2.35132 10.5001 2.33732 10.5001H1.50005C1.22391 10.5001 1.00005 10.2763 1.00005 10.0001V9.16286C1.00005 9.14886 1.00004 9.13497 1.00003 9.1212C0.999836 8.91776 0.999669 8.73838 1.0415 8.56416C1.07824 8.4111 1.13885 8.26479 1.22109 8.13058C1.31471 7.97781 1.44166 7.85109 1.58566 7.70736C1.5954 7.69764 1.60523 7.68783 1.61513 7.67793L7.89651 1.39656Z" fill="#6B7280" />
    </svg>
  )
}

const IconWrapper: FC<{ children: React.ReactNode | string }> = ({ children }) => {
  return (
    <div className="rounded-lg h-6 w-6 flex items-center justify-center hover:bg-gray-100">
      {children}
    </div>
  )
}

const stripThinkTags = (text: string) => {
  return text.replace(/<think>[\s\S]*?<\/think>/gi, '').trim()
}

const getReportContent = (text: string) => {
  return cleanReportMarkdown(stripThinkTags(text))
}

const isReportContent = (text: string) => {
  return /岗位要求分析报告/.test(text)
}

const getReportTitle = (text: string) => {
  const cleanedContent = getReportContent(text)
  const headingMatch = cleanedContent.match(/^#\s*(?:📄\s*)?(.+)$/m)
  const inlineTitleMatch = cleanedContent.match(/岗位要求分析报告[:：]\s*([^\n]+)/)
  const title = headingMatch?.[1] || (inlineTitleMatch ? `岗位要求分析报告：${inlineTitleMatch[1]}` : '岗位要求分析报告')

  return title
    .replace(/[*_`#]/g, '')
    .trim()
}

const toSafeFileName = (title: string) => {
  return title
    .replace(/[\\/:*?"<>|]/g, '-')
    .replace(/\s+/g, ' ')
    .trim() || '岗位要求分析报告'
}

const downloadMarkdown = (content: string, title: string) => {
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${toSafeFileName(title)}.md`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

interface IAnswerProps {
  item: ChatItem
  feedbackDisabled: boolean
  onFeedback?: FeedbackFunc
  onRegenerate?: (messageId: string) => void
  isResponding?: boolean
  allToolIcons?: Record<string, string | Emoji>
  suggestionClick?: (suggestion: string) => void
}

// 反馈对话框组件
const FeedbackModal: FC<{
  isOpen: boolean
  onClose: () => void
  onSubmit: (content: string) => void
}> = ({ isOpen, onClose, onSubmit }) => {
  const { t } = useTranslation()
  const [feedbackContent, setFeedbackContent] = useState('')

  if (!isOpen) { return null }

  const handleSubmit = () => {
    onSubmit(feedbackContent)
    setFeedbackContent('')
    onClose()
  }

  const handleCancel = () => {
    setFeedbackContent('')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl p-6 w-[480px] max-w-[90vw] shadow-xl">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900">{t('common.feedback.title')}</h3>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
        <p className="text-sm text-gray-500 mb-4">{t('common.feedback.description')}</p>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('common.feedback.contentLabel')}
          </label>
          <textarea
            value={feedbackContent}
            onChange={e => setFeedbackContent(e.target.value)}
            placeholder={t('common.feedback.placeholder') as string}
            className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
          />
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {t('common.operation.cancel')}
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors"
          >
            {t('common.feedback.submit')}
          </button>
        </div>
      </div>
    </div>
  )
}

const ReportPreviewModal: FC<{
  content: string
  title: string
  onClose: () => void
  onExport: () => void
}> = ({ content, title, onClose, onExport }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6">
      <div className="flex h-[85vh] w-full max-w-[1080px] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between gap-4 border-b border-gray-200 px-5 py-4">
          <div className="min-w-0">
            <div className="truncate text-base font-semibold text-gray-900">{title}</div>
            <div className="mt-0.5 text-xs text-gray-500">报告预览</div>
          </div>
          <div className="flex flex-shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={onExport}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              导出 Markdown
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-3 py-2 text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            >
              关闭
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-auto px-6 py-5">
          <StreamdownMarkdown content={content} className="mx-auto max-w-[960px]" />
        </div>
      </div>
    </div>
  )
}

// 组件需要维护自己的状态来控制是否显示输入组件
const Answer: FC<IAnswerProps> = ({
  item,
  feedbackDisabled = false,
  onFeedback,
  onRegenerate,
  isResponding,
  allToolIcons,
  suggestionClick = () => { },
}) => {
  const { id, content, feedback, agent_thoughts, workflowProcess, suggestedQuestions = [] } = item
  const isAgentMode = !!agent_thoughts && agent_thoughts.length > 0

  const { t } = useTranslation()

  // 反馈对话框状态
  const [showFeedbackModal, setShowFeedbackModal] = useState(false)
  const [showReportPreview, setShowReportPreview] = useState(false)
  const reportContent = getReportContent(content)
  const reportTitle = getReportTitle(content)
  const shouldShowReportActions = !isAgentMode && isReportContent(content)

  // 复制回答内容
  const handleCopy = async () => {
    try {
      // 获取纯文本内容（如果是 agent 模式，合并所有 thought）
      let textContent = content
      if (isAgentMode && agent_thoughts) {
        textContent = agent_thoughts.map(item => item.thought).filter(Boolean).join('\n')
      }
      await navigator.clipboard.writeText(textContent)
      Toast.notify({ type: 'success', message: t('common.operation.copySuccess') as string })
    } catch (e) {
      console.error('Failed to copy:', e)
    }
  }

  // 重新生成
  const handleRegenerate = () => {
    onRegenerate?.(id)
  }

  const handleExportReport = () => {
    downloadMarkdown(reportContent, reportTitle)
  }

  // 处理不喜欢按钮点击 - 打开反馈对话框
  const handleDislike = () => {
    setShowFeedbackModal(true)
  }

  // 提交反馈内容
  const handleSubmitFeedback = (feedbackContent: string) => {
    onFeedback?.(id, { rating: 'dislike', content: feedbackContent })
  }

  /**
   * Render feedback results (distinguish between users and administrators)
   * User reviews cannot be cancelled in Console
   * @param rating feedback result
   * @param isUserFeedback Whether it is user's feedback
   * @returns comp
   */
  const renderFeedbackRating = (rating: MessageRating | undefined) => {
    if (!rating) { return null }

    const isLike = rating === 'like'
    const ratingIconClassname = isLike ? 'text-primary-600 bg-primary-100 hover:bg-primary-200' : 'text-red-600 bg-red-100 hover:bg-red-200'

    return (
      <Tooltip
        selector={`user-feedback-${randomString(16)}`}
        content={isLike ? t('common.operation.cancelLike') as string : t('common.operation.cancelDislike') as string}
      >
        <div
          className="relative box-border flex items-center justify-center h-7 w-7 p-0.5 rounded-lg bg-white cursor-pointer text-gray-500 hover:text-gray-800"
          style={{ boxShadow: '0px 4px 6px -1px rgba(0, 0, 0, 0.1), 0px 2px 4px -2px rgba(0, 0, 0, 0.05)' }}
          onClick={async () => {
            await onFeedback?.(id, { rating: null })
          }}
        >
          <div className={`${ratingIconClassname} rounded-lg h-6 w-6 flex items-center justify-center`}>
            <RatingIcon isLike={isLike} />
          </div>
        </div>
      </Tooltip>
    )
  }

  /**
   * Different scenarios have different operation items.
   * @returns comp
   */
  const renderItemOperation = () => {
    // 反馈按钮组（赞同/反对）
    const feedbackButtons = () => {
      return feedback?.rating
        ? null
        : (
          <div className="flex gap-1">
            <Tooltip selector={`user-feedback-${randomString(16)}`} content={t('common.operation.like') as string}>
              {OperationBtn({ innerContent: <IconWrapper><RatingIcon isLike={true} /></IconWrapper>, onClick: () => onFeedback?.(id, { rating: 'like' }) })}
            </Tooltip>
            <Tooltip selector={`user-feedback-${randomString(16)}`} content={t('common.operation.dislike') as string}>
              {OperationBtn({ innerContent: <IconWrapper><RatingIcon isLike={false} /></IconWrapper>, onClick: handleDislike })}
            </Tooltip>
          </div>
        )
    }

    // 操作按钮组（复制/重新生成）
    const actionButtons = () => {
      return (
        <div className="flex gap-1">
          {shouldShowReportActions && (
            <>
              <Tooltip selector={`preview-report-${randomString(16)}`} content="预览报告">
                {OperationBtn({ innerContent: <IconWrapper><PreviewIcon className="w-4 h-4" /></IconWrapper>, onClick: () => setShowReportPreview(true) })}
              </Tooltip>
              <Tooltip selector={`export-report-${randomString(16)}`} content="导出 Markdown">
                {OperationBtn({ innerContent: <IconWrapper><DownloadIcon className="w-4 h-4" /></IconWrapper>, onClick: handleExportReport })}
              </Tooltip>
            </>
          )}
          <Tooltip selector={`copy-answer-${randomString(16)}`} content={t('common.operation.copy') as string}>
            {OperationBtn({ innerContent: <IconWrapper><CopyIcon className="w-4 h-4" /></IconWrapper>, onClick: handleCopy })}
          </Tooltip>
          {onRegenerate && (
            <Tooltip selector={`regenerate-${randomString(16)}`} content={t('common.operation.regenerate') as string}>
              {OperationBtn({ innerContent: <IconWrapper><RegenerateIcon className="w-4 h-4" /></IconWrapper>, onClick: handleRegenerate })}
            </Tooltip>
          )}
        </div>
      )
    }

    return (
      <div className={`${s.itemOperation} flex gap-2`}>
        {feedbackButtons()}
        {actionButtons()}
      </div>
    )
  }

  const getImgs = (list?: VisionFile[]) => {
    if (!list) { return [] }
    return list.filter(file => file.type === 'image' && file.belongs_to === 'assistant')
  }

  const agentModeAnswer = (
    <div>
      {agent_thoughts?.map((item, index) => (
        <div key={index}>
          {item.thought && (
            <StreamdownMarkdown content={item.thought} />
          )}
          {/* {item.tool} */}
          {/* perhaps not use tool */}
          {!!item.tool && (
            <Thought
              thought={item}
              allToolIcons={allToolIcons || {}}
              isFinished={!!item.observation || !isResponding}
            />
          )}

          {getImgs(item.message_files).length > 0 && (
            <ImageGallery srcs={getImgs(item.message_files).map(item => item.url)} />
          )}
        </div>
      ))}
    </div>
  )

  return (
    <div key={id} className="w-full">
      <div className="flex items-start justify-start">
        <div className={`${s.answerWrap} max-w-full`}>
          <div className={`${s.answer} relative text-sm text-gray-900`}>
            <div className={`py-3 px-4 bg-white rounded-tr-2xl rounded-b-2xl ${workflowProcess && 'min-w-[480px]'}`}>
              {workflowProcess && (
                <WorkflowProcess data={workflowProcess} hideInfo />
              )}
              {(isResponding && (isAgentMode ? (!content && (agent_thoughts || []).filter(item => !!item.thought || !!item.tool).length === 0) : !content))
                ? (
                  <div className="flex items-center justify-center w-6 h-5">
                    <LoadingAnim type="text" />
                  </div>
                )
                : (isAgentMode
                  ? agentModeAnswer
                  : (
                    <StreamdownMarkdown content={content} />
                  ))}
              {suggestedQuestions.length > 0 && (
                <div className="mt-3">
                  <div className="flex gap-2 mt-1 flex-wrap">
                    {suggestedQuestions.map((suggestion, index) => (
                      <div
                        key={index}
                        className="flex items-center px-3 py-2 bg-white border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 hover:border-gray-300 transition-colors max-w-full"
                        onClick={() => suggestionClick(suggestion)}
                      >
                        <span className="text-sm text-gray-700 break-words whitespace-pre-wrap">{suggestion}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="absolute top-[-14px] right-[-14px] flex flex-row justify-end gap-1">
              {!feedbackDisabled && !item.feedbackDisabled && renderItemOperation()}
              {/* User feedback must be displayed */}
              {!feedbackDisabled && renderFeedbackRating(feedback?.rating)}
            </div>
          </div>
        </div>
      </div>

      {/* 反馈对话框 */}
      <FeedbackModal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        onSubmit={handleSubmitFeedback}
      />
      {showReportPreview && (
        <ReportPreviewModal
          content={reportContent}
          title={reportTitle}
          onClose={() => setShowReportPreview(false)}
          onExport={handleExportReport}
        />
      )}
    </div>
  )
}
export default React.memo(Answer)
