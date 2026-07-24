import type { ReactNode } from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import DashboardPage from './DashboardPage'

vi.mock('recharts', () => {
  const Container = ({ children }: { children?: ReactNode }) => <div>{children}</div>

  return {
    ResponsiveContainer: Container,
    AreaChart: Container,
    PieChart: Container,
    Pie: Container,
    Area: () => null,
    CartesianGrid: () => null,
    XAxis: () => null,
    YAxis: () => null,
    Tooltip: () => null,
    Cell: () => null,
  }
})

describe('DashboardPage', () => {
  it('renders the dashboard heading and greeting copy (SCRUM-9 AC-A06)', () => {
    render(<DashboardPage />)

    expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument()
    expect(screen.getByText('Welcome back, Super! Friday, July 24th 2026')).toBeInTheDocument()
  })

  it('renders all required KPI cards with deterministic values (SCRUM-9 AC-A07, AC-A08)', () => {
    render(<DashboardPage />)

    const expectedCards: Array<[string, string]> = [
      ['Total Employees', '11'],
      ['Present Today', '0 / 10'],
      ['Pending Leaves', '0'],
      ['Monthly Payroll', 'Rs.2.2L'],
      ['New Joiners (Month)', '0'],
      ['Attendance Rate', '0%'],
      ['Open Positions', '0'],
      ['Active Employees', '10'],
    ]

    expectedCards.forEach(([label, value]) => {
      expect(screen.getByText(label)).toBeInTheDocument()
      expect(screen.getByText(value)).toBeInTheDocument()
    })

    expect(screen.getByText('↗ 5% vs last month')).toBeInTheDocument()
  })

  it('renders attendance and department legends with expected semantics (SCRUM-9 AC-A10, AC-A11)', () => {
    render(<DashboardPage />)

    expect(screen.getByRole('heading', { name: 'Attendance Trend' })).toBeInTheDocument()
    expect(screen.getByText('Absent')).toBeInTheDocument()
    expect(screen.getByText('On Leave')).toBeInTheDocument()
    expect(screen.getByText('Present')).toBeInTheDocument()

    expect(screen.getByRole('heading', { name: 'By Department' })).toBeInTheDocument()
    expect(screen.getByText('Design')).toBeInTheDocument()
    expect(screen.getByText('Engineering')).toBeInTheDocument()
    expect(screen.getByText('Finance')).toBeInTheDocument()
    expect(screen.getByText('Human Resources')).toBeInTheDocument()
    expect(screen.getByText('Marketing')).toBeInTheDocument()
  })
})
