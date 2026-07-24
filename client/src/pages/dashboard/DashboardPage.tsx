import { useQuery } from '@tanstack/react-query'
import { useState, useMemo } from 'react'
import api from '../../lib/axios'
import { StatCard } from '../../components/ui/StatCard'
import { useAuthStore } from '../../store/authStore'
import { format } from 'date-fns'
import {
  Users, Clock, Calendar, UserPlus, TrendingUp, Building2, Briefcase, Gift,
  CheckCircle, XCircle, Coffee, ChevronRight, ClockIcon, LogIn
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'
import { formatLakhs } from '../../lib/formatters'

const DEPT_COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899']

const SPARKLINES = {
  up: [{ v: 4 }, { v: 6 }, { v: 5 }, { v: 8 }, { v: 7 }, { v: 10 }, { v: 12 }],
  flat: [{ v: 7 }, { v: 8 }, { v: 7 }, { v: 9 }, { v: 8 }, { v: 8 }, { v: 9 }],
  down: [{ v: 10 }, { v: 9 }, { v: 8 }, { v: 8 }, { v: 7 }, { v: 6 }, { v: 5 }],
}

type Period = 'daily' | 'weekly' | 'monthly'

const RECENT_ACTIVITIES = [
  { id: 1, type: 'check-in', user: 'Rahul Sharma', time: '9:02 AM', desc: 'Checked in', icon: LogIn, color: 'text-emerald-600 bg-emerald-50' },
  { id: 2, type: 'leave', user: 'Priya Mehta', time: '8:45 AM', desc: 'Leave approved (Annual)', icon: CheckCircle, color: 'text-blue-600 bg-blue-50' },
  { id: 3, type: 'joiner', user: 'Arjun Patel', time: 'Yesterday', desc: 'New joiner — Engineering', icon: UserPlus, color: 'text-violet-600 bg-violet-50' },
  { id: 4, type: 'check-in', user: 'Sneha Iyer', time: '9:15 AM', desc: 'Checked in (WFH)', icon: LogIn, color: 'text-emerald-600 bg-emerald-50' },
  { id: 5, type: 'leave', user: 'Dev Kumar', time: 'Yesterday', desc: 'Leave request pending', icon: ClockIcon, color: 'text-amber-600 bg-amber-50' },
]

const UPCOMING_HOLIDAYS_STATIC = [
  { name: 'Independence Day', date: 'Aug 15' },
  { name: 'Gandhi Jayanti', date: 'Oct 2' },
]

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-lg p-3 text-xs">
      <p className="font-semibold text-gray-700 mb-1">{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-gray-500 capitalize">{p.name}:</span>
          <span className="font-semibold text-gray-800">{p.value}</span>
        </div>
      ))}
    </div>
  )
}

export default function DashboardPage() {
  const { user } = useAuthStore()
  const [period, setPeriod] = useState<Period>('monthly')

  const { data: raw, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => api.get('/dashboard').then(r => r.data.data),
    staleTime: 60000,
  })

  const { data: dailyTrend } = useQuery({
    queryKey: ['dashboard-attendance-trend'],
    queryFn: () => api.get('/dashboard/attendance-trend').then(r => r.data.data),
    enabled: period === 'daily',
    staleTime: 60000,
  })

  const d = raw ?? {}

  const monthlyChart = useMemo(() =>
    (d.charts?.monthlyTrend ?? []).reduce((acc: Record<string, number | string>[], item: any) => {
      const key = `${item._id.year}-${String(item._id.month).padStart(2, '0')}`
      const existing = acc.find(a => a.month === key)
      if (existing) existing[item._id.status] = ((existing[item._id.status] as number) ?? 0) + item.count
      else acc.push({ month: key, [item._id.status]: item.count })
      return acc
    }, []).slice(-6),
    [d.charts?.monthlyTrend]
  )

  const weeklyChart = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    return days.map(day => ({
      month: day,
      present: Math.floor(Math.random() * 20 + 70),
      absent: Math.floor(Math.random() * 5 + 2),
      on_leave: Math.floor(Math.random() * 5 + 1),
    }))
  }, [])

  const chartData = period === 'daily' ? (dailyTrend ?? monthlyChart) : period === 'weekly' ? weeklyChart : monthlyChart

  const totalHeadcount = (d.charts?.deptDistribution ?? []).reduce((s: number, d: any) => s + d.count, 0)
  const attendanceRate = d.attendance?.attendanceRate ?? 0

  const now = new Date()
  const hour = now.getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const userName = user?.role === 'admin' ? 'Super Admin' : `${user?.firstName ?? ''}`

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{greeting}, {userName} \u{1F44B}</h1>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 text-xs font-semibold px-3 py-1 rounded-full border border-indigo-100">
              \u{1F4C5} {format(now, 'EEEE, MMMM do yyyy')}
            </span>
          </div>
        </div>
        <button className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:opacity-90 transition-opacity shadow-md shadow-indigo-200">
          + Quick Action
        </button>
      </div>

      {/* KPI Grid — 8 cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Total Employees"
          value={d.overview?.totalEmployees ?? 0}
          icon={Users}
          gradientFrom="#6366f1" gradientTo="#8b5cf6"
          trend={5} sparkline={SPARKLINES.up}
          loading={isLoading}
        />
        <StatCard
          title="New This Month"
          value={d.overview?.newJoinees ?? 0}
          icon={UserPlus}
          gradientFrom="#06b6d4" gradientTo="#0ea5e9"
          trend={12} trendLabel="vs last month"
          sparkline={SPARKLINES.up}
          loading={isLoading}
        />
        <StatCard
          title="Present Today"
          value={d.attendance?.todayPresent ?? 0}
          icon={Clock}
          gradientFrom="#10b981" gradientTo="#34d399"
          suffix={`/ ${d.overview?.activeEmployees ?? 0}`}
          trend={2}
          loading={isLoading}
        />
        <StatCard
          title="Pending Leaves"
          value={d.leaves?.pendingLeaves ?? 0}
          icon={Calendar}
          gradientFrom="#f59e0b" gradientTo="#f97316"
          trend={-3}
          loading={isLoading}
        />
        <StatCard
          title="Attendance Rate"
          value={`${attendanceRate}%`}
          icon={TrendingUp}
          ringPercent={attendanceRate}
          ringColor="#6366f1"
          loading={isLoading}
        />
        <StatCard
          title="Monthly Payroll"
          value={d.payroll?.monthTotal ? formatLakhs(d.payroll.monthTotal as number) : '\u20b90'}
          icon={Building2}
          gradientFrom="#8b5cf6" gradientTo="#a78bfa"
          trend={8} sparkline={SPARKLINES.up}
          loading={isLoading}
        />
        <StatCard
          title="Open Positions"
          value={d.recruitment?.openPositions ?? 0}
          icon={Briefcase}
          gradientFrom="#ec4899" gradientTo="#f43f5e"
          trend={-1}
          loading={isLoading}
        />
        <StatCard
          title="Upcoming Birthdays"
          value={d.upcomingBirthdays?.length ?? 0}
          icon={Gift}
          gradientFrom="#f43f5e" gradientTo="#fb923c"
          loading={isLoading}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Area Chart */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-800">Attendance Trend</h3>
            <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
              {(['daily', 'weekly', 'monthly'] as Period[]).map(p => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`text-xs font-semibold px-3 py-1 rounded-lg transition-all capitalize ${
                    period === p ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          {isLoading ? (
            <div className="h-52 bg-gray-50 animate-pulse rounded-xl" />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <defs>
                  <linearGradient id="gPresent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gAbsent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gLeave" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="present" name="Present" stroke="#10b981" strokeWidth={2} fill="url(#gPresent)" dot={false} />
                <Area type="monotone" dataKey="absent" name="Absent" stroke="#ef4444" strokeWidth={2} fill="url(#gAbsent)" dot={false} />
                <Area type="monotone" dataKey="on_leave" name="On Leave" stroke="#f59e0b" strokeWidth={2} fill="url(#gLeave)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Donut Chart */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-bold text-gray-800 mb-4">By Department</h3>
          {isLoading ? (
            <div className="h-52 bg-gray-50 animate-pulse rounded-xl" />
          ) : (
            <div className="flex flex-col gap-3">
              <ResponsiveContainer width="100%" height={150}>
                <PieChart>
                  <Pie
                    data={d.charts?.deptDistribution ?? []}
                    dataKey="count"
                    nameKey="name"
                    cx="50%" cy="50%"
                    innerRadius={45} outerRadius={70}
                    paddingAngle={3}
                  >
                    {(d.charts?.deptDistribution ?? []).map((_: unknown, i: number) => (
                      <Cell key={i} fill={DEPT_COLORS[i % DEPT_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: any) => [`${v} employees`, '']} />
                </PieChart>
              </ResponsiveContainer>
              <div className="text-center -mt-2">
                <p className="text-xl font-bold text-gray-900">{totalHeadcount}</p>
                <p className="text-xs text-gray-400">Total Headcount</p>
              </div>
              <div className="space-y-1.5 mt-1">
                {(d.charts?.deptDistribution ?? []).slice(0, 5).map((dept: any, i: number) => (
                  <div key={dept.name} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: DEPT_COLORS[i % DEPT_COLORS.length] }} />
                    <span className="text-xs text-gray-600 flex-1 truncate">{dept.name}</span>
                    <span className="text-xs font-semibold text-gray-700">
                      {totalHeadcount > 0 ? Math.round((dept.count / totalHeadcount) * 100) : 0}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Recent Activity Feed */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-800">Recent Activity</h3>
            <button className="text-xs text-indigo-600 font-semibold flex items-center gap-1 hover:gap-2 transition-all">
              View all <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="space-y-3">
            {RECENT_ACTIVITIES.map(act => (
              <div key={act.id} className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${act.color.split(' ')[1]}`}>
                  <act.icon className={`w-4 h-4 ${act.color.split(' ')[0]}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-semibold text-gray-800 truncate">{act.user}</p>
                    <span className="w-1 h-1 rounded-full bg-gray-300 flex-shrink-0" />
                    <p className="text-xs text-gray-400 flex-shrink-0">{act.time}</p>
                  </div>
                  <p className="text-xs text-gray-500">{act.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Upcoming Birthdays if any */}
          {(d.upcomingBirthdays?.length ?? 0) > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">\u{1F382} Upcoming Birthdays</p>
              <div className="flex flex-wrap gap-2">
                {(d.upcomingBirthdays as any[]).slice(0, 4).map(emp => (
                  <div key={emp._id} className="flex items-center gap-2 bg-pink-50 border border-pink-100 rounded-xl px-3 py-2">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center text-white text-xs font-bold">
                      {emp.user?.firstName?.[0]}{emp.user?.lastName?.[0]}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-800">{emp.user?.firstName} {emp.user?.lastName}</p>
                      <p className="text-xs text-pink-600">{format(new Date(emp.dateOfBirth), 'MMM do')}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions & Announcements */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-bold text-gray-800 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Clock In', icon: LogIn, color: 'from-emerald-500 to-teal-600', desc: 'Mark attendance' },
              { label: 'Leave Request', icon: Calendar, color: 'from-blue-500 to-indigo-600', desc: 'Apply for leave' },
              { label: 'Holidays', icon: Gift, color: 'from-violet-500 to-purple-600', desc: 'View calendar' },
              { label: 'Break', icon: Coffee, color: 'from-amber-500 to-orange-600', desc: 'Start break' },
            ].map(action => (
              <button
                key={action.label}
                className="flex flex-col items-center gap-2 p-3 rounded-xl border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/40 transition-all group"
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform`}>
                  <action.icon className="w-5 h-5 text-white" />
                </div>
                <div className="text-center">
                  <p className="text-xs font-semibold text-gray-700">{action.label}</p>
                  <p className="text-xs text-gray-400 leading-tight">{action.desc}</p>
                </div>
              </button>
            ))}
          </div>

          {/* Announcements */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Upcoming Holidays</p>
            <div className="space-y-2">
              {UPCOMING_HOLIDAYS_STATIC.map(h => (
                <div key={h.name} className="flex items-center gap-2 text-xs">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 flex-shrink-0" />
                  <span className="text-gray-600 flex-1">{h.name}</span>
                  <span className="text-indigo-600 font-semibold">{h.date}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Absent today */}
          <div className="mt-3 p-3 bg-red-50 rounded-xl border border-red-100">
            <div className="flex items-center gap-2">
              <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-red-700">{d.attendance?.todayAbsent ?? 0} Absent Today</p>
                <p className="text-xs text-red-500">Out of {d.overview?.activeEmployees ?? 0} active</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
