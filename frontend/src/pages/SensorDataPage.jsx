import { useState } from 'react'
import { useSensorData } from '../hooks/useSensorData'
import FilterBar from '../components/shared/FilterBar'
import DataTable from '../components/shared/DataTable'
import { SENSOR_CONFIG } from '../config/constants'
import dayjs from 'dayjs'

const columns = [
  { key: 'id',          label: 'SENSOR ID' },
  { key: 'sensor.name', label: 'SENSOR NAME' },
  { key: 'value',       label: 'VALUE' },
  { key: 'measuredAt',  label: 'TIMESTAMP' },
]

const typeOptions = Object.entries(SENSOR_CONFIG).map(([value, cfg]) => ({
  value,
  label: cfg.label,
}))

const valueColorMap = {
  temperature: 'text-red-500 font-bold',
  humidity:    'text-blue-500 font-bold',
  light:       'text-amber-500 font-bold',
  soil:        'text-green-500 font-bold',
}

export default function SensorDataPage() {
  const [search,    setSearch]    = useState('')
  const [type,      setType]      = useState('')
  const [sortOrder, setSortOrder] = useState('DESC')
  const [limit,     setLimit]     = useState(10)
  const [page,      setPage]      = useState(1)

  const { data, isLoading, isError } = useSensorData({
    search, type, sortOrder, limit, page,
  })

  const rows       = data?.rows  ?? []
  const totalCount = data?.count ?? 0
  const totalPages = Math.ceil(totalCount / limit) || 1

  // Reset to page 1 whenever filters change
  function handleFilterChange(setter) {
    return (val) => { setter(val); setPage(1) }
  }

  function cellRenderer(colKey, row) {
    if (colKey === 'sensor.name') return row.sensor?.name
    if (colKey === 'value') {
      return (
        <span className={valueColorMap[row.type] ?? 'text-gray-700'}>
          {row.value}
          {SENSOR_CONFIG[row.type]?.unit
            ? ` ${SENSOR_CONFIG[row.type].unit}`
            : ''}
        </span>
      )
    }
    if (colKey === 'measuredAt') {
      return dayjs(row.measuredAt).format('MMM DD, YYYY - HH:mm:ss')
    }
  }

  return (
    <div>
      <FilterBar
        search={search}             onSearchChange={handleFilterChange(setSearch)}
        typeLabel="Type"
        typeOptions={typeOptions}
        typeValue={type}            onTypeChange={handleFilterChange(setType)}
        showSort
        sortValue={sortOrder}       onSortChange={handleFilterChange(setSortOrder)}
        limitValue={limit}          onLimitChange={handleFilterChange(setLimit)}
      />

      {isError && (
        <p className="text-red-500 text-sm mb-3">Failed to load data.</p>
      )}

      {isLoading ? (
        <div className="text-sm text-gray-400 py-12 text-center">Loading...</div>
      ) : (
        <DataTable
          columns={columns}
          rows={rows}
          cellRenderer={cellRenderer}
          currentPage={page}
          totalPages={totalPages}
          totalCount={totalCount}
          limit={limit}
          onPageChange={setPage}
        />
      )}
    </div>
  )
}