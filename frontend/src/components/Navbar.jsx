import { NavLink } from 'react-router-dom'
import { ROUTES } from '../config/constants'

const links = [
  { to: ROUTES.DASHBOARD,      label: 'Dashboard' },
  { to: ROUTES.SENSOR_DATA,    label: 'Sensor Data' },
  { to: ROUTES.ACTION_HISTORY, label: 'Action History' },
  { to: ROUTES.DEVICE_STATS,   label: 'Device Stats' },
  { to: ROUTES.PROFILE,        label: 'Profile' },
]

export default function Navbar() {
  return (
    <nav className="bg-white border-b border-gray-200 px-6">
      <div className="max-w-7xl mx-auto flex items-center gap-8 h-14">
        {links.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            end
            className={({ isActive }) =>
              isActive
                ? 'text-sm font-bold text-gray-900 border-b-2 border-gray-900 pb-1'
                : 'text-sm text-gray-500 hover:text-gray-700 pb-1'
            }
          >
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}