import { useState, useMemo } from 'react'
import { ArrowUpDown, ArrowUp, ArrowDown, MoreVertical, Check, IndianRupee, Eye } from 'lucide-react'
import type { Payroll, SortState } from '../../types'

interface PayrollCardTableProps {
  payrolls: Payroll[]
  loading: boolean
  canManage: boolean
  onApprove: (id: string) => void
  onMarkPaid: (id: string) => void
}

function StatusPill({ status }: { status: string }) {
  const styles: Record<string, string> = {
    processed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    paid: 'bg-blue-50 text-blue-700 border-blue-200',
    draft: 'bg-amber-50 text-amber-700 border-amber-200',
    cancelled: 'bg-red-50 text-red-700 border-red-200',
  }
  const dots: Record<string, string> = {
    processed: 'bg-emerald-500',
    paid: 'bg-blue-500',
    draft: 'bg-amber-500',
    cancelled: 'bg-red-500',
  }
  const cls = styles[status] ?? 'bg-gray-50 text-gray-700 border-gray-200'
  const dot = dots[status] ?? 'bg-gray-400'
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border capitalize ${cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {status}
    </span>
  )
}

function ActionMenu({ payroll, onApprove, onMarkPaid, canManage }: {
  payroll: Payroll; onApprove: (id: string) => void
  onMarkPaid: (id: string) => void; canManage: boolean
}) {
  const [open, setOpen] = useState(false)
  if (!canManage) return null

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
        title="Actions"
      >
        <MoreVertical className="w-4 h-4" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-1 w-44 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-20 animate-fade-in">
            <button
              onClick={() => { setOpen(false) }}
              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Eye className="w-3.5 h-3.5 text-gray-400" />
              View Details
            </button>
            {payroll.status === 'draft' && (
              <button
                onClick={() => { onApprove(payroll._id); setOpen(false) }}
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-primary-600 hover:bg-primary-50 transition-colors"
              >
                <Check className="w-3.5 h-3.5" />
                Approve
              </button>
            )}
            {payroll.status === 'processed' && (
              <button
                onClick={() => { onMarkPaid(payroll._id); setOpen(false) }}
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-emerald-600 hover:bg-emerald-50 transition-colors"
              >
                <IndianRupee className="w-3.5 h-3.5" />
                Mark as Paid
              </button>
            )}
          </div>
        </>
      )}
    </div>
  )
}

function SortIcon({ sort, column }: { sort: SortState; column: string }) {
  if (sort.column !== column) return <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
  if (sort.direction === 'asc') return <ArrowUp className="w-3.5 h-3.5 text-primary-500" />
  return <ArrowDown className="w-3.5 h-3.5 text-primary-500" />
}

export function PayrollCardTable({ payrolls, loading, canManage, onApprove, onMarkPaid }: PayrollCardTableProps) {
  const [sort, setSort] = useState<SortState>({ column: '', direction: 'none' })

  const toggleSort = (column: string) => {
    setSort(prev => {
      if (prev.column !== column) return { column, direction: 'asc' }
      if (prev.direction === 'asc') return { column, direction: 'desc' }
      return { column: '', direction: 'none' }
    })
  }

  const sorted = useMemo(() => {
    if (sort.direction === 'none' || !sort.column) return payrolls
    return [...payrolls].sort((a, b) => {
      const nameA = `${a.employee?.user?.firstName ?? ''} ${a.employee?.user?.lastName ?? ''}`.trim().toLowerCase()
      const nameB = `${b.employee?.user?.firstName ?? ''} ${b.employee?.user?.lastName ?? ''}`.trim().toLowerCase()
      return sort.direction === 'asc'
        ? nameA.localeCompare(nameB)
        : nameB.localeCompare(nameA)
    })
  }, [payrolls, sort])

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="card !p-4 flex items-center gap-4">
            <div className="skeleton w-10 h-10 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="skeleton h-4 w-40 rounded" />
              <div className="skeleton h-3 w-24 rounded" />
            </div>
            <div className="skeleton h-6 w-20 rounded-full" />
          </div>
        ))}
      </div>
    )
  }

  if (!payrolls.length) {
    return (
      <div className="card text-center py-12 text-gray-400">
        <IndianRupee className="w-10 h-10 mx-auto mb-3 opacity-30" />
        <p className="text-sm">No payroll records found</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {/* Table Header */}
      <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_auto] gap-4 px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
        <button
          className="flex items-center gap-1.5 text-left hover:text-gray-600 transition-colors"
          onClick={() => toggleSort('employee')}
        >
          Employee <SortIcon sort={sort} column="employee" />
        </button>
        <span>Period</span>
        <span>Days</span>
        <span>Gross</span>
        <span>Deductions</span>
        <span>Net Salary</span>
        <span>Status</span>
      </div>

      {/* Card Rows */}
      {sorted.map(p => {
        const firstName = (p.employee as any)?.user?.firstName ?? ''
        const lastName = (p.employee as any)?.user?.lastName ?? ''
        const empId = (p.employee as any)?.employeeId ?? ''
        const initials = `${firstName[0] ?? ''}${lastName[0] ?? ''}`.toUpperCase()
        const monthName = new Date(0, p.month - 1).toLocaleString('default', { month: 'short' })

        return (
          <div
            key={p._id}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 px-4 py-3.5"
          >
            <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_auto] gap-4 items-center">
              {/* Employee */}
              <div className="flex items-center gap-3">
                <div className="relative flex-shrink-0">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-violet-500 flex items-center justify-center text-white text-xs font-bold">
                    {initials || '?'}
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 border-2 border-white rounded-full" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{firstName} {lastName}</p>
                  <p className="text-xs text-gray-400">{empId}</p>
                </div>
              </div>

              {/* Period */}
              <span className="text-sm text-gray-600">{monthName} {p.year}</span>

              {/* Days */}
              <span className="text-sm text-gray-600">
                {p.attendanceSummary?.presentDays ?? 0}/{p.attendanceSummary?.workingDays ?? 0}
              </span>

              {/* Gross */}
              <span className="text-sm text-gray-700 font-medium">
                ₹{(p.earnings?.grossEarnings ?? 0).toLocaleString('en-IN')}
              </span>

              {/* Deductions */}
              <span className="text-sm text-red-500 font-medium">
                -₹{(p.deductions?.totalDeductions ?? 0).toLocaleString('en-IN')}
              </span>

              {/* Net Salary */}
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold text-gray-900">
                  ₹{(p.netSalary ?? 0).toLocaleString('en-IN')}
                </span>
                <span className="text-xs px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded font-medium hidden xl:inline">net</span>
              </div>

              {/* Status + Actions */}
              <div className="flex items-center gap-2">
                <StatusPill status={p.status} />
                <ActionMenu payroll={p} onApprove={onApprove} onMarkPaid={onMarkPaid} canManage={canManage} />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
