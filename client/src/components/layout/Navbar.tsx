import { Bell, Search, Menu, CircleDot, Settings2, Command, ChevronDown } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import api from '../../lib/axios'
import { Avatar } from '../ui/Avatar'

interface NavbarProps { onMenuToggle: () => void; onSidebarToggle: () => void }

export function Navbar({ onMenuToggle, onSidebarToggle }: NavbarProps) {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const { data: notifRes } = useQuery({
    queryKey: ['notifications-count'],
    queryFn: () => api.get('/notifications?isRead=false&limit=1').then(r => r.data),
    refetchInterval: 30000,
  })

  const unreadCount = notifRes?.data?.unreadCount ?? 0
  const statusPill = useMemo(() => ({ label: unreadCount > 0 ? `${unreadCount} alerts` : 'All clear', tone: unreadCount > 0 ? 'text-amber-700 bg-amber-50 border-amber-200' : 'text-emerald-700 bg-emerald-50 border-emerald-200' }), [unreadCount])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setDropdownOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    const onShortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        navigate('/search')
      }
    }
    window.addEventListener('keydown', onShortcut)
    return () => window.removeEventListener('keydown', onShortcut)
  }, [navigate])

  return (
    <header className="sticky top-0 z-10 border-b border-white/60 bg-white/80 backdrop-blur-xl">
      <div className="flex h-20 items-center justify-between gap-4 px-4 lg:px-6">
        <div className="flex items-center gap-3">
          <button type="button" onClick={onMenuToggle} className="rounded-2xl border border-slate-200 bg-white p-2.5 text-slate-600 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:text-indigo-600 lg:hidden">
            <Menu className="h-5 w-5" />
          </button>
          <button type="button" onClick={onSidebarToggle} className="hidden rounded-2xl border border-slate-200 bg-white p-2.5 text-slate-600 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:text-indigo-600 lg:inline-flex" aria-label="Toggle sidebar density">
            <ChevronDown className="h-5 w-5 -rotate-90" />
          </button>
          <div className="hidden min-w-[320px] items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500 shadow-sm md:flex lg:min-w-[420px]">
            <Search className="h-4 w-4 text-slate-400" />
            <input type="text" placeholder="Search employees, payroll, leaves..." className="w-full bg-transparent outline-none placeholder:text-slate-400" readOnly />
            <kbd className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">⌘K</kbd>
          </div>
        </div>
        <div className="flex items-center gap-2 lg:gap-3">
          <div className={`hidden items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold shadow-sm sm:flex ${statusPill.tone}`}>
            <CircleDot className="h-3.5 w-3.5" />
            {statusPill.label}
          </div>
          <div className="hidden items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700 shadow-sm md:flex">
            <Command className="h-3.5 w-3.5" />
            Quick actions ready
          </div>
          <Link to="/notifications" className="relative rounded-2xl border border-slate-200 bg-white p-2.5 text-slate-600 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:text-indigo-600">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-gradient-to-r from-rose-500 to-fuchsia-600 px-1 text-[10px] font-bold text-white">{unreadCount > 9 ? '9+' : unreadCount}</span>}
          </Link>
          <div className="relative" ref={dropdownRef}>
            <button type="button" onClick={() => setDropdownOpen((value) => !value)} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-2 py-1.5 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200">
              <Avatar src={user?.avatar} name={`${user?.firstName} ${user?.lastName}`} size="sm" />
              <div className="hidden text-left md:block">
                <p className="text-sm font-semibold text-slate-900">{user?.firstName} {user?.lastName}</p>
                <p className="text-xs capitalize text-slate-500">{user?.role}</p>
              </div>
              <ChevronDown className="h-4 w-4 text-slate-400" />
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 mt-3 w-64 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_25px_80px_-35px_rgba(15,23,42,0.45)]">
                <div className="border-b border-slate-100 px-4 py-4">
                  <div className="flex items-center gap-3">
                    <Avatar src={user?.avatar} name={`${user?.firstName} ${user?.lastName}`} size="md" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">{user?.firstName} {user?.lastName}</p>
                      <p className="truncate text-xs text-slate-500">{user?.email}</p>
                    </div>
                  </div>
                </div>
                <div className="p-2">
                  <Link to="/profile" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm text-slate-700 transition hover:bg-slate-50">
                    <Settings2 className="h-4 w-4" />
                    My Profile
                  </Link>
                  <Link to="/settings" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm text-slate-700 transition hover:bg-slate-50">
                    <Settings2 className="h-4 w-4" />
                    Settings
                  </Link>
                  <button type="button" onClick={() => { logout(); navigate('/login'); setDropdownOpen(false) }} className="mt-1 flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm text-rose-600 transition hover:bg-rose-50">
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
