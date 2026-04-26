import { LucideIcon } from 'lucide-react'

interface MetricCardProps {
  label: string
  value: string | number
  subLabel?: string
  accentColor?: string
  icon?: LucideIcon
  trend?: { value: number; positive: boolean }
}

export function MetricCard({ label, value, subLabel, accentColor = '#6366f1', icon: Icon, trend }: MetricCardProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      {/* Accent top strip */}
      <div className="absolute inset-x-0 top-0 h-1" style={{ backgroundColor: accentColor }} />

      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">{label}</p>
          <p className="mt-1 text-3xl font-bold text-slate-900">{value}</p>
          {subLabel && <p className="mt-0.5 text-xs text-slate-500">{subLabel}</p>}
          {trend && (
            <p className={`mt-1 text-xs font-medium ${trend.positive ? 'text-emerald-600' : 'text-red-500'}`}>
              {trend.positive ? '↑' : '↓'} {Math.abs(trend.value)}% vs last period
            </p>
          )}
        </div>
        {Icon && (
          <div className="rounded-xl p-2.5" style={{ backgroundColor: `${accentColor}15` }}>
            <Icon className="h-5 w-5" style={{ color: accentColor }} />
          </div>
        )}
      </div>
    </div>
  )
}
