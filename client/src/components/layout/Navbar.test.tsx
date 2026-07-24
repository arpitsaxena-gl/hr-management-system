import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Navbar } from './Navbar'

describe('Navbar', () => {
  it('renders quick search, notifications, and admin identity (SCRUM-9 AC-A05)', () => {
    const onMenuToggle = vi.fn()
    render(<Navbar onMenuToggle={onMenuToggle} />)

    expect(screen.getByPlaceholderText('Quick search...')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Notifications' })).toBeInTheDocument()
    expect(screen.getByText('SA')).toBeInTheDocument()
    expect(screen.getByText('Super Admin')).toBeInTheDocument()
    expect(screen.getByText('Admin')).toBeInTheDocument()
  })

  it('invokes menu toggle from hamburger action (SCRUM-9 AC-A05)', () => {
    const onMenuToggle = vi.fn()
    render(<Navbar onMenuToggle={onMenuToggle} />)

    fireEvent.click(screen.getByRole('button', { name: 'Toggle sidebar' }))
    expect(onMenuToggle).toHaveBeenCalledTimes(1)
  })
})
