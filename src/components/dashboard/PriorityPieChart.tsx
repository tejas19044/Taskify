'use client'

import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import type { PriorityBreakdown } from '@/types'

interface PriorityPieChartProps {
  data: PriorityBreakdown[]
  title: string
}

const RADIAN = Math.PI / 180

function CustomLabel({
  cx = 0, cy = 0, midAngle = 0, innerRadius = 0, outerRadius = 0, value = 0, percent = 0,
}: {
  cx?: number; cy?: number; midAngle?: number
  innerRadius?: number; outerRadius?: number
  value?: number; percent?: number
}) {
  if (percent < 0.08) return null
  const radius = innerRadius + (outerRadius - innerRadius) * 0.55
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central"
      style={{ fontSize: 12, fontWeight: 700 }}>
      {value}h
    </text>
  )
}

export function PriorityPieChart({ data, title }: PriorityPieChartProps) {


  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm flex flex-col">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-4">{title}</p>

      {data.length === 0 ? (
        <div className="flex flex-1 items-center justify-center h-48 text-sm text-slate-300">No data yet</div>
      ) : (
        <div className="flex items-center gap-4">
          {/* Legend — left column */}
          <div className="flex flex-col gap-3 w-28 flex-shrink-0">
            {data.map((item) => (
              <div key={item.priorityLabelId} className="flex items-center gap-2 min-w-0">
                <span
                  className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: item.labelColor }}
                />
                <span className="text-xs text-slate-500 truncate leading-tight">{item.labelName}</span>
              </div>
            ))}
          </div>

          {/* Donut — takes all remaining space */}
          <div className="relative flex-1" style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius="30%"
                  outerRadius="88%"
                  dataKey="hours"
                  paddingAngle={data.length > 1 ? 2 : 0}
                  startAngle={90}
                  endAngle={-270}
                  labelLine={false}
                  label={(props) => <CustomLabel {...props} />}
                  animationBegin={0}
                  animationDuration={600}
                  animationEasing="ease-out"
                >
                  {data.map((entry, i) => (
                    <Cell key={i} fill={entry.labelColor} stroke="white" strokeWidth={2} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

          </div>
        </div>
      )}
    </div>
  )
}
