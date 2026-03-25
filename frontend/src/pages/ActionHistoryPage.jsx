import { useState } from 'react'
import { useActionHistory } from '../hooks/useActionHistory'
import FilterBar from '../components/shared/FilterBar'
import DataTable from '../components/shared/DataTable'
import StatusBadge from '../components/shared/StatusBadge'
import { DEVICE_NAMES } from '../config/constants'
import dayjs from 'dayjs'

const columns = [
  { key: 'deviceId',     label: 'DEVICE ID' },
  { key: 'device.name',  label: 'DEVICE' },
  { key: 'action',       label: 'ACTION' },
  { key: 'status',       label: 'STATUS' },
  { key: 'interactedAt', label: 'TIMESTAMP' },
]

const deviceOptions = DEVICE_NAMES.map(name => ({
  value: name,
  label: name.charAt(0).toUpperCase() + name.slice(1),
}))

export default function ActionHistoryPage() {
  const [search,     setSearch]     = useState('')
  const [deviceName, setDeviceName] = useState('')
  const [limit,      setLimit]      = useState(5)
  const [page,       setPage]       = useState(1)

  const { data, isLoading, isError } = useActionHistory({
    search, deviceName, limit, page,
  })

  const rows       = data?.rows  ?? []
  const totalCount = data?.count ?? 0
  const totalPages = Math.ceil(totalCount / limit) || 1

  function handleFilterChange(setter) {
    return (val) => { setter(val); setPage(1) }
  }

  function cellRenderer(colKey, row) {
    if (colKey === 'device.name') {
      return (
        <span className="capitalize">{row.device?.name}</span>
      )
    }
    if (colKey === 'action') {
      return <StatusBadge value={row.action} />
    }
    if (colKey === 'status') {
      return <StatusBadge value={row.status} />
    }
    if (colKey === 'interactedAt') {
      return dayjs(row.interactedAt).format('MMM DD, YYYY - HH:mm:ss')
    }
  }

  return (
    <div>
      <FilterBar
        search={search}               onSearchChange={handleFilterChange(setSearch)}
        typeLabel="Name"
        typeOptions={deviceOptions}
        typeValue={deviceName}        onTypeChange={handleFilterChange(setDeviceName)}
        showSort={false}
        limitValue={limit}            onLimitChange={handleFilterChange(setLimit)}
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