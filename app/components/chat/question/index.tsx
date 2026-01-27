'use client'
import type { FC } from 'react'
import React, { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import type { IChatItem } from '../type'
import s from '../style.module.css'

import StreamdownMarkdown from '@/app/components/base/streamdown-markdown'
import ImageGallery from '@/app/components/base/image-gallery'
import Tooltip from '@/app/components/base/tooltip'
import Toast from '@/app/components/base/toast'

// 复制图标
const CopyIcon: FC<{ className?: string }> = ({ className }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5.33333 5.33333V3.46667C5.33333 2.71993 5.33333 2.34656 5.47866 2.06135C5.60649 1.81047 5.81047 1.60649 6.06135 1.47866C6.34656 1.33333 6.71993 1.33333 7.46667 1.33333H12.5333C13.2801 1.33333 13.6534 1.33333 13.9387 1.47866C14.1895 1.60649 14.3935 1.81047 14.5214 2.06135C14.6667 2.34656 14.6667 2.71993 14.6667 3.46667V8.53333C14.6667 9.28007 14.6667 9.65344 14.5214 9.93865C14.3935 10.1895 14.1895 10.3935 13.9387 10.5214C13.6534 10.6667 13.2801 10.6667 12.5333 10.6667H10.6667M3.46667 14.6667H8.53333C9.28007 14.6667 9.65344 14.6667 9.93865 14.5214C10.1895 14.3935 10.3935 14.1895 10.5214 13.9387C10.6667 13.6534 10.6667 13.2801 10.6667 12.5333V7.46667C10.6667 6.71993 10.6667 6.34656 10.5214 6.06135C10.3935 5.81047 10.1895 5.60649 9.93865 5.47866C9.65344 5.33333 9.28007 5.33333 8.53333 5.33333H3.46667C2.71993 5.33333 2.34656 5.33333 2.06135 5.47866C1.81047 5.60649 1.60649 5.81047 1.47866 6.06135C1.33333 6.34656 1.33333 6.71993 1.33333 7.46667V12.5333C1.33333 13.2801 1.33333 13.6534 1.47866 13.9387C1.60649 14.1895 1.81047 14.3935 2.06135 14.5214C2.34656 14.6667 2.71993 14.6667 3.46667 14.6667Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

// 编辑图标
const EditIcon: FC<{ className?: string }> = ({ className }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M14 11.9998L13.3332 12.7292C12.9796 13.1159 12.5001 13.3332 12.0001 13.3332C11.5001 13.3332 11.0205 13.1159 10.6669 12.7292C10.3128 12.3432 9.83332 12.1265 9.33345 12.1265C8.83359 12.1265 8.35409 12.3432 7.99998 12.7292M2 13.3332H3.11636C3.44248 13.3332 3.60554 13.3332 3.75899 13.2963C3.89504 13.2637 4.0251 13.2098 4.1444 13.1367C4.27895 13.0542 4.39425 12.9389 4.62486 12.7083L13 4.33316C13.5523 3.78087 13.5523 2.88544 13 2.33316C12.4477 1.78087 11.5523 1.78087 11 2.33316L2.62484 10.7083C2.39424 10.9389 2.27894 11.0542 2.19648 11.1888C2.12338 11.3081 2.0695 11.4381 2.03684 11.5742C2 11.7276 2 11.8907 2 12.2168V13.3332Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

type IQuestionProps = Pick<IChatItem, 'id' | 'content' | 'useCurrentUserAvatar'> & {
  imgSrcs?: string[]
  onEdit?: (id: string, newContent: string) => void
}

const Question: FC<IQuestionProps> = ({ id, content, useCurrentUserAvatar, imgSrcs, onEdit }) => {
  const { t } = useTranslation()
  const userName = ''
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(content)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus()
      textareaRef.current.setSelectionRange(editContent.length, editContent.length)
    }
  }, [isEditing])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content)
      Toast.notify({ type: 'success', message: t('common.operation.copySuccess') as string })
    } catch (err) {
      Toast.notify({ type: 'error', message: 'Copy failed' })
    }
  }

  const handleEdit = () => {
    setEditContent(content)
    setIsEditing(true)
  }

  const handleCancel = () => {
    setEditContent(content)
    setIsEditing(false)
  }

  const handleResend = () => {
    if (editContent.trim() && onEdit) {
      onEdit(id, editContent.trim())
      setIsEditing(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleResend()
    }
    if (e.key === 'Escape') {
      handleCancel()
    }
  }

  return (
    <div className='flex items-start justify-end w-full' key={id}>
      <div className='group max-w-full'>
        <div className={`${s.question} relative text-sm text-gray-900`}>
          {isEditing ? (
            <div className='flex flex-col'>
              <textarea
                ref={textareaRef}
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                onKeyDown={handleKeyDown}
                className='w-[300px] min-h-[80px] p-3 border border-blue-500 rounded-lg text-gray-900 bg-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500'
                placeholder={t('app.chat.inputPlaceholder') as string}
              />
              <div className='flex justify-end gap-2 mt-2'>
                <button
                  onClick={handleCancel}
                  className='px-3 py-1.5 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors'
                >
                  {t('common.operation.cancel')}
                </button>
                <button
                  onClick={handleResend}
                  disabled={!editContent.trim()}
                  className='px-3 py-1.5 text-sm text-white bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-lg transition-colors'
                >
                  {t('common.operation.send')}
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* 操作按钮 - 悬浮显示 */}
              <div className='absolute top-[-10px] left-[-10px] hidden group-hover:flex gap-1 z-10'>
                <Tooltip selector={`question-copy-${id}`} content={t('common.operation.copy') as string}>
                  <button
                    onClick={handleCopy}
                    className='p-1.5 rounded-lg bg-white shadow-md hover:bg-gray-50 text-gray-500 hover:text-gray-700 transition-colors'
                  >
                    <CopyIcon className='w-4 h-4' />
                  </button>
                </Tooltip>
                {onEdit && (
                  <Tooltip selector={`question-edit-${id}`} content={t('common.operation.edit') as string}>
                    <button
                      onClick={handleEdit}
                      className='p-1.5 rounded-lg bg-white shadow-md hover:bg-gray-50 text-gray-500 hover:text-gray-700 transition-colors'
                    >
                      <EditIcon className='w-4 h-4' />
                    </button>
                  </Tooltip>
                )}
              </div>
              <div className={'py-3 px-4 bg-blue-500 rounded-tl-2xl rounded-b-2xl'}>
                {imgSrcs && imgSrcs.length > 0 && (
                  <ImageGallery srcs={imgSrcs} />
                )}
                <StreamdownMarkdown content={content} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default React.memo(Question)
