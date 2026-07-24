/**
 * SCRUM-8 — StatCard component tests
 * Verifies: AC-3 (KPI cards render), AC-3.5 (trend pill), AC-3.4 (circular ring), AC-3.6 (loading skeleton)
 * Framework: Vitest + @testing-library/react
 * Run: cd client && npx vitest run src/components/ui/StatCard.test.tsx
 */
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Users } from 'lucide-react'
import { StatCard } from './StatCard'

describe('StatCard — loading state', () => {
  it('renders skeleton elements without title or value text', () => {
    const { container } = render(
      <StatCard title="Total Employees" value={100} icon={Users} loading />
    )
    expect(screen.queryByText('Total Employees')).not.toBeInTheDocument()
    // Skeleton divs should be present (animate-pulse)
    expect(container.querySelector('.animate-pulse')).toBeTruthy()
  })
})

describe('StatCard — basic render', () => {
  it('renders title and value', () => {
    render(<StatCard title="Total Employees" value={42} icon={Users} />)
    expect(screen.getByText('Total Employees')).toBeInTheDocument()
    expect(screen.getByText(/42/)).toBeInTheDocument()
  })

  it('renders string value (pre-formatted ₹ currency)', () => {
    render(<StatCard title="Monthly Payroll" value="₹12,34,567" icon={Users} />)
    expect(screen.getByText('Monthly Payroll')).toBeInTheDocument()
    expect(screen.getByText(/₹12,34,567/)).toBeInTheDocument()
  })

  it('renders optional description', () => {
    render(<StatCard title="Present Today" value={80} icon={Users} description="of 100 employees" />)
    expect(screen.getByText('of 100 employees')).toBeInTheDocument()
  })

  it('renders suffix', () => {
    render(<StatCard title="Attendance" value={92} icon={Users} suffix="%" />)
    expect(screen.getByText(/%/)).toBeInTheDocument()
  })
})

describe('StatCard — trend pill', () => {
  it('shows positive trend badge in emerald color class', () => {
    const { container } = render(
      <StatCard title="New This Month" value={5} icon={Users} trend={12} />
    )
    const badge = container.querySelector('.bg-emerald-50')
    expect(badge).toBeTruthy()
    expect(badge?.textContent).toContain('+12%')
  })

  it('shows negative trend badge in red color class', () => {
    const { container } = render(
      <StatCard title="Attrition" value={3} icon={Users} trend={-5} />
    )
    const badge = container.querySelector('.bg-red-50')
    expect(badge).toBeTruthy()
    expect(badge?.textContent).toContain('-5%')
  })

  it('does not render trend element when trend prop is omitted', () => {
    const { container } = render(<StatCard title="Open Positions" value={7} icon={Users} />)
    expect(container.querySelector('.bg-emerald-50')).toBeNull()
    expect(container.querySelector('.bg-red-50')).toBeNull()
  })

  it('shows custom trendLabel', () => {
    render(<StatCard title="Payroll" value={100} icon={Users} trend={3} trendLabel="vs last quarter" />)
    expect(screen.getByText('vs last quarter')).toBeInTheDocument()
  })
})

describe('StatCard — circular ring (Attendance Rate)', () => {
  it('renders SVG ring when ringPercent is provided', () => {
    const { container } = render(
      <StatCard title="Attendance Rate" value="" icon={Users} ringPercent={87} />
    )
    const svg = container.querySelector('svg')
    expect(svg).toBeTruthy()
    // The percentage text inside SVG
    expect(svg?.textContent).toContain('87%')
  })

  it('does NOT render ring SVG when ringPercent is absent', () => {
    const { container } = render(<StatCard title="Total Employees" value={100} icon={Users} />)
    // Icon wrapper should render, no ring SVG with text
    const svgs = container.querySelectorAll('svg')
    // Icon is also SVG; verify none contain ring percentage text
    const hasPct = Array.from(svgs).some(s => s.textContent?.includes('%'))
    expect(hasPct).toBe(false)
  })
})

describe('StatCard — sparkline', () => {
  const sparkData = [{ v: 10 }, { v: 15 }, { v: 12 }, { v: 18 }, { v: 20 }]

  it('renders sparkline SVG when sparkline data is provided', () => {
    const { container } = render(
      <StatCard title="New Joiners" value={5} icon={Users} sparkline={sparkData} trend={5} />
    )
    // The sparkline polyline should be in the DOM
    expect(container.querySelector('polyline')).toBeTruthy()
  })

  it('does not render polyline when sparkline is absent', () => {
    const { container } = render(<StatCard title="Open Positions" value={7} icon={Users} />)
    expect(container.querySelector('polyline')).toBeNull()
  })
})

describe('StatCard — gradient icon badge', () => {
  it('applies inline gradient style when gradientFrom and gradientTo are provided', () => {
    const { container } = render(
      <StatCard
        title="Payroll"
        value={100}
        icon={Users}
        gradientFrom="#6366f1"
        gradientTo="#8b5cf6"
      />
    )
    const iconWrapper = container.querySelector('[style*="linear-gradient"]')
    expect(iconWrapper).toBeTruthy()
  })
})
