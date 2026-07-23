import { Outlet } from 'react-router-dom'
import { useMemo, useState } from 'react'
import { Sidebar } from './Sidebar'
import { Navbar } from './Navbar'

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const shellClassName = useMemo(
    () => 'flex h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.15),_transparent_32%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)]',
    []
  )

  return (
    <div className={shellClassName}>
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          className="fixed inset-0 z-20 bg-slate-950/50 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <aside className={`hidden lg:flex flex-col border-r border-white/50 bg-white/70 backdrop-blur-xl shadow-[0_30px_80px_-35px_rgba(79,70,229,0.35)] transition-all duration-300 flex-shrink-0 ${collapsed ? 'w-20' : 'w-72'}`}>
        <Sidebar collapsed={collapsed} />
      </aside>
      <aside className={`fixed inset-y-0 left-0 z-30 w-72 border-r border-white/40 bg-white/90 backdrop-blur-xl shadow-2xl flex flex-col lg:hidden transform transition-transform duration-300 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar collapsed={false} onClose={() => setMobileOpen(false)} />
      </aside>
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Navbar onMenuToggle={() => setMobileOpen((value) => !value)} onSidebarToggle={() => setCollapsed((value) => !value)} />
        <main className="flex-1 overflow-y-auto px-4 py-5 lg:px-6 lg:py-6">
          <div className="mx-auto w-full max-w-[1600px]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
