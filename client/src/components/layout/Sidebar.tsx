import { NavLink } from 'react-router-dom'
import { useMemo } from 'react'
import { usePermissions } from '../../hooks/usePermissions'
import { useAuthStore } from '../../store/authStore'
import {
  LayoutDashboard, Users, UserCircle, Building2, Briefcase, Clock,
  CalendarDays, DollarSign, UserPlus, Star, GraduationCap, FileText,
  Gift, Timer, Bell, BarChart3, Settings, Shield, LogOut, Building, X, ChevronDown, ChevronRight
} from 'lucide-react'

const NAV_GROUPS = [
  {
    label: 'Core HR',
    items: [
      { label: 'Dashboard', icon: LayoutDashboard, to: '/dashboard' },
      { label: 'Employees', icon: Users, to: '/employees' },
      { label: 'Departments', icon: Building2, to: '/departments', roles: ['admin', 'hr'] },
      { label: 'Designations', icon: Briefcase, to: '/designations', roles: ['admin', 'hr'] },
      { label: 'Attendance', icon: Clock, to: '/attendance' },
      { label: 'Leaves', icon: CalendarDays, to: '/leaves' },
      { label: 'Recruitment', icon: UserPlus, to: '/recruitment', roles: ['admin', 'hr'] },
      { label: 'Performance', icon: Star, to: '/performance' },
      { label: 'Training', icon: GraduationCap, to: '/training' },
      { label: 'Documents', icon: FileText, to: '/documents' },
    ],
  },
  {
    label: 'Payroll & Finance',
    items: [
      { label: 'Payroll', icon: DollarSign, to: '/payroll' },
      { label: 'Holidays', icon: Gift, to: '/holidays' },
      { label: 'Shifts', icon: Timer, to: '/shifts', roles: ['admin', 'hr'] },
      { label: 'Reports', icon: BarChart3, to: '/reports', roles: ['admin', 'hr'] },
    ],
  },
  {
    label: 'System Admin',
    items: [
      { label: 'Users', icon: UserCircle, to: '/users', roles: ['admin', 'hr'] },
      { label: 'Notifications', icon: Bell, to: '/notifications' },
      { label: 'Settings', icon: Settings, to: '/settings', roles: ['admin'] },
      { label: 'Audit Logs', icon: Shield, to: '/audit', roles: ['admin'] },
    ],
  },
]

interface SidebarProps { collapsed: boolean; onClose?: () => void }

export function Sidebar({ collapsed, onClose }: SidebarProps) {
  const { user, logout } = useAuthStore()
  const { role } = usePermissions()

  const groups = useMemo(
    () => NAV_GROUPS.map((group) => ({
      ...group,
      items: group.items.filter((item) => !item.roles || item.roles.includes(role)),
    })).filter((group) => group.items.length > 0),
    [role]
  )

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-18 items-center justify-between border-b border-slate-200/80 px-4 py-4">
        {!collapsed ? (
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 text-white shadow-lg shadow-indigo-500/30">
              <Building className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold tracking-wide text-slate-900">HRMS</p>
              <p className="text-xs text-slate-500">Operations Suite</p>
            </div>
          </div>
        ) : (
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 text-white shadow-lg shadow-indigo-500/30">
            <Building className="h-5 w-5" />
          </div>
        )}
        {onClose && (
          <button type="button" onClick={onClose} className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900">
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <div className="space-y-5">
          {groups.map((group) => (
            <details key={group.label} open={!collapsed} className="group rounded-2xl border border-transparent bg-white/70 p-2 shadow-sm shadow-indigo-950/5">
              <summary className="flex cursor-pointer list-none items-center justify-between rounded-xl px-2 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 transition hover:bg-slate-50">
                <span className={collapsed ? 'sr-only' : ''}>{group.label}</span>
                {!collapsed && <ChevronDown className="h-4 w-4 text-slate-400 transition group-open:rotate-180" />}
              </summary>
              <div className="mt-2 space-y-1">
                {group.items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    title={collapsed ? item.label : undefined}
                    className={({ isActive }) =>
                      `group/item flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/20'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
                      }`
                    }
                  >
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                    {!collapsed && <span className="flex-1">{item.label}</span>}
                    {!collapsed && <ChevronRight className="h-4 w-4 opacity-0 transition group-hover/item:opacity-100" />}
                  </NavLink>
                ))}
              </div>
            </details>
          ))}
        </div>
      </nav>
      <div className="border-t border-slate-200/80 p-4">
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white/80 p-3 shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-900 to-slate-700 text-sm font-semibold text-white">
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-900">{user?.firstName} {user?.lastName}</p>
              <p className="truncate text-xs capitalize text-slate-500">{user?.role}</p>
            </div>
          )}
          <button type="button" onClick={logout} className="rounded-xl p-2 text-slate-500 transition hover:bg-rose-50 hover:text-rose-600" title="Logout">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
