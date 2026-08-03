import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '../../store/authStore'
import { KPIGrid } from './KPIGrid'
import { AttendanceAreaChart } from './AttendanceAreaChart'
import { DepartmentDonutChart } from './DepartmentDonutChart'
import { ActivityFeed } from './ActivityFeed'
import { QuickActionsPanel } from './QuickActionsPanel'
import { fetchDashboardStats } from '../../lib/api/dashboard'
import { Plus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

function formatDatePill() {
  return new Date().toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  })
}

export default function DashboardPage() {
  const { user } = useAuthStore()
  const navigate = useNavigate()

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: fetchDashboardStats,
    staleTime: 60000,
    refetchOnWindowFocus: false,
  })

  const displayName = user?.firstName
    ? `${user.firstName} ${user.lastName}`
    : user?.role === 'admin' ? 'Super Admin' : 'User'

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {getGreeting()}, {displayName} 👋
          </h1>
          <div className="mt-1.5">
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary-50 text-primary-700 text-xs font-medium border border-primary-100">
              {formatDatePill()}
            </span>
          </div>
        </div>
        <button
          onClick={() => navigate('/employees/new')}
          className="btn-primary self-start sm:self-auto gap-1.5"
        >
          <Plus className="w-4 h-4" />
          Quick Action
        </button>
      </div>

      {/* KPI Grid */}
      <KPIGrid data={data} loading={isLoading} />

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AttendanceAreaChart data={data} loading={isLoading} />
        </div>
        <div>
          <DepartmentDonutChart data={data} loading={isLoading} />
        </div>
      </div>

      {/* Widgets Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ActivityFeed data={data} loading={isLoading} />
        </div>
        <div>
          <QuickActionsPanel data={data} loading={isLoading} />
        </div>
      </div>
    </div>
  )
}
