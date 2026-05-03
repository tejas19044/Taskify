'use client'

import { useState } from 'react'
import { Trash2, Check } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { LabelColorPicker } from './LabelColorPicker'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import type { Label } from '@/types'

interface LabelRowProps {
  label: Label
  onUpdate: (id: string, updates: Partial<Label>) => void
  onDelete: (id: string) => void
}

export function LabelRow({ label, onUpdate, onDelete }: LabelRowProps) {
  const [name, setName] = useState(label.name)
  const [isEditing, setIsEditing] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value)
    setIsEditing(true)
  }

  const handleSave = () => {
    if (name.trim()) {
      onUpdate(label.id, { name: name.trim() })
      setIsEditing(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSave()
    if (e.key === 'Escape') { setName(label.name); setIsEditing(false) }
  }

  return (
    <div className="flex items-center gap-3">
      {/* Color swatch */}
      <Popover>
        <PopoverTrigger
          className="h-7 w-7 flex-shrink-0 rounded-full transition-transform hover:scale-110 border-2 border-white shadow-sm cursor-pointer"
          style={{ backgroundColor: label.color }}
          render={<span />}
        />
        <PopoverContent className="w-auto p-3">
          <LabelColorPicker
            value={label.color}
            onChange={(color) => onUpdate(label.id, { color })}
          />
        </PopoverContent>
      </Popover>

      {/* Name input */}
      <Input
        className="h-8 flex-1 text-sm"
        value={name}
        onChange={handleNameChange}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
      />

      {/* Save indicator */}
      {isEditing && (
        <Button type="button" size="icon" variant="ghost" className="h-7 w-7 text-emerald-600" onClick={handleSave}>
          <Check className="h-3.5 w-3.5" />
        </Button>
      )}

      {/* Delete */}
      <Button
        type="button"
        size="icon"
        variant="ghost"
        className="h-7 w-7 text-slate-400 hover:text-red-500"
        onClick={() => setShowConfirm(true)}
      >
        <Trash2 className="h-3.5 w-3.5" />
      </Button>

      <ConfirmDialog
        open={showConfirm}
        onOpenChange={setShowConfirm}
        title="Delete label?"
        description={`"${label.name}" will be permanently deleted. Tasks using this label won't be affected.`}
        confirmLabel="Delete"
        onConfirm={() => onDelete(label.id)}
      />
    </div>
  )
}
