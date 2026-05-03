'use client'
import React, { useState, useRef, useEffect, useMemo } from 'react'
import type { FC } from 'react'
import { useTranslation } from 'react-i18next'
import {
  ChatBubbleOvalLeftEllipsisIcon,
  EllipsisHorizontalIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/react/24/outline'
import { ChatBubbleOvalLeftEllipsisIcon as ChatBubbleOvalLeftEllipsisSolidIcon, PlusIcon } from '@heroicons/react/24/solid'
import Button from '@/app/components/base/button'
import AppIcon from '@/app/components/base/app-icon'
import type { ConversationItem } from '@/types/app'

function classNames(...classes: any[]) {
  return classes.filter(Boolean).join(' ')
}

const MAX_CONVERSATION_LENTH = 20
const PINNED_CONVERSATIONS_KEY = 'pinnedConversations'
const SIDEBAR_COLLAPSED_KEY = 'sidebarCollapsed'
const DAY_IN_MS = 24 * 60 * 60 * 1000

interface ConversationGroup {
  key: string
  label: string
  items: ConversationItem[]
}

const getConversationTimestamp = (item: ConversationItem) => {
  const rawTime = item.updated_at ?? item.created_at

  if (typeof rawTime === 'number')
  { return rawTime < 1e12 ? rawTime * 1000 : rawTime }

  if (typeof rawTime === 'string') {
    const parsedNumber = Number(rawTime)
    if (!Number.isNaN(parsedNumber))
    { return parsedNumber < 1e12 ? parsedNumber * 1000 : parsedNumber }

    const parsedDate = Date.parse(rawTime)
    if (!Number.isNaN(parsedDate))
    { return parsedDate }
  }

  return 0
}

const getConversationGroup = (timestamp: number) => {
  if (!timestamp)
  { return { key: 'earlier', label: '更早' } }

  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  const todayStartTime = todayStart.getTime()
  if (timestamp >= todayStartTime)
  { return { key: 'today', label: '今天' } }

  if (timestamp >= todayStartTime - DAY_IN_MS)
  { return { key: 'yesterday', label: '昨天' } }

  if (timestamp >= todayStartTime - 7 * DAY_IN_MS)
  { return { key: 'last-7-days', label: '近 7 天' } }

  if (timestamp >= todayStartTime - 30 * DAY_IN_MS)
  { return { key: 'last-30-days', label: '近 30 天' } }

  return { key: 'earlier', label: '更早' }
}

const groupConversationsByTime = (items: ConversationItem[]): ConversationGroup[] => {
  const groupOrder = ['today', 'yesterday', 'last-7-days', 'last-30-days', 'earlier']
  const groupMap = new Map<string, ConversationGroup>()

  items
    .map((item, index) => ({
      item,
      index,
      timestamp: getConversationTimestamp(item),
    }))
    .sort((a, b) => {
      if (b.timestamp !== a.timestamp)
      { return b.timestamp - a.timestamp }

      return a.index - b.index
    })
    .forEach(({ item, timestamp }) => {
      const group = getConversationGroup(timestamp)
      const existingGroup = groupMap.get(group.key)

      if (existingGroup) {
        existingGroup.items.push(item)
      }
      else {
        groupMap.set(group.key, {
          key: group.key,
          label: group.label,
          items: [item],
        })
      }
    })

  return groupOrder
    .map(key => groupMap.get(key))
    .filter((group): group is ConversationGroup => Boolean(group))
}

// 获取置顶列表
const getPinnedIds = (): string[] => {
  if (typeof window === 'undefined') { return [] }
  try {
    const stored = localStorage.getItem(PINNED_CONVERSATIONS_KEY)
    return stored ? JSON.parse(stored) : []
  }
  catch {
    return []
  }
}

// 保存置顶列表
const savePinnedIds = (ids: string[]) => {
  if (typeof window === 'undefined') { return }
  localStorage.setItem(PINNED_CONVERSATIONS_KEY, JSON.stringify(ids))
}

// 获取收起状态
const getCollapsedState = (): boolean => {
  if (typeof window === 'undefined') { return false }
  try {
    return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === 'true'
  }
  catch {
    return false
  }
}

// 保存收起状态
const saveCollapsedState = (collapsed: boolean) => {
  if (typeof window === 'undefined') { return }
  localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(collapsed))
}

// 置顶图标组件
const PinIcon: FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="17" x2="12" y2="22" />
    <path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z" />
  </svg>
)

// 收起侧边栏图标
const CollapseIcon: FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <line x1="9" y1="3" x2="9" y2="21" />
    <polyline points="14 9 11 12 14 15" />
  </svg>
)

// 展开侧边栏图标
const ExpandIcon: FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <line x1="9" y1="3" x2="9" y2="21" />
    <polyline points="13 9 16 12 13 15" />
  </svg>
)

export interface ISidebarProps {
  copyRight: string
  currentId: string
  onCurrentIdChange: (id: string) => void
  list: ConversationItem[]
  onRename?: (id: string, name: string) => void
  onDelete?: (id: string) => void
  appName?: string
  isCollapsed?: boolean
  onCollapseChange?: (collapsed: boolean) => void
}

// 操作菜单组件
const ActionMenu: FC<{
  conversationId: string
  conversationName: string
  isPinned: boolean
  onRename?: (id: string, name: string) => void
  onDelete?: (id: string) => void
  onTogglePin?: (id: string) => void
}> = ({ conversationId, conversationName, isPinned, onRename, onDelete, onTogglePin }) => {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const [showRenameModal, setShowRenameModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [newName, setNewName] = useState(conversationName)
  const menuRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // 点击外部关闭菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // 自动聚焦输入框
  useEffect(() => {
    if (showRenameModal && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [showRenameModal])

  const handleRename = () => {
    setShowRenameModal(true)
    setIsOpen(false)
  }

  const handleDelete = () => {
    setShowDeleteModal(true)
    setIsOpen(false)
  }

  const handleDeleteConfirm = () => {
    onDelete?.(conversationId)
    setShowDeleteModal(false)
  }

  const handleTogglePin = () => {
    onTogglePin?.(conversationId)
    setIsOpen(false)
  }

  const handleRenameSubmit = () => {
    if (newName.trim() && newName !== conversationName) {
      onRename?.(conversationId, newName.trim())
    }
    setShowRenameModal(false)
  }

  return (
    <>
      <div className="relative" ref={menuRef}>
        <button
          onClick={(e) => {
            e.stopPropagation()
            setIsOpen(!isOpen)
          }}
          className="p-1 rounded hover:bg-gray-200 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <EllipsisHorizontalIcon className="h-4 w-4 text-gray-500" />
        </button>
        {isOpen && (
          <div className="absolute right-0 mt-1 w-32 bg-white rounded-md shadow-lg border border-gray-200 z-50">
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleTogglePin()
              }}
              className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <PinIcon className="h-4 w-4 mr-2" />
              {isPinned ? t('app.chat.unpin') : t('app.chat.pin')}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleRename()
              }}
              className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <PencilIcon className="h-4 w-4 mr-2" />
              {t('app.chat.rename')}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleDelete()
              }}
              className="w-full flex items-center px-3 py-2 text-sm text-red-600 hover:bg-gray-100"
            >
              <TrashIcon className="h-4 w-4 mr-2" />
              {t('app.chat.delete')}
            </button>
          </div>
        )}
      </div>

      {/* 删除确认弹窗 */}
      {showDeleteModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowDeleteModal(false)}
        >
          <div
            className="bg-white rounded-lg p-5 w-80 shadow-xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mr-3">
                <TrashIcon className="h-5 w-5 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">{t('app.chat.deleteTitle')}</h3>
            </div>
            <p className="text-sm text-gray-500 mb-5">{t('app.chat.deleteDescription')}</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md"
              >
                {t('common.operation.cancel')}
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 text-sm text-white bg-red-600 hover:bg-red-700 rounded-md"
              >
                {t('app.chat.delete')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 重命名弹窗 */}
      {showRenameModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowRenameModal(false)}
        >
          <div
            className="bg-white rounded-lg p-4 w-80 shadow-xl"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-lg font-medium mb-3">{t('app.chat.renameTitle')}</h3>
            <input
              ref={inputRef}
              type="text"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') { handleRenameSubmit() }
                if (e.key === 'Escape') { setShowRenameModal(false) }
              }}
              placeholder={t('app.chat.renamePlaceholder') as string}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 mb-4"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowRenameModal(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md"
              >
                取消
              </button>
              <button
                onClick={handleRenameSubmit}
                className="px-4 py-2 text-sm text-white bg-primary-600 hover:bg-primary-700 rounded-md"
              >
                确定
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

const Sidebar: FC<ISidebarProps> = ({
  copyRight,
  currentId,
  onCurrentIdChange,
  list,
  onRename,
  onDelete,
  appName = '',
  isCollapsed: externalIsCollapsed,
  onCollapseChange,
}) => {
  const { t } = useTranslation()
  const [pinnedIds, setPinnedIds] = useState<string[]>([])
  const [internalIsCollapsed, setInternalIsCollapsed] = useState(false)

  // 如果外部传入了 isCollapsed，使用外部状态；否则使用内部状态
  const isCollapsed = externalIsCollapsed !== undefined ? externalIsCollapsed : internalIsCollapsed

  // 初始化时从 localStorage 读取置顶列表和收起状态
  useEffect(() => {
    setPinnedIds(getPinnedIds())
    const savedState = getCollapsedState()
    setInternalIsCollapsed(savedState)
    // 如果有外部回调，通知父组件初始状态
    if (onCollapseChange) {
      onCollapseChange(savedState)
    }
  }, [])

  // 切换收起状态
  const handleToggleCollapse = () => {
    const newState = !isCollapsed
    setInternalIsCollapsed(newState)
    saveCollapsedState(newState)
    // 通知父组件状态变化
    if (onCollapseChange) {
      onCollapseChange(newState)
    }
  }

  // 切换置顶状态
  const handleTogglePin = (id: string) => {
    const newPinnedIds = pinnedIds.includes(id)
      ? pinnedIds.filter(pinnedId => pinnedId !== id)
      : [id, ...pinnedIds]
    setPinnedIds(newPinnedIds)
    savePinnedIds(newPinnedIds)
  }

  const conversationGroups = useMemo(() => {
    const temporaryItems = list.filter(item => item.id === '-1')
    const pinnedItems = pinnedIds
      .map(id => list.find(item => item.id === id))
      .filter((item): item is ConversationItem => Boolean(item))
      .filter(item => item.id !== '-1')
    const unpinnedItems = list.filter(item => item.id !== '-1' && !pinnedIds.includes(item.id))
    const timeGroups = groupConversationsByTime(unpinnedItems)
    const temporaryGroups = temporaryItems.length > 0
      ? [{ key: 'current', label: '当前会话', items: temporaryItems }]
      : []

    return pinnedItems.length > 0
      ? [...temporaryGroups, { key: 'pinned', label: '置顶', items: pinnedItems }, ...timeGroups]
      : [...temporaryGroups, ...timeGroups]
  }, [list, pinnedIds])

  const renderConversationItem = (item: ConversationItem) => {
    const isCurrent = item.id === currentId
    const isPinned = pinnedIds.includes(item.id)
    const ItemIcon
      = isCurrent ? ChatBubbleOvalLeftEllipsisSolidIcon : ChatBubbleOvalLeftEllipsisIcon

    return (
      <div
        onClick={() => onCurrentIdChange(item.id)}
        key={item.id}
        className={classNames(
          isCurrent
            ? 'bg-primary-50 text-primary-600'
            : 'text-gray-700 hover:bg-gray-100 hover:text-gray-700',
          'group flex items-center justify-between rounded-md px-2 py-2 text-sm font-medium cursor-pointer',
        )}
      >
        <div className="flex items-center flex-1 min-w-0">
          <ItemIcon
            className={classNames(
              isCurrent
                ? 'text-primary-600'
                : 'text-gray-400 group-hover:text-gray-500',
              'mr-3 h-5 w-5 flex-shrink-0',
            )}
            aria-hidden="true"
          />
          <span className="truncate">{item.name}</span>
          {isPinned && (
            <PinIcon className="ml-1 h-3 w-3 text-gray-400 flex-shrink-0" />
          )}
        </div>
        {/* 新对话(id='-1')没有历史记录，不显示菜单 */}
        {item.id !== '-1' && (
          <ActionMenu
            conversationId={item.id}
            conversationName={item.name}
            isPinned={isPinned}
            onRename={onRename}
            onDelete={onDelete}
            onTogglePin={handleTogglePin}
          />
        )}
      </div>
    )
  }

  // 收起状态的侧边栏
  if (isCollapsed) {
    return (
      <div className="shrink-0 flex flex-col items-center bg-white w-[60px] border-r border-gray-200 h-screen py-3">
        {/* 顶部按钮组 */}
        <div className="flex flex-col items-center gap-2 p-2 bg-gray-100 rounded-full">
          <button
            onClick={handleToggleCollapse}
            className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
            title={t('app.chat.expandSidebar') as string}
          >
            <ExpandIcon className="h-5 w-5 text-gray-600" />
          </button>
          <button
            onClick={() => onCurrentIdChange('-1')}
            className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
            title={t('app.chat.newChat') as string}
          >
            <PlusIcon className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </div>
    )
  }

  // 展开状态的侧边栏
  return (
    <div
      className="shrink-0 flex flex-col overflow-y-auto overflow-x-hidden bg-white pc:w-[244px] tablet:w-[192px] mobile:w-[240px] border-r border-gray-200 h-screen"
    >
      {/* 顶部标题栏 */}
      <div className="flex items-center justify-between p-4 pb-2">
        <div className="flex items-center gap-2 min-w-0">
          <AppIcon size="small" />
          <span className="text-sm font-semibold text-gray-800 truncate">{appName}</span>
        </div>
        <button
          onClick={handleToggleCollapse}
          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
          title={t('app.chat.collapseSidebar') as string}
        >
          <CollapseIcon className="h-5 w-5 text-gray-500" />
        </button>
      </div>

      {/* 新建对话按钮 */}
      {list.length < MAX_CONVERSATION_LENTH && (
        <div className="flex flex-shrink-0 px-4 pb-0">
          <Button
            onClick={() => { onCurrentIdChange('-1') }}
            className="group block w-full flex-shrink-0 !justify-center !h-9 text-primary-600 items-center text-sm border border-gray-200 !bg-white hover:!bg-gray-50"
          >
            <PlusIcon className="mr-1 h-4 w-4" /> {t('app.chat.newChat')}
          </Button>
        </div>
      )}

      <nav className="mt-4 flex-1 bg-white p-4 !pt-0 overflow-y-auto overflow-x-hidden">
        {conversationGroups.map(group => (
          <div key={group.key} className="mb-4 last:mb-0">
            <div className="mb-1 px-2 text-xs font-medium text-gray-400">
              {group.label}
            </div>
            <div className="space-y-1">
              {group.items.map(renderConversationItem)}
            </div>
          </div>
        ))}
      </nav>
      <div className="flex flex-shrink-0 pr-4 pb-4 pl-4">
        <div className="text-gray-400 font-normal text-xs">© {copyRight} {(new Date()).getFullYear()}</div>
      </div>
    </div>
  )
}

export default React.memo(Sidebar)
