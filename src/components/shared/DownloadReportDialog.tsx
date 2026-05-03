'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { DatePicker } from '@/components/shared/DatePicker'
import { FileDown } from 'lucide-react'
import { generateTasksCsv, downloadCsv } from '@/lib/csvExport'
import { format } from 'date-fns'

interface DownloadReportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string
}

function toYMD(d: Date) { return format(d, 'yyyy-MM-dd') }

export function DownloadReportDialog({ open, onOpenChange, userId }: DownloadReportDialogProps) {
  const today = toYMD(new Date())
  const firstOfMonth = toYMD(new Date(new Date().getFullYear(), new Date().getMonth(), 1))

  const [from, setFrom] = useState(firstOfMonth)
  const [to, setTo] = useState(today)

  const handleDownload = () => {
    const csv = generateTasksCsv(userId, from, to)
    const filename = `taskify-report-${from}-to-${to}.csv`
    downloadCsv(csv, filename)
    onOpenChange(false)
  }

  const invalid = !from || !to || from > to

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Download report</DialogTitle>
          <DialogDescription>
            Export all tasks in the selected date range to a CSV file. Pending (unscheduled) tasks are always included.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-5 pt-2">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <span className="w-10 shrink-0 text-sm text-slate-500">From</span>
              <DatePicker value={from} onChange={setFrom} placeholder="Start date" />
            </div>
            <div className="flex items-center gap-3">
              <span className="w-10 shrink-0 text-sm text-slate-500">To</span>
              <DatePicker value={to} onChange={setTo} placeholder="End date" minDate={from} />
            </div>
          </div>

          {invalid && from && to && (
            <p className="text-xs text-red-500">&ldquo;From&rdquo; date must be before &ldquo;To&rdquo; date.</p>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" className="text-slate-500" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              className="bg-indigo-600 hover:bg-indigo-700"
              disabled={invalid}
              onClick={handleDownload}
            >
              <FileDown className="mr-1.5 h-3.5 w-3.5" />
              Download CSV
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
