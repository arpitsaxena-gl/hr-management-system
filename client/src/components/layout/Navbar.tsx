import { Bell, Search, Menu, Command } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useState, useRef, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import api from '../../lib/axios'
import { Avatar } from '../ui/Avatar'
import { GlobalSearchModal } from '../ui/GlobalSearchModal'

interface NavbarProps { onMenuToggle: () => void }

export function Navbar({ onMenuToggle }: NavbarProps) {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const { data: notifRes } = useQuery({
    queryKey: ['notifications-count'],
    queryFn: () => api.get('/notifications?isRead=false&limit=1').then(r => r.data),
    refetchInterval: 30000,
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
    }
  }, [])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  return (
    <>
      <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 lg:px-6 flex-shrink-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={onMenuToggle} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
            <Menu className="w-5 h-5" />
          </button>
          <button
            onClick={() => setSearchOpen(true)}
            className="hidden md:flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 w-64 text-left hover:border-primary-300 hover:bg-primary-50/30 transition-colors group"
          >
            <Search className="w-4 h-4 text-gray-400 group-hover:text-primary-500 transition-colors" />
            <span className="text-sm text-gray-400 flex-1">Search employees, payroll...</span>
            <kbd className="hidden lg:flex items-center gap-0.5 text-xs text-gray-400 bg-gray-100 rounded px-1.5 py-0.5 font-mono">
              <Command className="w-3 h-3" />K
            </kbd>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => setSearchOpen(true)} className="md:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
            <Search className="w-5 h-5" />
          </button>
          <Link to="/notifications" className="relative p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Link>
          <div className="relative" ref={dropdownRef}>
            <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center gap-2 p-1.5 pr-3 rounded-xl hover:bg-gray-100 transition-colors">
              <Avatar src={user?.avatar} name={`${user?.firstName} ${user?.lastName}`} size="sm" />
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-gray-800 leading-none">{user?.firstName} {user?.lastName}</p>
                <p className="text-xs text-gray-500 capitalize mt-0.5">{user?.role}</p>
              </div>
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50 animate-fade-in">
                <div className="px-4 py-2.5 border-b border-gray-100">
                  <p className="text-sm font-semibold text-gray-800">{user?.firstName} {user?.lastName}</p>
                  <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                </div>
                <Link to="/profile" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">My Profile</Link>
                <Link to="/settings" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">Settings</Link>
                <div className="border-t border-gray-100 pt-1">
                  <button onClick={() => { logout(); navigate('/login'); setDropdownOpen(false) }} className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">Sign Out</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>
      <GlobalSearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  )
}
