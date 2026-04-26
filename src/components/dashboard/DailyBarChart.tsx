'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { isDateToday, formatDateDisplay } from '@/lib/dateUtils'
import type { DailyWorkload } from '@/types'

interface DailyBarChartProps {
  data: DailyWorkload[]
}

export function DailyBarChart({ data }: DailyBarChartProps) {
  if (data.length === 0) return (
    <div className="flex h-48 items-center justify-center text-sm text-slate-400">No data</div>
  )

  const chartData = data.map((d) => ({
    date: formatDateDisplay(d.date),
    hours: d.hours,
    count: d.count,
    isToday: isDateToday(d.date),
  }))

  return (
    <div style={{ width: '100%', height: 220 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter={(value: any, name: any) => [
              name === 'hours' ? `${value}h` : value,
              name === 'hours' ? 'Hours' : 'Tasks',
            ]}
          />
          <Bar dataKey="hours" radius={[4, 4, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.isToday ? '#6366f1' : entry.hours > 0 ? '#a5b4fc' : '#e2e8f0'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
