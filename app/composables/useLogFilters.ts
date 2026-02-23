export function useLogFilters() {
  const searchQuery = useState('log-filter-search', () => '')
  const timeRange = useState('log-filter-time', () => '24h')
  const environment = useState('log-filter-env', () => 'all')
  const isLive = useState('log-filter-live', () => false)
  const refreshTrigger = useState('log-filter-refresh', () => 0)

  function refresh() {
    refreshTrigger.value++
  }

  function timeRangeToDate(range: string): Date | null {
    const now = Date.now()
    const map: Record<string, number> = {
      '15m': 15 * 60 * 1000,
      '1h': 60 * 60 * 1000,
      '6h': 6 * 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000,
    }
    const ms = map[range]
    return ms ? new Date(now - ms) : null
  }

  return {
    searchQuery,
    timeRange,
    environment,
    isLive,
    refreshTrigger,
    refresh,
    timeRangeToDate,
  }
}
