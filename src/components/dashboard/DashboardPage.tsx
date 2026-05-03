'use client'

import { useState, useMemo, useEffect } from 'react'
import { CheckCircle2, Clock } from 'lucide-react'
import { DailyBarChart } from './DailyBarChart'
import { PriorityPieChart } from './PriorityPieChart'
import { RangePicker } from './RangePicker'
import { UserSelector } from './UserSelector'
import { useAuth } from '@/context/AuthContext'
import { useTasks } from '@/hooks/useTasks'
import { useSettings } from '@/hooks/useSettings'
import { usePriorityLabels } from '@/hooks/usePriorityLabels'
import { usePriorities } from '@/hooks/usePriorities'
import { getAllUsers } from '@/services/userService'
import {
  computeDailyWorkload,
  computeTagBreakdown,
  computeLabelBreakdown,
  computePriorityLevelBreakdown,
  computeSummary,
} from '@/lib/analytics'
import { rangeToDateStrings, formatDateDisplay } from '@/lib/dateUtils'
import type { DashboardRange } from '@/types'
import { cn } from '@/lib/utils'

interface StatCardProps {
  label: string
  value: string | number
  sub?: string
  icon: React.ElementType
  color: string
  bg: string
}

function StatCard({ label, value, sub, icon: Icon, color, bg }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
          <p className="mt-1 text-3xl font-bold text-slate-900">{value}</p>
          {sub && <p className="mt-0.5 text-xs text-slate-500">{sub}</p>}
        </div>
        <div className={cn('flex h-9 w-9 items-center justify-center rounded-xl', bg)}>
          <Icon className={cn('h-4.5 w-4.5', color)} />
        </div>
      </div>
    </div>
  )
}

export function DashboardPage() {
  const { currentUser } = useAuth()
  const isAdmin = currentUser?.role === 'admin'

  const [selectedUserId, setSelectedUserId] = useState(currentUser!.id)
  const [range, setRange] = useState<DashboardRange>('this-week')
  const [customStart, setCustomStart] = useState('')
  const [customEnd, setCustomEnd] = useState('')

  const { tasks } = useTasks(selectedUserId)
  const { settings } = useSettings(selectedUserId)
  const { labels } = usePriorityLabels(selectedUserId)
  const { priorities } = usePriorities(selectedUserId)
  const [allUsers, setAllUsers] = useState<import('@/types').User[]>([])
  useEffect(() => {
    getAllUsers().then((users) => setAllUsers(users.filter((u) => u.active)))
  }, [])

  const { start, end } = useMemo(
    () => rangeToDateStrings(range, customStart || undefined, customEnd || undefined),
    [range, customStart, customEnd]
  )

  const summary = useMemo(
    () => computeSummary(tasks, start, end, settings.defaultDailyHours),
    [tasks, start, end, settings.defaultDailyHours]
  )
  const dailyWorkload = useMemo(
    () => computeDailyWorkload(tasks, start, end, settings.defaultDailyHours),
    [tasks, start, end, settings.defaultDailyHours]
  )
  const tagBreakdown = useMemo(() => computeTagBreakdown(tasks, start, end), [tasks, start, end])
  const labelBreakdown = useMemo(
    () => computeLabelBreakdown(tasks, labels, start, end),
    [tasks, labels, start, end]
  )
  const priorityLevelBreakdown = useMemo(
    () => computePriorityLevelBreakdown(tasks, priorities, start, end),
    [tasks, priorities, start, end]
  )

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-slate-50/50">
      {/* Header */}
      <div className="border-b border-slate-100 bg-white px-5 py-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-base font-semibold text-slate-900">Dashboard</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              {formatDateDisplay(start)} – {formatDateDisplay(end)}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            {isAdmin && (
              <UserSelector
                users={allUsers}
                selectedUserId={selectedUserId}
                onSelect={setSelectedUserId}
              />
            )}
            <RangePicker
              range={range}
              customStart={customStart}
              customEnd={customEnd}
              onRangeChange={setRange}
              onCustomStartChange={setCustomStart}
              onCustomEndChange={setCustomEnd}
            />
          </div>
        </div>
      </div>

      <div className="flex-1 p-5 space-y-5">
        {/* KPIs */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            label="Tasks Done"
            value={summary.rangeCompletedTasks}
            sub={`of ${summary.totalRangeTasks} scheduled`}
            icon={CheckCircle2}
            color="text-emerald-600"
            bg="bg-emerald-50"
          />
          <StatCard
            label="Hours"
            value={`${summary.rangeCompletedHours}h`}
            sub={`${summary.avgHoursPerDay}h avg/day`}
            icon={Clock}
            color="text-sky-600"
            bg="bg-sky-50"
          />
        </div>

        {/* Daily workload chart */}
        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Daily Workload</h3>
          <DailyBarChart data={dailyWorkload} />
        </div>

        {/* Label + Priority donuts side by side */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <PriorityPieChart data={labelBreakdown} title="By Label" />
          <PriorityPieChart data={priorityLevelBreakdown} title="By Priority" />
        </div>

        {/* Tag breakdown */}
        {tagBreakdown.length > 0 && (
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-wide text-slate-400">By Tag</h3>
            <div className="space-y-3">
              {tagBreakdown.slice(0, 6).map((item) => {
                const maxHours = tagBreakdown[0]?.hours ?? 1
                const pct = Math.round((item.hours / maxHours) * 100)
                return (
                  <div key={item.tag} className="flex items-center gap-3">
                    <span className="w-24 shrink-0 truncate text-xs font-medium text-slate-600">{item.tag}</span>
                    <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full rounded-full bg-indigo-400 transition-all duration-500" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="w-8 shrink-0 text-right text-xs font-bold text-slate-600">{item.hours}h</span>
                    <span className="w-14 shrink-0 text-right text-[11px] text-slate-400">{item.count} tasks</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
