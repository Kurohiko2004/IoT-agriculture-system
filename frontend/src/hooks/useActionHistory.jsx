import { useQuery } from '@tanstack/react-query'
import { API_BASE_URL } from '../config/constants'

export function useActionHistory({ search, status, sortOrder, limit, page }) {

  return useQuery({
    queryKey: ['action-history', search, status, sortOrder, limit, page],
    queryFn: async () => {
    const params = new URLSearchParams({
      ...(status && { status }),
      items: limit,
      page,
      search,
      sortOrder: sortOrder || 'DESC'
    })

    // tường minh:
    // if (status !== undefined && status !== null && status !== '') {
    //   queryParams.status = status;
    // }

    const res = await fetch(`${API_BASE_URL}/actions?${params}`)
    if (!res.ok) throw new Error('Failed to fetch action history')
    return res.json()
},
    keepPreviousData: true,
  })
}