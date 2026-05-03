'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverEvent,
  DragOverlay,
  pointerWithin,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import { ChevronLeft, ChevronRight, CalendarDays, LayoutGrid } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BoardColumn } from './BoardColumn'
import { PendingColumn, PENDING_COLUMN_ID } from './PendingColumn'
import { TaskCard } from './TaskCard'
import { AddTaskDialog } from './AddTaskDialog'
import { EditTaskDialog } from './EditTaskDialog'
import { useAuth } from '@/context/AuthContext'
import { useTasks } from '@/hooks/useTasks'
import { useSettings } from '@/hooks/useSettings'
import { usePriorityLabels } from '@/hooks/usePriorityLabels'
import { usePriorities } from '@/hooks/usePriorities'
import {
  getWeekDays,
  getRollingDays,
  toYMD,
  getPrevWeekStart,
  getNextWeekStart,
} from '@/lib/dateUtils'
import type { Task } from '@/types'
import { toast } from 'sonner'

export function BoardPage() {
  const { currentUser } = useAuth()
  const userId = currentUser!.id
  const { tasks, createTask, createRecurringTasks, updateTask, updateAllInSeries, deleteTask, deleteAllInSeries, moveTask } = useTasks(userId)
  const { settings, updateSettings } = useSettings(userId)
  const { labels } = usePriorityLabels(userId)
  const { priorities } = usePriorities(userId)

  const [weekAnchor, setWeekAnchor] = useState(() => {
    const today = new Date()
    const dow = today.getDay() // 0 = Sun, 6 = Sat
    // On weekends the Mon–Fri window is all in the past — jump to next week
    return (dow === 0 || dow === 6) ? getNextWeekStart(today) : today
  })
  const [addDialogDate, setAddDialogDate] = useState<string | null>(null)
  const [addDialogHalfDay, setAddDialogHalfDay] = useState<'am' | 'pm' | null>(null)
  const [addDialogPending, setAddDialogPending] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [activeTask, setActiveTask] = useState<Task | null>(null)

  // Working copy used for optimistic visual updates during drag
  const [displayTasks, setDisplayTasks] = useState<Task[]>(tasks)
  useEffect(() => { setDisplayTasks(tasks) }, [tasks])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  )

  const columns = useMemo(() => {
    if (settings.boardMode === 'current-week') {
      return getWeekDays(weekAnchor, settings.workingMode)
    }
    return getRollingDays(new Date(), settings.workingMode)
  }, [weekAnchor, settings.boardMode, settings.workingMode])

  const colDates = useMemo(() => columns.map(toYMD), [columns])

  const tasksByDate = useMemo(() => {
    const map = new Map<string, Task[]>()
    for (const dateStr of colDates) {
      map.set(dateStr, displayTasks.filter((t) => t.scheduledDate === dateStr))
    }
    return map
  }, [displayTasks, colDates])

  const pendingTasks = useMemo(
    () => displayTasks.filter((t) => t.scheduledDate === null),
    [displayTasks]
  )

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const task = tasks.find((t) => t.id === event.active.id)
    setActiveTask(task ?? null)
  }, [tasks])

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { active, over } = event
    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    const activeTask = displayTasks.find((t) => t.id === activeId)
    if (!activeTask) return

    // Resolve destination: pending column, date column, half-day section, or over a task
    let destDate: string | null | undefined
    let destHalfDay: 'am' | 'pm' | undefined
    if (overId === PENDING_COLUMN_ID) {
      destDate = null
    } else if (colDates.includes(overId)) {
      destDate = overId
    } else if (overId.endsWith('-am') && colDates.includes(overId.slice(0, -3))) {
      destDate = overId.slice(0, -3)
      destHalfDay = 'am'
    } else if (overId.endsWith('-pm') && colDates.includes(overId.slice(0, -3))) {
      destDate = overId.slice(0, -3)
      destHalfDay = 'pm'
    } else {
      const overTask = displayTasks.find((t) => t.id === overId)
      destDate = overTask?.scheduledDate
      destHalfDay = overTask?.halfDay
    }

    if (destDate === undefined) return

    const sameColumn = activeTask.scheduledDate === destDate
    const sameSection = activeTask.halfDay === destHalfDay

    if (sameColumn && sameSection) {
      // Reorder within same section
      const activeIndex = displayTasks.findIndex((t) => t.id === activeId)
      const overIndex = displayTasks.findIndex((t) => t.id === overId)
      if (activeIndex !== overIndex && overIndex !== -1) {
        setDisplayTasks((prev) => arrayMove(prev, activeIndex, overIndex))
      }
      return
    }

    // Different column or different half-day section — move card
    setDisplayTasks((prev) => {
      const withoutActive = prev.filter((t) => t.id !== activeId)
      const updated = { ...activeTask, scheduledDate: destDate as string | null, halfDay: destHalfDay }
      const overTaskIndex = withoutActive.findIndex((t) => t.id === overId)
      if (overTaskIndex !== -1) {
        const result = [...withoutActive]
        result.splice(overTaskIndex, 0, updated)
        return result
      }
      return [...withoutActive, updated]
    })
  }, [displayTasks, colDates])

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    setActiveTask(null)
    const { active, over } = event

    if (!over) {
      setDisplayTasks(tasks) // revert
      return
    }

    const taskId = active.id as string
    const originalTask = tasks.find((t) => t.id === taskId)
    if (!originalTask) return

    // Find where the display copy ended up
    const displayTask = displayTasks.find((t) => t.id === taskId)
    const destDate = displayTask != null ? displayTask.scheduledDate : originalTask.scheduledDate
    const destHalfDay = displayTask?.halfDay

    if (destDate !== originalTask.scheduledDate || destHalfDay !== originalTask.halfDay) {
      moveTask(taskId, destDate, destHalfDay)
      toast.success('Task moved')
    }
    // If same column — no-op (display already looks right)
  }, [tasks, displayTasks, moveTask])

  const handleDragCancel = useCallback(() => {
    setActiveTask(null)
    setDisplayTasks(tasks)
  }, [tasks])

  const weekRangeLabel = useMemo(() => {
    if (columns.length === 0) return ''
    const first = columns[0]
    const last = columns[columns.length - 1]
    const firstStr = first.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    const lastStr = last.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    return `${firstStr} – ${lastStr}`
  }, [columns])

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 bg-white px-5 py-3">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-base font-semibold text-slate-900">Board</h1>
            <p className="text-xs text-slate-400">{weekRangeLabel}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Mode toggles */}
          <div className="flex rounded-lg bg-slate-100 p-0.5">
            <button
              onClick={() => updateSettings({ workingMode: '5-day' })}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-all ${settings.workingMode === '5-day' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
            >
              5d
            </button>
            <button
              onClick={() => updateSettings({ workingMode: '7-day' })}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-all ${settings.workingMode === '7-day' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
            >
              7d
            </button>
          </div>

          <div className="flex rounded-lg bg-slate-100 p-0.5">
            <button
              onClick={() => updateSettings({ boardMode: 'current-week' })}
              className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-all ${settings.boardMode === 'current-week' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <CalendarDays className="h-3 w-3" />
              Week
            </button>
            <button
              onClick={() => updateSettings({ boardMode: 'rolling' })}
              className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-all ${settings.boardMode === 'rolling' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <LayoutGrid className="h-3 w-3" />
              Rolling
            </button>
          </div>

          {/* Week nav */}
          {settings.boardMode === 'current-week' && (
            <div className="flex items-center gap-0.5">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-slate-400 hover:text-slate-700"
                onClick={() => setWeekAnchor(getPrevWeekStart(weekAnchor))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <button
                className="rounded-md px-2.5 py-1 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
                onClick={() => setWeekAnchor(new Date())}
              >
                Today
              </button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-slate-400 hover:text-slate-700"
                onClick={() => setWeekAnchor(getNextWeekStart(weekAnchor))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Board */}
      <DndContext
        sensors={sensors}
        collisionDetection={pointerWithin}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div className="flex flex-1 gap-3 overflow-x-auto px-4 py-4 snap-x snap-mandatory">
          <PendingColumn
            tasks={pendingTasks}
            labels={labels}
            priorities={priorities}
            isDragging={activeTask !== null}
            onAddTask={() => setAddDialogPending(true)}
            onEditTask={(task) => setEditingTask(task)}
          />
          {columns.map((date) => (
            <BoardColumn
              key={toYMD(date)}
              date={date}
              tasks={tasksByDate.get(toYMD(date)) ?? []}
              labels={labels}
              priorities={priorities}
              settings={settings}
              isDragging={activeTask !== null}
              onAddTask={(dateStr, halfDay) => {
                setAddDialogDate(dateStr)
                setAddDialogHalfDay(halfDay ?? null)
              }}
              onEditTask={(task) => setEditingTask(task)}
              onCompleteTask={(task) => {
                updateTask(task.id, { completed: !task.completed })
                toast.success(task.completed ? 'Marked incomplete' : 'Task completed!')
              }}
            />
          ))}
        </div>

        <DragOverlay dropAnimation={{ duration: 180, easing: 'cubic-bezier(0.18,0.67,0.6,1.22)' }}>
          {activeTask && (
            <TaskCard
              task={activeTask}
              label={labels.find((l) => l.id === activeTask.labelId) ?? null}
              priority={priorities.find((p) => p.id === activeTask.priorityId) ?? null}
              isOverlay
            />
          )}
        </DragOverlay>
      </DndContext>

      {/* Dialogs */}
      <AddTaskDialog
        open={addDialogDate !== null || addDialogPending}
        onOpenChange={(open) => {
          if (!open) {
            setAddDialogDate(null)
            setAddDialogPending(false)
            setAddDialogHalfDay(null)
          }
        }}
        defaultDate={addDialogDate ?? undefined}
        defaultHalfDay={addDialogHalfDay ?? undefined}
        userId={userId}
        labels={labels}
        priorities={priorities}
        onAdd={(data, rule) => {
          if (rule) {
            const created = createRecurringTasks(data, rule)
            toast.success(`${created.length} recurring tasks added`)
          } else {
            createTask(data)
            toast.success('Task added')
          }
        }}
      />

      <EditTaskDialog
        task={editingTask}
        open={editingTask !== null}
        onOpenChange={(open) => !open && setEditingTask(null)}
        labels={labels}
        priorities={priorities}
        onSave={(id, updates) => {
          updateTask(id, updates)
          toast.success('Task updated')
        }}
        onDelete={(id) => {
          deleteTask(id)
          toast.success('Task deleted')
        }}
        onSaveAll={(groupId, updates) => {
          updateAllInSeries(groupId, updates)
          toast.success('All events updated')
        }}
        onDeleteAll={(groupId) => {
          deleteAllInSeries(groupId)
          toast.success('Series deleted')
        }}
        onConvertToRecurring={(id, base, rule) => {
          deleteTask(id)
          const created = createRecurringTasks(base, rule)
          toast.success(`${created.length} recurring tasks created`)
        }}
        onComplete={(id, completed) => {
          updateTask(id, { completed })
          toast.success(completed ? 'Task completed!' : 'Marked incomplete')
        }}
      />
    </div>
  )
}
