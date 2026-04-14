import { useQuery } from '@tanstack/react-query'
import { API_BASE_URL } from '../config/constants'

/**
 * Fetch số lần bật/tắt thiết bị theo ngày.
 * @param {string} from - YYYY-MM-DD
 * @param {string} to   - YYYY-MM-DD
 */
export function useDeviceStats({ from, to }) {
  return useQuery({
    queryKey: ['device-stats', from, to],
    queryFn: async () => {
      const params = new URLSearchParams({ from, to })
      const res = await fetch(`${API_BASE_URL}/stats/device-toggles?${params}`)
      if (!res.ok) throw new Error('Failed to fetch device stats')
      return res.json()
    },
    enabled: !!from && !!to,
    keepPreviousData: true,
  })
}
