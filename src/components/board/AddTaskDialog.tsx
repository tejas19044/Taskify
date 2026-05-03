'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { TaskFormFields, taskFormToTask, emptyFormData } from './TaskFormFields'
import type { Label, Priority, RecurrenceRule, Task } from '@/types'

interface AddTaskDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultDate?: string
  defaultHalfDay?: 'am' | 'pm'
  userId: string
  labels: Label[]
  priorities: Priority[]
  onAdd: (data: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>, rule?: RecurrenceRule) => void
}

export function AddTaskDialog({
  open,
  onOpenChange,
  defaultDate,
  defaultHalfDay,
  userId,
  labels,
  priorities,
  onAdd,
}: AddTaskDialogProps) {
  const [formData, setFormData] = useState(() => emptyFormData(defaultDate))

  // Sync defaultDate into the form whenever the dialog opens so the date
  // field is pre-filled even on the first mount (useState only runs once).
  useEffect(() => {
    if (open) setFormData(emptyFormData(defaultDate))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const handleOpenChange = (val: boolean) => {
    if (!val) setFormData(emptyFormData(defaultDate))
    onOpenChange(val)
  }

  const rule = formData.recurrenceRule
  const isWeeklyWithNoDays = rule?.frequency === 'weekly' && rule.days.length === 0
  const submitDisabled =
    !formData.title.trim() ||
    isWeeklyWithNoDays ||
    (!!rule && !rule.endDate) ||
    (!!rule && !formData.scheduledDate)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (submitDisabled) return
    const taskData = taskFormToTask(formData, userId)
    onAdd({ ...taskData, halfDay: defaultHalfDay }, rule ?? undefined)
    setFormData(emptyFormData(defaultDate))
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[680px] max-h-[90vh] overflow-y-auto p-0 gap-0">
        <form onSubmit={handleSubmit}>
          <div className="px-8 pt-8 pb-4">
            <TaskFormFields data={formData} onChange={setFormData} labels={labels} priorities={priorities} />
          </div>
          <div className="flex items-center justify-end gap-2 px-8 py-5">
            <Button type="button" variant="ghost" size="sm" className="text-slate-500" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" className="bg-indigo-600 hover:bg-indigo-700 px-5" disabled={submitDisabled}>
              {rule ? 'Add recurring tasks' : 'Add task'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
