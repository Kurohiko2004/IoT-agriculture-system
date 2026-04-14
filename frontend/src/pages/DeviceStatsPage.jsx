import { useState, useMemo } from 'react'
import dayjs from 'dayjs'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { useDeviceStats } from '../hooks/useDeviceStats'

// Màu sắc cho từng thiết bị (tối đa 8 device)
const DEVICE_COLORS = [
  { on: '#22c55e', off: '#86efac' },
  { on: '#3b82f6', off: '#93c5fd' },
  { on: '#f59e0b', off: '#fcd34d' },
  { on: '#ef4444', off: '#fca5a5' },
  { on: '#8b5cf6', off: '#c4b5fd' },
  { on: '#06b6d4', off: '#67e8f9' },
  { on: '#f97316', off: '#fdba74' },
  { on: '#ec4899', off: '#f9a8d4' },
]

const ACTION_FILTERS = [
  { value: 'ALL', label: 'Tất cả' },
  { value: 'ON',  label: 'ON'     },
  { value: 'OFF', label: 'OFF'    },
]

// Build danh sách ngày trong khoảng from → to
function buildDateRange(from, to) {
  const dates = []
  let cur = dayjs(from)
  const end = dayjs(to)
  while (!cur.isAfter(end)) {
    dates.push(cur.format('YYYY-MM-DD'))
    cur = cur.add(1, 'day')
  }
  return dates
}

// Transform dữ liệu API → format Recharts, lọc theo actionFilter
function buildChartData(apiData, from, to, actionFilter) {
  if (!apiData?.length) return []

  const allDates = buildDateRange(from, to)
  const dateMap = {}
  for (const date of allDates) dateMap[date] = { date }

  for (const device of apiData) {
    for (const stat of device.stats) {
      if (!dateMap[stat.date]) dateMap[stat.date] = { date: stat.date }
      if (actionFilter !== 'OFF')
        dateMap[stat.date][`${device.deviceName} ON`]  = stat.TURN_ON  ?? 0
      if (actionFilter !== 'ON')
        dateMap[stat.date][`${device.deviceName} OFF`] = stat.TURN_OFF ?? 0
    }
  }

  return allDates.map((d) => ({ ...dateMap[d], label: dayjs(d).format('DD/MM') }))
}

export default function DeviceStatsPage() {
  const today   = dayjs().format('YYYY-MM-DD')
  const weekAgo = dayjs().subtract(6, 'day').format('YYYY-MM-DD')

  const [from,         setFrom]         = useState(weekAgo)
  const [to,           setTo]           = useState(today)
  const [actionFilter, setActionFilter] = useState('ALL')   // 'ALL' | 'ON' | 'OFF'

  const { data, isLoading, isError } = useDeviceStats({ from, to })

  const apiData   = data?.data ?? []
  const chartData = useMemo(
    () => buildChartData(apiData, from, to, actionFilter),
    [apiData, from, to, actionFilter]
  )

  // Tổng (tính dựa trên filter hiện tại)
  const totals = useMemo(() => {
    let totalOn = 0, totalOff = 0
    for (const device of apiData) {
      for (const stat of device.stats) {
        totalOn  += stat.TURN_ON  ?? 0
        totalOff += stat.TURN_OFF ?? 0
      }
    }
    const shown = actionFilter === 'ON' ? totalOn : actionFilter === 'OFF' ? totalOff : totalOn + totalOff
    return { totalOn, totalOff, shown }
  }, [apiData, actionFilter])

  const showOnBars  = actionFilter !== 'OFF'
  const showOffBars = actionFilter !== 'ON'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Device Toggle Statistics</h1>
        <p className="text-sm text-gray-500 mt-1">Số lần bật / tắt thiết bị theo ngày</p>
      </div>

      {/* Filter bar: date range + ON/OFF toggle */}
      <div className="flex items-center gap-4 flex-wrap">
        {/* Từ ngày */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-600">Từ ngày</label>
          <input
            type="date"
            value={from}
            max={to}
            onChange={(e) => setFrom(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
          />
        </div>

        {/* Đến ngày */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-600">Đến ngày</label>
          <input
            type="date"
            value={to}
            min={from}
            max={today}
            onChange={(e) => setTo(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
          />
        </div>

        {/* Divider */}
        <div className="h-6 w-px bg-gray-300" />

        {/* ON / OFF / All toggle button group */}
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          {ACTION_FILTERS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setActionFilter(value)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-150 ${
                actionFilter === value
                  ? value === 'ON'
                    ? 'bg-green-500 text-white shadow-sm'
                    : value === 'OFF'
                    ? 'bg-red-500 text-white shadow-sm'
                    : 'bg-white text-gray-800 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            label: 'Tổng lần BẬT',
            value: totals.totalOn,
            color: actionFilter === 'OFF' ? 'text-gray-400' : 'text-green-600',
            bg:    actionFilter === 'OFF' ? 'bg-gray-50'    : 'bg-green-50',
          },
          {
            label: 'Tổng lần TẮT',
            value: totals.totalOff,
            color: actionFilter === 'ON'  ? 'text-gray-400' : 'text-red-500',
            bg:    actionFilter === 'ON'  ? 'bg-gray-50'    : 'bg-red-50',
          },
          {
            label: actionFilter === 'ALL' ? 'Tổng hành động' : `Đang xem: ${actionFilter}`,
            value: totals.shown,
            color: 'text-blue-600',
            bg:    'bg-blue-50',
          },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className={`${bg} rounded-xl p-5 border border-gray-100 transition-all`}>
            <p className="text-sm text-gray-500">{label}</p>
            <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        {/* Left Side: Per-device breakdown table */}
        <div className="xl:col-span-1">
          {!isLoading && !isError && apiData.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="text-base font-semibold text-gray-800">Chi tiết theo thiết bị</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      <th className="px-6 py-3">Thiết bị</th>
                      {actionFilter !== 'OFF' && (
                        <th className="px-6 py-3 text-green-600">Tổng lần BẬT</th>
                      )}
                      {actionFilter !== 'ON' && (
                        <th className="px-6 py-3 text-red-500">Tổng lần TẮT</th>
                      )}
                      <th className="px-6 py-3">Tổng hành động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {apiData.map((device) => {
                      const on  = device.stats.reduce((s, d) => s + (d.TURN_ON  ?? 0), 0)
                      const off = device.stats.reduce((s, d) => s + (d.TURN_OFF ?? 0), 0)
                      const shown = actionFilter === 'ON' ? on : actionFilter === 'OFF' ? off : on + off
                      return (
                        <tr key={device.deviceId} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-3 font-medium text-gray-800 capitalize">{device.deviceName}</td>
                          {actionFilter !== 'OFF' && (
                            <td className="px-6 py-3 text-green-600 font-semibold">{on}</td>
                          )}
                          {actionFilter !== 'ON' && (
                            <td className="px-6 py-3 text-red-500 font-semibold">{off}</td>
                          )}
                          <td className="px-6 py-3 text-gray-700 font-semibold">{shown}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Chart */}
        <div className="xl:col-span-2">
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-base font-semibold text-gray-800">
                Biểu đồ số lần
                {actionFilter === 'ON' ? ' BẬT' : actionFilter === 'OFF' ? ' TẮT' : ' bật / tắt'}
                {' '}theo ngày
              </h2>
              {actionFilter !== 'ALL' && (
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                  actionFilter === 'ON' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                }`}>
                  Lọc: {actionFilter}
                </span>
              )}
            </div>

            {isError && (
              <p className="text-red-500 text-sm text-center py-12">Không thể tải dữ liệu.</p>
            )}
            {isLoading && (
              <div className="text-sm text-gray-400 text-center py-20">Đang tải...</div>
            )}
            {!isLoading && !isError && chartData.length === 0 && (
              <div className="text-sm text-gray-400 text-center py-20">
                Không có dữ liệu trong khoảng thời gian này.
              </div>
            )}

            {!isLoading && !isError && chartData.length > 0 && (
              <ResponsiveContainer width="100%" height={380}>
                <BarChart
                  data={chartData}
                  margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                  barCategoryGap="30%"
                  barGap={2}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: 13 }}
                    cursor={{ fill: '#f9fafb' }}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: 12, paddingTop: 16 }}
                    formatter={(value) => <span className="capitalize text-gray-600">{value}</span>}
                  />

                  {apiData.map((device, idx) => {
                    const colors = DEVICE_COLORS[idx % DEVICE_COLORS.length]
                    return [
                      showOnBars && (
                        <Bar
                          key={`${device.deviceName}-ON`}
                          dataKey={`${device.deviceName} ON`}
                          name={`${device.deviceName} ON`}
                          fill={colors.on}
                          radius={[4, 4, 0, 0]}
                        />
                      ),
                      showOffBars && (
                        <Bar
                          key={`${device.deviceName}-OFF`}
                          dataKey={`${device.deviceName} OFF`}
                          name={`${device.deviceName} OFF`}
                          fill={colors.off}
                          radius={[4, 4, 0, 0]}
                        />
                      ),
                    ].filter(Boolean)
                  })}
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
