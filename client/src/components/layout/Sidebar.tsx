import { NavLink } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import {
  LayoutDashboard,
  Users,
  UserCircle,
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
  X
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
  { label: 'Users', icon: UserCircle, to: '/users' },
  { label: 'Notifications', icon: Bell, to: '/notifications' },
  { label: 'Settings', icon: Settings, to: '/settings' },
  { label: 'Audit Logs', icon: Shield, to: '/audit' },
]

interface SidebarProps { collapsed: boolean; onClose?: () => void }

export function Sidebar({ collapsed, onClose }: SidebarProps) {
  const { logout } = useAuthStore()

  return (
    <div className="flex h-full flex-col bg-slate-900 text-slate-200">
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-700 flex-shrink-0">
        {!collapsed ? (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <Building className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-white text-sm font-semibold leading-none">HRMS Enterprise</p>
            </div>
          </div>
        ) : (
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center mx-auto">
            <Building className="w-5 h-5 text-white" />
          </div>
        )}

        {onClose && (
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
        {NAV_ITEMS.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            title={collapsed ? item.label : undefined}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-full text-sm font-medium transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-900/40'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-slate-700 p-3 flex-shrink-0">
        {collapsed ? (
          <button
            onClick={logout}
            className="text-slate-400 hover:text-red-400 transition-colors p-2 mx-auto flex"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        ) : (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              SA
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-semibold truncate">Super Admin</p>
              <p className="text-slate-400 text-xs">Admin</p>
            </div>
            <button onClick={logout} className="text-slate-400 hover:text-red-400 transition-colors p-1 flex-shrink-0">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
