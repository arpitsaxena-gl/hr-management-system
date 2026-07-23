import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import PayrollPage from './PayrollPage'

const payrollRows = [
  {
    _id: 'p-1',
    month: 6,
    year: 2026,
    status: 'draft',
    createdAt: '2026-06-05T00:00:00.000Z',
    employee: {
      employeeId: 'EMP-002',
      designation: { name: 'Finance Lead' },
      user: { firstName: 'Zara', lastName: 'Khan' },
    },
    netSalary: 84250,
    earnings: { grossEarnings: 98000 },
    deductions: { totalDeductions: 13750 },
  },
  {
    _id: 'p-2',
    month: 6,
    year: 2026,
    status: 'processed',
    createdAt: '2026-06-08T00:00:00.000Z',
    employee: {
      employeeId: 'EMP-001',
      designation: { name: 'Software Engineer' },
      user: { firstName: 'Aarav', lastName: 'Mehta' },
    },
    netSalary: 112500,
    earnings: { grossEarnings: 125000 },
    deductions: { totalDeductions: 12500 },
  },
]

const queryMock = vi.fn()
const mutationMock = vi.fn()
const invalidateQueries = vi.fn()

vi.mock('@tanstack/react-query', () => ({
  useQuery: (...args: any[]) => queryMock(...args),
  useMutation: (options: any) => ({ mutate: mutationMock, isPending: false, options }),
  useQueryClient: () => ({ invalidateQueries }),
}))

vi.mock('../../lib/axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
  },
}))

vi.mock('../../hooks/usePermissions', () => ({
  usePermissions: () => ({ canManagePayroll: true, role: 'admin' }),
}))

vi.mock('react-hot-toast', () => ({
  default: { success: vi.fn(), error: vi.fn() },
}))

vi.mock('../../components/ui/StatCard', () => ({
  StatCard: ({ title, value }: any) => (
    <div data-testid={`stat-${title}`}>
      <span>{title}</span>
      <span>{String(value)}</span>
    </div>
  ),
}))

vi.mock('../../components/ui/Badge', () => ({
  StatusBadge: ({ status }: { status: string }) => <span>{status}</span>,
}))

describe('PayrollPage', () => {
  beforeEach(() => {
    queryMock.mockImplementation(({ queryKey, enabled }: any) => {
      if (queryKey?.[0] === 'payroll') {
        return { data: { data: payrollRows, pagination: { total: payrollRows.length } }, isLoading: false }
      }
      if (queryKey?.[0] === 'payroll-summary' && enabled !== false) {
        return { data: { summary: [{ _id: 'draft', count: 1 }, { _id: 'processed', count: 1 }, { _id: 'paid', count: 0 }] }, isLoading: false }
      }
      return { data: undefined, isLoading: false }
    })
  })

  it('renders payroll cards with the live sort and filter controls', () => {
    render(<PayrollPage />)

    // SCRUM-7 AC: payroll dashboard metrics, controls, and floating card rows.
    expect(screen.getByText('Payroll operations at a glance')).toBeInTheDocument()
    expect(screen.getByText('Process Payroll')).toBeInTheDocument()
    expect(screen.getByText('EMP-001')).toBeInTheDocument()
    expect(screen.getByText('EMP-002')).toBeInTheDocument()
    expect(screen.getByText('₹112,500')).toBeInTheDocument()
    expect(screen.getByText('₹84,250')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Employee' })).toBeInTheDocument()
    expect(screen.getByText('Draft')).toBeInTheDocument()
    expect(screen.getByText('processed')).toBeInTheDocument()
  })

  it('toggles employee sorting and applies the client-side date filter', async () => {
    const user = userEvent.setup()
    render(<PayrollPage />)

    // SCRUM-7 AC: employee sorting logic remains interactive and deterministic.
    await user.click(screen.getByRole('button', { name: 'Employee' }))
    const rowsAfterSort = screen.getAllByText(/EMP-00[12]/).map((node) => node.textContent)
    expect(rowsAfterSort[0]).toBe('EMP-002')

    await user.type(screen.getAllByRole('textbox')[0], '2026-06-06')
    expect(screen.queryByText('EMP-002')).not.toBeInTheDocument()
    expect(screen.getByText('EMP-001')).toBeInTheDocument()
  })
})
