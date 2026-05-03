'use client'

import { Clock, ExternalLink, Repeat } from 'lucide-react'
import type { Task, Label } from '@/types'
import { cn } from '@/lib/utils'

interface CalendarTaskCardProps {
  task: Task
  label?: Label | null
  onClick: (task: Task) => void
}

export function CalendarTaskCard({ task, label, onClick }: CalendarTaskCardProps) {
  const accentColor = label?.color ?? '#6366f1'

  return (
    <div
      onClick={() => onClick(task)}
      className={cn(
        'relative cursor-pointer rounded-xl bg-white border border-slate-100 shadow-sm',
        'hover:shadow-[0_4px_16px_-2px_rgba(0,0,0,0.10)] hover:border-slate-200 transition-all duration-150 overflow-hidden',
        task.completed && 'opacity-50'
      )}
    >
      {/* Left accent bar */}
      <div
        className="absolute left-0 top-0 bottom-0 w-[3px]"
        style={{ backgroundColor: accentColor }}
      />

      <div className="pl-4 pr-3 py-3 flex flex-col gap-2">
        {/* Label + hours */}
        <div className="flex items-center justify-between gap-2">
          {label ? (
            <span
              className="text-[10px] font-bold uppercase tracking-widest leading-none"
              style={{ color: accentColor }}
            >
              {label.name}
            </span>
          ) : <span />}
          <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 flex-shrink-0">
            {task.ticketNumber != null && (
              <span className="text-slate-300 font-medium">#{task.ticketNumber}</span>
            )}
            {task.recurringGroupId && <Repeat className="h-2.5 w-2.5 text-slate-300" />}
            <Clock className="h-3 w-3" />
            {task.estimatedHours}h
          </span>
        </div>

        {/* Title */}
        <p className="text-[13px] font-semibold text-slate-800 leading-snug break-words">
          {task.title}
        </p>

        {/* Description — rendered as HTML, shown in full */}
        {task.description?.trim() && (
          <div
            className="text-[12px] text-slate-500 leading-relaxed [&_p]:my-0.5 [&_ul]:my-1 [&_li]:my-0"
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
                className="inline-flex items-center rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500 tracking-wide"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Reference URL */}
        {task.referenceUrl && (
          <a
            href={task.referenceUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 text-[11px] text-indigo-500 hover:text-indigo-700 transition-colors"
          >
            <ExternalLink className="h-3 w-3 flex-shrink-0" />
            <span className="truncate">{task.referenceUrl.replace(/^https?:\/\//, '')}</span>
          </a>
        )}
      </div>
    </div>
  )
}
