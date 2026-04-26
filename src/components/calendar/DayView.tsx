'use client'

import { Plus, Clock, ExternalLink } from 'lucide-react'
import { PriorityBadge } from '@/components/shared/PriorityBadge'
import { TagChip } from '@/components/shared/TagChip'
import { EmptyState } from '@/components/shared/EmptyState'
import { ClipboardList } from 'lucide-react'
import type { Task, Label } from '@/types'
import { formatFullDate, fromYMD, isDateInPast } from '@/lib/dateUtils'
import { cn } from '@/lib/utils'

interface DayViewProps {
  date: string
  tasks: Task[]
  labels: Label[]
  onAddTask: (date: string) => void
  onTaskClick: (task: Task) => void
}

export function DayView({ date, tasks, labels, onAddTask, onTaskClick }: DayViewProps) {
  const isPast = isDateInPast(date)
  const totalHours = tasks.reduce((sum, t) => sum + t.estimatedHours, 0)

  return (
    <div className="flex flex-col flex-1 bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="flex items-center justify-between border-b border-slate-200 p-4">
        <div>
          <h3 className="font-semibold text-slate-900">{formatFullDate(fromYMD(date))}</h3>
          {totalHours > 0 && (
            <p className="text-sm text-slate-500">{tasks.length} tasks · {totalHours}h planned</p>
          )}
        </div>
        <button
          onClick={() => onAddTask(date)}
          className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          Add task
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {tasks.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="No tasks for this day"
            description="Click 'Add task' to plan something for this day."
          />
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => {
              const label = labels.find((l) => l.id === task.labelId)
              return (
                <div
                  key={task.id}
                  onClick={() => onTaskClick(task)}
                  className={cn(
                    'cursor-pointer rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow',
                    isPast && 'opacity-70'
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
                        {label && <PriorityBadge label={label} />}
                        {task.tags.map((tag) => <TagChip key={tag} tag={tag} />)}
                      </div>
                      <p className={cn('font-medium text-slate-800', isPast && 'line-through text-slate-500')}>
                        {task.title}
                      </p>
                      {task.description && (
                        <p className="mt-1 text-sm text-slate-500 line-clamp-2">{task.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-slate-500">
                      <Clock className="h-3.5 w-3.5" />
                      {task.estimatedHours}h
                    </div>
                  </div>
                  {task.referenceUrl && (
                    <a
                      href={task.referenceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="mt-2 inline-flex items-center gap-1 text-xs text-indigo-500 hover:text-indigo-700"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Reference link
                    </a>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
