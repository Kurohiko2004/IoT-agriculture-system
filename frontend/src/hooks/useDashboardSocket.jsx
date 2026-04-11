import { useEffect } from 'react'
import { io } from 'socket.io-client'
import { SOCKET_URL } from '../config/constants'
import toast from 'react-hot-toast'

export function useDashboardSocket({ onSensorUpdate, onDeviceUpdate }) {
  useEffect(() => {
    const socket = io(SOCKET_URL)

    socket.on('sensor_data_update', (payload) => {
      onSensorUpdate(payload)
    })

    socket.on('device_status_update', (payload) => {
      onDeviceUpdate(payload)
    })

    socket.on('connect_error', () => {
      toast.error('Lost connection to server')
    })

    return () => socket.disconnect()
  }, []) 
}
