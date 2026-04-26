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
  const { tasks, createTask, updateTask, deleteTask, moveTask } = useTasks(userId)
  const { settings, updateSettings } = useSettings(userId)
  const { labels } = usePriorityLabels(userId)
  const { priorities } = usePriorities(userId)

  const [weekAnchor, setWeekAnchor] = useState(new Date())
  const [addDialogDate, setAddDialogDate] = useState<string | null>(null)
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

    // Resolve destination date: over a column header OR over another task
    const destDate = colDates.includes(overId)
      ? overId
      : displayTasks.find((t) => t.id === overId)?.scheduledDate

    if (!destDate) return

    if (activeTask.scheduledDate === destDate) {
      // Same column — reorder within the column
      const overId2 = over.id as string
      const activeIndex = displayTasks.findIndex((t) => t.id === activeId)
      const overIndex = displayTasks.findIndex((t) => t.id === overId2)
      if (activeIndex !== overIndex && overIndex !== -1) {
        setDisplayTasks((prev) => arrayMove(prev, activeIndex, overIndex))
      }
      return
    }

    // Different column — move card there, place it at the end
    setDisplayTasks((prev) => {
      const withoutActive = prev.filter((t) => t.id !== activeId)
      const updated = { ...activeTask, scheduledDate: destDate }
      // Insert before the over-task if over a task, otherwise at end
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
    const destDate = displayTask?.scheduledDate ?? originalTask.scheduledDate

    if (destDate !== originalTask.scheduledDate) {
      moveTask(taskId, destDate)
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
          {columns.map((date) => (
            <BoardColumn
              key={toYMD(date)}
              date={date}
              tasks={tasksByDate.get(toYMD(date)) ?? []}
              labels={labels}
              priorities={priorities}
              settings={settings}
              isDragging={activeTask !== null}
              onAddTask={(dateStr) => setAddDialogDate(dateStr)}
              onEditTask={(task) => setEditingTask(task)}
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
        open={addDialogDate !== null}
        onOpenChange={(open) => !open && setAddDialogDate(null)}
        defaultDate={addDialogDate ?? undefined}
        userId={userId}
        labels={labels}
        priorities={priorities}
        onAdd={(data) => {
          createTask(data)
          toast.success('Task added')
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
      />
    </div>
  )
}
