import { Outlet } from 'react-router-dom'
import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'

const mockAuth = vi.hoisted(() => ({
  fetchMe: vi.fn(),
  logout: vi.fn(),
}))

vi.mock('./store/authStore', () => ({
  useAuthStore: () => ({
    isAuthenticated: true,
    token: 'test-token',
    fetchMe: mockAuth.fetchMe,
    logout: mockAuth.logout,
  }),
}))

vi.mock('./components/layout/Layout', () => ({
  default: function MockLayout() {
    return (
      <div data-testid="layout-shell">
        <Outlet />
      </div>
    )
  },
}))

vi.mock('./pages/dashboard/DashboardPage', () => ({
  default: function MockDashboardPage() {
    return <h1>Dashboard Page Mock</h1>
  },
}))

describe('App routing', () => {
  beforeEach(() => {
    mockAuth.fetchMe.mockClear()
    window.history.pushState({}, '', '/dashboard')
  })

  it('keeps /dashboard routed through private layout (SCRUM-9 AC-A01)', () => {
    render(<App />)

    expect(screen.getByTestId('layout-shell')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Dashboard Page Mock' })).toBeInTheDocument()
    expect(mockAuth.fetchMe).toHaveBeenCalledTimes(1)
  })
})
