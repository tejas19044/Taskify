'use client'

import { useMemo } from 'react'
import { isToday } from 'date-fns'
import { getWeekDays, toYMD, formatDayName } from '@/lib/dateUtils'
import { CalendarTaskChip } from './CalendarTaskChip'
import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Task, Label, WorkingMode } from '@/types'

interface WeekViewProps {
  date: Date
  tasks: Task[]
  labels: Label[]
  workingMode: WorkingMode
  onDateClick: (date: string) => void
  onTaskClick: (task: Task) => void
}

export function WeekView({ date, tasks, labels, workingMode, onDateClick, onTaskClick }: WeekViewProps) {
  const days = useMemo(() => getWeekDays(date, workingMode), [date, workingMode])

  const tasksByDate = useMemo(() => {
    const map = new Map<string, Task[]>()
    for (const task of tasks) {
      if (task.scheduledDate === null) continue
      const existing = map.get(task.scheduledDate) ?? []
      map.set(task.scheduledDate, [...existing, task])
    }
    return map
  }, [tasks])

  return (
    <div className="flex flex-1 gap-px bg-slate-200 rounded-xl overflow-hidden">
      {days.map((day) => {
        const dateStr = toYMD(day)
        const dayTasks = tasksByDate.get(dateStr) ?? []
        const isTodayDate = isToday(day)
        const totalHours = dayTasks.reduce((sum, t) => sum + t.estimatedHours, 0)

        return (
          <div
            key={dateStr}
            className={cn(
              'flex flex-1 flex-col bg-white',
              isTodayDate && 'bg-indigo-50/60'
            )}
          >
            {/* Column header */}
            <div
              className={cn(
                'cursor-pointer border-b border-slate-200 p-3 text-center hover:bg-slate-50',
                isTodayDate && 'bg-indigo-50'
              )}
              onClick={() => onDateClick(dateStr)}
            >
              <p className={cn('text-xs font-semibold uppercase', isTodayDate ? 'text-indigo-600' : 'text-slate-500')}>
                {formatDayName(day)}
              </p>
              <p className={cn(
                'text-lg font-bold',
                isTodayDate ? 'text-indigo-700' : 'text-slate-800'
              )}>
                {day.getDate()}
              </p>
              {totalHours > 0 && (
                <p className="text-xs text-slate-400">{totalHours}h</p>
              )}
            </div>

            {/* Tasks */}
            <div className="flex flex-1 flex-col gap-1 overflow-y-auto p-2">
              {dayTasks.map((task) => (
                <CalendarTaskChip
                  key={task.id}
                  task={task}
                  label={labels.find((l) => l.id === task.labelId) ?? null}
                  onClick={onTaskClick}
                />
              ))}
              <button
                onClick={() => onDateClick(dateStr)}
                className="mt-auto flex items-center gap-1 rounded-md px-1.5 py-1 text-xs text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
              >
                <Plus className="h-3 w-3" />
                Add
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
