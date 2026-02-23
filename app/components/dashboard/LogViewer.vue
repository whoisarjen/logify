<script setup lang="ts">
const { selected } = useProject()
const { searchQuery, timeRange, environment, isLive, refreshTrigger, timeRangeToDate } = useLogFilters()

interface LogEntry {
  id: string
  projectId: string
  level: string
  message: string
  service: string | null
  environment: string | null
  timestamp: string
  meta: Record<string, unknown> | null
  traceId: string | null
  spanId: string | null
  userId: string | null
  requestId: string | null
  host: string | null
  tags: unknown | null
  ip: string | null
  createdAt: string
}

interface LogsResponse {
  logs: LogEntry[]
  pagination: {
    total: number
    limit: number
    offset: number
    hasMore: boolean
  }
}

const loading = ref(false)
const logs = ref<LogEntry[]>([])
const pagination = ref({ total: 0, limit: 50, offset: 0, hasMore: false })

const activeLevel = ref<string>('all')
const expandedId = ref<string | null>(null)
const currentPage = ref(1)
const perPage = 50

const levelCounts = ref<Record<string, number>>({})

const levelTabs = computed(() => {
  const total = Object.values(levelCounts.value).reduce((sum, c) => sum + c, 0)
  return [
    { key: 'all', label: 'All', count: pagination.value.total || total },
    { key: 'fatal', label: 'Fatal', count: levelCounts.value.fatal ?? 0 },
    { key: 'error', label: 'Error', count: levelCounts.value.error ?? 0 },
    { key: 'warn', label: 'Warn', count: levelCounts.value.warn ?? 0 },
    { key: 'info', label: 'Info', count: levelCounts.value.info ?? 0 },
    { key: 'debug', label: 'Debug', count: levelCounts.value.debug ?? 0 },
  ]
})

async function fetchLogs() {
  if (!selected.value) return

  loading.value = true
  try {
    const query: Record<string, string | number> = {
      projectId: selected.value.id,
      limit: perPage,
      offset: (currentPage.value - 1) * perPage,
    }

    if (activeLevel.value !== 'all') {
      query.level = activeLevel.value
    }

    // Apply composable filters
    const fromDate = timeRangeToDate(timeRange.value)
    if (fromDate) {
      query.from = fromDate.toISOString()
    }

    if (environment.value !== 'all') {
      query.environment = environment.value
    }

    if (searchQuery.value) {
      query.search = searchQuery.value
    }

    const data = await $fetch<LogsResponse>('/api/logs', { query })
    logs.value = data.logs
    pagination.value = data.pagination
  } catch {
    logs.value = []
  } finally {
    loading.value = false
  }
}

async function fetchLevelCounts() {
  if (!selected.value) return

  try {
    const data = await $fetch<{ total: number; byLevel: Record<string, number> }>('/api/logs/stats', {
      query: { projectId: selected.value.id },
    })
    levelCounts.value = data.byLevel
  } catch {
    levelCounts.value = {}
  }
}

watch(selected, () => {
  currentPage.value = 1
  activeLevel.value = 'all'
  fetchLogs()
  fetchLevelCounts()
}, { immediate: true })

watch([activeLevel], () => {
  currentPage.value = 1
  fetchLogs()
})

watch(currentPage, () => {
  fetchLogs()
})

watch([searchQuery, timeRange, environment, refreshTrigger], () => {
  currentPage.value = 1
  fetchLogs()
  fetchLevelCounts()
})

// Live polling
let liveInterval: ReturnType<typeof setInterval> | null = null

watch(isLive, (live) => {
  if (live) {
    liveInterval = setInterval(() => {
      fetchLogs()
      fetchLevelCounts()
    }, 5000)
  } else if (liveInterval) {
    clearInterval(liveInterval)
    liveInterval = null
  }
})

onUnmounted(() => {
  if (liveInterval) {
    clearInterval(liveInterval)
  }
})

const totalPages = computed(() => Math.max(1, Math.ceil(pagination.value.total / perPage)))

function toggleExpand(id: string) {
  expandedId.value = expandedId.value === id ? null : id
}

function relativeTime(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime()
  const seconds = Math.floor(diff / 1000)
  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

function getLevelBadgeClass(level: string) {
  const classes: Record<string, string> = {
    fatal: 'bg-red-600/15 text-red-400 border-red-600/30',
    error: 'bg-red-500/15 text-red-400 border-red-500/30',
    warn: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    info: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    debug: 'bg-gray-500/15 text-gray-400 border-gray-500/30',
  }
  return classes[level] || ''
}

function getLevelTabClass(key: string) {
  const classes: Record<string, string> = {
    fatal: 'text-red-400 border-red-400',
    error: 'text-red-400 border-red-400',
    warn: 'text-amber-400 border-amber-400',
    info: 'text-blue-400 border-blue-400',
    debug: 'text-gray-400 border-gray-400',
    all: 'text-primary-400 border-primary-400',
  }
  return classes[key] || ''
}

function formatJson(obj: Record<string, unknown>) {
  return JSON.stringify(obj, null, 2)
}
</script>

<template>
  <div class="rounded-xl border border-surface-800 bg-surface-900/50 overflow-hidden">
    <!-- Level filter tabs -->
    <div class="flex items-center gap-0 border-b border-surface-800 overflow-x-auto px-1">
      <button
        v-for="tab in levelTabs"
        :key="tab.key"
        class="flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap -mb-px"
        :class="
          activeLevel === tab.key
            ? getLevelTabClass(tab.key)
            : 'text-surface-500 border-transparent hover:text-surface-300 hover:border-surface-600'
        "
        @click="activeLevel = tab.key"
      >
        {{ tab.label }}
        <span
          class="text-xs px-1.5 py-0.5 rounded-full"
          :class="
            activeLevel === tab.key
              ? 'bg-surface-800 text-surface-300'
              : 'bg-surface-800/50 text-surface-500'
          "
        >
          {{ tab.count.toLocaleString() }}
        </span>
      </button>
    </div>

    <!-- Loading skeleton -->
    <div v-if="loading" class="divide-y divide-surface-800/50">
      <div v-for="i in 5" :key="i" class="flex items-center gap-4 px-5 py-4 animate-pulse">
        <div class="h-4 w-16 rounded bg-surface-800" />
        <div class="h-5 w-14 rounded bg-surface-800" />
        <div class="h-5 w-20 rounded bg-surface-800" />
        <div class="h-4 flex-1 rounded bg-surface-800" />
        <div class="h-4 w-8 rounded bg-surface-800" />
      </div>
    </div>

    <!-- Empty state -->
    <div v-else-if="logs.length === 0" class="flex flex-col items-center justify-center py-20 px-4">
      <div class="flex items-center justify-center h-16 w-16 rounded-2xl bg-surface-800/50 mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-surface-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m5.231 13.481L15 17.25m-4.5-15H5.625c-.621 0-1.125.504-1.125 1.125v16.5c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9zm3.75 11.625a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
        </svg>
      </div>
      <p class="text-surface-300 font-medium mb-1">No logs found</p>
      <p class="text-surface-500 text-sm text-center max-w-sm">
        Try adjusting your filters or time range. Logs will appear here once your services start sending data.
      </p>
    </div>

    <!-- Log entries -->
    <div v-else class="divide-y divide-surface-800/50">
      <div
        v-for="log in logs"
        :key="log.id"
        class="group"
      >
        <!-- Log row -->
        <div
          class="flex items-center gap-3 px-5 py-3 cursor-pointer transition-colors hover:bg-surface-800/30"
          @click="toggleExpand(log.id)"
        >
          <!-- Timestamp -->
          <span class="text-xs text-surface-500 font-mono w-16 shrink-0">
            {{ relativeTime(log.timestamp) }}
          </span>

          <!-- Level badge -->
          <span
            class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider border shrink-0"
            :class="getLevelBadgeClass(log.level)"
          >
            {{ log.level }}
          </span>

          <!-- Service badge -->
          <span
            v-if="log.service"
            class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-surface-800 text-surface-400 border border-surface-700 shrink-0 max-w-[120px] truncate"
          >
            {{ log.service }}
          </span>

          <!-- Message -->
          <span class="flex-1 text-sm text-surface-300 truncate min-w-0">
            {{ log.message }}
          </span>

          <!-- Expand button -->
          <button class="shrink-0 p-1 rounded text-surface-600 group-hover:text-surface-400 transition-colors">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4 transition-transform duration-200"
              :class="expandedId === log.id ? 'rotate-180' : ''"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </button>
        </div>

        <!-- Expanded detail -->
        <Transition
          enter-active-class="transition-all duration-200 ease-out"
          enter-from-class="opacity-0 max-h-0"
          enter-to-class="opacity-100 max-h-[600px]"
          leave-active-class="transition-all duration-150 ease-in"
          leave-from-class="opacity-100 max-h-[600px]"
          leave-to-class="opacity-0 max-h-0"
        >
          <div
            v-if="expandedId === log.id"
            class="bg-surface-900 border-t border-surface-800/50 px-5 py-4 overflow-hidden"
          >
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div class="space-y-2">
                <div class="flex items-center gap-2 text-xs">
                  <span class="text-surface-500 w-20">Timestamp</span>
                  <span class="font-mono text-surface-300">{{ log.timestamp }}</span>
                </div>
                <div v-if="log.traceId" class="flex items-center gap-2 text-xs">
                  <span class="text-surface-500 w-20">Trace ID</span>
                  <span class="font-mono text-surface-300">{{ log.traceId }}</span>
                </div>
                <div v-if="log.requestId" class="flex items-center gap-2 text-xs">
                  <span class="text-surface-500 w-20">Request ID</span>
                  <span class="font-mono text-surface-300">{{ log.requestId }}</span>
                </div>
                <div v-if="log.service" class="flex items-center gap-2 text-xs">
                  <span class="text-surface-500 w-20">Service</span>
                  <span class="text-surface-300">{{ log.service }}</span>
                </div>
                <div v-if="log.environment" class="flex items-center gap-2 text-xs">
                  <span class="text-surface-500 w-20">Environment</span>
                  <span class="text-surface-300">{{ log.environment }}</span>
                </div>
                <div v-if="log.host" class="flex items-center gap-2 text-xs">
                  <span class="text-surface-500 w-20">Host</span>
                  <span class="font-mono text-surface-300">{{ log.host }}</span>
                </div>
                <div v-if="log.ip" class="flex items-center gap-2 text-xs">
                  <span class="text-surface-500 w-20">IP</span>
                  <span class="font-mono text-surface-300">{{ log.ip }}</span>
                </div>
              </div>

              <div>
                <p class="text-xs text-surface-500 mb-1.5">Full Message</p>
                <p class="text-sm text-surface-200 leading-relaxed">{{ log.message }}</p>
              </div>
            </div>

            <!-- Meta data -->
            <div v-if="log.meta">
              <p class="text-xs text-surface-500 mb-1.5">Metadata</p>
              <pre class="code-block p-3 text-xs text-surface-300 overflow-x-auto">{{ formatJson(log.meta) }}</pre>
            </div>
          </div>
        </Transition>
      </div>
    </div>

    <!-- Pagination -->
    <div class="flex items-center justify-between px-5 py-3 border-t border-surface-800 bg-surface-900/30">
      <p class="text-xs text-surface-500">
        Showing <span class="text-surface-300 font-medium">{{ pagination.offset + 1 }}-{{ Math.min(pagination.offset + perPage, pagination.total) }}</span>
        of <span class="text-surface-300 font-medium">{{ pagination.total.toLocaleString() }}</span>
      </p>
      <div class="flex items-center gap-1.5">
        <button
          class="px-3 py-1.5 rounded-lg text-xs font-medium border border-surface-700 text-surface-400 hover:bg-surface-800 hover:text-surface-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          :disabled="currentPage === 1"
          @click="currentPage--"
        >
          Previous
        </button>
        <span class="text-xs text-surface-500 px-2">{{ currentPage }} / {{ totalPages }}</span>
        <button
          class="px-3 py-1.5 rounded-lg text-xs font-medium border border-surface-700 text-surface-400 hover:bg-surface-800 hover:text-surface-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          :disabled="!pagination.hasMore"
          @click="currentPage++"
        >
          Next
        </button>
      </div>
    </div>
  </div>
</template>
