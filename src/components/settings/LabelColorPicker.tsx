'use client'

const PRESET_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e',
  '#ef4444', '#f97316', '#f59e0b', '#eab308',
  '#84cc16', '#22c55e', '#10b981', '#14b8a6',
  '#06b6d4', '#0ea5e9', '#3b82f6', '#64748b',
]

interface LabelColorPickerProps {
  value: string
  onChange: (color: string) => void
}

export function LabelColorPicker({ value, onChange }: LabelColorPickerProps) {
  return (
    <div className="grid grid-cols-8 gap-1.5">
      {PRESET_COLORS.map((color) => (
        <button
          key={color}
          type="button"
          onClick={() => onChange(color)}
          className="h-6 w-6 rounded-full transition-transform hover:scale-110"
          style={{
            backgroundColor: color,
            outline: value === color ? `2px solid ${color}` : 'none',
            outlineOffset: 2,
          }}
        />
      ))}
    </div>
  )
}
