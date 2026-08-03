import { Clock, UserPlus, CalendarCheck, DollarSign } from 'lucide-react'
import type { DashboardStats } from '../../types'

interface ActivityFeedProps {
  data?: DashboardStats
  loading: boolean
}

function getRelativeTime(timestamp: string) {
  const diff = Date.now() - new Date(timestamp).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

const EVENT_ICONS: Record<string, any> = {
  check_in: Clock,
  leave_approved: CalendarCheck,
  new_joiner: UserPlus,
  leave_request: CalendarCheck,
  payroll_processed: DollarSign,
}

const EVENT_COLORS: Record<string, string> = {
  check_in: 'bg-emerald-100 text-emerald-600',
  leave_approved: 'bg-blue-100 text-blue-600',
  new_joiner: 'bg-violet-100 text-violet-600',
  leave_request: 'bg-amber-100 text-amber-600',
  payroll_processed: 'bg-primary-100 text-primary-600',
}

const MOCK_EVENTS = [
  { id: '1', type: 'check_in', title: 'Ravi Kumar checked in', description: 'Engineering · 9:02 AM', timestamp: new Date(Date.now() - 2 * 60000).toISOString(), initials: 'RK' },
  { id: '2', type: 'leave_approved', title: 'Leave approved for Priya Sharma', description: 'HR approved 2-day sick leave', timestamp: new Date(Date.now() - 15 * 60000).toISOString(), initials: 'PS' },
  { id: '3', type: 'new_joiner', title: 'Ananya Patel joined the team', description: 'Design · Senior UI Designer', timestamp: new Date(Date.now() - 45 * 60000).toISOString(), initials: 'AP' },
  { id: '4', type: 'leave_request', title: 'Leave request from Arjun Singh', description: 'Annual leave · 3 days', timestamp: new Date(Date.now() - 2 * 3600000).toISOString(), initials: 'AS' },
  { id: '5', type: 'payroll_processed', title: 'July payroll processed', description: '48 employees · ₹24.6L total', timestamp: new Date(Date.now() - 4 * 3600000).toISOString(), initials: '₹' },
]

export function ActivityFeed({ data, loading }: ActivityFeedProps) {
  const events = data?.recentActivity?.length ? data.recentActivity : MOCK_EVENTS

  if (loading) {
    return (
      <div className="card">
        <div className="skeleton h-6 w-36 rounded mb-4" />
        <div className="space-y-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="flex gap-3">
              <div className="skeleton w-9 h-9 rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="skeleton h-4 w-48 rounded" />
                <div className="skeleton h-3 w-32 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-base font-semibold text-gray-800">Recent Activity</h3>
        <span className="text-xs text-primary-600 font-medium cursor-pointer hover:underline">View all</span>
      </div>

      <div className="space-y-4">
        {events.map((event, i) => {
          const IconComp = EVENT_ICONS[event.type] ?? Clock
          const colorClass = EVENT_COLORS[event.type] ?? 'bg-gray-100 text-gray-600'
          return (
            <div key={event.id ?? i} className="flex gap-3">
              <div className={`w-9 h-9 rounded-full ${colorClass} flex items-center justify-center flex-shrink-0 text-xs font-bold`}>
                {event.initials ? (
                  <span>{event.initials}</span>
                ) : (
                  <IconComp className="w-4 h-4" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 leading-tight">{event.title}</p>
                <p className="text-xs text-gray-400 mt-0.5">{event.description}</p>
              </div>
              <span className="text-xs text-gray-400 flex-shrink-0 mt-0.5">
                {getRelativeTime(event.timestamp)}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
