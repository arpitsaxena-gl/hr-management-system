import type { LucideIcon } from 'lucide-react'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { LineChart, Line, ResponsiveContainer } from 'recharts'

interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  gradient?: string
  iconColor?: string
  iconBg?: string
  trend?: number
  trendLabel?: string
  loading?: boolean
  suffix?: string
  sparklineData?: number[]
  progressValue?: number
  formatAs?: 'currency' | 'percent' | 'number'
}

function SparkLine({ data }: { data: number[] }) {
  const chartData = data.map((v, i) => ({ i, v }))
  return (
    <div className="h-10 w-20">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <Line type="monotone" dataKey="v" stroke="currentColor" strokeWidth={1.5} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

function CircularProgress({ value }: { value: number }) {
  const radius = 16
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (value / 100) * circumference

  return (
    <div className="relative w-12 h-12 flex items-center justify-center">
      <svg className="w-12 h-12 -rotate-90" viewBox="0 0 40 40">
        <circle cx="20" cy="20" r={radius} fill="none" stroke="#e5e7eb" strokeWidth="3" />
        <circle
          cx="20" cy="20" r={radius} fill="none"
          stroke="currentColor" strokeWidth="3"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-700"
        />
      </svg>
      <span className="absolute text-xs font-bold">{value}%</span>
    </div>
  )
}

export function StatCard({
  title, value, icon: Icon,
  gradient = 'from-primary-500 to-violet-500',
  iconColor = 'text-white',
  iconBg,
  trend, trendLabel, loading, suffix,
  sparklineData, progressValue, formatAs
}: StatCardProps) {
  if (loading) {
    return (
      <div className="card">
        <div className="flex items-center justify-between">
          <div className="space-y-2 flex-1">
            <div className="skeleton h-4 w-24 rounded" />
            <div className="skeleton h-8 w-20 rounded" />
            <div className="skeleton h-3 w-32 rounded" />
          </div>
          <div className="skeleton w-12 h-12 rounded-xl ml-4" />
        </div>
      </div>
    )
  }

  const displayValue = () => {
    if (formatAs === 'currency' && typeof value === 'number') {
      if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`
      return `₹${value.toLocaleString('en-IN')}`
    }
    if (formatAs === 'percent' && typeof value === 'number') return `${value}%`
    if (typeof value === 'number') return value.toLocaleString()
    return value
  }

  const isIconBgGradient = !iconBg

  return (
    <div className="card hover:shadow-md transition-all duration-200 group">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-500 truncate">{title}</p>
          <p className="mt-1.5 text-3xl font-bold text-gray-900">
            {displayValue()}
            {suffix && <span className="text-lg font-normal text-gray-500 ml-1">{suffix}</span>}
          </p>
          {(trend !== undefined || trendLabel) && (
            <div className="flex items-center gap-1 mt-2">
              {trend !== undefined && (
                <span className={`flex items-center gap-0.5 text-xs font-semibold px-1.5 py-0.5 rounded-full ${
                  trend >= 0
                    ? 'text-emerald-700 bg-emerald-50'
                    : 'text-red-700 bg-red-50'
                }`}>
                  {trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {Math.abs(trend)}%
                </span>
              )}
              {trendLabel && <span className="text-xs text-gray-400">{trendLabel}</span>}
            </div>
          )}
          {sparklineData && sparklineData.length > 0 && (
            <div className="mt-2 text-primary-400 opacity-60 group-hover:opacity-100 transition-opacity">
              <SparkLine data={sparklineData} />
            </div>
          )}
        </div>

        <div className="ml-4 flex-shrink-0">
          {progressValue !== undefined ? (
            <div className="text-primary-500">
              <CircularProgress value={progressValue} />
            </div>
          ) : isIconBgGradient ? (
            <div className={`bg-gradient-to-br ${gradient} p-3 rounded-2xl shadow-sm`}>
              <Icon className={`w-6 h-6 ${iconColor}`} />
            </div>
          ) : (
            <div className={`${iconBg} p-3 rounded-xl`}>
              <Icon className={`w-6 h-6 ${iconColor}`} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
