'use client'

import type { Task, Label } from '@/types'
import { cn } from '@/lib/utils'

interface CalendarTaskChipProps {
  task: Task
  label?: Label | null
  onClick: (task: Task) => void
  compact?: boolean
}

export function CalendarTaskChip({ task, label, onClick, compact }: CalendarTaskChipProps) {
  return (
    <button
      onClick={() => onClick(task)}
      className={cn(
        'w-full truncate rounded text-left transition-opacity hover:opacity-80',
        compact ? 'px-1 py-0.5 text-[10px]' : 'px-1.5 py-0.5 text-xs font-medium'
      )}
      style={{
        backgroundColor: label?.color ? `${label.color}20` : '#6366f120',
        color: label?.color ?? '#6366f1',
        borderLeft: `2px solid ${label?.color ?? '#6366f1'}`,
      }}
    >
      {task.title}
    </button>
  )
}
