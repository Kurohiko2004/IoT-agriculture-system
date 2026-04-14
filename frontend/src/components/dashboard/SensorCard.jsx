import {
  ResponsiveContainer, LineChart, Line, ReferenceLine, Tooltip, XAxis,
} from 'recharts'
import { SENSOR_CONFIG } from '../../config/constants'

export default function SensorCard({ type, value, data }) {
  const config = SENSOR_CONFIG[type]
  if (!config) return null

  const Icon = config.icon

  const iconBgMap = {
    red:   'bg-red-500',
    blue:  'bg-blue-500',
    green: 'bg-green-500',
    amber: 'bg-amber-500',
  }

  /**
   * FIX: data is already mapped to { value, time } in DashboardPage's getChartData().
   * We use the prop directly to avoid re-formatting undefined fields.
   */
  const chartData = data

  return (
      <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-6">
        {/* Icon + value */}
        <div className="flex items-center gap-4 min-w-[160px]">
          <div className={`${iconBgMap[config.color]} p-3 rounded-full text-white`}>
            <Icon size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">{config.label}</p>
            <p className="text-2xl font-bold text-gray-900">
              {value}{config.unit}
            </p>
          </div>
        </div>

        {/* Chart */}
        <div className="flex-1 h-28">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
                data={chartData}
                margin={{ top: 5, right: 10, left: 10, bottom: 0 }}
            >
              {/* XAxis with dataKey="time" allows the Tooltip to anchor correctly */}
              <XAxis dataKey="time" hide />

              <Tooltip
                  contentStyle={{ fontSize: 12 }}
                  formatter={(val) => [`${val}${config.unit}`, config.label]}
                  labelFormatter={(label) => `Measured at: ${label}`}
              />

              <ReferenceLine
                  y={config.threshold}
                  stroke={config.chartColor}
                  strokeDasharray="4 4"
                  strokeOpacity={0.6}
              />

              <Line
                  type="monotone"
                  dataKey="value"
                  stroke={config.chartColor}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                  isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
  )
}