import { NavLink } from 'react-router-dom'
import { usePermissions } from '../../hooks/usePermissions'
import { useAuthStore } from '../../store/authStore'
import { useState } from 'react'
import {
  LayoutDashboard, Users, UserCircle, Building2, Briefcase, Clock,
  CalendarDays, DollarSign, UserPlus, Star, GraduationCap, FileText,
  Gift, Timer, Bell, BarChart3, Settings, Shield, LogOut, Building, X,
  ChevronDown, ChevronRight
} from 'lucide-react'

const NAV_GROUPS = [
  {
    label: 'Overview',
    items: [
      { label: 'Dashboard', icon: LayoutDashboard, to: '/dashboard' },
    ]
  },
  {
    label: 'Core HR',
    items: [
      { label: 'Employees', icon: Users, to: '/employees' },
      { label: 'Departments', icon: Building2, to: '/departments', roles: ['admin', 'hr'] },
      { label: 'Designations', icon: Briefcase, to: '/designations', roles: ['admin', 'hr'] },
      { label: 'Attendance', icon: Clock, to: '/attendance' },
      { label: 'Leaves', icon: CalendarDays, to: '/leaves' },
      { label: 'Shifts', icon: Timer, to: '/shifts', roles: ['admin', 'hr'] },
      { label: 'Holidays', icon: Gift, to: '/holidays' },
    ]
  },
  {
    label: 'Payroll & Finance',
    items: [
      { label: 'Payroll', icon: DollarSign, to: '/payroll' },
      { label: 'Reports', icon: BarChart3, to: '/reports', roles: ['admin', 'hr'] },
    ]
  },
  {
    label: 'Talent',
    items: [
      { label: 'Recruitment', icon: UserPlus, to: '/recruitment', roles: ['admin', 'hr'] },
      { label: 'Performance', icon: Star, to: '/performance' },
      { label: 'Training', icon: GraduationCap, to: '/training' },
    ]
  },
  {
    label: 'Workspace',
    items: [
      { label: 'Documents', icon: FileText, to: '/documents' },
      { label: 'Notifications', icon: Bell, to: '/notifications' },
    ]
  },
  {
    label: 'System Admin',
    roles: ['admin', 'hr'],
    items: [
      { label: 'Users', icon: UserCircle, to: '/users', roles: ['admin', 'hr'] },
      { label: 'Settings', icon: Settings, to: '/settings', roles: ['admin'] },
      { label: 'Audit Logs', icon: Shield, to: '/audit', roles: ['admin'] },
    ]
  },
]

interface SidebarProps { collapsed: boolean; onClose?: () => void }

export function Sidebar({ collapsed, onClose }: SidebarProps) {
  const { user, logout } = useAuthStore()
  const { role } = usePermissions()
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(NAV_GROUPS.map(g => [g.label, true]))
  )

  const toggleGroup = (label: string) =>
    setOpenGroups(prev => ({ ...prev, [label]: !prev[label] }))

  return (
    <div className="flex flex-col h-full bg-slate-900">
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-700/60 flex-shrink-0">
        {!collapsed && (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-lg flex items-center justify-center shadow-lg">
              <Building className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="text-white font-bold text-sm leading-none tracking-wide">HRMS</span>
              <p className="text-slate-400 text-[10px] mt-0.5 tracking-widest uppercase">Enterprise</p>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-lg flex items-center justify-center mx-auto shadow-lg">
            <Building className="w-4 h-4 text-white" />
          </div>
        )}
        {onClose && (
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 transition-colors rounded-lg hover:bg-slate-800">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1 scrollbar-thin scrollbar-thumb-slate-700">
        {NAV_GROUPS.map(group => {
          const visibleItems = group.items.filter(item => !item.roles || item.roles.includes(role))
          if (visibleItems.length === 0) return null
          if (group.roles && !group.roles.some(r => r === role)) return null

          const isOpen = openGroups[group.label] ?? true

          return (
            <div key={group.label}>
              {!collapsed && (
                <button
                  onClick={() => toggleGroup(group.label)}
                  className="w-full flex items-center justify-between px-3 py-1.5 text-slate-500 hover:text-slate-300 transition-colors group"
                >
                  <span className="text-[10px] font-semibold tracking-widest uppercase">{group.label}</span>
                  {isOpen
                    ? <ChevronDown className="w-3 h-3 opacity-60 group-hover:opacity-100" />
                    : <ChevronRight className="w-3 h-3 opacity-60 group-hover:opacity-100" />}
                </button>
              )}
              {(isOpen || collapsed) && (
                <div className="space-y-0.5">
                  {visibleItems.map(item => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      title={collapsed ? item.label : undefined}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                          isActive
                            ? 'bg-gradient-to-r from-indigo-600/90 to-violet-600/80 text-white shadow-md shadow-indigo-900/30'
                            : 'text-slate-400 hover:bg-slate-800/70 hover:text-white'
                        }`
                      }
                    >
                      <item.icon className="w-4 h-4 flex-shrink-0" />
                      {!collapsed && <span>{item.label}</span>}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      {/* User footer */}
      <div className="border-t border-slate-700/60 p-3 flex-shrink-0">
        {collapsed ? (
          <button
            onClick={logout}
            className="text-slate-400 hover:text-red-400 transition-colors p-2 mx-auto flex rounded-lg hover:bg-slate-800"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        ) : (
          <div className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-semibold truncate">{user?.firstName} {user?.lastName}</p>
              <p className="text-slate-400 text-[10px] capitalize tracking-wide">{user?.role}</p>
            </div>
            <button
              onClick={logout}
              className="text-slate-400 hover:text-red-400 transition-colors p-1.5 flex-shrink-0 rounded-lg hover:bg-slate-800 opacity-0 group-hover:opacity-100"
              title="Sign out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
