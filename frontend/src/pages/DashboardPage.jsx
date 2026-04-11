import { useEffect, useState } from 'react'
import { useDeviceStore } from '../store/deviceStore'
import { useLatestSensorData, useDevices } from '../hooks/useDashboard'
import SensorCard from '../components/dashboard/SensorCard'
import ControlPanel from '../components/dashboard/ControlPanel'
import { Fan, Droplets, Wind, Waves, Lightbulb } from 'lucide-react'
import { useDashboardSocket } from '../hooks/useDashboardSocket'
import toast from 'react-hot-toast'
import dayjs from 'dayjs'

import { SENSOR_CONFIG, SOCKET_URL } from '../config/constants'

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
  'water pump':      'moisture', // Updated from 'soil' to 'moisture' to match SENSOR_CONFIG
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

  // Combined state to avoid cascading renders
  const [dashboardData, setDashboardData] = useState({
    liveValues: null,
    chartHistory: { temperature: [], humidity: [], moisture: [], light: [] }
  })

  // Seed initial values from REST
  useEffect(() => {
    if (!sensorData) return

    const grouped = { temperature: [], humidity: [], moisture: [], light: [] }
    for (const point of sensorData.history ?? []) {
      if (grouped[point.type]) {
        grouped[point.type].push({
          value: point.value,
          measuredAt: point.measuredAt ?? point.createdAt,
        })
      }
    }

    setDashboardData({
      liveValues: sensorData.latest,
      chartHistory: grouped,
    })
  }, [sensorData])

  // Seed device statuses into Zustand
  useEffect(() => {
    if (!devicesData) return
    initDevices(devicesData)
  }, [devicesData, initDevices])

  // Socket.io
  useDashboardSocket({
    onSensorUpdate: ({ temperature, humidity, lux, moisture, createdAt }) => {
      setDashboardData(prev => ({
        liveValues: { temperature, humidity, lux, moisture },
        chartHistory: {
          temperature: [...prev.chartHistory.temperature, { value: temperature, measuredAt: createdAt }].slice(-20),
          humidity:    [...prev.chartHistory.humidity,    { value: humidity,    measuredAt: createdAt }].slice(-20),
          moisture:    [...prev.chartHistory.moisture,    { value: moisture,    measuredAt: createdAt }].slice(-20),
          light:       [...prev.chartHistory.light,       { value: lux,         measuredAt: createdAt }].slice(-20),
        }
      }))
    },
    onDeviceUpdate: ({ actionId, status, deviceStatus, message }) => {
      if (status === 'SUCCESS') {
        resolveDevice(actionId, deviceStatus)
      } else {
        failDevice(actionId)
        toast.error(message ?? 'Device action failed')
      }
    },
  })

  if (loadingSensors || loadingDevices) {
    return <div className="text-sm text-gray-400 py-12 text-center">Loading...</div>
  }

  // Build per-type chart data from history
  function getChartData(type) {
    return (dashboardData.chartHistory[type] ?? []).map(d => ({
      value: d.value,
      time:  dayjs(d.measuredAt).format('HH:mm:ss'),
    }))
  }

  // Build sensor cards from liveValues
  const sensorCards = [
    { type: 'temperature', value: dashboardData.liveValues?.temperature ?? '--' },
    { type: 'humidity',    value: dashboardData.liveValues?.humidity    ?? '--' },
    { type: 'moisture',    value: dashboardData.liveValues?.moisture    ?? '--' },
    { type: 'light',       value: dashboardData.liveValues?.lux         ?? '--' },
  ]

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
