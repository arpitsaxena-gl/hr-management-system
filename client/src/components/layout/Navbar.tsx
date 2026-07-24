import { Bell, Search, Menu } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Avatar } from '../ui/Avatar'

interface NavbarProps { onMenuToggle: () => void }

export function Navbar({ onMenuToggle }: NavbarProps) {
  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 lg:px-6 flex-shrink-0 z-10">
      <div className="flex items-center gap-3">
        <button onClick={onMenuToggle} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
          <Menu className="w-5 h-5" />
        </button>
        <div className="hidden md:flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-full px-3.5 py-2 w-64">
          <Search className="w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Quick search..."
            className="bg-transparent text-sm text-gray-600 outline-none w-full placeholder-gray-400"
            readOnly
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Link to="/notifications" className="relative p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-semibold">
            3
          </span>
        </Link>

        <div className="flex items-center gap-2 p-1.5 pr-3 rounded-xl">
          <Avatar name="Super Admin" size="sm" className="bg-blue-100 text-blue-700" />
          <div className="hidden md:block text-left">
            <p className="text-sm font-semibold text-gray-800 leading-none">Super Admin</p>
            <p className="text-xs text-gray-500 mt-0.5">Admin</p>
          </div>
        </div>
      </div>
    </header>
  )
}
