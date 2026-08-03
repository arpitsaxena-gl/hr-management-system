import api from '../axios'
import type { DashboardStats } from '../../types'

export const fetchDashboardStats = async (): Promise<DashboardStats> => {
  const res = await api.get('/dashboard')
  return res.data.data
}
