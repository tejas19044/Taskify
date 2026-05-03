'use client'

import { useRef, useState, useLayoutEffect, useCallback } from 'react'
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
  onAddTask: (date: string, halfDay?: 'am' | 'pm') => void
  onEditTask: (task: Task) => void
  onCompleteTask?: (task: Task) => void
}

interface HalfSectionProps {
  id: string
  label: string
  tasks: Task[]
  labels: Label[]
  priorities: Priority[]
  pxPerHour: number
  isPast: boolean
  isDragging?: boolean
  onAddTask: () => void
  onEditTask: (task: Task) => void
  onCompleteTask?: (task: Task) => void
}

function HalfSection({
  id,
  label,
  tasks,
  labels,
  priorities,
  pxPerHour,
  isPast,
  isDragging,
  onAddTask,
  onEditTask,
  onCompleteTask,
}: HalfSectionProps) {
  const { setNodeRef, isOver } = useDroppable({ id })

  return (
    <div className="flex flex-col min-h-[80px]">
      <div className="flex items-center justify-between px-2 py-1.5">
        <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400/80">{label}</span>
        <button
          onClick={onAddTask}
          className="flex h-5 w-5 items-center justify-center rounded-md text-indigo-300 hover:bg-indigo-100 hover:text-indigo-600 transition-colors"
        >
          <Plus className="h-3 w-3" />
        </button>
      </div>
      <div ref={setNodeRef} className="flex-1 min-h-[64px] px-2 pb-2">
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.length === 0 ? (
            <div
              className={cn(
                'flex items-center justify-center rounded-xl border-2 border-dashed py-5 transition-all duration-150',
                isOver
                  ? 'border-indigo-300 bg-indigo-50/50'
                  : isDragging
                  ? 'border-slate-200 bg-slate-50/30'
                  : 'border-transparent'
              )}
            >
              {isOver && <p className="text-xs text-indigo-300 select-none">Drop here</p>}
            </div>
          ) : (
            tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                label={labels.find((l) => l.id === task.labelId) ?? null}
                priority={priorities.find((p) => p.id === task.priorityId) ?? null}
                pxPerHour={pxPerHour}
                isPast={isPast}
                isToday
                onEdit={onEditTask}
                onComplete={onCompleteTask}
              />
            ))
          )}
        </SortableContext>
      </div>
    </div>
  )
}

export function BoardColumn({ date, tasks, labels, priorities, settings, isDragging, onAddTask, onEditTask, onCompleteTask }: BoardColumnProps) {
  const dateStr = toYMD(date)
  const dayName = getDayName(date)
  const capacity = getDailyCapacity(settings, dayName)
  const totalHours = tasks.reduce((sum, t) => sum + t.estimatedHours, 0)
  const isPast = isDateInPast(dateStr)
  const isToday = isDateToday(dateStr)

  const { setNodeRef, isOver } = useDroppable({ id: dateStr })

  const bodyRef = useRef<HTMLDivElement>(null)
  const [bodyHeight, setBodyHeight] = useState(0)

  useLayoutEffect(() => {
    if (!bodyRef.current) return
    const ro = new ResizeObserver((entries) => {
      setBodyHeight(entries[0].contentRect.height)
    })
    ro.observe(bodyRef.current)
    return () => ro.disconnect()
  }, [])

  const pxPerHour = bodyHeight > 0 ? bodyHeight / capacity : 0

  const setBodyAndDropRef = useCallback(
    (el: HTMLDivElement | null) => {
      // For today, DON'T register the outer droppable rect — section droppables handle it.
      // If the outer rect exists, pointerWithin returns it first and sections never fire.
      if (!isToday) setNodeRef(el)
      ;(bodyRef as React.MutableRefObject<HTMLDivElement | null>).current = el
    },
    [setNodeRef, isToday]
  )

  const amTasks = isToday ? tasks.filter((t) => t.halfDay !== 'pm') : tasks
  const pmTasks = isToday ? tasks.filter((t) => t.halfDay === 'pm') : []

  return (
    <div
      className={cn(
        'flex snap-start flex-col rounded-2xl transition-all duration-150',
        isToday ? 'min-w-[320px] flex-[1.7]' : 'min-w-[200px] flex-1',
        isToday
          ? 'bg-indigo-50/60 ring-1 ring-indigo-200/80'
          : isPast
          ? 'bg-slate-50/60 ring-1 ring-slate-200/50'
          : 'bg-slate-50/40 ring-1 ring-slate-200/60',
        !isToday && isOver && 'ring-2 ring-indigo-400 ring-offset-1'
      )}
    >
      {/* Column header */}
      <div className="px-3 pt-3 pb-2.5 flex-shrink-0">
        <div className="flex items-start justify-between">
          <div>
            <p
              className={cn(
                'text-[10px] font-bold uppercase tracking-widest mb-0.5',
                isToday ? 'text-indigo-500' : 'text-slate-400'
              )}
            >
              {formatDayName(date)}
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

          {isToday ? (
            <span className="inline-flex items-center rounded-full bg-indigo-500 px-2 py-0.5 text-[9px] font-bold text-white uppercase tracking-wide leading-none">
              Today
            </span>
          ) : (
            <button
              onClick={() => onAddTask(dateStr)}
              className="mt-1 flex h-6 w-6 items-center justify-center rounded-lg transition-colors text-slate-300 hover:bg-slate-100 hover:text-slate-600"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="mt-2 flex items-center gap-2">
          <span className={cn('text-[11px] font-medium', isToday ? 'text-indigo-400' : 'text-slate-400')}>
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

      {/* Column body */}
      <div ref={setBodyAndDropRef} className="relative flex-1 overflow-y-auto">
        {isToday ? (
          <div className="flex flex-col">
            <HalfSection
              id={`${dateStr}-am`}
              label="Morning"
              tasks={amTasks}
              labels={labels}
              priorities={priorities}
              pxPerHour={pxPerHour}
              isPast={isPast}
              isDragging={isDragging}
              onAddTask={() => onAddTask(dateStr, 'am')}
              onEditTask={onEditTask}
              onCompleteTask={onCompleteTask}
            />
            <div className="mx-2 border-t border-dashed border-indigo-200" />
            <HalfSection
              id={`${dateStr}-pm`}
              label="Afternoon"
              tasks={pmTasks}
              labels={labels}
              priorities={priorities}
              pxPerHour={pxPerHour}
              isPast={isPast}
              isDragging={isDragging}
              onAddTask={() => onAddTask(dateStr, 'pm')}
              onEditTask={onEditTask}
              onCompleteTask={onCompleteTask}
            />
          </div>
        ) : (
          <div className="relative z-10 flex flex-col px-2">
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
                    pxPerHour={pxPerHour}
                    isPast={isPast}
                    onEdit={onEditTask}
                  />
                ))
              )}
            </SortableContext>
          </div>
        )}
      </div>
    </div>
  )
}
