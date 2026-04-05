import { useState } from 'react'
import { useActionHistory } from '../hooks/useActionHistory'
import FilterBar from '../components/shared/FilterBar'
import DataTable from '../components/shared/DataTable'
import StatusBadge from '../components/shared/StatusBadge'
import dayjs from 'dayjs'

const columns = [
  { key: 'id',           label: 'ID' },
  { key: 'device.name',  label: 'DEVICE NAME' },
  { key: 'action',       label: 'ACTION' },
  { key: 'status',       label: 'STATUS' },
  { key: 'interactedAt', label: 'INTERACTED TIME' },
]

const statusOptions = [
  { value: 'SUCCESS', label: 'Success' },
  { value: 'FAILED',  label: 'Failed'  },
  { value: 'TIMEOUT', label: 'Timeout' },
]

export default function ActionHistoryPage() {
  const [search,    setSearch]    = useState('')
  const [status,    setStatus]    = useState('')
  const [sortOrder, setSortOrder] = useState('DESC')
  const [limit,     setLimit]     = useState(10)
  const [page,      setPage]      = useState(1)

  const { data, isLoading, isError } = useActionHistory({
    search, status, sortOrder, limit, page,
  })

  const rows       = data?.data         ?? []
  const totalCount = data?.pagination?.totalItems ?? 0
  const totalPages = data?.pagination?.totalPages ?? 1


  //TODO: refactor these 2 functions to shared logic
  function handleFilterChange(setter) {
    return (val) => {
      setter(val);
      setPage(1) }
  }

  function cellRenderer(colKey, row) {
    if (colKey === 'device.name')  return <span className="capitalize">{row.device?.name}</span>
    if (colKey === 'action')       return <StatusBadge value={row.action} />
    if (colKey === 'status')       return <StatusBadge value={row.status} />
    if (colKey === 'interactedAt') return dayjs(row.interactedAt).format('YYYY-MM-DD HH:mm:ss')
  }


  return (
    <div>
      <FilterBar
        search={search}         onSearchChange={handleFilterChange(setSearch)}
        typeLabel="Status"
        typeOptions={statusOptions}
        typeValue={status}      onTypeChange={handleFilterChange(setStatus)}
        showSort
        sortValue={sortOrder}   onSortChange={handleFilterChange(setSortOrder)}
        limitValue={limit}      onLimitChange={handleFilterChange(setLimit)}
      />

      {isError && <p className="text-red-500 text-sm mb-3">Failed to load data.</p>}

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
