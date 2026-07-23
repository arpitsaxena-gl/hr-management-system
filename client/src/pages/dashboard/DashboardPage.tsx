import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '../../lib/axios'
import { StatCard } from '../../components/ui/StatCard'
import { useAuthStore } from '../../store/authStore'
import { format } from 'date-fns'
import {
  Users, Clock, Calendar, DollarSign, UserPlus, TrendingUp, Building2, Briefcase,
  Sparkles, ChevronRight, CheckCircle2, Clock3, ClipboardList, MessageSquareMore, Umbrella, UserRoundPlus, Waves, ArrowRight
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts'

const TREND_COLORS = {
  present: '#4f46e5',
  on_leave: '#8b5cf6',
  absent: '#ef4444',
}

const PERIODS = [
  { key: 'daily', label: 'Daily' },
  { key: 'weekly', label: 'Weekly' },
  { key: 'monthly', label: 'Monthly' },
] as const

const KPI_META = [
  { title: 'Total Employees', icon: Users, accent: 'from-indigo-600 to-violet-600', key: 'totalEmployees' },
  { title: 'Present Today', icon: Clock, accent: 'from-emerald-500 to-teal-500', key: 'todayPresent' },
  { title: 'Pending Leaves', icon: Calendar, accent: 'from-amber-500 to-orange-500', key: 'pendingLeaves' },
  { title: 'Monthly Payroll', icon: DollarSign, accent: 'from-fuchsia-600 to-pink-600', key: 'monthTotal' },
  { title: 'New Joiners', icon: UserPlus, accent: 'from-sky-500 to-cyan-500', key: 'newJoinees' },
  { title: 'Attendance Rate', icon: TrendingUp, accent: 'from-violet-500 to-purple-500', key: 'attendanceRate' },
  { title: 'Open Positions', icon: Building2, accent: 'from-rose-500 to-red-500', key: 'openPositions' },
  { title: 'Active Employees', icon: Briefcase, accent: 'from-slate-700 to-slate-900', key: 'activeEmployees' },
]

const COLORS = ['#4f46e5', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444']

function Ring({ value }: { value: number }) {
  const radius = 26
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (value / 100) * circumference
  return (
    <svg viewBox="0 0 64 64" className="h-14 w-14 -rotate-90">
      <circle cx="32" cy="32" r={radius} className="fill-none stroke-slate-200" strokeWidth="6" />
      <circle cx="32" cy="32" r={radius} className="fill-none stroke-[url(#gradient)]" strokeLinecap="round" strokeWidth="6" strokeDasharray={circumference} strokeDashoffset={offset} />
      <defs>
        <linearGradient id="gradient" x1="0%" x2="100%" y1="0%" y2="0%">
          <stop offset="0%" stopColor="#4f46e5" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>
    </svg>
  )
}

export default function DashboardPage() {
  const { user } = useAuthStore()
  const [period, setPeriod] = useState<(typeof PERIODS)[number]['key']>('monthly')
  const { data: raw, isLoading } = useQuery({
    queryKey: ['dashboard', 'overview'],
    queryFn: () => api.get('/dashboard').then(r => r.data.data),
    staleTime: 60000,
  })

  const d = raw ?? {}
  const todayLabel = format(new Date(), 'EEEE, MMMM do')
  const attendanceSeries = useMemo(() => {
    const source = (d.charts?.monthlyTrend ?? []) as Array<{ _id: { year: number; month: number; status: string }; count: number }>
    const rows = source.reduce((acc: Array<Record<string, string | number>>, item) => {
      const key = `${item._id.year}-${String(item._id.month).padStart(2, '0')}`
      const entry = acc.find((row) => row.label === key)
      const status = item._id.status === 'work_from_home' ? 'present' : item._id.status
      if (entry) entry[status] = Number(entry[status] ?? 0) + item.count
      else acc.push({ label: key, present: 0, on_leave: 0, absent: 0, [status]: item.count })
      return acc
    }, [])
    const windowSize = period === 'daily' ? 7 : period === 'weekly' ? 8 : 6
    return rows.slice(-windowSize)
  }, [d.charts?.monthlyTrend, period])

  const deptBreakdown = d.charts?.deptDistribution ?? []
  const totalDept = deptBreakdown.reduce((sum: number, item: { count: number }) => sum + item.count, 0) || 11

  const summary = {
    totalEmployees: d.overview?.totalEmployees ?? 0,
    todayPresent: d.attendance?.todayPresent ?? 0,
    pendingLeaves: d.leaves?.pendingLeaves ?? 0,
    monthTotal: `₹${Number(d.payroll?.monthTotal ?? 0).toLocaleString('en-IN')}`,
    newJoinees: d.overview?.newJoinees ?? 0,
    attendanceRate: d.attendance?.attendanceRate ?? 0,
    openPositions: d.recruitment?.openPositions ?? 0,
    activeEmployees: d.overview?.activeEmployees ?? 0,
  }

  const recentActivity = [
    { label: 'Check-in completed', note: `${user?.firstName ?? 'Team member'} clocked in at 09:02`, icon: Clock3, tone: 'from-indigo-500 to-violet-500' },
    { label: 'Leave approved', note: 'Sick leave request approved for today', icon: CheckCircle2, tone: 'from-emerald-500 to-teal-500' },
    { label: 'New joiner onboarded', note: 'Orientation checklist completed', icon: UserRoundPlus, tone: 'from-sky-500 to-cyan-500' },
  ]

  const announcements = [
    { label: 'Clock In / Out', note: 'Record attendance in one tap', icon: Waves },
    { label: 'Leave Requests', note: 'Review pending approvals', icon: ClipboardList },
    { label: 'Upcoming Holidays', note: 'Plan staffing around holidays', icon: Umbrella },
  ]

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-[0_24px_70px_-35px_rgba(79,70,229,0.35)] backdrop-blur-xl lg:p-8">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700">
              <Sparkles className="h-4 w-4" />
              Good morning, Super Admin 👋
              <span className="rounded-full bg-white px-2 py-1 text-xs font-semibold text-indigo-600 shadow-sm">{todayLabel}</span>
            </div>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-950 lg:text-4xl">HRMS Main Dashboard</h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500 lg:text-base">A modern SaaS overview for attendance, payroll, and people operations with quick access to the most important workflows.</p>
            </div>
          </div>
          <button type="button" className="inline-flex items-center gap-2 self-start rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:-translate-y-0.5">
            + Quick Action
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {KPI_META.map((item, index) => {
          const value = summary[item.key as keyof typeof summary] as string | number
          const isAttendance = item.key === 'attendanceRate'
          const isPayroll = item.key === 'monthTotal'
          return (
            <div key={item.key} className="rounded-[2rem] border border-white/70 bg-white/85 p-5 shadow-[0_18px_45px_-28px_rgba(15,23,42,0.45)] backdrop-blur-xl transition hover:-translate-y-1 hover:shadow-[0_30px_60px_-32px_rgba(15,23,42,0.5)]">
              <StatCard
                title={item.title}
                value={isAttendance ? `${value}%` : value}
                icon={item.icon}
                iconBg={`bg-gradient-to-br ${item.accent} text-white`}
                iconColor="text-white"
                trend={12 - index}
                trendLabel="vs last month"
                suffix={isPayroll ? '' : undefined}
                loading={isLoading}
              />
              {isAttendance && !isLoading && (
                <div className="mt-4 flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Attendance ring</p>
                    <p className="text-sm font-semibold text-slate-900">Target vs actual</p>
                  </div>
                  <Ring value={Number(value)} />
                </div>
              )}
              {isPayroll && !isLoading && <p className="mt-3 text-xs font-medium text-slate-500">Correct rupee formatting applied across payroll views.</p>}
            </div>
          )
        })}
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.8fr_1fr]">
        <div className="rounded-[2rem] border border-white/70 bg-white/85 p-5 shadow-[0_18px_45px_-28px_rgba(15,23,42,0.45)] backdrop-blur-xl">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">Attendance Trend</h2>
              <p className="text-sm text-slate-500">Absent, On Leave, and Present trends with smooth hover tooltips.</p>
            </div>
            <div className="inline-flex rounded-2xl border border-slate-200 bg-slate-50 p-1">
              {PERIODS.map((option) => (
                <button key={option.key} type="button" onClick={() => setPeriod(option.key)} className={`rounded-xl px-4 py-2 text-sm font-medium transition ${period === option.key ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}>
                  {option.label}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-5 h-[320px]">
            {isLoading ? (
              <div className="h-full rounded-3xl bg-slate-100/80" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={attendanceSeries}>
                  <defs>
                    <linearGradient id="presentFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="leaveFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="absentFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 4" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <Tooltip contentStyle={{ borderRadius: 18, border: '1px solid #e2e8f0', boxShadow: '0 20px 50px -25px rgba(15,23,42,.4)' }} />
                  <Area type="monotone" dataKey="present" stroke={TREND_COLORS.present} fill="url(#presentFill)" strokeWidth={3} />
                  <Area type="monotone" dataKey="on_leave" stroke={TREND_COLORS.on_leave} fill="url(#leaveFill)" strokeWidth={3} />
                  <Area type="monotone" dataKey="absent" stroke={TREND_COLORS.absent} fill="url(#absentFill)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/70 bg-white/85 p-5 shadow-[0_18px_45px_-28px_rgba(15,23,42,0.45)] backdrop-blur-xl">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">Department Breakdown</h2>
              <p className="text-sm text-slate-500">Modern donut with centered totals and color legend.</p>
            </div>
            <div className="rounded-2xl bg-slate-50 px-3 py-2 text-right">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Total</p>
              <p className="text-xl font-semibold text-slate-950">{totalDept}</p>
            </div>
          </div>
          <div className="mt-5 grid gap-5">
            <div className="h-[260px]">
              {isLoading ? (
                <div className="h-full rounded-3xl bg-slate-100/80" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={deptBreakdown} dataKey="count" nameKey="name" innerRadius={62} outerRadius={95} paddingAngle={3}>
                      {deptBreakdown.map((_: unknown, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="space-y-3">
              {deptBreakdown.map((item: { name: string; count: number }, i: number) => (
                <div key={item.name} className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="text-sm font-medium text-slate-700">{item.name}</span>
                  </div>
                  <span className="text-sm font-semibold text-slate-950">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.3fr_0.9fr]">
        <div className="rounded-[2rem] border border-white/70 bg-white/85 p-5 shadow-[0_18px_45px_-28px_rgba(15,23,42,0.45)] backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">Recent Activity Feed</h2>
              <p className="text-sm text-slate-500">Live timeline for check-ins, approvals, and onboarding.</p>
            </div>
            <MessageSquareMore className="h-5 w-5 text-indigo-500" />
          </div>
          <div className="mt-5 space-y-4">
            {recentActivity.map((item) => (
              <div key={item.label} className="flex gap-4 rounded-3xl border border-slate-100 bg-slate-50/80 p-4">
                <div className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${item.tone} text-white shadow-lg`}>
                  <item.icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-950">{item.label}</p>
                  <p className="text-sm text-slate-500">{item.note}</p>
                </div>
                <ChevronRight className="h-5 w-5 text-slate-300" />
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-[2rem] border border-white/70 bg-white/85 p-5 shadow-[0_18px_45px_-28px_rgba(15,23,42,0.45)] backdrop-blur-xl">
          <h2 className="text-lg font-semibold text-slate-950">Quick Actions & Announcements</h2>
          <p className="text-sm text-slate-500">Clock in, request leave, and plan around holidays.</p>
          <div className="mt-5 space-y-3">
            {announcements.map((item) => (
              <div key={item.label} className="flex items-center gap-4 rounded-3xl border border-slate-100 bg-gradient-to-r from-white to-slate-50 p-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                  <item.icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-950">{item.label}</p>
                  <p className="text-sm text-slate-500">{item.note}</p>
                </div>
                <button type="button" className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-indigo-200 hover:text-indigo-700">Open</button>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
