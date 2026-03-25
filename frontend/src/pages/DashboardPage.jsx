import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useLatestSensorData, useDevices } from '../hooks/useDashboard'
import SensorCard from '../components/dashboard/SensorCard'
import ControlPanel from '../components/dashboard/ControlPanel'
import { SENSOR_CONFIG } from '../config/constants'
import { Fan, Droplets, Wind, Waves, Lightbulb } from 'lucide-react'
import io from 'socket.io-client'

const SOCKET_URL = 'http://localhost:3000'

// Map device names to lucide icons
const deviceIconMap = {
  'cooling fan':     Fan,
  'misting system':  Droplets,
  'ventilation fan': Wind,
  'water pump':      Waves,
  'light':           Lightbulb,
}

// Map device names to sensor types (for grouping)
const deviceTypeMap = {
  'cooling fan':     'temperature',
  'misting system':  'humidity',
  'ventilation fan': 'humidity',
  'water pump':      'soil',
  'light':           'light',
}

export default function DashboardPage() {
  const queryClient = useQueryClient()
  const { data: sensorData, isLoading: loadingSensors } = useLatestSensorData()
  const { data: devicesData, isLoading: loadingDevices } = useDevices()

  // Socket.io — real-time sensor updates
  useEffect(() => {
    const socket = io(SOCKET_URL)
    socket.on('sensor-update', () => {
      queryClient.invalidateQueries({ queryKey: ['latest-sensor-data'] })
    })
    return () => socket.disconnect()
  }, [queryClient])

  if (loadingSensors || loadingDevices) {
    return <div className="text-sm text-gray-400 py-12 text-center">Loading...</div>
  }

  // Group devices by sensor type for ControlPanel
  const deviceGroups = Object.keys(SENSOR_CONFIG).map(type => ({
    type,
    devices: (devicesData ?? [])
      .filter(d => deviceTypeMap[d.name?.toLowerCase()] === type)
      .map(d => ({
        ...d,
        icon:        deviceIconMap[d.name?.toLowerCase()],
        description: deviceDescriptions[d.name?.toLowerCase()] ?? '',
      })),
  })).filter(g => g.devices.length > 0)

  return (
    <div className="grid grid-cols-3 gap-6">
      {/* Sensor Cards — left 2/3 */}
      <div className="col-span-2 flex flex-col gap-4">
        {(sensorData ?? []).map(sensor => (
          <SensorCard
            key={sensor.type}
            type={sensor.type}
            value={sensor.value}
            data={sensor.history ?? []}
          />
        ))}
      </div>

      {/* Control Panel — right 1/3 */}
      <div className="col-span-1">
        <ControlPanel deviceGroups={deviceGroups} />
      </div>
    </div>
  )
}

const deviceDescriptions = {
  'cooling fan':     'Cool down when > 18°C',
  'misting system':  'Increase humidity when < 80%',
  'ventilation fan': 'Reduce humidity when > 90%',
  'water pump':      'Irrigate when < 75%',
  'light':           'Supplement when < 1000 Lux',
}