import { Clock, CalendarPlus, FileText, Gift } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { DashboardStats } from '../../types'

interface QuickActionsPanelProps {
  data?: DashboardStats
  loading: boolean
}

const QUICK_ACTIONS = [
  { label: 'Clock In / Out', icon: Clock, color: 'bg-primary-50 text-primary-600 hover:bg-primary-100', to: '/attendance' },
  { label: 'Leave Request', icon: CalendarPlus, color: 'bg-violet-50 text-violet-600 hover:bg-violet-100', to: '/leaves' },
  { label: 'View Payslip', icon: FileText, color: 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100', to: '/payroll' },
]

const MOCK_HOLIDAYS = [
  { name: 'Independence Day', date: '2026-08-15', type: 'public' },
  { name: 'Janmashtami', date: '2026-08-22', type: 'public' },
  { name: 'Gandhi Jayanti', date: '2026-10-02', type: 'public' },
]

export function QuickActionsPanel({ data, loading }: QuickActionsPanelProps) {
  const navigate = useNavigate()
  const holidays = data?.upcomingHolidays?.length ? data.upcomingHolidays : MOCK_HOLIDAYS

  if (loading) {
    return (
      <div className="card">
        <div className="skeleton h-6 w-36 rounded mb-4" />
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="skeleton h-10 rounded-xl" />)}
        </div>
        <div className="skeleton h-6 w-32 rounded mt-5 mb-3" />
        <div className="space-y-2">
          {[1, 2].map(i => <div key={i} className="skeleton h-8 rounded" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="card space-y-5">
      <div>
        <h3 className="text-base font-semibold text-gray-800 mb-3">Quick Actions</h3>
        <div className="space-y-2">
          {QUICK_ACTIONS.map(action => (
            <button
              key={action.label}
              onClick={() => navigate(action.to)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium ${action.color}`}
            >
              <action.icon className="w-4 h-4 flex-shrink-0" />
              {action.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-3">
          <Gift className="w-4 h-4 text-amber-500" />
          <h3 className="text-base font-semibold text-gray-800">Upcoming Holidays</h3>
        </div>
        <div className="space-y-2">
          {holidays.slice(0, 4).map((h, i) => {
            const date = new Date(h.date)
            const month = date.toLocaleString('default', { month: 'short' })
            const day = date.getDate()
            return (
              <div key={h._id ?? i} className="flex items-center gap-3 py-1.5">
                <div className="w-10 h-10 rounded-lg bg-amber-50 flex flex-col items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-amber-600">{day}</span>
                  <span className="text-[10px] text-amber-500 leading-none">{month}</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">{h.name}</p>
                  <p className="text-xs text-gray-400 capitalize">{h.type}</p>
                </div>
              </div>
            )
          })}
          {holidays.length === 0 && (
            <p className="text-sm text-gray-400">No upcoming holidays</p>
          )}
        </div>
      </div>
    </div>
  )
}
