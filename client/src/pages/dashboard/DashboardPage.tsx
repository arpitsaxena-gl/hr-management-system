import {
  Users,
  Clock,
  CalendarDays,
  DollarSign,
  UserPlus,
  TrendingUp,
  Briefcase,
  Building2
} from 'lucide-react'
import {
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts'

const STATS = [
  {
    label: 'Total Employees',
    value: '11',
    subtext: '↗ 5% vs last month',
    subtextClass: 'text-emerald-600',
    icon: Users,
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600'
  },
  {
    label: 'Present Today',
    value: '0 / 10',
    icon: Clock,
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600'
  },
  {
    label: 'Pending Leaves',
    value: '0',
    icon: CalendarDays,
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600'
  },
  {
    label: 'Monthly Payroll',
    value: 'Rs.2.2L',
    icon: DollarSign,
    iconBg: 'bg-violet-100',
    iconColor: 'text-violet-600'
  },
  {
    label: 'New Joiners (Month)',
    value: '0',
    icon: UserPlus,
    iconBg: 'bg-sky-100',
    iconColor: 'text-sky-600'
  },
  {
    label: 'Attendance Rate',
    value: '0%',
    icon: TrendingUp,
    iconBg: 'bg-cyan-100',
    iconColor: 'text-cyan-600'
  },
  {
    label: 'Open Positions',
    value: '0',
    icon: Building2,
    iconBg: 'bg-pink-100',
    iconColor: 'text-pink-600'
  },
  {
    label: 'Active Employees',
    value: '10',
    icon: Briefcase,
    iconBg: 'bg-orange-100',
    iconColor: 'text-orange-600'
  }
]

const ATTENDANCE_TREND = [
  { day: 'Mon', present: 8, absent: 1, leave: 1 },
  { day: 'Tue', present: 7, absent: 2, leave: 1 },
  { day: 'Wed', present: 9, absent: 0, leave: 1 },
  { day: 'Thu', present: 8, absent: 1, leave: 1 },
  { day: 'Fri', present: 7, absent: 2, leave: 1 },
  { day: 'Sat', present: 6, absent: 2, leave: 2 }
]

const DEPARTMENT_DATA = [
  { name: 'Design', value: 2, color: '#A855F7' },
  { name: 'Engineering', value: 4, color: '#3B82F6' },
  { name: 'Finance', value: 1, color: '#EC4899' },
  { name: 'Human Resources', value: 2, color: '#22C55E' },
  { name: 'Marketing', value: 2, color: '#F59E0B' }
]

export default function DashboardPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-title text-slate-900">Dashboard</h1>
        <p className="page-subtitle">Welcome back, Super! Friday, July 24th 2026</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {STATS.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500 font-medium">{stat.label}</p>
                <p className="mt-1 text-3xl font-bold text-slate-900">{stat.value}</p>
                {stat.subtext && <p className={`mt-2 text-xs font-medium ${stat.subtextClass}`}>{stat.subtext}</p>}
              </div>
              <div className={`w-11 h-11 rounded-xl ${stat.iconBg} flex items-center justify-center`}>
                <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-8 bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h3 className="section-title mb-4">Attendance Trend</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={ATTENDANCE_TREND}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Area type="monotone" dataKey="present" stackId="1" stroke="#22C55E" fill="#22C55E" fillOpacity={0.25} />
                <Area type="monotone" dataKey="leave" stackId="1" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.2} />
                <Area type="monotone" dataKey="absent" stackId="1" stroke="#EF4444" fill="#EF4444" fillOpacity={0.2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center gap-5 mt-4 text-xs text-slate-600">
            <span className="flex items-center gap-2"><span className="w-3 h-3 bg-red-500" />Absent</span>
            <span className="flex items-center gap-2"><span className="w-3 h-3 bg-amber-500" />On Leave</span>
            <span className="flex items-center gap-2"><span className="w-3 h-3 bg-green-500" />Present</span>
          </div>
        </div>

        <div className="xl:col-span-4 bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h3 className="section-title mb-4">By Department</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={DEPARTMENT_DATA} dataKey="value" nameKey="name" innerRadius={62} outerRadius={88} paddingAngle={2}>
                  {DEPARTMENT_DATA.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            {DEPARTMENT_DATA.map((dept) => (
              <span key={dept.name} className="text-xs px-2 py-1 rounded-full text-slate-700" style={{ backgroundColor: `${dept.color}22` }}>
                {dept.name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
