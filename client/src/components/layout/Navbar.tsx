import { Bell, Menu, Search } from 'lucide-react'

interface NavbarProps {
  onMenuToggle: () => void
}

export function Navbar({ onMenuToggle }: NavbarProps) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 lg:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100"
          aria-label="Toggle sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="hidden w-64 items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-3 py-2 md:flex">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            type="text"
            readOnly
            placeholder="Quick search..."
            className="w-full bg-transparent text-sm text-slate-600 placeholder-slate-400 outline-none"
            aria-label="Quick search"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          className="relative rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full bg-red-500" />
        </button>

        <div className="flex items-center gap-2 rounded-xl px-2 py-1">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
            SA
          </div>
          <div className="hidden text-left md:block">
            <p className="text-sm font-semibold leading-none text-slate-900">Super Admin</p>
            <p className="mt-0.5 text-xs text-slate-500">Admin</p>
          </div>
        </div>
      </div>
    </header>
  )
}
