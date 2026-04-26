'use client'

import { CalendarDays } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { DashboardRange } from '@/types'

interface RangePickerProps {
  range: DashboardRange
  customStart?: string
  customEnd?: string
  onRangeChange: (range: DashboardRange) => void
  onCustomStartChange?: (date: string) => void
  onCustomEndChange?: (date: string) => void
}

const PRESETS: { value: DashboardRange; label: string }[] = [
  { value: 'today',        label: 'Today'      },
  { value: 'this-week',    label: 'This Week'  },
  { value: 'last-week',    label: 'Last Week'  },
  { value: 'this-month',   label: 'This Month' },
  { value: 'last-30',      label: 'Last 30d'   },
  { value: 'this-quarter', label: 'Quarter'    },
  { value: 'custom',       label: 'Custom'     },
]

const inputClass =
  'h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-700 outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 transition-all'

export function RangePicker({
  range,
  customStart,
  customEnd,
  onRangeChange,
  onCustomStartChange,
  onCustomEndChange,
}: RangePickerProps) {
  return (
    <div className="flex flex-col gap-2">
      {/* Preset pills */}
      <div className="flex flex-wrap gap-1">
        {PRESETS.map((preset) => (
          <button
            key={preset.value}
            onClick={() => onRangeChange(preset.value)}
            className={cn(
              'rounded-full px-3 py-1 text-xs font-medium transition-all',
              range === preset.value
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            )}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Custom date inputs */}
      {range === 'custom' && (
        <div className="flex items-center gap-2">
          <CalendarDays className="h-3.5 w-3.5 text-slate-400" />
          <input
            type="date"
            className={inputClass}
            value={customStart ?? ''}
            onChange={(e) => onCustomStartChange?.(e.target.value)}
          />
          <span className="text-xs text-slate-400">→</span>
          <input
            type="date"
            className={inputClass}
            value={customEnd ?? ''}
            onChange={(e) => onCustomEndChange?.(e.target.value)}
          />
        </div>
      )}
    </div>
  )
}
