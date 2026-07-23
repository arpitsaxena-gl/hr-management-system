import { beforeEach, describe, expect, it, vi } from 'vitest'
import api from '../lib/axios'
import { useAuthStore } from './authStore'

vi.mock('../lib/axios', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
  },
}))

const mockedApi = vi.mocked(api)

const resetAuthState = () => {
  useAuthStore.setState({
    user: null,
    token: null,
    refreshToken: null,
    isAuthenticated: false,
    isLoading: false,
  })
}

describe('useAuthStore', () => {
  beforeEach(() => {
    resetAuthState()
    vi.clearAllMocks()
  })

  it('keeps sensitive tokens out of browser storage during login', async () => {
    // SCRUM-6 AC-5 / analysis finding: browser token handling is hardened.
    mockedApi.post.mockResolvedValueOnce({
      data: {
        data: {
          token: 'jwt-token',
          refreshToken: 'refresh-token',
          user: { id: 'emp-1', email: 'jane@example.com', firstName: 'Jane', lastName: 'Doe' },
        },
      },
    } as never)

    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem')

    await useAuthStore.getState().login('jane@example.com', 'secret')

    expect(useAuthStore.getState().isAuthenticated).toBe(true)
    expect(useAuthStore.getState().user).toMatchObject({
      id: 'emp-1',
      email: 'jane@example.com',
    })
    expect(setItemSpy).not.toHaveBeenCalledWith('token', expect.any(String))
    expect(setItemSpy).not.toHaveBeenCalledWith('refreshToken', expect.any(String))
  })

  it('clears auth state on logout', () => {
    // SCRUM-6 regression guard: logout should always reset the store.
    useAuthStore.setState({
      user: { id: 'emp-1', email: 'jane@example.com' } as never,
      token: 'jwt-token',
      refreshToken: 'refresh-token',
      isAuthenticated: true,
      isLoading: false,
    })

    useAuthStore.getState().logout()

    expect(useAuthStore.getState().user).toBeNull()
    expect(useAuthStore.getState().token).toBeNull()
    expect(useAuthStore.getState().refreshToken).toBeNull()
    expect(useAuthStore.getState().isAuthenticated).toBe(false)
  })
})
