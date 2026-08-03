import {
  Users, UserCheck, UserPlus, Building2,
  Clock, CalendarX, IndianRupee, TrendingUp
} from 'lucide-react'
import { StatCard } from '../../components/ui/StatCard'
import type { DashboardStats } from '../../types'

interface KPIGridProps {
  data?: DashboardStats
  loading: boolean
}

export function KPIGrid({ data, loading }: KPIGridProps) {
  const cards = [
    {
      title: 'Total Employees',
      value: data?.overview?.totalEmployees ?? 0,
      icon: Users,
      gradient: 'from-primary-500 to-primary-600',
      trend: 12,
      trendLabel: 'vs last month',
      sparklineData: [42, 45, 48, 50, 52, 55, data?.overview?.totalEmployees ?? 55].map(Number),
    },
    {
      title: 'Active Employees',
      value: data?.overview?.activeEmployees ?? 0,
      icon: UserCheck,
      gradient: 'from-emerald-500 to-teal-500',
      trend: 8,
      trendLabel: 'vs last month',
    },
    {
      title: 'New Hires',
      value: data?.overview?.newJoinees ?? 0,
      icon: UserPlus,
      gradient: 'from-violet-500 to-purple-600',
      trend: 5,
      trendLabel: 'this month',
    },
    {
      title: 'Departments',
      value: data?.overview?.departments ?? data?.charts?.deptDistribution?.length ?? 0,
      icon: Building2,
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      title: 'Present Today',
      value: data?.attendance?.todayPresent ?? 0,
      icon: Clock,
      gradient: 'from-amber-500 to-orange-500',
      trend: 3,
      trendLabel: 'vs yesterday',
    },
    {
      title: 'Attendance Rate',
      value: data?.attendance?.attendanceRate ?? 0,
      icon: TrendingUp,
      gradient: 'from-primary-500 to-violet-500',
      progressValue: data?.attendance?.attendanceRate ?? 0,
      formatAs: 'percent' as const,
    },
    {
      title: 'Pending Leaves',
      value: data?.leaves?.pendingLeaves ?? 0,
      icon: CalendarX,
      gradient: 'from-rose-500 to-pink-500',
    },
    {
      title: 'Monthly Payroll',
      value: data?.payroll?.monthTotal ?? 0,
      icon: IndianRupee,
      gradient: 'from-emerald-500 to-green-600',
      formatAs: 'currency' as const,
      trend: 2,
      trendLabel: 'vs last month',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <StatCard
          key={card.title}
          loading={loading}
          {...card}
        />
      ))}
    </div>
  )
}
