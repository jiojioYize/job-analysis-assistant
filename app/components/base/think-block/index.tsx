'use client'
import { useEffect, useRef, useState } from 'react'
import cn from '@/utils/classnames'

interface ThinkBlockProps {
  content: string
  defaultExpanded?: boolean
}

export function ThinkBlock({ content, defaultExpanded = false }: ThinkBlockProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)
  const bodyRef = useRef<HTMLDivElement | null>(null)
  const [maxHeight, setMaxHeight] = useState<number>(0)

  useEffect(() => {
    if (!isExpanded || !bodyRef.current) {
      setMaxHeight(0)
      return
    }

    const node = bodyRef.current

    const updateHeight = () => {
      setMaxHeight(node.scrollHeight)
    }

    updateHeight()

    if (typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver(updateHeight)
      observer.observe(node)
      return () => observer.disconnect()
    }

    window.addEventListener('resize', updateHeight)
    return () => window.removeEventListener('resize', updateHeight)
  }, [content, isExpanded])

  if (!content.trim())
  { return null }

  return (
    <div className="my-3 rounded-lg border border-gray-200 bg-gray-50 overflow-hidden">
      <button
        type="button"
        className={cn(
          'w-full flex items-center justify-between px-4 py-2.5',
          'text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-inset',
        )}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span className="flex items-center gap-2">
          <ThinkIcon className="w-4 h-4 text-gray-500" />
          <span>思考过程</span>
        </span>
        <ChevronIcon
          className={cn(
            'w-4 h-4 text-gray-500 transition-transform duration-200',
            isExpanded ? 'rotate-180' : '',
          )}
        />
      </button>
      <div
        className={cn(
          'overflow-hidden transition-all duration-200 ease-in-out',
          isExpanded ? 'opacity-100' : 'max-h-0 opacity-0',
        )}
        style={isExpanded ? { maxHeight } : undefined}
      >
        <div ref={bodyRef} className="px-4 py-3 border-t border-gray-200 bg-white">
          <div className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">
            {content}
          </div>
        </div>
      </div>
    </div>
  )
}

function ThinkIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </svg>
  )
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}

export default ThinkBlock
