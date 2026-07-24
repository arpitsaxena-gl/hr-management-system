import {
  Users,
  Clock,
  Calendar,
  DollarSign,
  UserPlus,
  TrendingUp,
  Briefcase,
  ShoppingBag
} from 'lucide-react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell
} from 'recharts'

const STATS = [
  {
    label: 'Total Employees',
    value: '11',
    subtext: '↗ 5% vs last month',
    subtextColor: 'text-emerald-600',
    icon: Users,
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
  },
  {
    label: 'Present Today',
    value: '0 / 10',
    icon: Clock,
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
  },
  {
    label: 'Pending Leaves',
    value: '0',
    icon: Calendar,
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
  },
  {
    label: 'Monthly Payroll',
    value: 'Rs.2.2L',
    icon: DollarSign,
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600',
  },
  {
    label: 'New Joiners (Month)',
    value: '0',
    icon: UserPlus,
    iconBg: 'bg-sky-100',
    iconColor: 'text-sky-600',
  },
  {
    label: 'Attendance Rate',
    value: '0%',
    icon: TrendingUp,
    iconBg: 'bg-cyan-100',
    iconColor: 'text-cyan-600',
  },
  {
    label: 'Open Positions',
    value: '0',
    icon: Briefcase,
    iconBg: 'bg-pink-100',
    iconColor: 'text-pink-600',
  },
  {
    label: 'Active Employees',
    value: '10',
    icon: ShoppingBag,
    iconBg: 'bg-orange-100',
    iconColor: 'text-orange-600',
  },
]

const ATTENDANCE_DATA = [
  { day: 'Mon', present: 0, absent: 0, onLeave: 0 },
  { day: 'Tue', present: 0, absent: 0, onLeave: 0 },
  { day: 'Wed', present: 0, absent: 0, onLeave: 0 },
  { day: 'Thu', present: 0, absent: 0, onLeave: 0 },
  { day: 'Fri', present: 0, absent: 0, onLeave: 0 },
  { day: 'Sat', present: 0, absent: 0, onLeave: 0 },
]

const DEPARTMENT_DATA = [
  { name: 'Design', value: 2, color: '#8B5CF6' },
  { name: 'Engineering', value: 4, color: '#3B82F6' },
  { name: 'Finance', value: 1, color: '#EC4899' },
  { name: 'Human Resources', value: 2, color: '#22C55E' },
  { name: 'Marketing', value: 1, color: '#F97316' },
]

function LegendSwatch({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2 text-xs text-slate-600">
      <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: color }} />
      <span>{label}</span>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">Welcome back, Super! Friday, July 24th 2026</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {STATS.map(card => (
          <div key={card.label} className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{card.label}</p>
                <p className="mt-3 text-3xl font-bold text-slate-900">{card.value}</p>
                {card.subtext && <p className={`mt-2 text-xs font-medium ${card.subtextColor}`}>{card.subtext}</p>}
              </div>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.iconBg}`}>
                <card.icon className={`w-5 h-5 ${card.iconColor}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-8 bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-5">
          <h3 className="text-base font-semibold text-slate-900">Attendance Trend</h3>
          <div className="mt-5 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={ATTENDANCE_DATA} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid stroke="#E2E8F0" strokeDasharray="3 3" />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="absent" stackId="1" stroke="#EF4444" fill="#FEE2E2" />
                <Area type="monotone" dataKey="onLeave" stackId="1" stroke="#F59E0B" fill="#FEF3C7" />
                <Area type="monotone" dataKey="present" stackId="1" stroke="#22C55E" fill="#DCFCE7" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-4">
            <LegendSwatch color="#EF4444" label="Absent" />
            <LegendSwatch color="#F59E0B" label="On Leave" />
            <LegendSwatch color="#22C55E" label="Present" />
          </div>
        </div>

        <div className="xl:col-span-4 bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-5">
          <h3 className="text-base font-semibold text-slate-900">By Department</h3>
          <div className="mt-5 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={DEPARTMENT_DATA}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={80}
                  paddingAngle={3}
                >
                  {DEPARTMENT_DATA.map(item => (
                    <Cell key={item.name} fill={item.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {DEPARTMENT_DATA.map(item => (
              <span
                key={item.name}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium text-slate-700"
                style={{ backgroundColor: `${item.color}22` }}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                {item.name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
