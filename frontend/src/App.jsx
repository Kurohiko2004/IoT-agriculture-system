import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import { ROUTES } from './config/constants'
import { Toaster } from 'react-hot-toast'

import SensorDataPage from './pages/SensorDataPage'
import ActionHistoryPage from './pages/ActionHistoryPage'
import DashboardPage from './pages/DashboardPage'
import ProfilePage from './pages/ProfilePage'
import DeviceStatsPage from './pages/DeviceStatsPage'



export default function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Toaster position="top-right" />
      <Navbar />
      <main className="max-w-7xl mx-auto px-6 py-6">
        <Routes>
          <Route path={ROUTES.DASHBOARD}      element={<DashboardPage />} />
          <Route path={ROUTES.SENSOR_DATA}    element={<SensorDataPage />} />
          <Route path={ROUTES.ACTION_HISTORY} element={<ActionHistoryPage />} />
          <Route path={ROUTES.DEVICE_STATS}   element={<DeviceStatsPage />} />
          <Route path={ROUTES.PROFILE}        element={<ProfilePage />} />

        </Routes>
      </main>
    </div>
  )
}