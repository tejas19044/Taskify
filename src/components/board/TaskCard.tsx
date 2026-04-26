'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Clock, ExternalLink } from 'lucide-react'
import type { Task, Label, Priority } from '@/types'
import { cn } from '@/lib/utils'

interface TaskCardProps {
  task: Task
  label?: Label | null
  priority?: Priority | null
  isPast?: boolean
  isOverlay?: boolean
  onEdit?: (task: Task) => void
}

function TaskCardContent({
  task,
  label,
  priority,
  isPast,
  isOverlay,
  onEdit,
  dragListeners,
}: TaskCardProps & { dragListeners?: Record<string, unknown> }) {
  const accentColor = label?.color ?? '#e2e8f0'

  return (
    <div
      className={cn(
        'group relative flex flex-col rounded-2xl bg-white overflow-hidden transition-all duration-150',
        isPast
          ? 'border border-slate-100 opacity-55 shadow-none'
          : 'border border-slate-100 shadow-sm hover:shadow-[0_4px_16px_-2px_rgba(0,0,0,0.10)] hover:border-slate-200',
        isOverlay && 'rotate-1 shadow-2xl border-slate-200 scale-[1.02]'
      )}
    >
      {/* Left accent bar */}
      <div
        className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-2xl"
        style={{ backgroundColor: accentColor }}
      />

      {/* Drag / click layer */}
      {dragListeners && (
        <div
          {...(dragListeners as React.HTMLAttributes<HTMLDivElement>)}
          className="absolute inset-0 cursor-pointer z-10"
          onClick={() => onEdit?.(task)}
        />
      )}

      {/* Card body */}
      <div className="relative z-20 pointer-events-none flex flex-col gap-2 pl-4 pr-3.5 py-3">

        {/* Row 1: label name (left) + hours (right) */}
        <div className="flex items-center justify-between gap-2">
          {label ? (
            <span
              className="text-[10px] font-bold uppercase tracking-widest leading-none"
              style={{ color: accentColor }}
            >
              {label.name}
            </span>
          ) : (
            <span />
          )}
          <span className="flex items-center gap-0.5 text-[11px] font-semibold text-slate-400 flex-shrink-0">
            <Clock className="h-3 w-3" />
            {task.estimatedHours}h
          </span>
        </div>

        {/* Title */}
        <p
          className={cn(
            'text-[13px] font-semibold leading-snug break-words',
            isPast ? 'text-slate-400' : 'text-slate-800'
          )}
        >
          {task.title}
        </p>

        {/* Footer: tags (left) + priority (right) */}
        {(task.tags.length > 0 || task.referenceUrl || priority) && (
          <div className="flex items-end justify-between gap-2 pt-0.5">
            {/* Tags + URL */}
            <div className="flex flex-wrap items-center gap-1 min-w-0">
              {task.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500 tracking-wide"
                >
                  {tag}
                </span>
              ))}
              {task.tags.length > 3 && (
                <span className="text-[10px] text-slate-400">+{task.tags.length - 3}</span>
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

            {/* Priority — bottom right */}
            {priority && (
              <span
                className="inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-bold tracking-wide text-white leading-none flex-shrink-0"
                style={{ backgroundColor: priority.color }}
              >
                {priority.name}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export function TaskCard({ task, label, priority, isPast, isOverlay, onEdit }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: { task },
  })

  if (isOverlay) {
    return <TaskCardContent task={task} label={label} priority={priority} isPast={isPast} isOverlay />
  }

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform ? { ...transform, scaleX: 1, scaleY: 1 } : null),
        transition,
      }}
      {...attributes}
      className={cn(isDragging && 'opacity-0')}
    >
      <TaskCardContent
        task={task}
        label={label}
        priority={priority}
        isPast={isPast}
        onEdit={onEdit}
        dragListeners={listeners as Record<string, unknown>}
      />
    </div>
  )
}
