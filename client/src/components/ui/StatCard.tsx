import type { LucideIcon } from 'lucide-react'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface SparkPoint { value: number }

interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  iconColor?: string
  iconGradient?: string
  trend?: number
  trendLabel?: string
  loading?: boolean
  suffix?: string
  sparkline?: SparkPoint[]
  ringProgress?: number
  ringColor?: string
  badge?: string
  badgeColor?: string
}

function MiniSparkline({ data }: { data: SparkPoint[] }) {
  if (!data || data.length < 2) return null
  const max = Math.max(...data.map(d => d.value))
  const min = Math.min(...data.map(d => d.value))
  const range = max - min || 1
  const w = 60
  const h = 28
  const pts = data.map((d, i) => {
    const x = (i / (data.length - 1)) * w
    const y = h - ((d.value - min) / range) * h
    return `${x},${y}`
  }).join(' ')

  return (
    <svg width={w} height={h} className="overflow-visible">
      <defs>
        <linearGradient id="spark-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.3" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline points={pts} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function RingProgress({ value, color = '#6366f1', size = 52 }: { value: number; color?: string; size?: number }) {
  const r = (size - 8) / 2
  const circ = 2 * Math.PI * r
  const dash = (value / 100) * circ
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e5e7eb" strokeWidth="4" />
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none" stroke={color} strokeWidth="4"
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 0.6s ease' }}
      />
    </svg>
  )
}

export function StatCard({
  title, value, icon: Icon,
  iconColor = 'text-indigo-600',
  iconGradient = 'from-indigo-500 to-violet-600',
  trend, trendLabel, loading, suffix,
  sparkline, ringProgress, ringColor, badge, badgeColor = 'bg-emerald-100 text-emerald-700'
}: StatCardProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <div className="h-3.5 w-24 rounded-lg bg-gray-100 animate-pulse" />
            <div className="h-8 w-20 rounded-lg bg-gray-100 animate-pulse" />
            <div className="h-3 w-32 rounded-lg bg-gray-100 animate-pulse" />
          </div>
          <div className="w-12 h-12 rounded-2xl bg-gray-100 animate-pulse ml-4" />
        </div>
      </div>
    )
  }

  const isPositive = (trend ?? 0) >= 0

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 p-5 group relative overflow-hidden">
      {/* Subtle background glow */}
      <div className={`absolute -top-6 -right-6 w-20 h-20 bg-gradient-to-br ${iconGradient} opacity-5 rounded-full blur-xl group-hover:opacity-10 transition-opacity`} />

      <div className="flex items-start justify-between relative">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-gray-500 truncate tracking-wide uppercase">{title}</p>
          <p className="mt-2 text-2xl font-bold text-gray-900 leading-none">
            {typeof value === 'number' ? value.toLocaleString() : value}
            {suffix && <span className="text-base font-normal text-gray-400 ml-1">{suffix}</span>}
          </p>

          <div className="flex items-center gap-2 mt-2.5 flex-wrap">
            {trend !== undefined && (
              <span className={`flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full ${
                isPositive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'
              }`}>
                {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {isPositive ? '+' : ''}{Math.abs(trend)}%
              </span>
            )}
            {trendLabel && <span className="text-xs text-gray-400">{trendLabel}</span>}
            {badge && (
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${badgeColor}`}>{badge}</span>
            )}
          </div>

          {sparkline && sparkline.length > 0 && (
            <div className={`mt-2 ${isPositive ? 'text-emerald-500' : 'text-red-400'}`}>
              <MiniSparkline data={sparkline} />
            </div>
          )}
        </div>

        <div className="ml-4 flex-shrink-0 flex flex-col items-center gap-1">
          {ringProgress !== undefined ? (
            <div className="relative flex items-center justify-center">
              <RingProgress value={ringProgress} color={ringColor ?? '#6366f1'} size={52} />
              <div className="absolute inset-0 flex items-center justify-center">
                <Icon className={`w-4 h-4 ${iconColor}`} />
              </div>
            </div>
          ) : (
            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${iconGradient} flex items-center justify-center shadow-md`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
