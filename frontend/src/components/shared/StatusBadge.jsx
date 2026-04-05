const styles = {
  ON:      'text-blue-500 font-bold',
  OFF:     'text-red-500 font-bold',
  PENDING: 'text-amber-500 font-bold animate-pulse',
  SUCCESS: 'text-green-500 font-bold',
  FAILED:  'text-red-500 font-bold',
  TIMEOUT: 'text-amber-500 font-bold animate-pulse',
  TURN_ON:  'text-blue-500 font-bold',
  TURN_OFF: 'text-red-500 font-bold',
}

export default function StatusBadge({ value }) {
  const label = value === 'PENDING' ? 'WAITING...' : value
  return (
    <span className={styles[value] ?? 'text-gray-500'}>
      {label}
    </span>
  )
}