import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { usePermissions } from '../../hooks/usePermissions'
import { useAuthStore } from '../../store/authStore'
import {
  LayoutDashboard, Users, UserCircle, Building2, Briefcase, Clock,
  CalendarDays, DollarSign, UserPlus, Star, GraduationCap, FileText,
  Gift, Timer, Bell, BarChart3, Settings, Shield, LogOut, Building, X,
  ChevronDown, ChevronRight
} from 'lucide-react'

interface NavItem {
  label: string
  icon: React.ElementType
  to: string
  roles?: string[]
}

interface NavGroup {
  label: string
  items: NavItem[]
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Core HR',
    items: [
      { label: 'Dashboard', icon: LayoutDashboard, to: '/dashboard' },
      { label: 'Employees', icon: Users, to: '/employees' },
      { label: 'Departments', icon: Building2, to: '/departments', roles: ['admin', 'hr'] },
      { label: 'Designations', icon: Briefcase, to: '/designations', roles: ['admin', 'hr'] },
      { label: 'Attendance', icon: Clock, to: '/attendance' },
      { label: 'Leaves', icon: CalendarDays, to: '/leaves' },
    ],
  },
  {
    label: 'Payroll & Finance',
    items: [
      { label: 'Payroll', icon: DollarSign, to: '/payroll' },
      { label: 'Reports', icon: BarChart3, to: '/reports', roles: ['admin', 'hr'] },
    ],
  },
  {
    label: 'Talent',
    items: [
      { label: 'Recruitment', icon: UserPlus, to: '/recruitment', roles: ['admin', 'hr'] },
      { label: 'Performance', icon: Star, to: '/performance' },
      { label: 'Training', icon: GraduationCap, to: '/training' },
    ],
  },
  {
    label: 'Workspace',
    items: [
      { label: 'Documents', icon: FileText, to: '/documents' },
      { label: 'Holidays', icon: Gift, to: '/holidays' },
      { label: 'Shifts', icon: Timer, to: '/shifts', roles: ['admin', 'hr'] },
      { label: 'Notifications', icon: Bell, to: '/notifications' },
    ],
  },
  {
    label: 'System Admin',
    items: [
      { label: 'Users', icon: UserCircle, to: '/users', roles: ['admin', 'hr'] },
      { label: 'Settings', icon: Settings, to: '/settings', roles: ['admin'] },
      { label: 'Audit Logs', icon: Shield, to: '/audit', roles: ['admin'] },
    ],
  },
]

interface SidebarProps { collapsed: boolean; onClose?: () => void }

export function Sidebar({ collapsed, onClose }: SidebarProps) {
  const { user, logout } = useAuthStore()
  const { role } = usePermissions()
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(
    NAV_GROUPS.reduce((acc, g) => ({ ...acc, [g.label]: true }), {})
  )

  const toggleGroup = (label: string) =>
    setOpenGroups(prev => ({ ...prev, [label]: !prev[label] }))

  return (
    <div className="flex flex-col h-full bg-slate-900">
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-700/60 flex-shrink-0">
        {!collapsed && (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg">
              <Building className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="text-white font-bold text-sm leading-none">HRMS</span>
              <p className="text-slate-400 text-xs">Enterprise</p>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center mx-auto shadow-lg">
            <Building className="w-4 h-4 text-white" />
          </div>
        )}
        {onClose && (
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 transition-colors rounded-lg hover:bg-slate-700">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
        {NAV_GROUPS.map(group => {
          const visibleItems = group.items.filter(item => !item.roles || item.roles.includes(role))
          if (visibleItems.length === 0) return null
          const isOpen = openGroups[group.label] ?? true

          return (
            <div key={group.label}>
              {!collapsed && (
                <button
                  onClick={() => toggleGroup(group.label)}
                  className="w-full flex items-center justify-between px-3 py-1.5 text-xs font-semibold text-slate-500 uppercase tracking-widest hover:text-slate-300 transition-colors rounded-lg group"
                >
                  <span>{group.label}</span>
                  <span className="transition-transform duration-200" style={{ transform: isOpen ? 'rotate(0deg)' : 'rotate(-90deg)' }}>
                    {isOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                  </span>
                </button>
              )}
              <div
                className="space-y-0.5 overflow-hidden transition-all duration-200"
                style={{ maxHeight: (!collapsed && !isOpen) ? '0px' : '1000px', opacity: (!collapsed && !isOpen) ? 0 : 1 }}
              >
                {visibleItems.map(item => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    title={collapsed ? item.label : undefined}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                        isActive
                          ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-900/30'
                          : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                      }`
                    }
                  >
                    <item.icon className="w-4 h-4 flex-shrink-0" />
                    {!collapsed && <span>{item.label}</span>}
                  </NavLink>
                ))}
              </div>
            </div>
          )
        })}
      </nav>

      <div className="border-t border-slate-700/60 p-3 flex-shrink-0">
        {collapsed ? (
          <button onClick={logout} className="text-slate-400 hover:text-red-400 transition-colors p-2 mx-auto flex rounded-xl hover:bg-slate-800" title="Logout">
            <LogOut className="w-4 h-4" />
          </button>
        ) : (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-semibold truncate">{user?.firstName} {user?.lastName}</p>
              <p className="text-slate-400 text-xs capitalize">{user?.role}</p>
            </div>
            <button onClick={logout} className="text-slate-400 hover:text-red-400 transition-colors p-1.5 flex-shrink-0 rounded-lg hover:bg-slate-800">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
