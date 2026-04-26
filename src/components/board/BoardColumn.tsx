'use client'

import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Plus } from 'lucide-react'
import { TaskCard } from './TaskCard'
import { CapacityBar } from './CapacityBar'
import { cn } from '@/lib/utils'
import { formatDayName, formatShortDate, isDateInPast, isDateToday, toYMD, getDayName } from '@/lib/dateUtils'
import type { Task, Label, Priority, UserSettings } from '@/types'
import { getDailyCapacity } from '@/services/settingsService'

interface BoardColumnProps {
  date: Date
  tasks: Task[]
  labels: Label[]
  priorities: Priority[]
  settings: UserSettings
  isDragging?: boolean
  onAddTask: (date: string) => void
  onEditTask: (task: Task) => void
}

export function BoardColumn({ date, tasks, labels, priorities, settings, isDragging, onAddTask, onEditTask }: BoardColumnProps) {
  const dateStr = toYMD(date)
  const dayName = getDayName(date)
  const capacity = getDailyCapacity(settings, dayName)
  const totalHours = tasks.reduce((sum, t) => sum + t.estimatedHours, 0)
  const isPast = isDateInPast(dateStr)
  const isToday = isDateToday(dateStr)

  const { setNodeRef, isOver } = useDroppable({ id: dateStr })

  return (
    <div
      className={cn(
        'flex min-w-[260px] flex-1 snap-start flex-col rounded-2xl transition-all duration-150',
        isToday
          ? 'bg-indigo-50/60 ring-1 ring-indigo-200/80'
          : isPast
          ? 'bg-slate-50/60 ring-1 ring-slate-200/50'
          : 'bg-slate-50/40 ring-1 ring-slate-200/60',
        isOver && 'ring-2 ring-indigo-400 ring-offset-1'
      )}
    >
      {/* Column header */}
      <div className="px-3 pt-3 pb-2.5">
        <div className="flex items-start justify-between">
          <div>
            <p
              className={cn(
                'text-[10px] font-bold uppercase tracking-widest mb-0.5',
                isToday ? 'text-indigo-500' : 'text-slate-400'
              )}
            >
              {formatDayName(date)}
              {isToday && (
                <span className="ml-1.5 inline-flex items-center rounded-full bg-indigo-500 px-1.5 py-px text-[9px] font-semibold text-white uppercase tracking-wide">
                  Today
                </span>
              )}
            </p>
            <p
              className={cn(
                'text-2xl font-bold leading-none',
                isToday ? 'text-indigo-700' : isPast ? 'text-slate-400' : 'text-slate-800'
              )}
            >
              {formatShortDate(date)}
            </p>
          </div>

          <button
            onClick={() => onAddTask(dateStr)}
            className={cn(
              'mt-1 flex h-6 w-6 items-center justify-center rounded-lg transition-colors',
              isToday
                ? 'text-indigo-400 hover:bg-indigo-100 hover:text-indigo-600'
                : 'text-slate-300 hover:bg-slate-100 hover:text-slate-600'
            )}
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Stats row */}
        <div className="mt-2 flex items-center gap-2">
          <span
            className={cn(
              'text-[11px] font-medium',
              isToday ? 'text-indigo-400' : 'text-slate-400'
            )}
          >
            {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
          </span>
          <span className="text-slate-200">·</span>
          <span className={cn('text-[11px] font-medium', isToday ? 'text-indigo-400' : 'text-slate-400')}>
            {totalHours}h / {capacity}h
          </span>
        </div>

        <div className="mt-2">
          <CapacityBar hours={totalHours} capacity={capacity} />
        </div>
      </div>

      {/* Tasks */}
      <div
        ref={setNodeRef}
        className="flex flex-1 flex-col gap-2.5 overflow-y-auto px-3 pb-3"
        style={{ minHeight: 80 }}
      >
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.length === 0 ? (
            <div
              className={cn(
                'flex items-center justify-center rounded-xl border-2 border-dashed py-8 transition-all duration-150',
                isOver
                  ? 'border-indigo-300 bg-indigo-50/50'
                  : isDragging
                  ? 'border-slate-200 bg-slate-50/50'
                  : 'border-transparent'
              )}
            >
              <p className="text-xs text-slate-300 select-none">
                {isOver ? 'Drop here' : 'No tasks'}
              </p>
            </div>
          ) : (
            tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                label={labels.find((l) => l.id === task.labelId) ?? null}
                priority={priorities.find((p) => p.id === task.priorityId) ?? null}
                isPast={isPast}
                onEdit={onEditTask}
              />
            ))
          )}
        </SortableContext>
      </div>
    </div>
  )
}
