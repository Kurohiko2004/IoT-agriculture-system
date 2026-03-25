import { useQuery } from '@tanstack/react-query'
import { API_BASE_URL } from '../config/constants'

export function useSensorData({ search, type, sortOrder, limit, page }) {
  const offset = (page - 1) * limit

  return useQuery({
    queryKey: ['sensor-data', search, type, sortOrder, limit, page],
    queryFn: async () => {
      const params = new URLSearchParams({
        ...(search    && { search }),
        ...(type      && { type }),
        sortBy: 'measuredAt',
        sortOrder,
        limit,
        offset,
      })
      const res = await fetch(`${API_BASE_URL}/sensor-data?${params}`)
      if (!res.ok) throw new Error('Failed to fetch sensor data')
      return res.json()
    },
    keepPreviousData: true,
  })
}