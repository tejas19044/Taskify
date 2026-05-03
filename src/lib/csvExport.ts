import { getTasksByUser } from '@/services/taskService'
import { getLabelsByUser } from '@/services/priorityLabelService'
import { getPrioritiesByUser } from '@/services/priorityService'
import type { Task, Label, Priority } from '@/types'

function htmlToText(html: string): string {
  return html
    .replace(/<li[^>]*data-checked="true"[^>]*>/gi, '[x] ')
    .replace(/<li[^>]*data-checked="false"[^>]*>/gi, '[ ] ')
    .replace(/<\/(p|li|div|h[1-6])>/gi, ' ')
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function cell(v: string | number | boolean | null | undefined): string {
  if (v === null || v === undefined || v === '') return ''
  const s = String(v)
  if (s.includes(',') || s.includes('"') || s.includes('\n') || s.includes('\r')) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}

const HEADERS = [
  'Title',
  'Status',
  'Scheduled Date',
  'Half Day',
  'Estimated Hours',
  'Label',
  'Priority',
  'Tags',
  'Description',
  'Reference URL',
  'Recurring',
  'Created At',
  'Updated At',
]

function taskToRow(task: Task, labels: Label[], priorities: Priority[]): string[] {
  const label = labels.find((l) => l.id === task.labelId)
  const priority = priorities.find((p) => p.id === task.priorityId)

  const status = task.completed
    ? 'Completed'
    : task.scheduledDate === null
    ? 'Pending'
    : 'Scheduled'

  return [
    task.title,
    status,
    task.scheduledDate ?? '',
    task.halfDay === 'am' ? 'Morning' : task.halfDay === 'pm' ? 'Afternoon' : '',
    String(task.estimatedHours),
    label?.name ?? '',
    priority?.name ?? '',
    task.tags.join('; '),
    task.description ? htmlToText(task.description) : '',
    task.referenceUrl ?? '',
    task.recurringGroupId ? 'Yes' : 'No',
    task.createdAt ? new Date(task.createdAt).toLocaleString() : '',
    task.updatedAt ? new Date(task.updatedAt).toLocaleString() : '',
  ]
}

export function generateTasksCsv(userId: string, from: string, to: string): string {
  const tasks = getTasksByUser(userId)
  const labels = getLabelsByUser(userId)
  const priorities = getPrioritiesByUser(userId)

  const filtered = tasks.filter((t) => {
    if (t.scheduledDate === null) return true          // pending — always included
    return t.scheduledDate >= from && t.scheduledDate <= to
  })

  const rows = [
    HEADERS.map(cell).join(','),
    ...filtered.map((t) => taskToRow(t, labels, priorities).map(cell).join(',')),
  ]

  return rows.join('\r\n')
}

export function downloadCsv(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
