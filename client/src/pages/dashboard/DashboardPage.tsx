import type { ComponentType } from 'react'
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
  Cell,
} from 'recharts'
import {
  Users,
  Clock,
  Calendar,
  DollarSign,
  UserPlus,
  TrendingUp,
  Building2,
  Briefcase,
} from 'lucide-react'

type StatCardData = {
  label: string
  value: string
  subtext?: string
  subtextClassName?: string
  icon: ComponentType<{ className?: string }>
  iconBadgeClassName: string
}

const STATS: StatCardData[] = [
  {
    label: 'Total Employees',
    value: '11',
    subtext: '↗ 5% vs last month',
    subtextClassName: 'text-emerald-600',
    icon: Users,
    iconBadgeClassName: 'bg-blue-100 text-blue-600',
  },
  {
    label: 'Present Today',
    value: '0 / 10',
    icon: Clock,
    iconBadgeClassName: 'bg-emerald-100 text-emerald-600',
  },
  {
    label: 'Pending Leaves',
    value: '0',
    icon: Calendar,
    iconBadgeClassName: 'bg-amber-100 text-amber-600',
  },
  {
    label: 'Monthly Payroll',
    value: 'Rs.2.2L',
    icon: DollarSign,
    iconBadgeClassName: 'bg-violet-100 text-violet-600',
  },
  {
    label: 'New Joiners (Month)',
    value: '0',
    icon: UserPlus,
    iconBadgeClassName: 'bg-sky-100 text-sky-600',
  },
  {
    label: 'Attendance Rate',
    value: '0%',
    icon: TrendingUp,
    iconBadgeClassName: 'bg-cyan-100 text-cyan-600',
  },
  {
    label: 'Open Positions',
    value: '0',
    icon: Building2,
    iconBadgeClassName: 'bg-pink-100 text-pink-600',
  },
  {
    label: 'Active Employees',
    value: '10',
    icon: Briefcase,
    iconBadgeClassName: 'bg-orange-100 text-orange-600',
  },
]

const ATTENDANCE_TREND = [
  { week: 'W1', absent: 1, onLeave: 0, present: 8 },
  { week: 'W2', absent: 0, onLeave: 1, present: 9 },
  { week: 'W3', absent: 1, onLeave: 1, present: 8 },
  { week: 'W4', absent: 0, onLeave: 0, present: 10 },
]

const DEPARTMENT_SPLIT = [
  { name: 'Design', value: 14, color: '#A855F7' },
  { name: 'Engineering', value: 38, color: '#3B82F6' },
  { name: 'Finance', value: 16, color: '#EC4899' },
  { name: 'Human Resources', value: 18, color: '#22C55E' },
  { name: 'Marketing', value: 14, color: '#F59E0B' },
]

function LegendSwatch({ label, color }: { label: string; color: string }) {
  return (
    <div className="flex items-center gap-2 text-xs text-slate-600">
      <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: color }} />
      <span>{label}</span>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">Welcome back, Super! Friday, July 24th 2026</p>
      </section>

      <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {STATS.map((card) => {
          const Icon = card.icon
          return (
            <article
              key={card.label}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-medium text-slate-500">{card.label}</p>
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${card.iconBadgeClassName}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-4 text-3xl font-bold leading-none text-slate-900">{card.value}</p>
              {card.subtext ? (
                <p className={`mt-2 text-xs font-medium ${card.subtextClassName ?? 'text-slate-500'}`}>
                  {card.subtext}
                </p>
              ) : (
                <p className="mt-2 text-xs text-transparent">-</p>
              )}
            </article>
          )
        })}
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
          <h2 className="text-base font-semibold text-slate-900">Attendance Trend</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={ATTENDANCE_TREND} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
                <defs>
                  <linearGradient id="presentFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22C55E" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#22C55E" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#E2E8F0" strokeDasharray="3 3" />
                <XAxis dataKey="week" tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="absent" stroke="#EF4444" fill="#FEE2E2" strokeWidth={2} />
                <Area type="monotone" dataKey="onLeave" stroke="#F59E0B" fill="#FEF3C7" strokeWidth={2} />
                <Area type="monotone" dataKey="present" stroke="#22C55E" fill="url(#presentFill)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-4">
            <LegendSwatch label="Absent" color="#EF4444" />
            <LegendSwatch label="On Leave" color="#F59E0B" />
            <LegendSwatch label="Present" color="#22C55E" />
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-slate-900">By Department</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={DEPARTMENT_SPLIT}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={48}
                  outerRadius={82}
                  paddingAngle={2}
                >
                  {DEPARTMENT_SPLIT.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {DEPARTMENT_SPLIT.map((item) => (
              <span
                key={item.name}
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-2 py-1 text-xs text-slate-600"
              >
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                {item.name}
              </span>
            ))}
          </div>
        </article>
      </section>
    </div>
  )
}
