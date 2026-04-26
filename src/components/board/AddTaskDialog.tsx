'use client'

import { useState } from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { TaskFormFields, taskFormToTask, emptyFormData } from './TaskFormFields'
import type { Label, Priority } from '@/types'

interface AddTaskDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultDate?: string
  userId: string
  labels: Label[]
  priorities: Priority[]
  onAdd: (data: ReturnType<typeof taskFormToTask>) => void
}

export function AddTaskDialog({
  open,
  onOpenChange,
  defaultDate,
  userId,
  labels,
  priorities,
  onAdd,
}: AddTaskDialogProps) {
  const [formData, setFormData] = useState(() => emptyFormData(defaultDate))

  const handleOpenChange = (val: boolean) => {
    if (!val) setFormData(emptyFormData(defaultDate))
    onOpenChange(val)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim()) return
    onAdd(taskFormToTask(formData, userId))
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
            <Button type="submit" size="sm" className="bg-indigo-600 hover:bg-indigo-700 px-5" disabled={!formData.title.trim()}>
              Add task
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
