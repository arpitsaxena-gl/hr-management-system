import { Bell, Menu, Search, Command, X, Calendar, Zap } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useState, useRef, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import api from '../../lib/axios'
import { Avatar } from '../ui/Avatar'
import { format } from 'date-fns'

const CMD_ITEMS = [
  { label: 'Dashboard', to: '/dashboard', category: 'Core HR' },
  { label: 'Employees', to: '/employees', category: 'Core HR' },
  { label: 'Attendance', to: '/attendance', category: 'Core HR' },
  { label: 'Leaves', to: '/leaves', category: 'Core HR' },
  { label: 'Departments', to: '/departments', category: 'Core HR' },
  { label: 'Designations', to: '/designations', category: 'Core HR' },
  { label: 'Payroll', to: '/payroll', category: 'Payroll & Finance' },
  { label: 'Reports', to: '/reports', category: 'Payroll & Finance' },
  { label: 'Recruitment', to: '/recruitment', category: 'Talent' },
  { label: 'Performance', to: '/performance', category: 'Talent' },
  { label: 'Training', to: '/training', category: 'Talent' },
  { label: 'Documents', to: '/documents', category: 'Workspace' },
  { label: 'Holidays', to: '/holidays', category: 'Workspace' },
  { label: 'Notifications', to: '/notifications', category: 'Workspace' },
  { label: 'Settings', to: '/settings', category: 'System Admin' },
  { label: 'Users', to: '/users', category: 'System Admin' },
  { label: 'Audit Logs', to: '/audit', category: 'System Admin' },
]

interface NavbarProps { onMenuToggle: () => void }

export function Navbar({ onMenuToggle }: NavbarProps) {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [cmdOpen, setCmdOpen] = useState(false)
  const [cmdQuery, setCmdQuery] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)
  const cmdInputRef = useRef<HTMLInputElement>(null)

  const { data: notifRes } = useQuery({
    queryKey: ['notifications-count'],
    queryFn: () => api.get('/notifications?isRead=false&limit=1').then(r => r.data),
    refetchInterval: 30000,
  })
  const unreadCount = notifRes?.data?.unreadCount ?? 0

  const openCmd = useCallback(() => { setCmdOpen(true); setCmdQuery('') }, [])
  const closeCmd = useCallback(() => { setCmdOpen(false); setCmdQuery('') }, [])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); openCmd() }
      if (e.key === 'Escape') closeCmd()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [openCmd, closeCmd])

  useEffect(() => {
    if (cmdOpen) setTimeout(() => cmdInputRef.current?.focus(), 50)
  }, [cmdOpen])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setDropdownOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const filteredItems = CMD_ITEMS.filter(item =>
    cmdQuery === '' || item.label.toLowerCase().includes(cmdQuery.toLowerCase()) || item.category.toLowerCase().includes(cmdQuery.toLowerCase())
  )

  const now = new Date()
  const hour = now.getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <>
      <header className="h-16 bg-white/90 backdrop-blur-sm border-b border-gray-100 flex items-center justify-between px-4 lg:px-6 flex-shrink-0 z-20">
        <div className="flex items-center gap-3">
          <button onClick={onMenuToggle} className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors">
            <Menu className="w-5 h-5" />
          </button>
          <button
            onClick={openCmd}
            className="hidden md:flex items-center gap-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl px-3 py-2 w-60 text-left transition-colors group"
          >
            <Search className="w-4 h-4 text-gray-400 group-hover:text-indigo-500 transition-colors" />
            <span className="text-sm text-gray-400 flex-1">Quick search...</span>
            <span className="hidden lg:flex items-center gap-0.5 text-xs text-gray-300 font-mono">
              <Command className="w-3 h-3" />K
            </span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 bg-indigo-50 text-indigo-700 text-xs font-semibold px-3 py-1.5 rounded-full border border-indigo-100">
            <Calendar className="w-3.5 h-3.5" />
            {format(now, 'EEE dd MMM')}
          </div>

          <button
            onClick={() => navigate('/dashboard')}
            className="hidden sm:flex items-center gap-1.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-xs font-semibold px-3 py-1.5 rounded-full hover:opacity-90 transition-opacity shadow-sm"
          >
            <Zap className="w-3.5 h-3.5" />
            Quick Action
          </button>

          <Link to="/notifications" className="relative p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors">
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            )}
          </Link>

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 p-1.5 pr-3 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <Avatar src={user?.avatar} name={`${user?.firstName} ${user?.lastName}`} size="sm" />
              <div className="hidden md:block text-left">
                <p className="text-sm font-semibold text-gray-800 leading-none">{user?.firstName} {user?.lastName}</p>
                <p className="text-xs text-gray-400 capitalize mt-0.5">{user?.role}</p>
              </div>
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-fade-in">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-xs text-gray-400">{greeting},</p>
                  <p className="text-sm font-bold text-gray-900">{user?.firstName} {user?.lastName}</p>
                  <p className="text-xs text-gray-400 truncate mt-0.5">{user?.email}</p>
                </div>
                <div className="py-1">
                  <Link to="/profile" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors">
                    My Profile
                  </Link>
                  <Link to="/settings" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors">
                    Settings
                  </Link>
                </div>
                <div className="border-t border-gray-100 pt-1">
                  <button
                    onClick={() => { logout(); navigate('/login'); setDropdownOpen(false) }}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {cmdOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4" onClick={closeCmd}>
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" />
          <div
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-200"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
              <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <input
                ref={cmdInputRef}
                type="text"
                value={cmdQuery}
                onChange={e => setCmdQuery(e.target.value)}
                placeholder="Search pages, actions..."
                className="flex-1 text-sm text-gray-800 outline-none placeholder-gray-400 bg-transparent"
              />
              <button onClick={closeCmd} className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="max-h-72 overflow-y-auto py-2">
              {filteredItems.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">No results found</p>
              ) : (
                filteredItems.map(item => (
                  <button
                    key={item.to}
                    onClick={() => { navigate(item.to); closeCmd() }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-indigo-50 hover:text-indigo-700 text-left transition-colors group"
                  >
                    <span className="text-sm font-medium text-gray-800 group-hover:text-indigo-700 flex-1">{item.label}</span>
                    <span className="text-xs text-gray-400 bg-gray-100 group-hover:bg-indigo-100 group-hover:text-indigo-500 px-2 py-0.5 rounded-full">{item.category}</span>
                  </button>
                ))
              )}
            </div>
            <div className="border-t border-gray-100 px-4 py-2 flex items-center gap-4 text-xs text-gray-400">
              <span><kbd className="font-mono">\u21b5</kbd> to select</span>
              <span><kbd className="font-mono">Esc</kbd> to close</span>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
