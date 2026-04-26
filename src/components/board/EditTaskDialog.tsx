'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import { TaskFormFields, taskFormToTask, taskToFormData, emptyFormData } from './TaskFormFields'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import type { Task, Label, Priority } from '@/types'

interface EditTaskDialogProps {
  task: Task | null
  open: boolean
  onOpenChange: (open: boolean) => void
  labels: Label[]
  priorities: Priority[]
  onSave: (id: string, data: Partial<Task>) => void
  onDelete: (id: string) => void
}

export function EditTaskDialog({ task, open, onOpenChange, labels, priorities, onSave, onDelete }: EditTaskDialogProps) {
  const [formData, setFormData] = useState(() => task ? taskToFormData(task) : emptyFormData())
  const [showConfirm, setShowConfirm] = useState(false)

  useEffect(() => {
    if (task) setFormData(taskToFormData(task))
  }, [task])

  if (!task) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim()) return
    const updates = taskFormToTask(formData, task.userId)
    onSave(task.id, updates)
    onOpenChange(false)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[720px] max-h-[90vh] overflow-y-auto p-0">
          <form onSubmit={handleSubmit}>
            <div className="px-8 pt-8 pb-4">
              <TaskFormFields data={formData} onChange={setFormData} labels={labels} priorities={priorities} />
            </div>
            <div className="flex items-center justify-between px-8 py-5">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-red-400 hover:bg-red-50 hover:text-red-600"
                onClick={() => setShowConfirm(true)}
              >
                <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                Delete
              </Button>
              <div className="flex gap-2">
                <Button type="button" variant="ghost" size="sm" className="text-slate-500" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="bg-indigo-600 hover:bg-indigo-700 px-5" disabled={!formData.title.trim()}>
                  Save changes
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      <ConfirmDialog
        open={showConfirm}
        onOpenChange={setShowConfirm}
        title="Delete task"
        description="This task will be permanently deleted. This cannot be undone."
        confirmLabel="Delete"
        onConfirm={() => {
          onDelete(task.id)
          onOpenChange(false)
        }}
      />
    </>
  )
}
