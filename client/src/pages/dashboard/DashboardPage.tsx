import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '../../lib/axios'
import { StatCard } from '../../components/ui/StatCard'
import { useAuthStore } from '../../store/authStore'
import { format } from 'date-fns'
import {
  Users, Clock, Calendar, DollarSign, UserPlus, TrendingUp,
  Building2, Briefcase, CheckCircle2, LogIn, LogOut, UserCheck,
  Bell, CalendarDays, Coffee, Zap, Gift, ChevronRight
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts'

const CHART_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4']
const PERIOD_TABS = ['Daily', 'Weekly', 'Monthly']

const MOCK_ACTIVITY = [
  { id: 1, type: 'checkin', user: 'Anita Sharma', time: '09:02 AM', avatar: 'AS', color: 'bg-emerald-500' },
  { id: 2, type: 'leave', user: 'Rohit Verma', time: '09:15 AM', avatar: 'RV', color: 'bg-amber-500' },
  { id: 3, type: 'joiner', user: 'Priya Nair', time: '10:00 AM', avatar: 'PN', color: 'bg-indigo-500' },
  { id: 4, type: 'checkout', user: 'Deepak Kumar', time: '06:30 PM', avatar: 'DK', color: 'bg-blue-500' },
  { id: 5, type: 'leave', user: 'Sneha Gupta', time: '10:45 AM', avatar: 'SG', color: 'bg-violet-500' },
]

const MOCK_HOLIDAYS = [
  { name: 'Independence Day', date: 'Aug 15', days: 22 },
  { name: 'Ganesh Chaturthi', date: 'Aug 27', days: 34 },
]

const ACTIVITY_CONFIG: Record<string, { icon: typeof CheckCircle2; label: string; color: string }> = {
  checkin: { icon: LogIn, label: 'Checked in', color: 'text-emerald-600 bg-emerald-50' },
  checkout: { icon: LogOut, label: 'Checked out', color: 'text-blue-600 bg-blue-50' },
  leave: { icon: CalendarDays, label: 'Leave approved', color: 'text-amber-600 bg-amber-50' },
  joiner: { icon: UserCheck, label: 'New joiner', color: 'text-indigo-600 bg-indigo-50' },
}

const SPARKLINE_EMPLOYEES = [{ value: 210 }, { value: 215 }, { value: 218 }, { value: 221 }, { value: 228 }, { value: 234 }]
const SPARKLINE_PAYROLL = [{ value: 52 }, { value: 58 }, { value: 55 }, { value: 61 }, { value: 64 }, { value: 68 }]
const SPARKLINE_LEAVES = [{ value: 8 }, { value: 12 }, { value: 7 }, { value: 14 }, { value: 10 }, { value: 9 }]
const SPARKLINE_RATE = [{ value: 85 }, { value: 88 }, { value: 86 }, { value: 91 }, { value: 89 }, { value: 92 }]

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-lg px-4 py-3">
      <p className="text-xs font-semibold text-gray-600 mb-1.5">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2 text-xs">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
          <span className="text-gray-500 capitalize">{p.name}:</span>
          <span className="font-semibold text-gray-800">{p.value}</span>
        </div>
      ))}
    </div>
  )
}

export default function DashboardPage() {
  const { user } = useAuthStore()
  const [attendancePeriod, setAttendancePeriod] = useState('Monthly')

  const { data: raw, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => api.get('/dashboard').then(r => r.data.data),
    staleTime: 60000,
  })
  const d = raw ?? {}

  const attendanceChart = (d.charts?.monthlyTrend ?? []).reduce(
    (acc: Record<string, number | string>[], item: { _id: { year: number; month: number; status: string }; count: number }) => {
      const key = `${item._id.year}-${String(item._id.month).padStart(2, '0')}`
      const existing = acc.find(a => a.month === key)
      if (existing) existing[item._id.status] = ((existing[item._id.status] as number) ?? 0) + item.count
      else acc.push({ month: key, [item._id.status]: item.count })
      return acc
    }, []
  ).slice(-7)

  const deptData: { name: string; count: number; color?: string }[] = d.charts?.deptDistribution ?? []
  const totalDept = deptData.reduce((s: number, d: { count: number }) => s + d.count, 0)

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  const monthPayrollL = d.payroll?.monthTotal ? ((d.payroll.monthTotal as number) / 100000).toFixed(1) : '0'
  const attendanceRate = d.attendance?.attendanceRate ?? 0

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-gray-900">
              {greeting()}, {user?.firstName} 👋
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">{format(new Date(), 'EEEE, MMMM do yyyy')}</span>
            <span className="inline-flex items-center gap-1 bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
              Live
            </span>
          </div>
        </div>
        <button className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-md shadow-indigo-200 transition-all hover:shadow-indigo-300 hover:-translate-y-0.5">
          <Zap className="w-4 h-4" />
          + Quick Action
        </button>
      </div>

      {/* KPI Grid — 8 cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Total Employees"
          value={d.overview?.totalEmployees ?? 0}
          icon={Users}
          iconGradient="from-blue-500 to-indigo-600"
          iconColor="text-white"
          trend={5}
          trendLabel="vs last month"
          loading={isLoading}
          sparkline={SPARKLINE_EMPLOYEES}
        />
        <StatCard
          title="Present Today"
          value={d.attendance?.todayPresent ?? 0}
          icon={Clock}
          iconGradient="from-emerald-400 to-teal-600"
          iconColor="text-white"
          suffix={`/ ${d.overview?.activeEmployees ?? 0}`}
          loading={isLoading}
          trend={3}
          trendLabel="vs yesterday"
        />
        <StatCard
          title="Pending Leaves"
          value={d.leaves?.pendingLeaves ?? 0}
          icon={Calendar}
          iconGradient="from-amber-400 to-orange-500"
          iconColor="text-white"
          loading={isLoading}
          badge={d.leaves?.pendingLeaves > 0 ? 'Action needed' : undefined}
          badgeColor="bg-amber-100 text-amber-700"
        />
        <StatCard
          title="Monthly Payroll"
          value={`₹${monthPayrollL}L`}
          icon={DollarSign}
          iconGradient="from-violet-500 to-purple-700"
          iconColor="text-white"
          loading={isLoading}
          trend={8}
          trendLabel="vs last month"
          sparkline={SPARKLINE_PAYROLL}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="New Joiners (Month)"
          value={d.overview?.newJoinees ?? 0}
          icon={UserPlus}
          iconGradient="from-indigo-400 to-blue-600"
          iconColor="text-white"
          loading={isLoading}
          trend={12}
          trendLabel="vs last month"
        />
        <StatCard
          title="Attendance Rate"
          value={`${attendanceRate}%`}
          icon={TrendingUp}
          iconColor="text-indigo-500"
          iconGradient="from-cyan-400 to-sky-600"
          loading={isLoading}
          ringProgress={attendanceRate}
          ringColor="#6366f1"
          sparkline={SPARKLINE_RATE}
        />
        <StatCard
          title="Open Positions"
          value={d.recruitment?.openPositions ?? 0}
          icon={Building2}
          iconGradient="from-pink-400 to-rose-600"
          iconColor="text-white"
          loading={isLoading}
        />
        <StatCard
          title="Active Employees"
          value={d.overview?.activeEmployees ?? 0}
          icon={Briefcase}
          iconGradient="from-orange-400 to-red-500"
          iconColor="text-white"
          loading={isLoading}
          trend={2}
          trendLabel="vs last month"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Attendance Trend — Gradient Area Chart */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Attendance Trend</h3>
              <p className="text-xs text-gray-400 mt-0.5">Present, On Leave & Absent</p>
            </div>
            <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-xl p-1">
              {PERIOD_TABS.map(tab => (
                <button
                  key={tab}
                  onClick={() => setAttendancePeriod(tab)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    attendancePeriod === tab
                      ? 'bg-white shadow text-indigo-700 border border-gray-200'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
          {isLoading ? (
            <div className="h-52 rounded-xl bg-gray-50 animate-pulse" />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={attendanceChart} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="grad-present" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="grad-absent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="grad-leave" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="present" stroke="#10b981" strokeWidth={2} fill="url(#grad-present)" name="Present" dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
                <Area type="monotone" dataKey="on_leave" stroke="#f59e0b" strokeWidth={2} fill="url(#grad-leave)" name="On Leave" dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
                <Area type="monotone" dataKey="absent" stroke="#ef4444" strokeWidth={2} fill="url(#grad-absent)" name="Absent" dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Department Donut Chart */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-gray-900">Department Breakdown</h3>
            <p className="text-xs text-gray-400 mt-0.5">By headcount</p>
          </div>
          {isLoading ? (
            <div className="h-52 rounded-xl bg-gray-50 animate-pulse" />
          ) : (
            <>
              <div className="flex items-center justify-center">
                <div className="relative">
                  <ResponsiveContainer width={160} height={160}>
                    <PieChart>
                      <Pie
                        data={deptData}
                        dataKey="count"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={48}
                        outerRadius={72}
                        paddingAngle={2}
                        strokeWidth={0}
                      >
                        {deptData.map((_: unknown, i: number) => (
                          <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v: number, n: string) => [`${v}`, n]} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-2xl font-bold text-gray-900">{totalDept}</span>
                    <span className="text-[10px] text-gray-400 font-medium">Total</span>
                  </div>
                </div>
              </div>
              <div className="mt-3 space-y-1.5">
                {deptData.slice(0, 5).map((dept: { name: string; count: number }, i: number) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                    <span className="flex-1 text-gray-600 truncate">{dept.name}</span>
                    <span className="font-semibold text-gray-800">{totalDept > 0 ? Math.round((dept.count / totalDept) * 100) : 0}%</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Bottom widgets row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Recent Activity Feed */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Recent Activity</h3>
              <p className="text-xs text-gray-400 mt-0.5">Today's HR activity feed</p>
            </div>
            <button className="text-xs text-indigo-600 font-semibold hover:text-indigo-800 flex items-center gap-0.5 transition-colors">
              View all <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="space-y-3">
            {MOCK_ACTIVITY.map((item, idx) => {
              const cfg = ACTIVITY_CONFIG[item.type] ?? ACTIVITY_CONFIG.checkin
              const ActivityIcon = cfg.icon
              return (
                <div key={item.id} className="flex items-start gap-3">
                  {/* Timeline line */}
                  <div className="flex flex-col items-center flex-shrink-0">
                    <div className={`w-8 h-8 rounded-xl ${item.color} flex items-center justify-center text-white text-[10px] font-bold shadow-sm`}>
                      {item.avatar}
                    </div>
                    {idx < MOCK_ACTIVITY.length - 1 && (
                      <div className="w-px h-3 bg-gray-100 mt-1" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 pt-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-gray-800">{item.user}</span>
                      <span className={`flex items-center gap-0.5 text-[10px] font-medium px-1.5 py-0.5 rounded-full ${cfg.color}`}>
                        <ActivityIcon className="w-2.5 h-2.5" />
                        {cfg.label}
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-0.5">{item.time}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Quick Actions & Announcements */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-gray-900">Quick Actions</h3>
            <p className="text-xs text-gray-400 mt-0.5">Frequent tasks at your fingertips</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button className="flex flex-col items-center gap-2 p-3 bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 rounded-xl transition-colors group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow">
                <LogIn className="w-4 h-4 text-white" />
              </div>
              <span className="text-xs font-semibold text-emerald-800">Clock In / Out</span>
            </button>
            <button className="flex flex-col items-center gap-2 p-3 bg-amber-50 hover:bg-amber-100 border border-amber-100 rounded-xl transition-colors group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow">
                <CalendarDays className="w-4 h-4 text-white" />
              </div>
              <span className="text-xs font-semibold text-amber-800">Leave Request</span>
            </button>
            <button className="flex flex-col items-center gap-2 p-3 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 rounded-xl transition-colors group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-400 to-violet-600 flex items-center justify-center shadow">
                <Bell className="w-4 h-4 text-white" />
              </div>
              <span className="text-xs font-semibold text-indigo-800">Announcements</span>
            </button>
            <button className="flex flex-col items-center gap-2 p-3 bg-pink-50 hover:bg-pink-100 border border-pink-100 rounded-xl transition-colors group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-pink-400 to-rose-600 flex items-center justify-center shadow">
                <Coffee className="w-4 h-4 text-white" />
              </div>
              <span className="text-xs font-semibold text-pink-800">Break Time</span>
            </button>
          </div>

          {/* Upcoming Holidays */}
          <div>
            <h4 className="text-xs font-bold text-gray-700 mb-2 flex items-center gap-1.5">
              <Gift className="w-3.5 h-3.5 text-pink-500" />
              Upcoming Holidays
            </h4>
            <div className="space-y-2">
              {MOCK_HOLIDAYS.map((h, i) => (
                <div key={i} className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center">
                      <Gift className="w-3.5 h-3.5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-800">{h.name}</p>
                      <p className="text-[10px] text-gray-400">{h.date}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold bg-pink-100 text-pink-700 px-2 py-0.5 rounded-full">
                    {h.days}d away
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Birthdays */}
      {(d.upcomingBirthdays?.length ?? 0) > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
            🎂 <span>Upcoming Birthdays</span>
            <span className="text-xs font-normal text-gray-400">(Next 7 Days)</span>
          </h3>
          <div className="flex flex-wrap gap-3">
            {(d.upcomingBirthdays as { _id: string; user?: { firstName?: string; lastName?: string }; dateOfBirth: string }[]).map(emp => (
              <div key={emp._id} className="flex items-center gap-3 bg-gradient-to-br from-pink-50 to-rose-50 border border-pink-100 rounded-2xl px-4 py-3 hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-400 to-rose-600 flex items-center justify-center text-white text-sm font-bold shadow">
                  {emp.user?.firstName?.[0]}{emp.user?.lastName?.[0]}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{emp.user?.firstName} {emp.user?.lastName}</p>
                  <p className="text-xs text-pink-600 font-medium">{format(new Date(emp.dateOfBirth), 'MMM do')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
