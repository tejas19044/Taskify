import type { Priority, Label } from '@/types'

interface PriorityBadgeProps {
  label?: Priority | Label | null
  size?: 'sm' | 'md'
}

export function PriorityBadge({ label, size = 'sm' }: PriorityBadgeProps) {
  if (!label) return null
  return (
    <span
      className={`inline-flex items-center rounded-full font-medium text-white ${
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm'
      }`}
      style={{ backgroundColor: label.color }}
    >
      {label.name}
    </span>
  )
}
