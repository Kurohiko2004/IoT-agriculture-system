import { useEffect, useState } from 'react'
import { useDeviceStore } from '../store/deviceStore'
import { useLatestSensorData, useDevices } from '../hooks/useDashboard'
import SensorCard from '../components/dashboard/SensorCard'
import ControlPanel from '../components/dashboard/ControlPanel'
import { SENSOR_CONFIG, SOCKET_URL } from '../config/constants'
import { Fan, Droplets, Wind, Waves, Lightbulb } from 'lucide-react'
import { io } from 'socket.io-client'
import toast from 'react-hot-toast'
import dayjs from 'dayjs'

const deviceIconMap = {
  'cooling fan':     Fan,
  'misting system':  Droplets,
  'ventilation fan': Wind,
  'water pump':      Waves,
  'light':           Lightbulb,
}

const deviceTypeMap = {
  'cooling fan':     'temperature',
  'misting system':  'humidity',
  'ventilation fan': 'humidity',
  'water pump':      'soil',
  'light':           'light',
}

const deviceDescriptions = {
  'cooling fan':     'Cool down when > 18°C',
  'misting system':  'Increase humidity when < 80%',
  'ventilation fan': 'Reduce humidity when > 90%',
  'water pump':      'Irrigate when < 75%',
  'light':           'Supplement when < 1000 Lux',
}

export default function DashboardPage() {
  const { initDevices, resolveDevice, failDevice } = useDeviceStore()
  const { data: sensorData, isLoading: loadingSensors } = useLatestSensorData()
  const { data: devicesData, isLoading: loadingDevices } = useDevices()

  // Local state for live card values and chart history
  const [liveValues, setLiveValues]   = useState(null)
  const [chartHistory, setChartHistory] = useState([])

  // Seed initial values from REST
  useEffect(() => {
    if (!sensorData) return
    setLiveValues(sensorData.latest)
    setChartHistory(sensorData.history ?? [])
  }, [sensorData])

  // Seed device statuses into Zustand
  useEffect(() => {
    if (!devicesData) return
    initDevices(devicesData)
  }, [devicesData])

  // Socket.io
  useEffect(() => {
    const socket = io(SOCKET_URL)

    // Sensor update — update cards + append to chart
    socket.on('sensor_data_update', (payload) => {
      const { temperature, humidity, lux, createdAt } = payload

      setLiveValues({ temperature, humidity, lux })

      setChartHistory(prev => {
        const newPoints = [
          { type: 'temperature', value: temperature, measuredAt: createdAt },
          { type: 'humidity',    value: humidity,    measuredAt: createdAt },
          { type: 'light',       value: lux,         measuredAt: createdAt },
        ]
        return [...prev, ...newPoints].slice(-60) // keep last 60 raw points
      })
    })

    // Device update — resolve or fail the pending switch
    socket.on('device_status_update', (payload) => {
      const { actionId, status, deviceStatus, message } = payload

      if (status === 'SUCCESS') {
        resolveDevice(actionId, deviceStatus)
      } else {
        failDevice(actionId)
        toast.error(message ?? 'Device action failed')
      }
    })

    return () => socket.disconnect()
  }, [resolveDevice, failDevice])

  if (loadingSensors || loadingDevices) {
    return <div className="text-sm text-gray-400 py-12 text-center">Loading...</div>
  }

  // Build per-type chart data from history
  function getChartData(type) {
    return chartHistory
      .filter(d => d.type === type)
      .slice(-20)
      .map(d => ({
        value: d.value,
        time:  dayjs(d.measuredAt).format('HH:mm:ss'),
      }))
  }

  // Build sensor cards from liveValues
  const sensorCards = [
    { type: 'temperature', value: liveValues?.temperature ?? '--' },
    { type: 'humidity',    value: liveValues?.humidity    ?? '--' },
    { type: 'light',       value: liveValues?.lux         ?? '--' },
  ]

  console.log(devicesData)

  // Group devices for ControlPanel
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
      <div className="col-span-2 flex flex-col gap-4">
        {sensorCards.map(({ type, value }) => (
          <SensorCard
            key={type}
            type={type}
            value={value}
            data={getChartData(type)}
          />
        ))}
      </div>
      <div className="col-span-1">
        <ControlPanel deviceGroups={deviceGroups} />
      </div>
    </div>
  )
}