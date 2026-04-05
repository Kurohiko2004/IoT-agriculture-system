import { API_BASE_URL } from '../../config/constants'
import { useDeviceStore } from '../../store/deviceStore'

export default function DeviceSwitch({ device, color }) {
  const { devices, setDevicePending } = useDeviceStore()

  const deviceState = devices[device.id]
  const status      = deviceState?.status ?? device.status
  const isPending   = status === 'PENDING'
  const isOn        = status === 'ON'

  const Icon = device.icon

  // Map color name to Tailwind bg class
  const colorMap = {
    red:   'bg-red-500',
    blue:  'bg-blue-500',
    green: 'bg-green-500',
    amber: 'bg-amber-500',
  }
  const onColor = colorMap[color] ?? 'bg-blue-500'

  async function handleToggle() {
    if (isPending) return
    const action = isOn ? 'TURN_OFF' : 'TURN_ON'
    try {
      const res = await fetch(`${API_BASE_URL}/devices/${device.id}/action`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ action }),
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      setDevicePending(device.id, data.actionId)
    } catch {
      console.error('Failed to send action')
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

        <button
            onClick={handleToggle}
            disabled={isPending}
            className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none
          ${isPending
                ? 'bg-amber-400 animate-pulse cursor-not-allowed'
                : isOn ? onColor : 'bg-gray-300'
            }`}
        >
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow
          transition-transform duration-200
          ${isOn || isPending ? 'translate-x-5' : 'translate-x-0'}`}
        />
        </button>
      </div>
  )
}