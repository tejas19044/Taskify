'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { DashboardRange } from '@/types'
import { LabelsSection } from './PriorityLabelsSection'
import { useAuth } from '@/context/AuthContext'
import { useSettings } from '@/hooks/useSettings'
import { usePriorityLabels } from '@/hooks/usePriorityLabels'
import { usePriorities } from '@/hooks/usePriorities'
import { toast } from 'sonner'

const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

function SectionCard({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
        {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
      </div>
      {children}
    </div>
  )
}

export function SettingsPage() {
  const { currentUser } = useAuth()
  const userId = currentUser!.id
  const { settings, updateSettings } = useSettings(userId)
  const { labels, createLabel, updateLabel, deleteLabel } = usePriorityLabels(userId)
  const { priorities, createPriority, updatePriority, deletePriority } = usePriorities(userId)

  const activeDays = settings.workingMode === '7-day' ? DAY_NAMES : DAY_NAMES.slice(0, 5)

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="border-b border-slate-200 bg-white px-4 py-3">
        <h1 className="text-xl font-bold text-slate-900">Settings</h1>
        <p className="text-sm text-slate-500">Customize your board and planning preferences</p>
      </div>

      <div className="p-4 space-y-4 max-w-2xl">
        {/* Working mode */}
        <SectionCard title="Board Layout" description="Configure how your board displays tasks">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-700">Working mode</p>
                <p className="text-xs text-slate-500">Show 5 days (Mon–Fri) or 7 days (Mon–Sun)</p>
              </div>
              <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-0.5">
                {(['5-day', '7-day'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => { updateSettings({ workingMode: mode }); toast.success('Saved') }}
                    className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${settings.workingMode === mode ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-700">Board mode</p>
                <p className="text-xs text-slate-500">Week view or today-centered rolling view</p>
              </div>
              <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-0.5">
                {([
                  { value: 'current-week', label: 'Week' },
                  { value: 'rolling', label: 'Rolling' },
                ] as const).map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => { updateSettings({ boardMode: value }); toast.success('Saved') }}
                    className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${settings.boardMode === value ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </SectionCard>

        {/* Dashboard */}
        <SectionCard title="Dashboard" description="Default analytics range">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium text-slate-700">Default range</Label>
            <select
              className="h-8 w-40 rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-700 outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 transition-all"
              value={settings.defaultDashboardRange}
              onChange={(e) => { updateSettings({ defaultDashboardRange: e.target.value as DashboardRange }); toast.success('Saved') }}
            >
              <option value="this-week">This week</option>
              <option value="this-month">This month</option>
              <option value="last-7">Last 7 days</option>
              <option value="last-30">Last 30 days</option>
            </select>
          </div>
        </SectionCard>

        {/* Working hours */}
        <SectionCard title="Working Hours" description="Set your daily capacity for workload calculations">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-700">Default daily hours</p>
                <p className="text-xs text-slate-500">Applied to all days without overrides</p>
              </div>
              <Input
                type="number"
                className="w-20 h-8 text-center text-sm"
                min={1}
                max={24}
                step={0.5}
                value={settings.defaultDailyHours}
                onChange={(e) => updateSettings({ defaultDailyHours: parseFloat(e.target.value) || 8 })}
                onBlur={() => toast.success('Saved')}
              />
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-slate-700">Per-day overrides</p>
              <p className="mb-3 text-xs text-slate-500">Override hours for specific days (e.g. lighter on Fridays)</p>
              <div className="space-y-2">
                {activeDays.map((day) => (
                  <div key={day} className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 w-28">{day}</span>
                    <Input
                      type="number"
                      className="w-20 h-7 text-center text-sm"
                      min={0}
                      max={24}
                      step={0.5}
                      placeholder={String(settings.defaultDailyHours)}
                      value={settings.perDayOverrides[day] ?? ''}
                      onChange={(e) => {
                        const val = e.target.value
                        const overrides = { ...settings.perDayOverrides }
                        if (val === '') {
                          delete overrides[day]
                        } else {
                          overrides[day] = parseFloat(val) || 0
                        }
                        updateSettings({ perDayOverrides: overrides })
                      }}
                      onBlur={() => toast.success('Saved')}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </SectionCard>

        {/* Labels */}
        <SectionCard title="Labels" description="Create and manage your personal task labels">
          <LabelsSection
            userId={userId}
            labels={labels}
            onCreate={(data) => { createLabel(data); toast.success('Label created') }}
            onUpdate={(id, updates) => { updateLabel(id, updates); toast.success('Label updated') }}
            onDelete={(id) => { deleteLabel(id); toast.success('Label deleted') }}
            addButtonLabel="Add label"
          />
        </SectionCard>

        {/* Priority Levels */}
        <SectionCard title="Priority Levels" description="Create and manage priority levels (e.g. High, Medium, Low)">
          <LabelsSection
            userId={userId}
            labels={priorities}
            onCreate={(data) => { createPriority(data); toast.success('Priority created') }}
            onUpdate={(id, updates) => { updatePriority(id, updates); toast.success('Priority updated') }}
            onDelete={(id) => { deletePriority(id); toast.success('Priority deleted') }}
            addButtonLabel="Add priority"
          />
        </SectionCard>
      </div>
    </div>
  )
}
