'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Trash2, CheckCircle2, RotateCcw } from 'lucide-react'
import { TaskFormFields, taskFormToTask, taskToFormData, emptyFormData } from './TaskFormFields'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import type { Task, Label, Priority, RecurrenceRule } from '@/types'

function toYMD(d: Date) {
  return d.toISOString().slice(0, 10)
}

type PendingAction =
  | { type: 'save'; updates: Partial<Task> }
  | { type: 'delete' }

interface EditTaskDialogProps {
  task: Task | null
  open: boolean
  onOpenChange: (open: boolean) => void
  labels: Label[]
  priorities: Priority[]
  onSave: (id: string, data: Partial<Task>) => void
  onDelete: (id: string) => void
  onSaveAll?: (recurringGroupId: string, updates: Partial<Task>) => void
  onDeleteAll?: (recurringGroupId: string) => void
  onConvertToRecurring?: (id: string, base: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>, rule: RecurrenceRule) => void
  onComplete?: (id: string, completed: boolean) => void
}

export function EditTaskDialog({
  task,
  open,
  onOpenChange,
  labels,
  priorities,
  onSave,
  onDelete,
  onSaveAll,
  onDeleteAll,
  onConvertToRecurring,
  onComplete,
}: EditTaskDialogProps) {
  const [formData, setFormData] = useState(() => task ? taskToFormData(task) : emptyFormData())
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null)
  const [isCompleted, setIsCompleted] = useState(task?.completed ?? false)

  useEffect(() => { setIsCompleted(task?.completed ?? false) }, [task])

  useEffect(() => {
    if (task) setFormData(taskToFormData(task))
  }, [task])

  if (!task) return null

  const isTaskToday = task.scheduledDate === toYMD(new Date())
  const rule = formData.recurrenceRule
  const isWeeklyWithNoDays = rule?.frequency === 'weekly' && rule.days.length === 0
  const submitDisabled = !formData.title.trim() || isWeeklyWithNoDays || (!!rule && !rule.endDate) || (!!rule && !formData.scheduledDate)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (submitDisabled) return
    const base = taskFormToTask(formData, task.userId)

    // Converting a non-recurring task into a recurring series
    if (rule && !task.recurringGroupId) {
      onConvertToRecurring?.(task.id, base, rule)
      onOpenChange(false)
      return
    }

    if (task.recurringGroupId) {
      setPendingAction({ type: 'save', updates: base })
    } else {
      onSave(task.id, base)
      onOpenChange(false)
    }
  }

  const handleDeleteRequest = () => {
    if (task.recurringGroupId) {
      setPendingAction({ type: 'delete' })
    } else {
      setShowDeleteConfirm(true)
    }
  }

  const closePending = () => setPendingAction(null)

  const handleJustThis = () => {
    if (!pendingAction) return
    if (pendingAction.type === 'save') {
      onSave(task.id, pendingAction.updates)
    } else {
      onDelete(task.id)
    }
    closePending()
    onOpenChange(false)
  }

  const handleAllSeries = () => {
    if (!pendingAction || !task.recurringGroupId) return
    if (pendingAction.type === 'save') {
      // Don't propagate scheduledDate — each instance keeps its own date
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { scheduledDate, ...seriesUpdates } = pendingAction.updates as Partial<Task>
      onSaveAll?.(task.recurringGroupId, seriesUpdates)
    } else {
      onDeleteAll?.(task.recurringGroupId)
    }
    closePending()
    onOpenChange(false)
  }

  const isDelete = pendingAction?.type === 'delete'

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[720px] max-h-[90vh] overflow-y-auto p-0">
          <form onSubmit={handleSubmit}>
            {isTaskToday && onComplete && (
              <div className="flex justify-end px-8 pt-6 pb-0">
                <Button
                  type="button"
                  size="sm"
                  onClick={() => {
                    const next = !isCompleted
                    setIsCompleted(next)
                    onComplete(task.id, next)
                  }}
                  className={
                    isCompleted
                      ? 'bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700'
                      : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                  }
                >
                  {isCompleted ? (
                    <><RotateCcw className="mr-1.5 h-3.5 w-3.5" />Mark incomplete</>
                  ) : (
                    <><CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />Complete</>
                  )}
                </Button>
              </div>
            )}
            <div className="px-8 pt-6 pb-4">
              <TaskFormFields data={formData} onChange={setFormData} labels={labels} priorities={priorities} />
            </div>
            <div className="flex items-center justify-between px-8 py-5">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-red-400 hover:bg-red-50 hover:text-red-600"
                onClick={handleDeleteRequest}
              >
                <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                Delete
              </Button>
              <div className="flex gap-2">
                <Button type="button" variant="ghost" size="sm" className="text-slate-500" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="bg-indigo-600 hover:bg-indigo-700 px-5" disabled={submitDisabled}>
                  {rule ? 'Save as recurring' : 'Save changes'}
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Single-task delete confirmation (non-recurring) */}
      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Delete task"
        description="This task will be permanently deleted. This cannot be undone."
        confirmLabel="Delete"
        onConfirm={() => {
          onDelete(task.id)
          onOpenChange(false)
        }}
      />

      {/* Recurring scope dialog — acts as both scope selector and confirmation */}
      <Dialog open={pendingAction !== null} onOpenChange={(open) => !open && closePending()}>
        <DialogContent className="sm:max-w-[380px]">
          <DialogHeader>
            <DialogTitle>
              {isDelete ? 'Delete recurring task?' : 'Edit recurring task?'}
            </DialogTitle>
            <DialogDescription>
              {isDelete
                ? 'This task is part of a series. Choose what to delete — this cannot be undone.'
                : 'This task is part of a series. Choose which events to update.'}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2 pt-1">
            <Button
              variant={isDelete ? 'destructive' : 'outline'}
              className={`w-full justify-start ${!isDelete ? 'text-slate-700' : ''}`}
              onClick={handleJustThis}
            >
              {isDelete ? 'Delete just this event' : 'Just this event'}
            </Button>
            <Button
              variant="destructive"
              className={`w-full justify-start ${!isDelete ? 'bg-indigo-600 hover:bg-indigo-700' : ''}`}
              onClick={handleAllSeries}
            >
              {isDelete ? 'Delete all events in series' : 'All events in series'}
            </Button>
            <Button variant="ghost" className="w-full text-slate-500" onClick={closePending}>
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
