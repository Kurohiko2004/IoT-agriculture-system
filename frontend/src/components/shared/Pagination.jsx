export default function Pagination({ currentPage, totalPages, onPageChange }) {
    function getPages() {
        const delta = 2
        const range = []
        const left = Math.max(1, currentPage - delta)
        const right = Math.min(totalPages, currentPage + delta)

        for (let i = left; i <= right; i++) range.push(i)

        // Add first page + ellipsis
        if (left > 2) range.unshift('...')
        if (left > 1) range.unshift(1)

        // Add last page + ellipsis
        if (right < totalPages - 1) range.push('...')
        if (right < totalPages) range.push(totalPages)

        return range
    }

    return (
        <div className="flex items-center gap-1">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1.5 text-sm border border-gray-200 rounded-md disabled:opacity-40 hover:bg-gray-50"
            >
                Previous
            </button>

            {getPages().map((p, i) =>
                p === '...'
                    ? <span key={`ellipsis-${i}`} className="px-2 text-gray-400">...</span>
                    : <button
                        key={p}
                        onClick={() => onPageChange(p)}
                        className={`px-3 py-1.5 text-sm rounded-md ${
                            p === currentPage
                                ? 'bg-gray-900 text-white'
                                : 'border border-gray-200 hover:bg-gray-50'
                        }`}
                    >
                        {p}
                    </button>
            )}

            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 text-sm border border-gray-200 rounded-md disabled:opacity-40 hover:bg-gray-50"
            >
                Next
            </button>
        </div>
    )
}