'use client'

import { useState } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Plus, Clock, ChevronLeft, ChevronRight } from 'lucide-react'
import { TaskCard } from './TaskCard'
import { cn } from '@/lib/utils'
import type { Task, Label, Priority } from '@/types'

export const PENDING_COLUMN_ID = 'pending'

interface PendingColumnProps {
  tasks: Task[]
  labels: Label[]
  priorities: Priority[]
  isDragging?: boolean
  onAddTask: () => void
  onEditTask: (task: Task) => void
}

export function PendingColumn({ tasks, labels, priorities, isDragging, onAddTask, onEditTask }: PendingColumnProps) {
  const [collapsed, setCollapsed] = useState(false)
  const totalHours = tasks.reduce((sum, t) => sum + t.estimatedHours, 0)
  const { setNodeRef, isOver } = useDroppable({ id: PENDING_COLUMN_ID })

  if (collapsed) {
    return (
      <div
        className={cn(
          'flex w-10 flex-shrink-0 snap-start flex-col items-center rounded-2xl py-3 gap-3 transition-all duration-150 cursor-pointer',
          'bg-amber-50/60 ring-1 ring-amber-200/70',
          isOver && 'ring-2 ring-amber-400 ring-offset-1'
        )}
        ref={setNodeRef}
        onClick={() => setCollapsed(false)}
        title="Expand Pending Tasks"
      >
        <button
          onClick={(e) => { e.stopPropagation(); setCollapsed(false) }}
          className="flex h-6 w-6 items-center justify-center rounded-lg text-amber-400 hover:bg-amber-100 hover:text-amber-600 transition-colors"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
        <div className="flex flex-col items-center gap-1.5">
          <span
            className="text-[10px] font-bold uppercase tracking-widest text-amber-500 select-none"
            style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
          >
            Pending Tasks
          </span>
          {tasks.length > 0 && (
            <span className="rounded-full bg-amber-200 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700">
              {tasks.length}
            </span>
          )}
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'flex min-w-[260px] flex-1 snap-start flex-col rounded-2xl transition-all duration-150',
        'bg-amber-50/60 ring-1 ring-amber-200/70',
        isOver && 'ring-2 ring-amber-400 ring-offset-1'
      )}
    >
      {/* Header */}
      <div className="px-3 pt-3 pb-2.5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-0.5 text-amber-500">
              Pending Tasks
            </p>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={onAddTask}
              className="mt-1 flex h-6 w-6 items-center justify-center rounded-lg text-amber-400 hover:bg-amber-100 hover:text-amber-600 transition-colors"
              title="Add pending task"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setCollapsed(true)}
              className="mt-1 flex h-6 w-6 items-center justify-center rounded-lg text-amber-300 hover:bg-amber-100 hover:text-amber-600 transition-colors"
              title="Collapse"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <div className="mt-2 flex items-center gap-2">
          <span className="text-[11px] font-medium text-amber-400">
            {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
          </span>
          <span className="text-amber-200">·</span>
          <span className="flex items-center gap-0.5 text-[11px] font-medium text-amber-400">
            <Clock className="h-3 w-3" />
            {totalHours}h
          </span>
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
                  ? 'border-amber-300 bg-amber-50/50'
                  : isDragging
                  ? 'border-amber-200 bg-amber-50/30'
                  : 'border-transparent'
              )}
            >
              <p className="text-xs text-amber-300 select-none">
                {isOver ? 'Drop here' : 'No pending tasks'}
              </p>
            </div>
          ) : (
            tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                label={labels.find((l) => l.id === task.labelId) ?? null}
                priority={priorities.find((p) => p.id === task.priorityId) ?? null}
                onEdit={onEditTask}
              />
            ))
          )}
        </SortableContext>
      </div>
    </div>
  )
}
