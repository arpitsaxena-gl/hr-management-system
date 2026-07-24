import { Bell, Search, Menu, Command, Zap, ChevronDown, User, Settings, LogOut } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useState, useRef, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import api from '../../lib/axios'
import { Avatar } from '../ui/Avatar'
import { format } from 'date-fns'

interface NavbarProps { onMenuToggle: () => void }

export function Navbar({ onMenuToggle }: NavbarProps) {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  const { data: notifRes } = useQuery({
    queryKey: ['notifications-count'],
    queryFn: () => api.get('/notifications?isRead=false&limit=1').then(r => r.data),
    refetchInterval: 30000,
    staleTime: 15000,
  })
  const unreadCount = notifRes?.data?.unreadCount ?? 0

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault()
      setSearchOpen(true)
      setTimeout(() => searchRef.current?.focus(), 50)
    }
    if (e.key === 'Escape') setSearchOpen(false)
  }, [])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 lg:px-6 flex-shrink-0 z-10 shadow-sm">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors"
          title="Toggle sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Search bar */}
        <button
          onClick={() => { setSearchOpen(true); setTimeout(() => searchRef.current?.focus(), 50) }}
          className="hidden md:flex items-center gap-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl px-3 py-2 w-64 text-left transition-colors group"
        >
          <Search className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-400 flex-1">Search anything...</span>
          <span className="flex items-center gap-0.5 bg-white border border-gray-200 rounded-md px-1.5 py-0.5 text-[10px] text-gray-400 font-medium shadow-sm">
            <Command className="w-2.5 h-2.5" />K
          </span>
        </button>
      </div>

      <div className="flex items-center gap-2">
        {/* Date pill */}
        <div className="hidden lg:flex items-center gap-1.5 bg-indigo-50 border border-indigo-100 rounded-full px-3 py-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
          <span className="text-xs font-medium text-indigo-700">{format(new Date(), 'EEE, MMM d')}</span>
        </div>

        {/* Notifications */}
        <Link
          to="/notifications"
          className="relative p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors"
          title="Notifications"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold leading-none">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Link>

        {/* Quick action */}
        <button className="hidden md:flex items-center gap-1.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white text-xs font-semibold px-3 py-2 rounded-xl transition-all shadow-md shadow-indigo-200 hover:shadow-indigo-300">
          <Zap className="w-3.5 h-3.5" />
          Quick Action
        </button>

        {/* Profile dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 p-1.5 pr-2.5 rounded-xl hover:bg-gray-100 transition-colors border border-transparent hover:border-gray-200"
          >
            <Avatar src={user?.avatar} name={`${user?.firstName} ${user?.lastName}`} size="sm" />
            <div className="hidden md:block text-left">
              <p className="text-sm font-semibold text-gray-800 leading-none">{user?.firstName} {user?.lastName}</p>
              <p className="text-[10px] text-gray-500 capitalize mt-0.5 font-medium">{user?.role}</p>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-fade-in">
              {/* Greeting header */}
              <div className="px-4 py-3 border-b border-gray-50">
                <p className="text-xs text-gray-400 font-medium">{greeting()}, 👋</p>
                <p className="text-sm font-bold text-gray-800 mt-0.5">{user?.firstName} {user?.lastName}</p>
                <p className="text-xs text-gray-400 truncate mt-0.5">{user?.email}</p>
              </div>

              <div className="py-1">
                <Link
                  to="/profile"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center">
                    <User className="w-3.5 h-3.5 text-indigo-600" />
                  </div>
                  My Profile
                </Link>
                <Link
                  to="/settings"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <div className="w-7 h-7 rounded-lg bg-gray-50 flex items-center justify-center">
                    <Settings className="w-3.5 h-3.5 text-gray-500" />
                  </div>
                  Settings
                </Link>
              </div>

              <div className="border-t border-gray-100 pt-1">
                <button
                  onClick={() => { logout(); navigate('/login'); setDropdownOpen(false) }}
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <div className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center">
                    <LogOut className="w-3.5 h-3.5 text-red-500" />
                  </div>
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Cmd+K Search modal */}
      {searchOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-start justify-center pt-24 px-4"
          onClick={() => setSearchOpen(false)}
        >
          <div
            className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-100">
              <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <input
                ref={searchRef}
                type="text"
                placeholder="Search employees, payroll, leaves..."
                className="flex-1 text-sm text-gray-800 outline-none placeholder-gray-400 bg-transparent"
              />
              <kbd className="bg-gray-100 text-gray-500 text-xs rounded px-1.5 py-0.5 font-mono">ESC</kbd>
            </div>
            <div className="p-4 text-center text-sm text-gray-400 py-8">
              Start typing to search across employees, payroll records, leaves, and more.
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
