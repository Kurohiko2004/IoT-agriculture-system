import DeviceSwitch from './DeviceSwitch'

const groupStyles = {
  red:   { border: 'border-red-200',   bg: 'bg-red-50',   label: 'text-red-500'   },
  blue:  { border: 'border-blue-200',  bg: 'bg-blue-50',  label: 'text-blue-500'  },
  green: { border: 'border-green-200', bg: 'bg-green-50', label: 'text-green-500' },
  amber: { border: 'border-amber-200', bg: 'bg-amber-50', label: 'text-amber-500' },
}

export default function DeviceGroup({ title, color, devices }) {
  const style = groupStyles[color] ?? groupStyles.blue

  return (
    <div className={`rounded-xl border ${style.border} ${style.bg} p-4 mb-3`}>
      <p className={`text-xs font-bold tracking-widest uppercase mb-2 ${style.label}`}>
        {title}
      </p>
      <div className="bg-white rounded-lg px-4 divide-y divide-gray-100">
        {devices.map(device => (
          <DeviceSwitch key={device.id} device={device} />
        ))}
      </div>
    </div>
  )
}