import { useState, useMemo } from 'react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import type { DashboardStats } from '../../types'

type Period = 'daily' | 'weekly' | 'monthly'

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

interface AttendanceAreaChartProps {
  data?: DashboardStats
  loading: boolean
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-3 text-xs">
      <p className="font-semibold text-gray-700 mb-2">{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-2 py-0.5">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-gray-500 capitalize">{p.name}:</span>
          <span className="font-bold text-gray-800">{p.value}</span>
        </div>
      ))}
    </div>
  )
}

export function AttendanceAreaChart({ data, loading }: AttendanceAreaChartProps) {
  const [period, setPeriod] = useState<Period>('monthly')

  const chartData = useMemo(() => {
    const raw = data?.charts?.monthlyTrend ?? []
    if (!raw.length) {
      return MONTH_NAMES.slice(0, 6).map(m => ({ name: m, Present: 0, Absent: 0, 'On Leave': 0 }))
    }

    const grouped: Record<string, { Present: number; Absent: number; 'On Leave': number }> = {}
    raw.forEach(item => {
      const key = `${MONTH_NAMES[(item._id.month ?? 1) - 1]} ${item._id.year}`
      if (!grouped[key]) grouped[key] = { Present: 0, Absent: 0, 'On Leave': 0 }
      const status = item._id.status
      if (status === 'present' || status === 'work_from_home') grouped[key].Present += item.count
      else if (status === 'absent') grouped[key].Absent += item.count
      else if (status === 'on_leave') grouped[key]['On Leave'] += item.count
    })

    return Object.entries(grouped).map(([name, values]) => ({ name, ...values }))
  }, [data])

  if (loading) {
    return (
      <div className="card">
        <div className="skeleton h-6 w-48 rounded mb-4" />
        <div className="skeleton h-48 w-full rounded" />
      </div>
    )
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-semibold text-gray-800">Attendance Trend</h3>
          <p className="text-xs text-gray-400 mt-0.5">Employee attendance over time</p>
        </div>
        <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
          {(['daily', 'weekly', 'monthly'] as Period[]).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${
                period === p
                  ? 'bg-white text-primary-600 shadow-sm font-semibold'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorAbsent" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorLeave" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: '12px', paddingTop: '16px' }}
            formatter={(value) => <span className="text-gray-600">{value}</span>}
          />
          <Area type="monotone" dataKey="Present" stroke="#6366f1" strokeWidth={2} fill="url(#colorPresent)" />
          <Area type="monotone" dataKey="Absent" stroke="#f43f5e" strokeWidth={2} fill="url(#colorAbsent)" />
          <Area type="monotone" dataKey="On Leave" stroke="#f59e0b" strokeWidth={2} fill="url(#colorLeave)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
