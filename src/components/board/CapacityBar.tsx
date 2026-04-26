interface CapacityBarProps {
  hours: number
  capacity: number
}

export function CapacityBar({ hours, capacity }: CapacityBarProps) {
  const pct = capacity > 0 ? Math.min((hours / capacity) * 100, 100) : 0
  const colorClass =
    pct > 90 ? 'bg-red-400' : pct > 70 ? 'bg-amber-400' : 'bg-emerald-400'

  return (
    <div className="h-1 w-full overflow-hidden rounded-full bg-slate-200">
      <div
        className={`h-full rounded-full transition-all duration-300 ${colorClass}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}
