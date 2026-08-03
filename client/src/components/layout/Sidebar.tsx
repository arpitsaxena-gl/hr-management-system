import { NavLink } from 'react-router-dom'
import { useState } from 'react'
import { usePermissions } from '../../hooks/usePermissions'
import { useAuthStore } from '../../store/authStore'
import {
  LayoutDashboard, Users, Building2, Briefcase, Clock,
  CalendarDays, IndianRupee, UserPlus, Star, GraduationCap, FileText,
  Gift, Timer, Bell, BarChart3, Settings, Shield, LogOut, Building, X,
  ChevronDown, UserCircle
} from 'lucide-react'

interface NavItem {
  label: string
  icon: any
  to: string
  roles?: string[]
}

interface NavGroup {
  label: string
  icon: any
  items: NavItem[]
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Overview',
    icon: LayoutDashboard,
    items: [
      { label: 'Dashboard', icon: LayoutDashboard, to: '/dashboard' },
    ],
  },
  {
    label: 'Core HR',
    icon: Users,
    items: [
      { label: 'Employees', icon: Users, to: '/employees' },
      { label: 'Departments', icon: Building2, to: '/departments', roles: ['admin', 'hr'] },
      { label: 'Designations', icon: Briefcase, to: '/designations', roles: ['admin', 'hr'] },
      { label: 'Documents', icon: FileText, to: '/documents' },
      { label: 'Performance', icon: Star, to: '/performance' },
      { label: 'Training', icon: GraduationCap, to: '/training' },
    ],
  },
  {
    label: 'Time & Attendance',
    icon: Clock,
    items: [
      { label: 'Attendance', icon: Clock, to: '/attendance' },
      { label: 'Leaves', icon: CalendarDays, to: '/leaves' },
      { label: 'Holidays', icon: Gift, to: '/holidays' },
      { label: 'Shifts', icon: Timer, to: '/shifts', roles: ['admin', 'hr'] },
    ],
  },
  {
    label: 'Payroll & Finance',
    icon: IndianRupee,
    items: [
      { label: 'Payroll', icon: IndianRupee, to: '/payroll' },
      { label: 'Recruitment', icon: UserPlus, to: '/recruitment', roles: ['admin', 'hr'] },
      { label: 'Reports', icon: BarChart3, to: '/reports', roles: ['admin', 'hr'] },
    ],
  },
  {
    label: 'System Admin',
    icon: Shield,
    items: [
      { label: 'Notifications', icon: Bell, to: '/notifications' },
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
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    Overview: true,
    'Core HR': true,
    'Time & Attendance': true,
    'Payroll & Finance': true,
    'System Admin': false,
  })

  const toggleGroup = (label: string) => {
    setOpenGroups(prev => ({ ...prev, [label]: !prev[label] }))
  }

  const filterItems = (items: NavItem[]) =>
    items.filter(item => !item.roles || item.roles.includes(role))

  return (
    <div className="flex flex-col h-full">
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-700 flex-shrink-0">
        {!collapsed && (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
              <Building className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-white font-bold text-sm leading-none">HRMS</span>
              <p className="text-slate-400 text-xs">Enterprise</p>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center mx-auto">
            <Building className="w-5 h-5 text-white" />
          </div>
        )}
        {onClose && (
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 transition-colors">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto py-3 px-2">
        {NAV_GROUPS.map(group => {
          const visibleItems = filterItems(group.items)
          if (visibleItems.length === 0) return null
          const isOpen = openGroups[group.label] !== false

          return (
            <div key={group.label} className="mb-1">
              {!collapsed && (
                <button
                  onClick={() => toggleGroup(group.label)}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider hover:text-slate-300 transition-colors"
                >
                  <span>{group.label}</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-0' : '-rotate-90'}`} />
                </button>
              )}
              {(collapsed || isOpen) && (
                <div className="space-y-0.5">
                  {visibleItems.map(item => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      title={collapsed ? item.label : undefined}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-all text-sm font-medium ${
                          isActive ? 'bg-primary-600 !text-white hover:bg-primary-700' : ''
                        }`
                      }
                    >
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                      {!collapsed && <span>{item.label}</span>}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      <div className="border-t border-slate-700 p-3 flex-shrink-0">
        {collapsed ? (
          <button onClick={logout} className="text-slate-400 hover:text-red-400 transition-colors p-2 mx-auto flex" title="Logout">
            <LogOut className="w-4 h-4" />
          </button>
        ) : (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-medium truncate">{user?.firstName} {user?.lastName}</p>
              <p className="text-slate-400 text-xs capitalize">{user?.role}</p>
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
