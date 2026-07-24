import type { LucideIcon } from 'lucide-react'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface SparkPoint { v: number }

function MiniSparkline({ data, positive = true }: { data: SparkPoint[]; positive?: boolean }) {
  if (!data || data.length < 2) return null
  const max = Math.max(...data.map(d => d.v))
  const min = Math.min(...data.map(d => d.v))
  const range = max - min || 1
  const w = 64
  const h = 28
  const pts = data.map((d, i) => {
    const x = (i / (data.length - 1)) * w
    const y = h - ((d.v - min) / range) * h
    return `${x},${y}`
  })
  const fill = positive ? '#10b981' : '#ef4444'
  const stroke = positive ? '#10b981' : '#ef4444'
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
      <defs>
        <linearGradient id={`spark-${fill}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={fill} stopOpacity="0.3" />
          <stop offset="100%" stopColor={fill} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline
        points={pts.join(' ')}
        fill="none"
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function CircularRing({ percent, color = '#6366f1' }: { percent: number; color?: string }) {
  const r = 18
  const circ = 2 * Math.PI * r
  const offset = circ - (percent / 100) * circ
  return (
    <svg width="48" height="48" viewBox="0 0 48 48">
      <circle cx="24" cy="24" r={r} fill="none" stroke="#e5e7eb" strokeWidth="4" />
      <circle
        cx="24" cy="24" r={r} fill="none"
        stroke={color} strokeWidth="4"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 24 24)"
        style={{ transition: 'stroke-dashoffset 0.6s ease' }}
      />
      <text x="24" y="28" textAnchor="middle" fontSize="10" fontWeight="700" fill={color}>
        {percent}%
      </text>
    </svg>
  )
}

export interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  iconColor?: string
  iconBg?: string
  gradientFrom?: string
  gradientTo?: string
  trend?: number
  trendLabel?: string
  loading?: boolean
  suffix?: string
  sparkline?: SparkPoint[]
  ringPercent?: number
  ringColor?: string
  description?: string
}

export function StatCard({
  title, value, icon: Icon,
  iconColor = 'text-indigo-600', iconBg = 'bg-indigo-50',
  gradientFrom, gradientTo,
  trend, trendLabel = 'vs last month', loading, suffix,
  sparkline, ringPercent, ringColor = '#6366f1', description,
}: StatCardProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <div className="h-3.5 w-24 bg-gray-100 animate-pulse rounded-full" />
            <div className="h-8 w-20 bg-gray-100 animate-pulse rounded-full" />
            <div className="h-3 w-32 bg-gray-100 animate-pulse rounded-full" />
          </div>
          <div className="w-12 h-12 bg-gray-100 animate-pulse rounded-2xl ml-4" />
        </div>
      </div>
    )
  }

  const isPositive = (trend ?? 0) >= 0
  const iconStyle = gradientFrom && gradientTo
    ? { background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})` }
    : undefined

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 p-5 group">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide truncate">{title}</p>
          <div className="flex items-end gap-2 mt-1.5">
            <p className="text-2xl font-bold text-gray-900 leading-tight">
              {typeof value === 'number' ? value.toLocaleString('en-IN') : value}
              {suffix && <span className="text-base font-normal text-gray-400 ml-1">{suffix}</span>}
            </p>
          </div>
          {description && <p className="text-xs text-gray-400 mt-0.5 truncate">{description}</p>}
          {trend !== undefined && (
            <div className="flex items-center gap-1 mt-2">
              <span className={`inline-flex items-center gap-0.5 text-xs font-semibold px-1.5 py-0.5 rounded-full ${
                isPositive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
              }`}>
                {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {isPositive ? '+' : ''}{trend}%
              </span>
              <span className="text-xs text-gray-400">{trendLabel}</span>
            </div>
          )}
        </div>
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          {ringPercent !== undefined ? (
            <CircularRing percent={ringPercent} color={ringColor} />
          ) : (
            <div
              className={`p-3 rounded-2xl flex-shrink-0 ${!gradientFrom ? iconBg : ''}`}
              style={iconStyle}
            >
              <Icon className={`w-5 h-5 ${gradientFrom ? 'text-white' : iconColor}`} />
            </div>
          )}
          {sparkline && <MiniSparkline data={sparkline} positive={isPositive} />}
        </div>
      </div>
    </div>
  )
}
