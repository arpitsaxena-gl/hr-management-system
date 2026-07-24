import { useState, useMemo, useRef, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../../lib/axios'
import { StatCard } from '../../components/ui/StatCard'
import { usePermissions } from '../../hooks/usePermissions'
import { formatINR } from '../../lib/formatters'
import {
  DollarSign, Play, Check, ArrowUpDown, ArrowUp, ArrowDown,
  MoreVertical, Eye, CheckCircle2, CreditCard, ChevronLeft, ChevronRight
} from 'lucide-react'
import type { Payroll } from '../../types'
import toast from 'react-hot-toast'

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const STATUS_CONFIG: Record<string, { label: string; dot: string; pill: string }> = {
  processed: { label: 'Processed', dot: 'bg-emerald-500', pill: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
  paid: { label: 'Paid', dot: 'bg-blue-500', pill: 'bg-blue-50 text-blue-700 border-blue-100' },
  draft: { label: 'Draft', dot: 'bg-amber-500', pill: 'bg-amber-50 text-amber-700 border-amber-100' },
  cancelled: { label: 'Cancelled', dot: 'bg-gray-400', pill: 'bg-gray-50 text-gray-500 border-gray-200' },
}

const AVATAR_COLORS = [
  'from-indigo-500 to-violet-600',
  'from-emerald-500 to-teal-600',
  'from-rose-500 to-pink-600',
  'from-amber-500 to-orange-500',
  'from-sky-500 to-blue-600',
  'from-purple-500 to-fuchsia-600',
]

function InitialAvatar({ firstName, lastName, index, online = true }: { firstName?: string; lastName?: string; index: number; online?: boolean }) {
  const gradient = AVATAR_COLORS[index % AVATAR_COLORS.length]
  return (
    <div className="relative flex-shrink-0">
      <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white text-xs font-bold shadow-sm`}>
        {(firstName?.[0] ?? '?')}{(lastName?.[0] ?? '')}
      </div>
      {online && (
        <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
      )}
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.draft
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${cfg.pill}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  )
}

function ActionMenu({ payroll, onApprove, onMarkPaid }: { payroll: Payroll; onApprove: (id: string) => void; onMarkPaid: (id: string) => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
        title="Actions"
      >
        <MoreVertical className="w-4 h-4" />
      </button>
      {open && (
        <div className="absolute right-0 mt-1 w-40 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-20 animate-fade-in">
          {payroll.status === 'draft' && (
            <button
              onClick={() => { onApprove(payroll._id); setOpen(false) }}
              className="flex items-center gap-2 w-full px-3 py-2 text-xs text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
            >
              <CheckCircle2 className="w-3.5 h-3.5" /> Approve
            </button>
          )}
          {payroll.status === 'processed' && (
            <button
              onClick={() => { onMarkPaid(payroll._id); setOpen(false) }}
              className="flex items-center gap-2 w-full px-3 py-2 text-xs text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
            >
              <CreditCard className="w-3.5 h-3.5" /> Mark Paid
            </button>
          )}
          <button className="flex items-center gap-2 w-full px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 transition-colors">
            <Eye className="w-3.5 h-3.5" /> View Details
          </button>
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
  const [sortDir, setSortDir] = useState<SortDir>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['payroll', page, limit, month, year, status],
    queryFn: () => api.get('/payroll', { params: { page, limit, month, year, status: status || undefined } }).then(r => r.data),
    staleTime: 60000,
  })

  const { data: summary } = useQuery({
    queryKey: ['payroll-summary', month, year],
    queryFn: () => api.get('/payroll/summary', { params: { month, year } }).then(r => r.data.data),
    enabled: canManagePayroll,
    staleTime: 60000,
  })

  const processMutation = useMutation({
    mutationFn: () => api.post('/payroll/process', { month: Number(month), year: Number(year) }),
    onSuccess: (res) => { toast.success(`Processed ${res.data?.data?.processed ?? 0} payrolls`); qc.invalidateQueries({ queryKey: ['payroll'] }); qc.invalidateQueries({ queryKey: ['payroll-summary'] }) },
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
  const totalPayroll = (summary?.summary ?? []).reduce((s: number, item: any) => s + (item.totalNet ?? 0), 0)

  const rawPayrolls: Payroll[] = data?.data ?? []
  const sortedPayrolls = useMemo(() => {
    if (!sortDir) return rawPayrolls
    return [...rawPayrolls].sort((a, b) => {
      const nameA = `${a.employee?.user?.firstName ?? ''} ${a.employee?.user?.lastName ?? ''}`.toLowerCase()
      const nameB = `${b.employee?.user?.firstName ?? ''} ${b.employee?.user?.lastName ?? ''}`.toLowerCase()
      return sortDir === 'asc' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA)
    })
  }, [rawPayrolls, sortDir])

  const years = Array.from({ length: 5 }, (_, i) => today.getFullYear() - 2 + i)
  const pagination = data?.pagination

  const SPARKLINE_UP = [{ v: 4 }, { v: 6 }, { v: 5 }, { v: 8 }, { v: 7 }, { v: 10 }, { v: 12 }]

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payroll</h1>
          <p className="text-sm text-gray-400 mt-0.5">Manage and process employee salaries</p>
        </div>
        {canManagePayroll && (
          <button
            onClick={() => processMutation.mutate()}
            disabled={processMutation.isPending}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:opacity-90 transition-opacity shadow-md shadow-indigo-200 disabled:opacity-60"
          >
            <Play className="w-4 h-4" />
            {processMutation.isPending ? 'Processing...' : 'Process Payroll'}
          </button>
        )}
      </div>

      {/* Stat Cards */}
      {canManagePayroll && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            title="Total Payroll"
            value={totalPayroll ? (totalPayroll >= 100000 ? `\u20b9${(totalPayroll / 100000).toFixed(1)}L` : formatINR(totalPayroll)) : '\u20b90'}
            icon={DollarSign}
            gradientFrom="#6366f1" gradientTo="#8b5cf6"
            trend={8} sparkline={SPARKLINE_UP}
          />
          <StatCard
            title="Processed"
            value={summaryData.processed?.count ?? 0}
            icon={CheckCircle2}
            gradientFrom="#10b981" gradientTo="#34d399"
            trend={3}
          />
          <StatCard
            title="Pending / Draft"
            value={summaryData.draft?.count ?? 0}
            icon={DollarSign}
            gradientFrom="#f59e0b" gradientTo="#f97316"
            trend={-2}
          />
          <StatCard
            title="Paid"
            value={summaryData.paid?.count ?? 0}
            icon={CreditCard}
            gradientFrom="#06b6d4" gradientTo="#0ea5e9"
            trend={5}
          />
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <div className="flex flex-wrap gap-3 items-center">
          {/* Month pill tabs */}
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1 overflow-x-auto flex-nowrap">
            {MONTHS.slice(0, 12).map((m, i) => (
              <button
                key={i}
                onClick={() => { setMonth(String(i + 1)); setPage(1) }}
                className={`text-xs font-semibold px-3 py-1 rounded-lg whitespace-nowrap transition-all ${
                  month === String(i + 1)
                    ? 'bg-white text-indigo-700 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {m.slice(0, 3)}
              </button>
            ))}
          </div>
          {/* Year */}
          <select
            value={year}
            onChange={e => { setYear(e.target.value); setPage(1) }}
            className="text-xs font-semibold border border-gray-200 rounded-xl px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-300"
          >
            {years.map(y => <option key={y} value={String(y)}>{y}</option>)}
          </select>
          {/* Status filter */}
          <select
            value={status}
            onChange={e => { setStatus(e.target.value); setPage(1) }}
            className="text-xs font-semibold border border-gray-200 rounded-xl px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-300"
          >
            <option value="">All Status</option>
            {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </div>
      </div>

      {/* Floating Card Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_auto] gap-3 px-5 py-3 bg-gray-50/70 border-b border-gray-100">
          <button
            onClick={() => setSortDir(d => d === 'asc' ? 'desc' : d === 'desc' ? null : 'asc')}
            className="flex items-center gap-1.5 text-xs font-bold text-gray-500 uppercase tracking-wide hover:text-indigo-600 transition-colors group"
          >
            Employee
            <span className="text-gray-300 group-hover:text-indigo-400 transition-colors">
              {sortDir === 'asc' ? <ArrowUp className="w-3.5 h-3.5" /> : sortDir === 'desc' ? <ArrowDown className="w-3.5 h-3.5" /> : <ArrowUpDown className="w-3.5 h-3.5" />}
            </span>
          </button>
          {['Period', 'Working Days', 'Gross', 'Deductions', 'Net Salary', ''].map(h => (
            <span key={h} className="text-xs font-bold text-gray-500 uppercase tracking-wide">{h}</span>
          ))}
        </div>

        {/* Rows */}
        <div className="divide-y divide-gray-50">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_auto] gap-3 px-5 py-4 items-center">
                {Array.from({ length: 7 }).map((__, j) => (
                  <div key={j} className="h-4 bg-gray-100 animate-pulse rounded-full" />
                ))}
              </div>
            ))
          ) : sortedPayrolls.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <DollarSign className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No payroll records found</p>
            </div>
          ) : (
            sortedPayrolls.map((p, idx) => (
              <div
                key={p._id}
                className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_auto] gap-3 px-5 py-3.5 items-center hover:bg-indigo-50/30 hover:shadow-[inset_0_0_0_1px_rgba(99,102,241,0.1)] transition-all duration-150 group"
              >
                {/* Employee */}
                <div className="flex items-center gap-3 min-w-0">
                  <InitialAvatar
                    firstName={p.employee?.user?.firstName}
                    lastName={p.employee?.user?.lastName}
                    index={idx}
                    online={p.status !== 'cancelled'}
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">
                      {p.employee?.user?.firstName} {p.employee?.user?.lastName}
                    </p>
                    <p className="text-xs text-gray-400 truncate">{(p.employee as any)?.employeeId}</p>
                  </div>
                </div>

                {/* Period */}
                <span className="text-xs text-gray-600">
                  {MONTHS[(p.month ?? 1) - 1]?.slice(0, 3)} {p.year}
                </span>

                {/* Working Days */}
                <span className="text-xs text-gray-600">
                  {p.attendanceSummary?.presentDays ?? 0}/{p.attendanceSummary?.workingDays ?? 0}
                </span>

                {/* Gross */}
                <span className="text-sm font-medium text-gray-700">
                  {formatINR(p.earnings?.grossEarnings ?? 0)}
                </span>

                {/* Deductions */}
                <span className="text-sm font-medium text-red-500">
                  -{formatINR(p.deductions?.totalDeductions ?? 0)}
                </span>

                {/* Net Salary */}
                <div>
                  <span className="inline-flex items-center text-sm font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-xl">
                    {formatINR(p.netSalary ?? 0)}
                  </span>
                </div>

                {/* Status + Actions */}
                <div className="flex items-center gap-2 justify-end">
                  <StatusBadge status={p.status} />
                  {canManagePayroll && (
                    <ActionMenu
                      payroll={p}
                      onApprove={id => approveMutation.mutate(id)}
                      onMarkPaid={id => paidMutation.mutate(id)}
                    />
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50/50">
            <p className="text-xs text-gray-500">
              Showing {((pagination.page - 1) * pagination.limit) + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={pagination.page <= 1}
                className="p-1.5 rounded-lg hover:bg-gray-200 disabled:opacity-40 transition-colors"
              >
                <ChevronLeft className="w-4 h-4 text-gray-600" />
              </button>
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                const pageNum = i + 1
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`w-7 h-7 text-xs font-semibold rounded-lg transition-colors ${
                      pagination.page === pageNum
                        ? 'bg-indigo-600 text-white'
                        : 'text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              })}
              <button
                onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                disabled={pagination.page >= pagination.totalPages}
                className="p-1.5 rounded-lg hover:bg-gray-200 disabled:opacity-40 transition-colors"
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
