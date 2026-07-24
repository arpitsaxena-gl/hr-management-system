import { NavLink } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import {
  LayoutDashboard,
  Users,
  Building2,
  Briefcase,
  Clock,
  CalendarDays,
  DollarSign,
  UserPlus,
  Star,
  GraduationCap,
  FileText,
  Gift,
  Timer,
  Bell,
  BarChart3,
  Settings,
  Shield,
  LogOut,
  Building,
  X,
} from 'lucide-react'

const NAV_ITEMS = [
  { label: 'Dashboard', icon: LayoutDashboard, to: '/dashboard' },
  { label: 'Employees', icon: Users, to: '/employees' },
  { label: 'Departments', icon: Building2, to: '/departments' },
  { label: 'Designations', icon: Briefcase, to: '/designations' },
  { label: 'Attendance', icon: Clock, to: '/attendance' },
  { label: 'Leaves', icon: CalendarDays, to: '/leaves' },
  { label: 'Payroll', icon: DollarSign, to: '/payroll' },
  { label: 'Recruitment', icon: UserPlus, to: '/recruitment' },
  { label: 'Performance', icon: Star, to: '/performance' },
  { label: 'Training', icon: GraduationCap, to: '/training' },
  { label: 'Documents', icon: FileText, to: '/documents' },
  { label: 'Holidays', icon: Gift, to: '/holidays' },
  { label: 'Shifts', icon: Timer, to: '/shifts' },
  { label: 'Reports', icon: BarChart3, to: '/reports' },
  { label: 'Users', icon: Users, to: '/users' },
  { label: 'Notifications', icon: Bell, to: '/notifications' },
  { label: 'Settings', icon: Settings, to: '/settings' },
  { label: 'Audit Logs', icon: Shield, to: '/audit' },
]

interface SidebarProps {
  collapsed: boolean
  onClose?: () => void
}

export function Sidebar({ collapsed, onClose }: SidebarProps) {
  const { logout } = useAuthStore()

  return (
    <div className="flex h-full flex-col bg-slate-900 text-slate-200">
      <div className="flex h-16 items-center justify-between border-b border-slate-800 px-4">
        {!collapsed ? (
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 shadow-sm">
              <Building className="h-5 w-5 text-white" />
            </div>
            <span className="text-sm font-semibold tracking-wide text-white">HRMS Enterprise</span>
          </div>
        ) : (
          <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 shadow-sm">
            <Building className="h-5 w-5 text-white" />
          </div>
        )}

        {onClose && (
          <button
            onClick={onClose}
            className="rounded-md p-1 text-slate-400 transition-colors hover:text-white"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-3">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            title={collapsed ? item.label : undefined}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors ${
                collapsed ? 'justify-center rounded-lg' : 'rounded-full'
              } ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            <item.icon className="h-5 w-5 flex-shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-slate-800 p-3">
        {collapsed ? (
          <button
            onClick={logout}
            className="mx-auto flex rounded-md p-2 text-slate-400 transition-colors hover:text-red-400"
            title="Logout"
            aria-label="Logout"
          >
            <LogOut className="h-4 w-4" />
          </button>
        ) : (
          <div className="flex items-center gap-2.5 rounded-xl bg-slate-800 px-2.5 py-2">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
              SA
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-white">Super Admin</p>
              <p className="text-xs text-slate-400">Admin</p>
            </div>
            <button
              onClick={logout}
              className="flex-shrink-0 rounded-md p-1 text-slate-400 transition-colors hover:text-red-400"
              title="Logout"
              aria-label="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
