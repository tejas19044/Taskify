'use client'

import { useMemo } from 'react'
import { isSameMonth, isToday } from 'date-fns'
import { getMonthGrid, toYMD } from '@/lib/dateUtils'
import { CalendarTaskChip } from './CalendarTaskChip'
import { cn } from '@/lib/utils'
import type { Task, Label } from '@/types'

const DAY_HEADERS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

interface MonthViewProps {
  date: Date
  tasks: Task[]
  labels: Label[]
  onDateClick: (date: string) => void
  onTaskClick: (task: Task) => void
}

export function MonthView({ date, tasks, labels, onDateClick, onTaskClick }: MonthViewProps) {
  const days = useMemo(() => getMonthGrid(date), [date])

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
    <div className="flex flex-col flex-1">
      {/* Day headers */}
      <div className="grid grid-cols-7 border-b border-slate-200">
        {DAY_HEADERS.map((day) => (
          <div key={day} className="py-2 text-center text-xs font-semibold text-slate-500">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid flex-1 grid-cols-7 grid-rows-6">
        {days.map((day, i) => {
          const dateStr = toYMD(day)
          const dayTasks = tasksByDate.get(dateStr) ?? []
          const isCurrentMonth = isSameMonth(day, date)
          const isTodayDate = isToday(day)
          const totalHours = dayTasks.reduce((sum, t) => sum + t.estimatedHours, 0)

          return (
            <div
              key={dateStr}
              onClick={() => onDateClick(dateStr)}
              className={cn(
                'group cursor-pointer border-b border-r border-slate-100 p-1.5 transition-colors hover:bg-slate-50',
                !isCurrentMonth && 'bg-slate-50/50',
                i % 7 === 0 && 'border-l-0',
                i % 7 === 6 && 'border-r-0'
              )}
            >
              {/* Day number */}
              <div className="mb-1 flex items-center justify-between">
                <span
                  className={cn(
                    'inline-flex h-6 w-6 items-center justify-center rounded-full text-sm font-medium',
                    isTodayDate
                      ? 'bg-indigo-600 text-white'
                      : isCurrentMonth
                      ? 'text-slate-800'
                      : 'text-slate-400'
                  )}
                >
                  {day.getDate()}
                </span>
                {totalHours > 0 && (
                  <span className="text-[10px] text-slate-400">{totalHours}h</span>
                )}
              </div>

              {/* Tasks */}
              <div className="flex flex-col gap-0.5" onClick={(e) => e.stopPropagation()}>
                {dayTasks.slice(0, 3).map((task) => (
                  <CalendarTaskChip
                    key={task.id}
                    task={task}
                    label={labels.find((l) => l.id === task.labelId) ?? null}
                    onClick={onTaskClick}
                    compact
                  />
                ))}
                {dayTasks.length > 3 && (
                  <span className="text-[10px] text-slate-400 pl-1">+{dayTasks.length - 3} more</span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
