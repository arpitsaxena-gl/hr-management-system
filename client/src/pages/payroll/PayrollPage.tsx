import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../../lib/axios'
import { StatCard } from '../../components/ui/StatCard'
import { PayrollCardTable } from './PayrollCardTable'
import { usePermissions } from '../../hooks/usePermissions'
import { IndianRupee, Play, CheckCircle, Clock, XCircle } from 'lucide-react'
import type { Payroll } from '../../types'
import toast from 'react-hot-toast'

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const STATUS_OPTIONS = ['', 'draft', 'processed', 'paid', 'cancelled']

export default function PayrollPage() {
  const qc = useQueryClient()
  const { canManagePayroll } = usePermissions()
  const today = new Date()
  const [page, setPage] = useState(1)
  const [limit] = useState(20)
  const [month, setMonth] = useState(String(today.getMonth() + 1))
  const [year, setYear] = useState(String(today.getFullYear()))
  const [status, setStatus] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['payroll', page, limit, month, year, status],
    queryFn: () =>
      api.get('/payroll', { params: { page, limit, month, year, status: status || undefined } }).then(r => r.data),
  })

  const { data: summary } = useQuery({
    queryKey: ['payroll-summary', month, year],
    queryFn: () =>
      api.get('/payroll/summary', { params: { month, year } }).then(r => r.data.data),
    enabled: canManagePayroll,
  })

  const processMutation = useMutation({
    mutationFn: () => api.post('/payroll/process', { month: Number(month), year: Number(year) }),
    onSuccess: (res) => {
      toast.success(`Processed ${res.data?.data?.processed ?? 0} payrolls`)
      qc.invalidateQueries({ queryKey: ['payroll'] })
      qc.invalidateQueries({ queryKey: ['payroll-summary'] })
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to process payroll'),
  })

  const approveMutation = useMutation({
    mutationFn: (id: string) => api.put(`/payroll/${id}/approve`),
    onSuccess: () => { toast.success('Payroll approved'); qc.invalidateQueries({ queryKey: ['payroll'] }) },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed'),
  })

  const paidMutation = useMutation({
    mutationFn: (id: string) => api.put(`/payroll/${id}/paid`, { paymentDate: new Date(), paymentMethod: 'bank_transfer' }),
    onSuccess: () => { toast.success('Marked as paid'); qc.invalidateQueries({ queryKey: ['payroll'] }) },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed'),
  })

  const summaryMap = ((summary?.summary ?? []) as any[]).reduce((acc: any, s: any) => {
    acc[s._id] = s
    return acc
  }, {})

  const years = Array.from({ length: 5 }, (_, i) => today.getFullYear() - 2 + i)

  const statCards = [
    {
      title: 'Total Paid',
      value: summaryMap.paid?.count ?? 0,
      icon: CheckCircle,
      gradient: 'from-emerald-500 to-teal-500',
      trend: 5,
      trendLabel: 'vs last month',
    },
    {
      title: 'Paid Amount',
      value: summaryMap.paid?.totalNet ?? 0,
      icon: IndianRupee,
      gradient: 'from-primary-500 to-violet-500',
      formatAs: 'currency' as const,
    },
    {
      title: 'Pending Draft',
      value: summaryMap.draft?.count ?? 0,
      icon: Clock,
      gradient: 'from-amber-500 to-orange-500',
    },
    {
      title: 'Processed',
      value: summaryMap.processed?.count ?? 0,
      icon: XCircle,
      gradient: 'from-blue-500 to-cyan-500',
    },
  ]

  const payrolls: Payroll[] = data?.data ?? []
  const pagination = data?.pagination

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="page-title">Payroll</h1>
          <p className="page-subtitle">Manage and process employee salaries</p>
        </div>
        {canManagePayroll && (
          <button
            onClick={() => processMutation.mutate()}
            disabled={processMutation.isPending}
            className="btn-primary gap-2"
          >
            <Play className="w-4 h-4" />
            {processMutation.isPending ? 'Processing...' : 'Process Payroll'}
          </button>
        )}
      </div>

      {/* Stat Cards */}
      {canManagePayroll && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map(card => (
            <StatCard key={card.title} loading={isLoading} {...card} />
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="card !p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
            {MONTH_NAMES.map((m, i) => (
              <button
                key={m}
                onClick={() => { setMonth(String(i + 1)); setPage(1) }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  month === String(i + 1)
                    ? 'bg-white text-primary-600 shadow-sm font-semibold'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {m.slice(0, 3)}
              </button>
            ))}
          </div>

          <select
            value={year}
            onChange={e => { setYear(e.target.value); setPage(1) }}
            className="input w-24 !py-2"
          >
            {years.map(y => <option key={y} value={String(y)}>{y}</option>)}
          </select>

          <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
            {STATUS_OPTIONS.map(st => (
              <button
                key={st}
                onClick={() => { setStatus(st); setPage(1) }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${
                  status === st
                    ? 'bg-white text-primary-600 shadow-sm font-semibold'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {st || 'All'}
              </button>
            ))}
          </div>

          {data?.pagination && (
            <span className="ml-auto text-xs text-gray-400">
              {data.pagination.total} records
            </span>
          )}
        </div>
      </div>

      {/* Card Table */}
      <PayrollCardTable
        payrolls={payrolls}
        loading={isLoading}
        canManage={canManagePayroll}
        onApprove={id => approveMutation.mutate(id)}
        onMarkPaid={id => paidMutation.mutate(id)}
      />

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Page {pagination.page} of {pagination.totalPages}
          </p>
          <div className="flex gap-2">
            <button
              disabled={!pagination.hasPrevPage}
              onClick={() => setPage(p => p - 1)}
              className="btn-outline btn-sm disabled:opacity-40"
            >
              Previous
            </button>
            <button
              disabled={!pagination.hasNextPage}
              onClick={() => setPage(p => p + 1)}
              className="btn-outline btn-sm disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
