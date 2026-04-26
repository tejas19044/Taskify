'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { LabelRow } from './LabelRow'
import { LabelColorPicker } from './LabelColorPicker'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import type { Label } from '@/types'

interface LabelsSectionProps {
  userId: string
  labels: Label[]
  onCreate: (data: Omit<Label, 'id' | 'createdAt'>) => void
  onUpdate: (id: string, updates: Partial<Label>) => void
  onDelete: (id: string) => void
  addButtonLabel?: string
}

export function LabelsSection({
  userId,
  labels,
  onCreate,
  onUpdate,
  onDelete,
  addButtonLabel = 'Add label',
}: LabelsSectionProps) {
  const [newName, setNewName] = useState('')
  const [newColor, setNewColor] = useState('#6366f1')
  const [showAdd, setShowAdd] = useState(false)

  const handleCreate = () => {
    if (!newName.trim()) return
    onCreate({ userId, name: newName.trim(), color: newColor })
    setNewName('')
    setNewColor('#6366f1')
    setShowAdd(false)
  }

  return (
    <div className="space-y-3">
      {labels.map((label) => (
        <LabelRow key={label.id} label={label} onUpdate={onUpdate} onDelete={onDelete} />
      ))}

      {showAdd ? (
        <div className="flex items-center gap-3 rounded-xl border border-dashed border-slate-300 p-3">
          <Popover>
            <PopoverTrigger
              className="h-7 w-7 flex-shrink-0 rounded-full border-2 border-white shadow-sm transition-transform hover:scale-110 cursor-pointer"
              style={{ backgroundColor: newColor }}
              render={<span />}
            />
            <PopoverContent className="w-auto p-3">
              <LabelColorPicker value={newColor} onChange={setNewColor} />
            </PopoverContent>
          </Popover>
          <Input
            className="h-8 flex-1 text-sm"
            placeholder="Name..."
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleCreate(); if (e.key === 'Escape') setShowAdd(false) }}
            autoFocus
          />
          <Button type="button" size="sm" className="h-8 bg-indigo-600 hover:bg-indigo-700" onClick={handleCreate} disabled={!newName.trim()}>
            Add
          </Button>
          <Button type="button" size="sm" variant="ghost" className="h-8" onClick={() => setShowAdd(false)}>
            Cancel
          </Button>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full border-dashed text-slate-500 hover:text-slate-700"
          onClick={() => setShowAdd(true)}
        >
          <Plus className="mr-1 h-3.5 w-3.5" />
          {addButtonLabel}
        </Button>
      )}
    </div>
  )
}

// Keep old name as alias for backward compat
export const PriorityLabelsSection = LabelsSection
