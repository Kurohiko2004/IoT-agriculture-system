import { Settings } from 'lucide-react'
import DeviceGroup from './DeviceGroup'
import { SENSOR_CONFIG } from '../../config/constants'

export default function ControlPanel({ deviceGroups }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center gap-2 mb-4">
        <Settings size={18} className="text-gray-600" />
        <h2 className="text-base font-bold text-gray-900">Control Panel</h2>
      </div>

      {deviceGroups.map(group => {
        const config = SENSOR_CONFIG[group.type]
        return (
          <DeviceGroup
            key={group.type}
            title={config?.label ?? group.type}
            color={config?.color ?? 'blue'}
            devices={group.devices}
          />
        )
      })}
    </div>
  )
}