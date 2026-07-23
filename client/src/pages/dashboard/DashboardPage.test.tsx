import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import DashboardPage from './DashboardPage'

const dashboardData = {
  overview: { totalEmployees: 128, activeEmployees: 121, newJoinees: 7 },
  attendance: { todayPresent: 104, todayAbsent: 8, attendanceRate: 81 },
  leaves: { pendingLeaves: 6 },
  payroll: { monthTotal: 24567890 },
  recruitment: { openPositions: 4 },
  charts: {
    monthlyTrend: [
      { _id: { year: 2026, month: 6, status: 'present' }, count: 32 },
      { _id: { year: 2026, month: 6, status: 'on_leave' }, count: 8 },
      { _id: { year: 2026, month: 6, status: 'absent' }, count: 2 },
    ],
    deptDistribution: [
      { name: 'Engineering', count: 5 },
      { name: 'Operations', count: 4 },
      { name: 'HR', count: 2 },
    ],
  },
}

const queryMock = vi.fn()

vi.mock('@tanstack/react-query', () => ({
  useQuery: (...args: any[]) => queryMock(...args),
}))

vi.mock('../../lib/axios', () => ({
  default: {
    get: vi.fn(),
  },
}))

vi.mock('../../store/authStore', () => ({
  useAuthStore: () => ({ user: { firstName: 'Super', lastName: 'Admin' } }),
}))

vi.mock('../../components/ui/StatCard', () => ({
  StatCard: ({ title, value, trendLabel, loading }: any) => (
    <div data-testid={`stat-${title}`}>
      <span>{title}</span>
      <span>{String(value)}</span>
      {trendLabel && <span>{trendLabel}</span>}
      {loading && <span>Loading</span>}
    </div>
  ),
}))

vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
  AreaChart: ({ children }: any) => <div data-testid="area-chart">{children}</div>,
  Area: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  PieChart: ({ children }: any) => <div data-testid="pie-chart">{children}</div>,
  Pie: ({ children }: any) => <div>{children}</div>,
  Cell: () => null,
  Legend: () => null,
}))

describe('DashboardPage', () => {
  beforeEach(() => {
    queryMock.mockImplementation(({ queryKey }: any) => {
      if (queryKey?.[0] === 'dashboard') {
        return { data: { data: dashboardData }, isLoading: false }
      }
      return { data: undefined, isLoading: false }
    })
  })

  it('renders the new HRMS overview and KPI surface', () => {
    render(<DashboardPage />)

    // SCRUM-7 AC: HRMS dashboard redesign and rupee formatting.
    expect(screen.getByText('Good morning, Super Admin 👋')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '+ Quick Action' })).toBeInTheDocument()
    expect(screen.getByText('HRMS Main Dashboard')).toBeInTheDocument()
    expect(screen.getByText('₹24,567,890')).toBeInTheDocument()
    expect(screen.getByText('Attendance Trend')).toBeInTheDocument()
    expect(screen.getByText('Department Breakdown')).toBeInTheDocument()
    expect(screen.getByText('Recent Activity Feed')).toBeInTheDocument()
    expect(screen.getByText('Quick Actions & Announcements')).toBeInTheDocument()
    expect(screen.getByText('11')).toBeInTheDocument()
  })

  it('switches the attendance period toggle without breaking the chart shell', async () => {
    const user = userEvent.setup()
    render(<DashboardPage />)

    // SCRUM-7 AC: attendance trend period toggles remain interactive.
    await user.click(screen.getByRole('button', { name: 'Weekly' }))
    expect(screen.getByRole('button', { name: 'Weekly' })).toBeInTheDocument()
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument()
  })
})
