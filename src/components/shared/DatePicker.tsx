'use client'

import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { format, parseISO, isValid, addMonths, addYears } from 'date-fns'
import { CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react'
import { DayPicker, type DayButtonProps } from 'react-day-picker'
import { cn } from '@/lib/utils'

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

interface DatePickerProps {
  value: string        // YYYY-MM-DD or ''
  onChange: (val: string) => void
  placeholder?: string
  minDate?: string     // YYYY-MM-DD — dates before this are disabled
  className?: string
}

// ─── Day button ───────────────────────────────────────────────────────────────

function DayButton({ day, modifiers, onClick, ...props }: DayButtonProps) {
  const isSelected = modifiers.selected
  const isToday = day.date.toDateString() === new Date().toDateString()
  const isOutside = modifiers.outside
  const isDisabled = modifiers.disabled

  return (
    <button
      {...props}
      onClick={onClick}
      className={cn(
        'relative flex h-9 w-9 flex-col items-center justify-center rounded-xl text-[13px] font-medium transition-all duration-100 select-none outline-none focus-visible:ring-2 focus-visible:ring-indigo-400',
        !isSelected && !isDisabled && !isOutside &&
          'text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 cursor-pointer',
        isToday && !isSelected &&
          'bg-amber-400 text-white font-bold hover:bg-amber-500',
        isSelected &&
          'bg-indigo-600 text-white hover:bg-indigo-700 font-semibold shadow-sm cursor-pointer',
        isOutside && !isSelected &&
          'text-slate-300 hover:text-slate-400 hover:bg-slate-50 cursor-pointer',
        isDisabled &&
          'text-slate-200 cursor-not-allowed',
      )}
    >
      {day.date.getDate()}
    </button>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function DatePicker({ value, onChange, placeholder = 'Pick a date', minDate, className }: DatePickerProps) {
  const [open, setOpen] = useState(false)
  const [triggerRect, setTriggerRect] = useState<DOMRect | null>(null)
  const [pickerMode, setPickerMode] = useState<'days' | 'months'>('days')
  const [displayMonth, setDisplayMonth] = useState<Date>(new Date())

  const triggerRef = useRef<HTMLButtonElement>(null)
  const calendarRef = useRef<HTMLDivElement>(null)

  const parsed = value ? parseISO(value) : undefined
  const selected = parsed && isValid(parsed) ? parsed : undefined

  const minParsed = minDate ? parseISO(minDate) : undefined
  const minDateObj = minParsed && isValid(minParsed) ? minParsed : undefined

  const handleOpen = () => {
    if (triggerRef.current) {
      setTriggerRect(triggerRef.current.getBoundingClientRect())
    }
    setPickerMode('days')
    setDisplayMonth(selected ?? minDateObj ?? new Date())
    setOpen((v) => !v)
  }

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (
        !triggerRef.current?.contains(e.target as Node) &&
        !calendarRef.current?.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open])

  // ── Chevron button used in both header modes ──
  const NavBtn = ({ onClick, children }: { onClick: () => void; children: React.ReactNode }) => (
    <button
      type="button"
      onClick={onClick}
      className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:bg-indigo-50 hover:text-indigo-500 transition-colors"
    >
      {children}
    </button>
  )

  const popover =
    open && triggerRect
      ? createPortal(
          <div
            ref={calendarRef}
            style={{ position: 'fixed', top: triggerRect.bottom + 8, left: triggerRect.left, zIndex: 9999 }}
            className="w-[296px] rounded-2xl border border-slate-100 bg-white shadow-2xl ring-1 ring-black/5 overflow-hidden"
          >
            {/* ── Custom header ── */}
            <div className="px-4 pt-4 pb-1 flex items-center justify-between h-14">
              {pickerMode === 'days' ? (
                <>
                  <NavBtn onClick={() => setDisplayMonth(m => addMonths(m, -1))}>
                    <ChevronLeft className="h-4 w-4" />
                  </NavBtn>
                  <button
                    type="button"
                    onClick={() => setPickerMode('months')}
                    className="text-sm font-bold text-slate-800 tracking-tight rounded-xl px-3 py-1.5 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                  >
                    {format(displayMonth, 'MMMM yyyy')}
                  </button>
                  <NavBtn onClick={() => setDisplayMonth(m => addMonths(m, 1))}>
                    <ChevronRight className="h-4 w-4" />
                  </NavBtn>
                </>
              ) : (
                <>
                  <NavBtn onClick={() => setDisplayMonth(m => addYears(m, -1))}>
                    <ChevronLeft className="h-4 w-4" />
                  </NavBtn>
                  <button
                    type="button"
                    onClick={() => setPickerMode('days')}
                    className="text-sm font-bold text-slate-800 tracking-tight rounded-xl px-3 py-1.5 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                  >
                    {format(displayMonth, 'yyyy')}
                  </button>
                  <NavBtn onClick={() => setDisplayMonth(m => addYears(m, 1))}>
                    <ChevronRight className="h-4 w-4" />
                  </NavBtn>
                </>
              )}
            </div>

            {/* ── Day grid ── */}
            {pickerMode === 'days' && (
              <DayPicker
                mode="single"
                selected={selected}
                month={displayMonth}
                onMonthChange={setDisplayMonth}
                onSelect={(date) => {
                  if (date) { onChange(format(date, 'yyyy-MM-dd')); setOpen(false) }
                }}
                disabled={minDateObj ? { before: minDateObj } : undefined}
                showOutsideDays
                classNames={{
                  root: 'px-4 pb-4',
                  months: 'flex flex-col',
                  month: 'flex flex-col gap-3',
                  month_caption: 'hidden',  // we have our own header
                  nav: 'hidden',            // we have our own nav
                  weekdays: 'flex gap-0.5 mb-1',
                  weekday: 'flex-1 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest py-1',
                  weeks: 'flex flex-col gap-0.5',
                  week: 'flex gap-0.5',
                  day: 'flex flex-1 items-center justify-center',
                  day_button: '',
                  selected: '',
                  today: '',
                  outside: '',
                  disabled: '',
                }}
                components={{ DayButton }}
              />
            )}

            {/* ── Month grid ── */}
            {pickerMode === 'months' && (
              <div className="grid grid-cols-3 gap-1.5 px-4 pb-4 pt-1">
                {MONTH_NAMES.map((name, i) => {
                  const now = new Date()
                  const isThisMonth = now.getMonth() === i && now.getFullYear() === displayMonth.getFullYear()
                  const isSelectedMonth =
                    selected &&
                    selected.getMonth() === i &&
                    selected.getFullYear() === displayMonth.getFullYear()
                  const isDisabledMonth =
                    minDateObj &&
                    new Date(displayMonth.getFullYear(), i + 1, 0) < minDateObj

                  return (
                    <button
                      key={name}
                      type="button"
                      disabled={!!isDisabledMonth}
                      onClick={() => {
                        setDisplayMonth(new Date(displayMonth.getFullYear(), i, 1))
                        setPickerMode('days')
                      }}
                      className={cn(
                        'rounded-xl py-2.5 text-sm font-semibold transition-all duration-100 select-none',
                        isDisabledMonth
                          ? 'text-slate-200 cursor-not-allowed'
                          : isSelectedMonth
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : isThisMonth
                          ? 'bg-amber-400 text-white hover:bg-amber-500'
                          : 'text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 cursor-pointer'
                      )}
                    >
                      {name}
                    </button>
                  )
                })}
              </div>
            )}
          </div>,
          document.body
        )
      : null

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={handleOpen}
        className={cn(
          'flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm transition-all duration-150',
          'border border-transparent hover:border-indigo-200 hover:bg-indigo-50',
          selected ? 'text-slate-800 font-medium' : 'text-slate-400',
          open && 'border-indigo-300 bg-indigo-50 text-indigo-700',
          className
        )}
      >
        {selected ? format(selected, 'MMM d, yyyy') : placeholder}
        <CalendarIcon className={cn('h-3.5 w-3.5 flex-shrink-0 transition-colors', open ? 'text-indigo-500' : 'text-slate-400')} />
      </button>
      {popover}
    </>
  )
}
