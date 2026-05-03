'use client'

import dynamic from 'next/dynamic'
import { Calendar, Clock, Tag, Link2, Layers, Flag, Repeat } from 'lucide-react'
import type { Task, Label, Priority, RecurrenceFrequency, RecurrenceRule } from '@/types'
import { cn } from '@/lib/utils'
import { DatePicker } from '@/components/shared/DatePicker'

const RichTextEditor = dynamic(
  () => import('@/components/shared/RichTextEditor').then((m) => m.RichTextEditor),
  { ssr: false, loading: () => <div className="min-h-[180px] rounded-xl bg-slate-50 animate-pulse" /> }
)

export interface TaskFormData {
  title: string
  description: string
  scheduledDate: string
  estimatedHours: number
  labelId: string
  priorityId: string
  tags: string
  referenceUrl: string
  recurrenceRule: RecurrenceRule | null
}

interface TaskFormFieldsProps {
  data: TaskFormData
  onChange: (data: TaskFormData) => void
  labels: Label[]
  priorities: Priority[]
}

function autoResize(el: HTMLTextAreaElement) {
  el.style.height = 'auto'
  el.style.height = el.scrollHeight + 'px'
}

function ColorDot({ color }: { color?: string }) {
  return color
    ? <span className="h-2.5 w-2.5 rounded-full flex-shrink-0 ring-1 ring-black/10" style={{ backgroundColor: color }} />
    : <span className="h-2.5 w-2.5 rounded-full flex-shrink-0 border-2 border-dashed border-slate-300" />
}

interface PropRowProps {
  icon: React.ElementType
  label: string
  children: React.ReactNode
  noDivider?: boolean
  className?: string
}

function PropRow({ icon: Icon, label, children, noDivider, className }: PropRowProps) {
  return (
    <div className={cn('flex items-center gap-4 px-4 py-3', !noDivider && 'border-b border-slate-100/80', className)}>
      <div className="flex items-center gap-2.5 w-36 flex-shrink-0">
        <Icon className="h-4 w-4 text-slate-400" />
        <span className="text-sm text-slate-500">{label}</span>
      </div>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  )
}

const valueClass =
  'w-full bg-transparent text-sm text-slate-800 placeholder:text-slate-400 outline-none border-0 p-0 focus:ring-0'

const selectValueClass =
  'w-full bg-transparent text-sm text-slate-800 outline-none border-0 p-0 cursor-pointer focus:ring-0 appearance-none'

// Mon-first order matching the board week display
const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0]
const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

function fourWeeksFromNow(): string {
  const d = new Date()
  d.setDate(d.getDate() + 28)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function TaskFormFields({ data, onChange, labels, priorities }: TaskFormFieldsProps) {
  const set = (field: keyof TaskFormData) => (value: string | number) =>
    onChange({ ...data, [field]: value })

  const selectedLabel = labels.find((l) => l.id === data.labelId)
  const selectedPriority = priorities.find((p) => p.id === data.priorityId)

  const handleFrequencyChange = (freq: RecurrenceFrequency | '') => {
    if (!freq) {
      onChange({ ...data, recurrenceRule: null })
      return
    }
    const startDay = data.scheduledDate
      ? new Date(data.scheduledDate + 'T12:00:00').getDay()
      : new Date().getDay()
    onChange({
      ...data,
      recurrenceRule: {
        frequency: freq,
        days: freq === 'weekly' ? [startDay] : [],
        endDate: data.recurrenceRule?.endDate ?? fourWeeksFromNow(),
      },
    })
  }

  const toggleDay = (dayNum: number) => {
    if (!data.recurrenceRule) return
    const days = data.recurrenceRule.days.includes(dayNum)
      ? data.recurrenceRule.days.filter((d) => d !== dayNum)
      : [...data.recurrenceRule.days, dayNum]
    onChange({ ...data, recurrenceRule: { ...data.recurrenceRule, days } })
  }

  return (
    <div className="flex flex-col gap-6">

      {/* Title */}
      <textarea
        className="w-full resize-none overflow-hidden bg-transparent text-2xl font-semibold text-slate-900 placeholder:text-slate-300 outline-none leading-snug border-0 p-0 focus:ring-0"
        placeholder="Task title"
        value={data.title}
        rows={1}
        autoFocus
        required
        onChange={(e) => {
          set('title')(e.target.value)
          autoResize(e.target)
        }}
        onFocus={(e) => autoResize(e.target)}
      />

      {/* Description */}
      <RichTextEditor
        value={data.description}
        onChange={(html) => set('description')(html)}
        placeholder="Add description, steps, links, context…"
        minimal
      />

      {/* Properties panel */}
      <div className="rounded-2xl border border-slate-100 bg-white overflow-hidden shadow-sm">

        {/* Date row — only shown when no repeat is active; start date moves into the repeat section */}
        {!data.recurrenceRule && (
          <PropRow icon={Calendar} label="Date">
            <DatePicker
              value={data.scheduledDate}
              onChange={(val) => onChange({ ...data, scheduledDate: val })}
              placeholder="Pick a date"
            />
          </PropRow>
        )}

        <PropRow icon={Clock} label="Est. hours">
          <div className="flex items-center gap-2">
            <input
              type="number"
              className={cn(valueClass, 'w-16')}
              min={0.25}
              max={24}
              step={0.25}
              value={data.estimatedHours}
              onChange={(e) => set('estimatedHours')(parseFloat(e.target.value) || 0)}
            />
            <span className="text-sm text-slate-400">hrs</span>
          </div>
        </PropRow>

        {/* Repeat row — expands inline when a frequency is selected */}
        <PropRow
          icon={Repeat}
          label="Repeat"
          className={cn(data.recurrenceRule && 'items-start pt-3')}
        >
          <div className="flex flex-col gap-2.5 w-full">
            <select
              className={selectValueClass}
              value={data.recurrenceRule?.frequency ?? ''}
              onChange={(e) => handleFrequencyChange(e.target.value as RecurrenceFrequency | '')}
            >
              <option value="">No repeat</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>

            {data.recurrenceRule && (
              <div className="rounded-xl border border-slate-100 bg-slate-50/70 px-3 py-2.5 flex flex-col gap-2.5">
                {/* Start date */}
                <div className="flex items-center gap-2">
                  <span className="w-10 shrink-0 text-xs text-slate-400">Start</span>
                  <DatePicker
                    value={data.scheduledDate}
                    onChange={(val) => onChange({ ...data, scheduledDate: val })}
                    placeholder="Pick start date"
                  />
                </div>

                {/* Day toggles for weekly — label spacer keeps them aligned with Start/End pickers */}
                {data.recurrenceRule.frequency === 'weekly' && (
                  <div className="flex items-center gap-2">
                    <span className="w-10 shrink-0" />
                    <div className="flex items-center gap-1.5">
                    {DAY_ORDER.map((dayNum, i) => {
                      const isSelected = data.recurrenceRule!.days.includes(dayNum)
                      return (
                        <button
                          key={dayNum}
                          type="button"
                          onClick={() => toggleDay(dayNum)}
                          className={cn(
                            'flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold transition-colors select-none',
                            isSelected
                              ? 'bg-indigo-500 text-white'
                              : 'border border-slate-200 bg-white text-slate-500 hover:border-indigo-300 hover:text-indigo-500'
                          )}
                        >
                          {DAY_LABELS[i]}
                        </button>
                      )
                    })}
                    </div>
                  </div>
                )}

                {/* End date */}
                <div className="flex items-center gap-2">
                  <span className="w-10 shrink-0 text-xs text-slate-400">End</span>
                  <DatePicker
                    value={data.recurrenceRule.endDate}
                    onChange={(val) =>
                      onChange({ ...data, recurrenceRule: { ...data.recurrenceRule!, endDate: val } })
                    }
                    placeholder="Pick end date"
                    minDate={data.scheduledDate || undefined}
                  />
                </div>
              </div>
            )}
          </div>
        </PropRow>

        <PropRow icon={Flag} label="Priority">
          <div className="flex items-center gap-2.5">
            <ColorDot color={selectedPriority?.color} />
            <select
              className={selectValueClass}
              value={data.priorityId}
              onChange={(e) => set('priorityId')(e.target.value)}
            >
              <option value="">No priority</option>
              {priorities.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        </PropRow>

        <PropRow icon={Layers} label="Label">
          <div className="flex items-center gap-2.5">
            <ColorDot color={selectedLabel?.color} />
            <select
              className={selectValueClass}
              value={data.labelId}
              onChange={(e) => set('labelId')(e.target.value)}
            >
              <option value="">No label</option>
              {labels.map((l) => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
            </select>
          </div>
        </PropRow>

        <PropRow icon={Tag} label="Tags">
          <input
            className={valueClass}
            placeholder="Design, Backend, Research"
            value={data.tags}
            onChange={(e) => set('tags')(e.target.value)}
          />
        </PropRow>

        <PropRow icon={Link2} label="Reference URL" noDivider>
          <input
            type="url"
            className={valueClass}
            placeholder="https://…"
            value={data.referenceUrl}
            onChange={(e) => set('referenceUrl')(e.target.value)}
          />
        </PropRow>

      </div>
    </div>
  )
}

export function taskFormToTask(data: TaskFormData, userId: string): Omit<Task, 'id' | 'createdAt' | 'updatedAt'> {
  return {
    userId,
    title: data.title.trim(),
    description: data.description.trim(),
    scheduledDate: data.scheduledDate.trim() || null,
    estimatedHours: data.estimatedHours,
    labelId: data.labelId || '',
    priorityId: data.priorityId || '',
    tags: data.tags.split(',').map((t) => t.trim()).filter(Boolean),
    referenceUrl: data.referenceUrl.trim() || undefined,
  }
}

export function taskToFormData(task: Task): TaskFormData {
  return {
    title: task.title,
    description: task.description,
    scheduledDate: task.scheduledDate ?? '',
    estimatedHours: task.estimatedHours,
    labelId: task.labelId || '',
    priorityId: task.priorityId || '',
    tags: task.tags.join(', '),
    referenceUrl: task.referenceUrl ?? '',
    recurrenceRule: null,
  }
}

export function emptyFormData(defaultDate?: string): TaskFormData {
  return {
    title: '',
    description: '',
    scheduledDate: defaultDate ?? '',
    estimatedHours: 1,
    labelId: '',
    priorityId: '',
    tags: '',
    referenceUrl: '',
    recurrenceRule: null,
  }
}
