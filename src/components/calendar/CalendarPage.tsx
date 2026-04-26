'use client'

import { useState, useMemo } from 'react'
import { addMonths, subMonths, addWeeks, subWeeks, format } from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MonthView } from './MonthView'
import { WeekView } from './WeekView'
import { DayView } from './DayView'
import { AddTaskDialog } from '@/components/board/AddTaskDialog'
import { EditTaskDialog } from '@/components/board/EditTaskDialog'
import { useAuth } from '@/context/AuthContext'
import { useTasks } from '@/hooks/useTasks'
import { useSettings } from '@/hooks/useSettings'
import { usePriorityLabels } from '@/hooks/usePriorityLabels'
import { usePriorities } from '@/hooks/usePriorities'
import type { Task } from '@/types'
import { toast } from 'sonner'
import { toYMD } from '@/lib/dateUtils'

type ViewMode = 'month' | 'week' | 'day'

export function CalendarPage() {
  const { currentUser } = useAuth()
  const userId = currentUser!.id
  const { tasks, createTask, updateTask, deleteTask } = useTasks(userId)
  const { settings } = useSettings(userId)
  const { labels } = usePriorityLabels(userId)
  const { priorities } = usePriorities(userId)

  const [viewMode, setViewMode] = useState<ViewMode>('month')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [addDialogDate, setAddDialogDate] = useState<string | null>(null)
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  const navigate = (direction: 'prev' | 'next') => {
    if (viewMode === 'month') {
      setCurrentDate((d) => direction === 'prev' ? subMonths(d, 1) : addMonths(d, 1))
    } else if (viewMode === 'week') {
      setCurrentDate((d) => direction === 'prev' ? subWeeks(d, 1) : addWeeks(d, 1))
    } else {
      setCurrentDate((d) => {
        const next = new Date(d)
        next.setDate(d.getDate() + (direction === 'prev' ? -1 : 1))
        return next
      })
    }
  }

  const headerLabel = useMemo(() => {
    if (viewMode === 'month') return format(currentDate, 'MMMM yyyy')
    if (viewMode === 'week') {
      const start = new Date(currentDate)
      start.setDate(currentDate.getDate() - currentDate.getDay() + 1)
      const end = new Date(start)
      end.setDate(start.getDate() + 6)
      return `${format(start, 'MMM d')} – ${format(end, 'MMM d, yyyy')}`
    }
    return format(currentDate, 'EEEE, MMMM d, yyyy')
  }, [viewMode, currentDate])

  const handleDateClick = (date: string) => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(date + 'T12:00:00'))
      setViewMode('day')
    } else {
      setAddDialogDate(date)
    }
  }

  const handleTaskClick = (task: Task) => {
    setEditingTask(task)
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => navigate('prev')}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs"
              onClick={() => setCurrentDate(new Date())}
            >
              Today
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => navigate('next')}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <h2 className="text-lg font-bold text-slate-900">{headerLabel}</h2>
        </div>

        {/* View toggle */}
        <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-0.5">
          {(['month', 'week', 'day'] as ViewMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`rounded-md px-3 py-1 text-xs font-medium capitalize transition-colors ${
                viewMode === mode ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Calendar body */}
      <div className="flex flex-1 flex-col overflow-hidden p-4">
        {viewMode === 'month' && (
          <MonthView
            date={currentDate}
            tasks={tasks}
            labels={labels}
            onDateClick={handleDateClick}
            onTaskClick={handleTaskClick}
          />
        )}
        {viewMode === 'week' && (
          <WeekView
            date={currentDate}
            tasks={tasks}
            labels={labels}
            workingMode={settings.workingMode}
            onDateClick={handleDateClick}
            onTaskClick={handleTaskClick}
          />
        )}
        {viewMode === 'day' && (
          <DayView
            date={toYMD(currentDate)}
            tasks={tasks.filter((t) => t.scheduledDate === toYMD(currentDate))}
            labels={labels}
            onAddTask={setAddDialogDate}
            onTaskClick={handleTaskClick}
          />
        )}
      </div>

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
