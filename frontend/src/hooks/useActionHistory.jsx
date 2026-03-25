import { useQuery } from '@tanstack/react-query'
import { API_BASE_URL } from '../config/constants'

export function useActionHistory({ search, deviceName, limit, page }) {
  const offset = (page - 1) * limit

  return useQuery({
    queryKey: ['action-history', search, deviceName, limit, page],
    queryFn: async () => {
      const params = new URLSearchParams({
        ...(search     && { search }),
        ...(deviceName && { deviceName }),
        limit,
        offset,
      })
      const res = await fetch(`${API_BASE_URL}/action?${params}`)
      if (!res.ok) throw new Error('Failed to fetch action history')
      return res.json()
    },
    keepPreviousData: true,
  })
}