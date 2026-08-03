import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, X, Users, Building2, IndianRupee, Loader2 } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import api from '../../lib/axios'
import type { SearchResults } from '../../types'

interface GlobalSearchModalProps {
  open: boolean
  onClose: () => void
}

function useDebounce(value: string, delay: number) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
}

export function GlobalSearchModal({ open, onClose }: GlobalSearchModalProps) {
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()
  const debouncedQuery = useDebounce(query, 300)

  const { data, isFetching } = useQuery<SearchResults>({
    queryKey: ['global-search', debouncedQuery],
    queryFn: () =>
      api.get('/search', { params: { q: debouncedQuery, limit: 5 } }).then(r => r.data.data),
    enabled: debouncedQuery.length >= 2,
    staleTime: 30000,
  })

  useEffect(() => {
    if (open) {
      setQuery('')
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose()
  }, [onClose])

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, handleKeyDown])

  const goTo = (path: string) => {
    navigate(path)
    onClose()
  }

  const hasResults = data && (
    (data.employees?.length ?? 0) > 0 ||
    (data.departments?.length ?? 0) > 0 ||
    (data.payrolls?.length ?? 0) > 0
  )

  if (!open) return null

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center pt-[10vh] px-4"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-fade-in">
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-100">
          <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search employees, departments, payroll..."
            className="flex-1 text-base text-gray-800 placeholder-gray-400 outline-none bg-transparent"
          />
          {isFetching && <Loader2 className="w-4 h-4 text-primary-500 animate-spin flex-shrink-0" />}
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors flex-shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto">
          {debouncedQuery.length >= 2 && !isFetching && !hasResults && (
            <div className="px-4 py-8 text-center text-gray-400 text-sm">
              No results for "{debouncedQuery}"
            </div>
          )}

          {debouncedQuery.length < 2 && (
            <div className="px-4 py-8 text-center text-gray-400 text-sm">
              Type at least 2 characters to search
            </div>
          )}

          {hasResults && (
            <div className="py-2">
              {(data.employees?.length ?? 0) > 0 && (
                <div>
                  <div className="px-4 py-2 flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Employees</span>
                  </div>
                  {data.employees.map(emp => (
                    <button
                      key={emp._id}
                      onClick={() => goTo(`/employees/${emp._id}`)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors text-left"
                    >
                      <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {emp.firstName[0]}{emp.lastName[0]}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">{emp.firstName} {emp.lastName}</p>
                        <p className="text-xs text-gray-400">{emp.employeeId} · {emp.department?.name}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {(data.departments?.length ?? 0) > 0 && (
                <div>
                  <div className="px-4 py-2 flex items-center gap-2 mt-1">
                    <Building2 className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Departments</span>
                  </div>
                  {data.departments.map(dept => (
                    <button
                      key={dept._id}
                      onClick={() => goTo('/departments')}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors text-left"
                    >
                      <div className="w-8 h-8 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">{dept.name}</p>
                        <p className="text-xs text-gray-400">{dept.code} · {dept.employeeCount ?? 0} employees</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {(data.payrolls?.length ?? 0) > 0 && (
                <div>
                  <div className="px-4 py-2 flex items-center gap-2 mt-1">
                    <IndianRupee className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Payrolls</span>
                  </div>
                  {data.payrolls.map(p => (
                    <button
                      key={p._id}
                      onClick={() => goTo('/payroll')}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors text-left"
                    >
                      <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
                        <IndianRupee className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          {p.employee?.user?.firstName} {p.employee?.user?.lastName}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(0, p.month - 1).toLocaleString('default', { month: 'long' })} {p.year} · ₹{p.netSalary?.toLocaleString('en-IN')}
                        </p>
                      </div>
                      <span className={`ml-auto text-xs px-2 py-0.5 rounded-full font-medium ${
                        p.status === 'paid' ? 'bg-emerald-100 text-emerald-700' :
                        p.status === 'processed' ? 'bg-blue-100 text-blue-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>{p.status}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="px-4 py-2.5 border-t border-gray-100 flex items-center gap-4 text-xs text-gray-400">
          <span className="flex items-center gap-1"><kbd className="bg-gray-100 rounded px-1 font-mono">↵</kbd> select</span>
          <span className="flex items-center gap-1"><kbd className="bg-gray-100 rounded px-1 font-mono">Esc</kbd> close</span>
        </div>
      </div>
    </div>
  )
}
