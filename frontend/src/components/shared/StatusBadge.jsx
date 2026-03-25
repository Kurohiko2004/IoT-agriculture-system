const styles = {
  ON:      'text-blue-500 font-bold',
  OFF:     'text-red-500 font-bold',
  PENDING: 'text-amber-500 font-bold animate-pulse',
}

export default function StatusBadge({ value }) {
  const label = value === 'PENDING' ? 'WAITING...' : value
  return (
    <span className={styles[value] ?? 'text-gray-500'}>
      {label}
    </span>
  )
}