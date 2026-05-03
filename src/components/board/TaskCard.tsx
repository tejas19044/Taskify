'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Check, Clock, ExternalLink, Repeat, Tag, Link } from 'lucide-react'
import type { Task, Label, Priority } from '@/types'
import { cn } from '@/lib/utils'

const COMPACT_THRESHOLD = 64
const DESCRIPTION_THRESHOLD = 100
const MIN_CARD_HEIGHT = 16
const HOVER_DELAY_MS = 1000

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

interface TaskCardProps {
  task: Task
  label?: Label | null
  priority?: Priority | null
  isPast?: boolean
  isOverlay?: boolean
  isToday?: boolean
  pxPerHour?: number
  onEdit?: (task: Task) => void
  onComplete?: (task: Task) => void
}

// ─── Hover preview portal ──────────────────────────────────────────────────

function TaskPreview({
  task,
  label,
  priority,
  rect,
}: {
  task: Task
  label?: Label | null
  priority?: Priority | null
  rect: DOMRect
}) {
  const accentColor = label?.color ?? '#6366f1'
  const PREVIEW_WIDTH = 320

  const left =
    rect.right + 14 + PREVIEW_WIDTH > window.innerWidth
      ? rect.left - PREVIEW_WIDTH - 14
      : rect.right + 14

  const top = Math.min(rect.top, window.innerHeight - 48)

  return createPortal(
    <div
      style={{
        position: 'fixed', top, left, width: PREVIEW_WIDTH, zIndex: 9999,
        boxShadow: '0 24px 64px -12px rgba(0,0,0,0.18), 0 4px 16px -4px rgba(0,0,0,0.08)',
      }}
      className="rounded-2xl bg-white overflow-hidden pointer-events-none border border-white/60"
    >
      {/* Tinted header band */}
      <div
        style={{ backgroundColor: `${accentColor}14` }}
        className="px-5 pt-4 pb-3 flex items-start justify-between gap-3"
      >
        <div className="flex flex-col gap-1 min-w-0">
          {label && (
            <span
              className="text-[9px] font-black uppercase tracking-[0.14em] leading-none"
              style={{ color: accentColor }}
            >
              {label.name}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0 mt-0.5">
          {task.recurringGroupId && <Repeat className="h-3 w-3 text-slate-300" />}
          {priority && (
            <span
              className="rounded-full px-2 py-0.5 text-[9px] font-bold tracking-wide text-white leading-none"
              style={{ backgroundColor: priority.color }}
            >
              {priority.name}
            </span>
          )}
          <span
            className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold leading-none"
            style={{ backgroundColor: `${accentColor}18`, color: accentColor }}
          >
            <Clock className="h-2.5 w-2.5" />
            {task.estimatedHours}h
          </span>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px mx-5" style={{ backgroundColor: `${accentColor}20` }} />

      {/* Body */}
      <div className="px-5 pt-3.5 pb-4 flex flex-col gap-3">
        {/* Title */}
        <p className="text-[15px] font-bold text-slate-900 leading-snug tracking-tight">
          {task.title}
        </p>

        {/* Description — renders HTML */}
        {task.description?.trim() && (
          <div
            className={cn(
              'text-[12px] text-slate-500 leading-relaxed',
              '[&_p]:my-1 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0',
              '[&_ul:not([data-type])]:my-1 [&_ul:not([data-type])]:pl-4',
              '[&_li:not([data-type])]:my-0.5 [&_li:not([data-type])]:list-disc',
              '[&_ul[data-type=taskList]]:pl-0 [&_ul[data-type=taskList]]:my-1 [&_ul[data-type=taskList]]:list-none',
              '[&_li[data-type=taskItem]]:flex [&_li[data-type=taskItem]]:items-center [&_li[data-type=taskItem]]:gap-1.5 [&_li[data-type=taskItem]]:list-none [&_li[data-type=taskItem]]:my-0.5',
              '[&_li[data-type=taskItem]_label]:flex [&_li[data-type=taskItem]_label]:shrink-0 [&_li[data-type=taskItem]_label]:items-center',
              '[&_li[data-type=taskItem]_label_span]:hidden',
              '[&_li[data-type=taskItem]_input]:w-3 [&_li[data-type=taskItem]_input]:h-3 [&_li[data-type=taskItem]_input]:shrink-0 [&_li[data-type=taskItem]_input]:pointer-events-none',
              '[&_li[data-type=taskItem]_div]:flex-1 [&_li[data-type=taskItem]_div_p]:my-0',
              '[&_strong]:font-semibold [&_strong]:text-slate-700',
              '[&_a]:text-indigo-500 [&_a]:underline',
            )}
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: task.description }}
          />
        )}

        {/* Tags */}
        {task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {task.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-wide"
                style={{ backgroundColor: `${accentColor}12`, color: accentColor }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Reference URL */}
        {task.referenceUrl && (
          <div className="flex items-center gap-1.5 rounded-lg bg-slate-50 px-2.5 py-1.5">
            <Link className="h-3 w-3 text-indigo-400 flex-shrink-0" />
            <span className="text-[11px] text-indigo-500 truncate">
              {task.referenceUrl.replace(/^https?:\/\//, '')}
            </span>
          </div>
        )}
      </div>
    </div>,
    document.body
  )
}

// ─── Card content ──────────────────────────────────────────────────────────

function TaskCardContent({
  task,
  label,
  priority,
  isPast,
  isOverlay,
  isToday,
  isCompact,
  showDescription,
  onEdit,
  onComplete,
  dragListeners,
}: TaskCardProps & { dragListeners?: Record<string, unknown>; isCompact?: boolean; showDescription?: boolean }) {
  const accentColor = label?.color ?? '#e2e8f0'
  const isCompleted = task.completed

  return (
    <div
      className={cn(
        'group relative flex flex-col rounded-2xl bg-white overflow-hidden transition-all duration-200 h-full',
        isPast
          ? 'border border-slate-100 opacity-55 shadow-none'
          : 'border border-slate-100 shadow-sm hover:shadow-[0_4px_16px_-2px_rgba(0,0,0,0.10)] hover:border-slate-200',
        isOverlay && 'rotate-1 shadow-2xl border-slate-200 scale-[1.02]',
        isCompleted && !isPast && 'opacity-45'
      )}
    >
      {/* Left accent bar */}
      <div
        className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-2xl"
        style={{ backgroundColor: isCompleted ? '#d1d5db' : accentColor }}
      />

      {/* Drag / click layer */}
      {dragListeners && (
        <div
          {...(dragListeners as React.HTMLAttributes<HTMLDivElement>)}
          className="absolute inset-0 cursor-pointer z-10"
          onClick={() => onEdit?.(task)}
        />
      )}

      {isCompact ? (
        <div className="relative z-20 pointer-events-none flex h-full items-center pl-4 pr-3 overflow-hidden">
          <p
            className={cn(
              'flex-1 min-w-0 truncate text-[11px] font-semibold',
              isPast || isCompleted ? 'text-slate-400' : 'text-slate-800',
            )}
          >
            {task.title}
          </p>
          <span className="ml-2 flex-shrink-0 text-[10px] font-semibold text-slate-400">
            {task.estimatedHours}h
          </span>
        </div>
      ) : (
        <div className="relative z-20 pointer-events-none flex flex-col gap-2 pl-4 pr-3.5 py-3 h-full">

          {/* Row 1: title (left) + complete button + hours (right) */}
          <div className="flex items-start justify-between gap-2">
            <p
              className={cn(
                'text-[13px] font-semibold leading-snug break-words min-w-0',
                isPast || isCompleted ? 'text-slate-400' : 'text-slate-800',
              )}
            >
              {task.title}
            </p>
            <div className="flex items-center gap-1.5 flex-shrink-0 mt-0.5">
              {isToday && onComplete && (
                <button
                  className={cn(
                    'pointer-events-auto flex h-5 w-5 items-center justify-center rounded-full transition-all duration-150',
                    isCompleted
                      ? 'bg-emerald-500 text-white'
                      : 'opacity-0 group-hover:opacity-100 bg-slate-100 text-slate-400 hover:bg-emerald-100 hover:text-emerald-600'
                  )}
                  onClick={(e) => { e.stopPropagation(); onComplete(task) }}
                >
                  <Check className="h-2.5 w-2.5" strokeWidth={3} />
                </button>
              )}
              <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-400">
                {task.recurringGroupId && <Repeat className="h-2.5 w-2.5 text-slate-300" />}
                <Clock className="h-3 w-3" />
                {task.estimatedHours}h
              </span>
            </div>
          </div>

          {/* Description snippet — today only, when card is tall enough */}
          {showDescription && task.description?.trim() && (
            <div
              className={cn(
                'flex-1 overflow-hidden text-[11px] leading-relaxed text-slate-400 break-words',
                '[&_p]:my-0.5 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0',
                '[&_ul:not([data-type])]:pl-3 [&_ul:not([data-type])]:my-0.5',
                '[&_li:not([data-type])]:list-disc [&_li:not([data-type])]:my-0',
                '[&_ul[data-type=taskList]]:pl-0 [&_ul[data-type=taskList]]:my-0.5 [&_ul[data-type=taskList]]:list-none',
                '[&_li[data-type=taskItem]]:flex [&_li[data-type=taskItem]]:items-center [&_li[data-type=taskItem]]:gap-1.5 [&_li[data-type=taskItem]]:list-none [&_li[data-type=taskItem]]:my-0',
                '[&_li[data-type=taskItem]_label]:flex [&_li[data-type=taskItem]_label]:shrink-0 [&_li[data-type=taskItem]_label]:items-center',
                '[&_li[data-type=taskItem]_label_span]:hidden',
                '[&_li[data-type=taskItem]_input]:w-3 [&_li[data-type=taskItem]_input]:h-3 [&_li[data-type=taskItem]_input]:shrink-0 [&_li[data-type=taskItem]_input]:pointer-events-none',
                '[&_li[data-type=taskItem]_div]:flex-1 [&_li[data-type=taskItem]_div_p]:my-0',
                '[&_strong]:font-semibold [&_strong]:text-slate-600',
              )}
              // eslint-disable-next-line react/no-danger
              dangerouslySetInnerHTML={{ __html: task.description }}
            />
          )}

          {/* Footer: label + tags + url + priority — always shown when any exist */}
          {(label || priority || task.tags.length > 0 || task.referenceUrl) && (
            <div className="mt-auto flex items-end justify-between gap-2 pt-0.5">
              <div className="flex flex-wrap items-center gap-1 min-w-0">
                {label && (
                  <span
                    className="text-[10px] font-bold uppercase tracking-widest leading-none"
                    style={{ color: isCompleted ? '#9ca3af' : accentColor }}
                  >
                    {label.name}
                  </span>
                )}
                {task.tags.slice(0, 2).map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500 tracking-wide"
                  >
                    {tag}
                  </span>
                ))}
                {task.tags.length > 2 && (
                  <span className="text-[10px] text-slate-400">+{task.tags.length - 2}</span>
                )}
                {task.referenceUrl && (
                  <a
                    href={task.referenceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="pointer-events-auto flex items-center justify-center h-5 w-5 rounded-md text-slate-300 hover:bg-indigo-50 hover:text-indigo-500 transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>

              {priority && (
                <span
                  className="inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-bold tracking-wide text-white leading-none flex-shrink-0"
                  style={{ backgroundColor: isCompleted ? '#9ca3af' : priority.color }}
                >
                  {priority.name}
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Sortable wrapper ──────────────────────────────────────────────────────

export function TaskCard({ task, label, priority, isPast, isOverlay, isToday, pxPerHour, onEdit, onComplete }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: { task },
  })

  const cardHeight =
    pxPerHour && pxPerHour > 0
      ? Math.max(task.estimatedHours * pxPerHour, MIN_CARD_HEIGHT)
      : undefined

  const isCompact = cardHeight !== undefined && cardHeight < COMPACT_THRESHOLD
  const showDescription = cardHeight !== undefined && cardHeight >= DESCRIPTION_THRESHOLD

  // Hover preview state
  const [previewRect, setPreviewRect] = useState<DOMRect | null>(null)
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const divRef = useRef<HTMLDivElement | null>(null)

  const setRefs = useCallback(
    (el: HTMLDivElement | null) => {
      setNodeRef(el)
      divRef.current = el
    },
    [setNodeRef]
  )

  const handleMouseEnter = useCallback(() => {
    if (isDragging) return
    hoverTimer.current = setTimeout(() => {
      if (divRef.current) setPreviewRect(divRef.current.getBoundingClientRect())
    }, HOVER_DELAY_MS)
  }, [isDragging])

  const handleMouseLeave = useCallback(() => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current)
    setPreviewRect(null)
  }, [])

  // Clear preview if drag starts mid-hover
  useEffect(() => {
    if (isDragging) {
      if (hoverTimer.current) clearTimeout(hoverTimer.current)
      setPreviewRect(null)
    }
  }, [isDragging])

  if (isOverlay) {
    return <TaskCardContent task={task} label={label} priority={priority} isPast={isPast} isOverlay />
  }

  return (
    <>
      <div
        ref={setRefs}
        style={{
          transform: CSS.Transform.toString(transform ? { ...transform, scaleX: 1, scaleY: 1 } : null),
          transition,
          height: cardHeight,
          flexShrink: 0,
        }}
        {...attributes}
        className={cn(isDragging && 'opacity-0')}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <TaskCardContent
          task={task}
          label={label}
          priority={priority}
          isPast={isPast}
          isToday={isToday}
          isCompact={isCompact}
          showDescription={showDescription}
          onEdit={onEdit}
          onComplete={onComplete}
          dragListeners={listeners as Record<string, unknown>}
        />
      </div>

      {previewRect && !isDragging && (
        <TaskPreview task={task} label={label} priority={priority} rect={previewRect} />
      )}
    </>
  )
}
