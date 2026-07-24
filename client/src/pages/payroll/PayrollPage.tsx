import { useState, useRef, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../../lib/axios'
import { StatusBadge } from '../../components/ui/Badge'
import { StatCard } from '../../components/ui/StatCard'
import { usePermissions } from '../../hooks/usePermissions'
import {
  DollarSign, Play, Check, ArrowUpDown, ArrowUp, ArrowDown,
  MoreVertical, Eye, CheckCheck, CreditCard, Wallet, Clock3,
  ChevronLeft, ChevronRight, Users2
} from 'lucide-react'
import type { Payroll } from '../../types'
import toast from 'react-hot-toast'

const SPARKLINE_PAID = [{ value: 42 }, { value: 50 }, { value: 48 }, { value: 55 }, { value: 60 }, { value: 65 }]
const SPARKLINE_AMT = [{ value: 52 }, { value: 58 }, { value: 55 }, { value: 63 }, { value: 68 }, { value: 72 }]
const SPARKLINE_PEND = [{ value: 10 }, { value: 8 }, { value: 12 }, { value: 9 }, { value: 7 }, { value: 5 }]
const SPARKLINE_PROC = [{ value: 30 }, { value: 35 }, { value: 28 }, { value: 40 }, { value: 38 }, { value: 45 }]

function InitialAvatar({ name, isOnline }: { name: string; isOnline?: boolean }) {
  const parts = name.trim().split(' ').filter(Boolean)
  const initials = parts.length >= 2
    ? parts[0][0].toUpperCase() + parts[parts.length - 1][0].toUpperCase()
    : name.slice(0, 2).toUpperCase()

  const colors = [
    'from-indigo-400 to-violet-600',
    'from-emerald-400 to-teal-600',
    'from-pink-400 to-rose-600',
    'from-amber-400 to-orange-500',
    'from-blue-400 to-cyan-600',
    'from-purple-400 to-fuchsia-600',
  ]
  const colorIdx = initials.charCodeAt(0) % colors.length

  return (
    <div className="relative flex-shrink-0">
      <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${colors[colorIdx]} flex items-center justify-center text-white text-xs font-bold shadow-sm`}>
        {initials}
      </div>
      {isOnline !== undefined && (
        <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${isOnline ? 'bg-emerald-500' : 'bg-gray-300'}`} />
      )}
    </div>
  )
}

function ActionMenu({ payroll, onApprove, onPaid }: {
  payroll: Payroll
  onApprove: () => void
  onPaid: () => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
        title="Actions"
      >
        <MoreVertical className="w-4 h-4" />
      </button>
      {open && (
        <div className="absolute right-0 mt-1 w-44 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-20 animate-fade-in">
          <button className="flex items-center gap-2.5 w-full px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 transition-colors">
            <Eye className="w-3.5 h-3.5 text-gray-400" />
            View Details
          </button>
          {payroll.status === 'draft' && (
            <button
              onClick={() => { onApprove(); setOpen(false) }}
              className="flex items-center gap-2.5 w-full px-3 py-2 text-xs text-indigo-700 hover:bg-indigo-50 transition-colors"
            >
              <Check className="w-3.5 h-3.5" />
              Approve Payroll
            </button>
          )}
          {payroll.status === 'processed' && (
            <button
              onClick={() => { onPaid(); setOpen(false) }}
              className="flex items-center gap-2.5 w-full px-3 py-2 text-xs text-emerald-700 hover:bg-emerald-50 transition-colors"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Mark as Paid
            </button>
          )}
        </div>
      )}
    </div>
  )
}

type SortDir = 'asc' | 'desc' | null

export default function PayrollPage() {
  const qc = useQueryClient()
  const { canManagePayroll } = usePermissions()
  const today = new Date()
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [month, setMonth] = useState(String(today.getMonth() + 1))
  const [year, setYear] = useState(String(today.getFullYear()))
  const [status, setStatus] = useState('')
  const [empSort, setEmpSort] = useState<SortDir>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['payroll', page, limit, month, year, status],
    queryFn: () => api.get('/payroll', { params: { page, limit, month, year, status: status || undefined } }).then(r => r.data),
    staleTime: 30000,
  })

  const { data: summary } = useQuery({
    queryKey: ['payroll-summary', month, year],
    queryFn: () => api.get('/payroll/summary', { params: { month, year } }).then(r => r.data.data),
    enabled: canManagePayroll,
    staleTime: 30000,
  })

  const processMutation = useMutation({
    mutationFn: () => api.post('/payroll/process', { month: Number(month), year: Number(year) }),
    onSuccess: (res) => {
      toast.success(`Processed ${res.data?.data?.processed ?? 0} payrolls`)
      qc.invalidateQueries({ queryKey: ['payroll'] })
      qc.invalidateQueries({ queryKey: ['payroll-summary'] })
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed'),
  })

  const approveMutation = useMutation({
    mutationFn: (id: string) => api.put(`/payroll/${id}/approve`),
    onSuccess: () => { toast.success('Approved!'); qc.invalidateQueries({ queryKey: ['payroll'] }) },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed'),
  })

  const paidMutation = useMutation({
    mutationFn: (id: string) => api.put(`/payroll/${id}/paid`, { paymentDate: new Date(), paymentMethod: 'bank_transfer' }),
    onSuccess: () => { toast.success('Marked as paid!'); qc.invalidateQueries({ queryKey: ['payroll'] }) },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed'),
  })

  const summaryData = (summary?.summary ?? []).reduce((acc: any, s: any) => { acc[s._id] = s; return acc }, {})

  const rawRows: Payroll[] = data?.data ?? []
  const sortedRows = empSort
    ? [...rawRows].sort((a, b) => {
        const nameA = `${a.employee?.user?.firstName} ${a.employee?.user?.lastName}`.toLowerCase()
        const nameB = `${b.employee?.user?.firstName} ${b.employee?.user?.lastName}`.toLowerCase()
        return empSort === 'asc' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA)
      })
    : rawRows

  const cycleSort = () => {
    setEmpSort(prev => prev === null ? 'asc' : prev === 'asc' ? 'desc' : null)
  }

  const years = Array.from({ length: 5 }, (_, i) => today.getFullYear() - 2 + i)
  const pagination = data?.pagination

  const fmtCur = (v: number) => `₹${(v ?? 0).toLocaleString('en-IN')}`
  const fmtL = (v: number) => v >= 100000 ? `₹${(v / 100000).toFixed(1)}L` : fmtCur(v)

  const STATUS_MONTHS = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payroll</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage and process employee salaries</p>
        </div>
        {canManagePayroll && (
          <button
            onClick={() => processMutation.mutate()}
            disabled={processMutation.isPending}
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 disabled:opacity-60 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-md shadow-indigo-200 transition-all hover:shadow-indigo-300 hover:-translate-y-0.5"
          >
            {processMutation.isPending ? (
              <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Processing...</>
            ) : (
              <><Play className="w-4 h-4" />Process Payroll</>
            )}
          </button>
        )}
      </div>

      {/* Stat cards */}
      {canManagePayroll && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            title="Paid"
            value={summaryData.paid?.count ?? 0}
            icon={CreditCard}
            iconGradient="from-emerald-400 to-teal-600"
            iconColor="text-white"
            trend={7}
            trendLabel="vs last month"
            sparkline={SPARKLINE_PAID}
            loading={!summary}
          />
          <StatCard
            title="Total Amount"
            value={summaryData.paid ? fmtL(summaryData.paid.totalNet ?? 0) : '₹0'}
            icon={Wallet}
            iconGradient="from-indigo-400 to-violet-600"
            iconColor="text-white"
            trend={5}
            trendLabel="vs last month"
            sparkline={SPARKLINE_AMT}
            loading={!summary}
          />
          <StatCard
            title="Pending"
            value={summaryData.draft?.count ?? 0}
            icon={Clock3}
            iconGradient="from-amber-400 to-orange-500"
            iconColor="text-white"
            badge={(summaryData.draft?.count ?? 0) > 0 ? 'Review needed' : undefined}
            badgeColor="bg-amber-100 text-amber-700"
            sparkline={SPARKLINE_PEND}
            loading={!summary}
          />
          <StatCard
            title="Processed"
            value={summaryData.processed?.count ?? 0}
            icon={Users2}
            iconGradient="from-blue-400 to-cyan-600"
            iconColor="text-white"
            trend={3}
            trendLabel="vs last month"
            sparkline={SPARKLINE_PROC}
            loading={!summary}
          />
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-xl p-1">
            {['', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'].slice(1).map((m, i) => (
              <button
                key={m}
                onClick={() => { setMonth(m); setPage(1) }}
                className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  month === m
                    ? 'bg-white shadow text-indigo-700 border border-gray-200'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {STATUS_MONTHS[i + 1]}
              </button>
            ))}
          </div>

          <select
            value={year}
            onChange={e => { setYear(e.target.value); setPage(1) }}
            className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 cursor-pointer"
          >
            {years.map(y => <option key={y} value={String(y)}>{y}</option>)}
          </select>

          <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-xl p-1 ml-auto">
            {['All', 'draft', 'processed', 'paid', 'cancelled'].map(st => (
              <button
                key={st}
                onClick={() => { setStatus(st === 'All' ? '' : st); setPage(1) }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all ${
                  status === (st === 'All' ? '' : st)
                    ? 'bg-white shadow text-indigo-700 border border-gray-200'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Payroll table as floating card rows */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-[2fr_1fr_1fr_1.2fr_1.2fr_1.2fr_1fr_auto] gap-3 px-5 py-3 bg-gray-50 border-b border-gray-100 text-[11px] font-bold text-gray-500 tracking-wider uppercase">
          <div className="flex items-center gap-1.5">
            <span>Employee</span>
            <button
              onClick={cycleSort}
              className="p-0.5 rounded hover:bg-gray-200 transition-colors"
              title={empSort === 'asc' ? 'Sort Z-A' : empSort === 'desc' ? 'Clear sort' : 'Sort A-Z'}
            >
              {empSort === 'asc'
                ? <ArrowUp className="w-3 h-3 text-indigo-600" />
                : empSort === 'desc'
                  ? <ArrowDown className="w-3 h-3 text-indigo-600" />
                  : <ArrowUpDown className="w-3 h-3 text-gray-400" />
              }
            </button>
          </div>
          <div>Period</div>
          <div>Working Days</div>
          <div>Gross</div>
          <div>Deductions</div>
          <div>Net Salary</div>
          <div>Status</div>
          <div className="w-8"></div>
        </div>

        {/* Rows */}
        <div className="divide-y divide-gray-50">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="grid grid-cols-[2fr_1fr_1fr_1.2fr_1.2fr_1.2fr_1fr_auto] gap-3 px-5 py-4 items-center">
                {Array.from({ length: 8 }).map((__, j) => (
                  <div key={j} className="h-4 rounded-lg bg-gray-100 animate-pulse" />
                ))}
              </div>
            ))
          ) : sortedRows.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mb-3">
                <DollarSign className="w-6 h-6 text-gray-300" />
              </div>
              <p className="text-sm font-semibold text-gray-500">No payroll records</p>
              <p className="text-xs text-gray-400 mt-1">Process payroll to generate records for this period.</p>
            </div>
          ) : (
            sortedRows.map((p: Payroll) => {
              const fullName = `${p.employee?.user?.firstName ?? ''} ${p.employee?.user?.lastName ?? ''}`.trim()
              const empId = (p.employee as any)?.employeeId ?? ''
              const monthName = STATUS_MONTHS[p.month] ?? ''
              const presentDays = p.attendanceSummary?.presentDays ?? 0
              const workingDays = p.attendanceSummary?.workingDays ?? 0

              return (
                <div
                  key={p._id}
                  className="grid grid-cols-[2fr_1fr_1fr_1.2fr_1.2fr_1.2fr_1fr_auto] gap-3 px-5 py-3.5 items-center hover:bg-indigo-50/30 hover:shadow-sm transition-all duration-150 group"
                >
                  {/* Employee */}
                  <div className="flex items-center gap-2.5 min-w-0">
                    <InitialAvatar name={fullName || '??'} isOnline={Math.random() > 0.5} />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{fullName}</p>
                      <p className="text-[10px] text-gray-400 font-medium">{empId}</p>
                    </div>
                  </div>

                  {/* Period */}
                  <div className="text-sm text-gray-600 font-medium">
                    {monthName} {p.year}
                  </div>

                  {/* Working days */}
                  <div className="text-sm text-gray-600">
                    <span className="font-semibold">{presentDays}</span>
                    <span className="text-gray-400"> / {workingDays}</span>
                  </div>

                  {/* Gross */}
                  <div className="text-sm font-medium text-gray-800">
                    {fmtCur(p.earnings?.grossEarnings ?? 0)}
                  </div>

                  {/* Deductions */}
                  <div className="text-sm font-medium text-red-500">
                    -{fmtCur(p.deductions?.totalDeductions ?? 0)}
                  </div>

                  {/* Net salary — highlighted */}
                  <div>
                    <span className="inline-flex items-center gap-1 text-sm font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-xl">
                      {fmtCur(p.netSalary ?? 0)}
                    </span>
                  </div>

                  {/* Status badge */}
                  <div>
                    <StatusBadge status={p.status} />
                  </div>

                  {/* Actions */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    {canManagePayroll ? (
                      <ActionMenu
                        payroll={p}
                        onApprove={() => approveMutation.mutate(p._id)}
                        onPaid={() => paidMutation.mutate(p._id)}
                      />
                    ) : (
                      <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50/50">
            <p className="text-xs text-gray-500">
              Showing <span className="font-semibold">{((page - 1) * limit) + 1}</span>–
              <span className="font-semibold">{Math.min(page * limit, pagination.total)}</span> of{' '}
              <span className="font-semibold">{pagination.total}</span> records
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={!pagination.hasPrevPage}
                className="p-1.5 rounded-lg border border-gray-200 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4 text-gray-600" />
              </button>
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                const pg = pagination.totalPages <= 5
                  ? i + 1
                  : page <= 3 ? i + 1 : page + i - 2
                if (pg < 1 || pg > pagination.totalPages) return null
                return (
                  <button
                    key={pg}
                    onClick={() => setPage(pg)}
                    className={`w-8 h-8 text-xs font-semibold rounded-lg transition-all ${
                      pg === page
                        ? 'bg-indigo-600 text-white shadow'
                        : 'border border-gray-200 text-gray-600 hover:bg-white'
                    }`}
                  >
                    {pg}
                  </button>
                )
              })}
              <button
                onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                disabled={!pagination.hasNextPage}
                className="p-1.5 rounded-lg border border-gray-200 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
