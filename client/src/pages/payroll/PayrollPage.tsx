import { useMemo, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../../lib/axios'
import { StatCard } from '../../components/ui/StatCard'
import { usePermissions } from '../../hooks/usePermissions'
import {
  DollarSign, Play, Check, ChevronDown, ArrowDownAZ, ArrowUpAZ, Filter, CalendarRange,
  Sparkles, BadgeCheck, MoreVertical, CircleDot, Clock3, ArrowRightLeft, BriefcaseBusiness
} from 'lucide-react'
import type { Payroll } from '../../types'
import toast from 'react-hot-toast'
import { StatusBadge } from '../../components/ui/Badge'

const SORT_MODES = ['az', 'za'] as const
const FILTER_TABS = [
  { key: '', label: 'All' },
  { key: 'draft', label: 'Draft' },
  { key: 'processed', label: 'Processed' },
  { key: 'paid', label: 'Paid' },
] as const

function currency(value?: number) {
  return `₹${Number(value ?? 0).toLocaleString('en-IN')}`
}

function avatarLabel(employee?: Payroll['employee']) {
  const first = employee?.user?.firstName?.[0] ?? ''
  const last = employee?.user?.lastName?.[0] ?? ''
  return `${first}${last}`.trim() || 'HR'
}

export default function PayrollPage() {
  const qc = useQueryClient()
  const { canManagePayroll } = usePermissions()
  const today = new Date()
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [month, setMonth] = useState(String(today.getMonth() + 1))
  const [year, setYear] = useState(String(today.getFullYear()))
  const [status, setStatus] = useState('')
  const [sortMode, setSortMode] = useState<(typeof SORT_MODES)[number]>('az')
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const [periodStart, setPeriodStart] = useState('')
  const [periodEnd, setPeriodEnd] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['payroll', page, limit, month, year, status, sortMode],
    queryFn: () => api.get('/payroll', { params: { page, limit, month, year, status: status || undefined } }).then(r => r.data),
  })

  const { data: summary } = useQuery({
    queryKey: ['payroll-summary', month, year],
    queryFn: () => api.get('/payroll/summary', { params: { month, year } }).then(r => r.data.data),
    enabled: canManagePayroll,
  })

  const processMutation = useMutation({
    mutationFn: () => api.post('/payroll/process', { month: Number(month), year: Number(year) }),
    onSuccess: (res) => { toast.success(`Processed ${res.data?.data?.processed ?? 0} payrolls`); qc.invalidateQueries({ queryKey: ['payroll'] }); qc.invalidateQueries({ queryKey: ['payroll-summary'] }) },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to process payroll'),
  })

  const approveMutation = useMutation({
    mutationFn: (id: string) => api.put(`/payroll/${id}/approve`),
    onSuccess: () => { toast.success('Payroll approved'); qc.invalidateQueries({ queryKey: ['payroll'] }) },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to approve payroll'),
  })

  const paidMutation = useMutation({
    mutationFn: (id: string) => api.put(`/payroll/${id}/paid`, { paymentDate: new Date(), paymentMethod: 'bank_transfer' }),
    onSuccess: () => { toast.success('Marked as paid'); qc.invalidateQueries({ queryKey: ['payroll'] }) },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to mark payroll as paid'),
  })

  const summaryData = (summary?.summary ?? []).reduce((acc: Record<string, any>, item: any) => { acc[item._id] = item; return acc }, {})
  const stats = useMemo(() => {
    const draft = summaryData.draft ?? {}
    const processed = summaryData.processed ?? {}
    const paid = summaryData.paid ?? {}
    return [
      { title: 'Total Paid', value: paid.count ?? 0, icon: BadgeCheck, bg: 'from-emerald-500 to-teal-500', trend: '+8% vs last cycle' },
      { title: 'Processed Amount', value: currency(processed.totalNet), icon: DollarSign, bg: 'from-violet-600 to-fuchsia-600', trend: 'Stable trend' },
      { title: 'Draft Payrolls', value: draft.count ?? 0, icon: Clock3, bg: 'from-amber-500 to-orange-500', trend: 'Needs review' },
      { title: 'Total Records', value: data?.pagination?.total ?? 0, icon: BriefcaseBusiness, bg: 'from-sky-500 to-cyan-500', trend: 'Across selected period' },
    ]
  }, [data?.pagination?.total, summaryData])

  const payrolls = useMemo(() => {
    const rows: Payroll[] = data?.data ?? []
    const filtered = rows.filter((row) => {
      if (periodStart && row.createdAt < periodStart) return false
      if (periodEnd && row.createdAt > `${periodEnd}T23:59:59.999Z`) return false
      return true
    })
    return filtered.sort((a, b) => {
      const aName = `${a.employee?.user?.firstName ?? ''} ${a.employee?.user?.lastName ?? ''}`.trim().toLowerCase()
      const bName = `${b.employee?.user?.firstName ?? ''} ${b.employee?.user?.lastName ?? ''}`.trim().toLowerCase()
      return sortMode === 'az' ? aName.localeCompare(bName) : bName.localeCompare(aName)
    })
  }, [data?.data, sortMode, periodStart, periodEnd])

  const years = Array.from({ length: 5 }, (_, i) => today.getFullYear() - 2 + i)

  const toggleSort = () => setSortMode((mode) => (mode === 'az' ? 'za' : 'az'))

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-[0_18px_45px_-28px_rgba(15,23,42,0.45)] backdrop-blur-xl">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-4 py-2 text-sm font-medium text-violet-700">
              <Sparkles className="h-4 w-4" />
              Payroll Dashboard
            </div>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">Payroll operations at a glance</h1>
            <p className="mt-2 text-sm text-slate-500">Track salary cycles, approvals, and payment states with live sorting and modern card rows.</p>
          </div>
          {canManagePayroll && (
            <button onClick={() => processMutation.mutate()} disabled={processMutation.isPending} className="inline-flex items-center gap-2 self-start rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70">
              <Play className="h-4 w-4" />
              {processMutation.isPending ? 'Processing...' : 'Process Payroll'}
            </button>
          )}
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => (
          <StatCard key={item.title} title={item.title} value={item.value} icon={item.icon} iconBg={`bg-gradient-to-br ${item.bg} text-white`} iconColor="text-white" trendLabel={item.trend} loading={isLoading} />
        ))}
      </section>

      <section className="rounded-[2rem] border border-white/70 bg-white/85 p-5 shadow-[0_18px_45px_-28px_rgba(15,23,42,0.45)] backdrop-blur-xl">
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex rounded-2xl border border-slate-200 bg-slate-50 p-1">
            {FILTER_TABS.map((tab) => (
              <button key={tab.key} type="button" onClick={() => { setStatus(tab.key); setPage(1) }} className={`rounded-xl px-4 py-2 text-sm font-medium transition ${status === tab.key ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}>
                {tab.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 shadow-sm">
            <Filter className="h-4 w-4 text-slate-400" />
            <select value={month} onChange={e => { setMonth(e.target.value); setPage(1) }} className="bg-transparent text-sm font-medium text-slate-700 outline-none">
              {Array.from({ length: 12 }, (_, i) => <option key={i + 1} value={String(i + 1)}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</option>)}
            </select>
            <select value={year} onChange={e => { setYear(e.target.value); setPage(1) }} className="bg-transparent text-sm font-medium text-slate-700 outline-none">
              {years.map((value) => <option key={value} value={String(value)}>{value}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 shadow-sm">
            <CalendarRange className="h-4 w-4 text-slate-400" />
            <input type="date" value={periodStart} onChange={(e) => setPeriodStart(e.target.value)} className="bg-transparent text-sm text-slate-700 outline-none" />
            <span className="text-slate-400">-</span>
            <input type="date" value={periodEnd} onChange={(e) => setPeriodEnd(e.target.value)} className="bg-transparent text-sm text-slate-700 outline-none" />
          </div>
          <button type="button" onClick={toggleSort} className="ml-auto inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-indigo-200 hover:text-indigo-700">
            {sortMode === 'az' ? <ArrowDownAZ className="h-4 w-4" /> : <ArrowUpAZ className="h-4 w-4" />}
            Employee
          </button>
        </div>
      </section>

      <section className="space-y-4">
        {isLoading ? (
          <div className="rounded-[2rem] border border-white/70 bg-white/85 p-8 text-center text-slate-500">Loading payroll rows...</div>
        ) : payrolls.length === 0 ? (
          <div className="rounded-[2rem] border border-dashed border-slate-200 bg-white/85 p-10 text-center text-slate-500">No payroll records matched the current filters.</div>
        ) : payrolls.map((row) => (
          <article key={row._id} className="group rounded-[2rem] border border-white/70 bg-white/90 p-5 shadow-[0_18px_45px_-30px_rgba(15,23,42,0.5)] backdrop-blur-xl transition hover:-translate-y-1 hover:shadow-[0_28px_60px_-32px_rgba(15,23,42,0.55)]">
            <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr_1fr_1fr_auto] lg:items-center">
              <div className="flex items-center gap-4">
                <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-lg font-semibold text-white shadow-lg shadow-indigo-500/20">
                  {avatarLabel(row)}
                  <span className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-base font-semibold text-slate-950">{row.employee?.user?.firstName} {row.employee?.user?.lastName}</p>
                    <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-500">{row.employee?.employeeId}</span>
                  </div>
                  <p className="text-sm text-slate-500">{row.employee?.designation?.name ?? 'General Payroll'}</p>
                </div>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Period</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{new Date(0, row.month - 1).toLocaleString('default', { month: 'long' })} {row.year}</p>
                <p className="text-xs text-slate-500">Created {new Date(row.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Net Salary</p>
                <div className="mt-1 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-emerald-700">
                  {currency(row.netSalary)}
                  <ArrowRightLeft className="h-3.5 w-3.5" />
                </div>
                <p className="mt-2 text-xs text-slate-500">Gross {currency(row.earnings?.grossEarnings)} · Deductions {currency(row.deductions?.totalDeductions)}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Status</p>
                <div className="mt-1 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5">
                  <CircleDot className={`h-2.5 w-2.5 ${row.status === 'paid' ? 'text-emerald-500' : row.status === 'processed' ? 'text-amber-500' : 'text-slate-400'}`} fill="currentColor" />
                  <StatusBadge status={row.status} />
                </div>
              </div>
              <div className="relative justify-self-end">
                <button type="button" onClick={() => setActiveMenu(activeMenu === row._id ? null : row._id)} className="rounded-2xl border border-slate-200 bg-white p-2.5 text-slate-500 shadow-sm transition hover:border-indigo-200 hover:text-indigo-700">
                  <MoreVertical className="h-4 w-4" />
                </button>
                {activeMenu === row._id && (
                  <div className="absolute right-0 z-10 mt-2 w-52 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_25px_80px_-35px_rgba(15,23,42,0.45)]">
                    {canManagePayroll && row.status === 'draft' && (
                      <button type="button" onClick={() => { approveMutation.mutate(row._id); setActiveMenu(null) }} className="flex w-full items-center gap-3 px-4 py-3 text-sm text-slate-700 transition hover:bg-slate-50">
                        <Check className="h-4 w-4" />
                        Approve payroll
                      </button>
                    )}
                    {canManagePayroll && row.status === 'processed' && (
                      <button type="button" onClick={() => { paidMutation.mutate(row._id); setActiveMenu(null) }} className="flex w-full items-center gap-3 px-4 py-3 text-sm text-slate-700 transition hover:bg-slate-50">
                        <DollarSign className="h-4 w-4" />
                        Mark as paid
                      </button>
                    )}
                    <button type="button" onClick={() => setActiveMenu(null)} className="flex w-full items-center gap-3 px-4 py-3 text-sm text-slate-700 transition hover:bg-slate-50">
                      <ChevronDown className="h-4 w-4" />
                      Close
                    </button>
                  </div>
                )}
              </div>
            </div>
          </article>
        ))}
      </section>
    </div>
  )
}
