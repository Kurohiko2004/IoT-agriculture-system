import { useQuery } from '@tanstack/react-query'
import { API_BASE_URL } from '../config/constants'

export function useLatestSensorData() {
  return useQuery({
    queryKey: ['latest-sensor-data'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/sensor-data/latest`)
      if (!res.ok) throw new Error('Failed to fetch latest sensor data')
      return res.json()
      // returns { latest: { temperature, humidity, lux }, history: [], lastUpdate }
    },
  })
}

export function useDevices() {
  return useQuery({
    queryKey: ['devices'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/devices/status`)
      if (!res.ok) throw new Error('Failed to fetch devices')
      const json = await res.json()
      return json.data  // unwrap here
    },
  })
}