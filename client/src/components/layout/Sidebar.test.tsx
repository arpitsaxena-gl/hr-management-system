import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Sidebar } from './Sidebar'

const logout = vi.fn()

vi.mock('../../store/authStore', () => ({
  useAuthStore: () => ({ logout }),
}))

describe('Sidebar', () => {
  beforeEach(() => {
    logout.mockClear()
  })

  it('renders dashboard first with active highlight and required ordering (SCRUM-9 AC-A02, AC-A03)', () => {
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Sidebar collapsed={false} />
      </MemoryRouter>
    )

    const expectedOrder = [
      'Dashboard',
      'Employees',
      'Departments',
      'Designations',
      'Attendance',
      'Leaves',
      'Payroll',
      'Recruitment',
      'Performance',
      'Training',
      'Documents',
      'Holidays',
      'Shifts',
      'Reports',
      'Users',
      'Notifications',
      'Settings',
      'Audit Logs',
    ]

    const navLinks = screen.getAllByRole('link')
    expect(navLinks.map((link) => link.textContent?.trim())).toEqual(expectedOrder)
    expect(navLinks[0].className).toContain('bg-blue-600')
  })

  it('renders enterprise branding and admin footer identity (SCRUM-9 AC-A04)', () => {
    render(
      <MemoryRouter>
        <Sidebar collapsed={false} />
      </MemoryRouter>
    )

    expect(screen.getByText('HRMS Enterprise')).toBeInTheDocument()
    expect(screen.getByText('SA')).toBeInTheDocument()
    expect(screen.getByText('Super Admin')).toBeInTheDocument()
    expect(screen.getByText('Admin')).toBeInTheDocument()
  })

  it('triggers logout from footer action (SCRUM-9 regression path)', () => {
    render(
      <MemoryRouter>
        <Sidebar collapsed={false} />
      </MemoryRouter>
    )

    fireEvent.click(screen.getByRole('button', { name: /logout/i }))
    expect(logout).toHaveBeenCalledTimes(1)
  })
})
