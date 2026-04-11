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
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col">
      
      {/* Scrollable area — header fixed, body scrolls */}
      <div className="overflow-auto max-h-[600px]">
        <table className="w-full border-collapse">
          <thead className="sticky top-0 z-10">
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
          <tbody className="divide-y divide-gray-100">
            {rows.map((row, i) => (
              <tr
                key={row.id ?? i}
                className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50 hover:bg-gray-100 transition-colors'}
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
      </div>

      {/* Footer — always visible outside scroll area */}
      <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-white">
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
