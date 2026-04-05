export default function FilterBar({
  search, onSearchChange,
  typeLabel = 'Type', typeOptions = [], typeValue, onTypeChange,
  showSort = false, sortValue, onSortChange,
  limitValue, onLimitChange,
}) {
  return (
    <div className="flex items-center gap-3 mb-4">
      {/* Search */}
      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"/>
        </svg>
        <input
          type="text"
          value={search}
          onChange={e => onSearchChange(e.target.value)}
          placeholder="Search..."
          className="pl-9 pr-4 py-1.5 text-sm border border-gray-200 rounded-md w-52 focus:outline-none focus:ring-1 focus:ring-gray-300"
        />
      </div>

      <div className="flex items-center gap-3 ml-auto">
        {/* Type / Name dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">{typeLabel}:</span>
          <select
            value={typeValue}
            onChange={e => onTypeChange(e.target.value)}
            className="text-sm border border-gray-200 rounded-md px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-gray-300"
          >
            <option value="">All</option>
            {typeOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* Sort — only on Sensor Data */}
        {showSort && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Sort:</span>
            <select
              value={sortValue}
              onChange={e => onSortChange(e.target.value)}
              className="text-sm border border-gray-200 rounded-md px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-gray-300"
            >
              <option value="DESC">Newest</option>
              <option value="ASC">Oldest</option>
            </select>
          </div>
        )}

        {/* Items per page */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Items:</span>
          <select
            value={limitValue}
            onChange={e => onLimitChange(Number(e.target.value))}
            className="text-sm border border-gray-200 rounded-md px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-gray-300"
          >
            {[5, 10, 20].map(n => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}