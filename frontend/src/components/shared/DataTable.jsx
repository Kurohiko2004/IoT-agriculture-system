import Pagination from './Pagination'

export default function DataTable({
  columns,
  rows,
  cellRenderer,
  currentPage,
  totalPages,
  totalCount,
  limit,
  onPageChange,
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="bg-gray-900 text-white">
            {columns.map(col => (
              <th
                key={col.key}
                className="text-left text-xs font-bold tracking-wider px-6 py-4"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={row.id ?? i}
              className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
            >
              {columns.map(col => (
                <td key={col.key} className="px-6 py-4 text-sm text-gray-700">
                  {cellRenderer
                    ? cellRenderer(col.key, row) ?? row[col.key]
                    : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Footer */}
      <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
        <span className="text-sm text-gray-500">
          Showing <strong>{(currentPage - 1) * limit + 1}</strong> to{' '}
          <strong>{Math.min(currentPage * limit, totalCount)}</strong> of{' '}
          <strong>{totalCount}</strong> entries
        </span>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      </div>
    </div>
  )
}