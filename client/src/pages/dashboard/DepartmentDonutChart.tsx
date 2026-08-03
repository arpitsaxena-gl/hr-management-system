import { useMemo } from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import type { DashboardStats } from '../../types'

const COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#f43f5e', '#3b82f6', '#ec4899', '#14b8a6', '#84cc16']

interface DepartmentDonutChartProps {
  data?: DashboardStats
  loading: boolean
}

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-3 text-xs">
      <p className="font-semibold text-gray-700">{payload[0].name}</p>
      <p className="text-gray-500 mt-1">{payload[0].value} employees</p>
      <p className="text-primary-600 font-medium">{payload[0].payload.percentage}%</p>
    </div>
  )
}

export function DepartmentDonutChart({ data, loading }: DepartmentDonutChartProps) {
  const chartData = useMemo(() => {
    const raw = data?.charts?.deptDistribution ?? []
    const total = raw.reduce((s, d) => s + (d.count ?? 0), 0)
    return raw.map((d, i) => ({
      name: d.name,
      value: d.count,
      color: d.color || COLORS[i % COLORS.length],
      percentage: total > 0 ? Math.round((d.count / total) * 100) : 0,
    }))
  }, [data])

  const total = chartData.reduce((s, d) => s + (d.value ?? 0), 0)

  if (loading) {
    return (
      <div className="card">
        <div className="skeleton h-6 w-48 rounded mb-4" />
        <div className="flex gap-4">
          <div className="skeleton w-40 h-40 rounded-full mx-auto" />
          <div className="flex-1 space-y-2">
            {[1, 2, 3, 4].map(i => <div key={i} className="skeleton h-4 rounded" />)}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="mb-6">
        <h3 className="text-base font-semibold text-gray-800">Department Breakdown</h3>
        <p className="text-xs text-gray-400 mt-0.5">Employee distribution by department</p>
      </div>

      <div className="flex flex-col items-center gap-6">
        <div className="relative w-48 h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-2xl font-bold text-gray-900">{total}</span>
            <span className="text-xs text-gray-400">Total</span>
          </div>
        </div>

        <div className="w-full grid grid-cols-2 gap-x-4 gap-y-2">
          {chartData.map((d, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: d.color }} />
              <span className="text-xs text-gray-600 truncate flex-1">{d.name}</span>
              <span className="text-xs font-semibold text-gray-700 flex-shrink-0">{d.percentage}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
