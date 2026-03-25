import { useState } from 'react'
import { API_BASE_URL } from '../../config/constants'
import { useDeviceStore } from '../../store/deviceStore'

export default function DeviceSwitch({ device }) {
  const { devices, setDeviceStatus } = useDeviceStore()
  const status = devices[device.id] ?? device.status
  const isPending = status === 'PENDING'
  const isOn      = status === 'ON'

  const Icon = device.icon

  async function handleToggle() {
    if (isPending) return
    const action = isOn ? 'OFF' : 'ON'
    setDeviceStatus(device.id, 'PENDING')
    try {
      const res = await fetch(`${API_BASE_URL}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceId: device.id, action }),
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      setDeviceStatus(device.id, data.status ?? action)
    } catch {
      setDeviceStatus(device.id, isOn ? 'ON' : 'OFF')
    }
  }

  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-center gap-3">
        {Icon && <Icon size={18} className="text-gray-500" />}
        <div>
          <p className="text-sm font-medium text-gray-800">{device.name}</p>
          <p className="text-xs text-gray-400">{device.description}</p>
        </div>
      </div>

      {/* Toggle */}
      <button
        onClick={handleToggle}
        disabled={isPending}
        className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none
          ${isPending ? 'bg-amber-400 animate-pulse' : isOn ? 'bg-blue-500' : 'bg-gray-300'}`}
      >
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200
          ${isOn || isPending ? 'translate-x-5' : 'translate-x-0'}`}
        />
      </button>
    </div>
  )
}