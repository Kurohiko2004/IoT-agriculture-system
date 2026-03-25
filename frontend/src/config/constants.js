import { Thermometer, Droplets, Sprout, Sun } from 'lucide-react'

export const API_BASE_URL = 'http://localhost:3000/api'

export const SENSOR_CONFIG = {
  temperature: {
    label: 'Temperature',
    unit: '°C',
    icon: Thermometer,
    color: 'red',
    threshold: 30,
    chartColor: '#ef4444',
  },
  humidity: {
    label: 'Humidity',
    unit: '%',
    icon: Droplets,
    color: 'blue',
    threshold: 40,
    chartColor: '#3b82f6',
  },
  soil: {
    label: 'Soil Moisture',
    unit: '%',
    icon: Sprout,
    color: 'green',
    threshold: 40,
    chartColor: '#22c55e',
  },
  light: {
    label: 'Light Intensity',
    unit: 'Lux',
    icon: Sun,
    color: 'amber',
    threshold: 20,
    chartColor: '#f59e0b',
  },
}

export const DEVICE_NAMES = [
  'cooling fan',
  'misting system',
  'ventilation fan',
  'water pump',
  'light',
]

export const ROUTES = {
  DASHBOARD: '/',
  SENSOR_DATA: '/sensor-data',
  ACTION_HISTORY: '/action-history',
  PROFILE: '/profile',
}