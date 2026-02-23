<script setup lang="ts">
type LogLevel = 'error' | 'warn' | 'info' | 'debug'

interface LogEntry {
  timestamp: string
  level: LogLevel
  service: string
  message: string
}

const activeFilter = ref<'all' | LogLevel>('all')
const searchQuery = ref('')

const logEntries: LogEntry[] = [
  {
    timestamp: '2026-02-23T14:32:01.847Z',
    level: 'error',
    service: 'payment-service',
    message: 'Failed to process payment: card declined (4xxx-xxxx-xxxx-9012)',
  },
  {
    timestamp: '2026-02-23T14:32:00.234Z',
    level: 'warn',
    service: 'api-gateway',
    message: 'Rate limit approaching for key lgfy_prod_8f3k (82/100 requests)',
  },
  {
    timestamp: '2026-02-23T14:31:58.102Z',
    level: 'info',
    service: 'auth-service',
    message: 'User authenticated successfully via OAuth (usr_123)',
  },
  {
    timestamp: '2026-02-23T14:31:55.891Z',
    level: 'debug',
    service: 'worker-pool',
    message: 'Job queue processed: 47 items in 1.2s (avg 25ms/item)',
  },
  {
    timestamp: '2026-02-23T14:31:54.456Z',
    level: 'info',
    service: 'auth-service',
    message: 'New session created for user usr_456 (TTL: 24h)',
  },
  {
    timestamp: '2026-02-23T14:31:52.003Z',
    level: 'error',
    service: 'storage-service',
    message: 'Connection timeout after 30s: unable to reach replica db-read-02',
  },
]

const filters: { label: string; value: 'all' | LogLevel }[] = [
  { label: 'All', value: 'all' },
  { label: 'Error', value: 'error' },
  { label: 'Warn', value: 'warn' },
  { label: 'Info', value: 'info' },
  { label: 'Debug', value: 'debug' },
]

const filteredLogs = computed(() => {
  return logEntries.filter((entry) => {
    if (activeFilter.value !== 'all' && entry.level !== activeFilter.value) return false
    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase()
      return (
        entry.message.toLowerCase().includes(q) ||
        entry.service.toLowerCase().includes(q)
      )
    }
    return true
  })
})

const levelConfig: Record<LogLevel, { badge: string; dot: string }> = {
  error: {
    badge: 'bg-error/10 text-error border-error/20',
    dot: 'bg-error',
  },
  warn: {
    badge: 'bg-warning/10 text-warning border-warning/20',
    dot: 'bg-warning',
  },
  info: {
    badge: 'bg-info/10 text-info border-info/20',
    dot: 'bg-info',
  },
  debug: {
    badge: 'bg-debug/10 text-debug border-debug/20',
    dot: 'bg-debug',
  },
}

function formatTime(isoString: string): string {
  return isoString.split('T')[1]?.replace('Z', '') || ''
}
</script>

<template>
  <section class="relative py-24 sm:py-32">
    <!-- Background accent -->
    <div
      class="pointer-events-none absolute inset-0 flex items-center justify-center"
      aria-hidden="true"
    >
      <div class="h-[500px] w-[700px] rounded-full bg-primary-600/5 blur-[100px]" />
    </div>

    <div class="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <!-- Section header -->
      <div class="mx-auto max-w-2xl text-center">
        <span class="text-sm font-semibold uppercase tracking-wider text-primary-400">Log Viewer</span>
        <h2 class="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
          Your logs, <span class="text-gradient">beautifully organized</span>
        </h2>
        <p class="mt-4 text-base text-surface-400 sm:text-lg">
          A clean, powerful interface designed for debugging at speed.
        </p>
      </div>

      <!-- Log viewer panel -->
      <div class="mx-auto mt-16 max-w-5xl">
        <div class="code-block glow overflow-hidden">
          <!-- Panel header -->
          <div class="flex flex-col gap-3 border-b border-surface-800 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-4">
            <!-- Filter buttons -->
            <div class="flex flex-wrap items-center gap-1.5">
              <button
                v-for="filter in filters"
                :key="filter.value"
                :class="[
                  'rounded-md px-3 py-1.5 text-xs font-medium transition-all duration-200',
                  activeFilter === filter.value
                    ? filter.value === 'all'
                      ? 'bg-surface-700 text-white'
                      : filter.value === 'error'
                        ? 'bg-error/15 text-error'
                        : filter.value === 'warn'
                          ? 'bg-warning/15 text-warning'
                          : filter.value === 'info'
                            ? 'bg-info/15 text-info'
                            : 'bg-debug/15 text-debug'
                    : 'text-surface-500 hover:bg-surface-800/50 hover:text-surface-300',
                ]"
                @click="activeFilter = filter.value"
              >
                {{ filter.label }}
              </button>
            </div>

            <!-- Search bar -->
            <div class="relative">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607z" />
              </svg>
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search logs..."
                class="w-full rounded-md border border-surface-800 bg-surface-950/80 py-1.5 pl-9 pr-3 text-xs text-surface-300 placeholder-surface-600 outline-none transition-colors focus:border-primary-500/50 sm:w-56"
              />
            </div>
          </div>

          <!-- Table header -->
          <div class="hidden border-b border-surface-800/50 bg-surface-950/50 px-4 py-2 sm:px-6 md:grid md:grid-cols-[140px_80px_130px_1fr] md:gap-4">
            <span class="text-xs font-medium uppercase tracking-wider text-surface-600">Timestamp</span>
            <span class="text-xs font-medium uppercase tracking-wider text-surface-600">Level</span>
            <span class="text-xs font-medium uppercase tracking-wider text-surface-600">Service</span>
            <span class="text-xs font-medium uppercase tracking-wider text-surface-600">Message</span>
          </div>

          <!-- Log entries -->
          <div class="divide-y divide-surface-800/30">
            <TransitionGroup
              enter-active-class="transition duration-200 ease-out"
              enter-from-class="opacity-0"
              enter-to-class="opacity-100"
              leave-active-class="transition duration-150 ease-in"
              leave-from-class="opacity-100"
              leave-to-class="opacity-0"
            >
              <div
                v-for="log in filteredLogs"
                :key="log.timestamp + log.message"
                class="group px-4 py-2.5 transition-colors duration-150 hover:bg-surface-800/20 sm:px-6 sm:py-3 md:grid md:grid-cols-[140px_80px_130px_1fr] md:items-center md:gap-4"
              >
                <!-- Timestamp -->
                <span class="font-mono text-xs text-surface-500">
                  {{ formatTime(log.timestamp) }}
                </span>

                <!-- Level badge -->
                <div class="mt-1 md:mt-0">
                  <span
                    :class="[
                      'inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 font-mono text-[11px] font-medium uppercase',
                      levelConfig[log.level].badge,
                    ]"
                  >
                    <span :class="['h-1.5 w-1.5 rounded-full', levelConfig[log.level].dot]" />
                    {{ log.level }}
                  </span>
                </div>

                <!-- Service -->
                <span class="mt-1 block truncate font-mono text-xs text-primary-400/80 md:mt-0">
                  {{ log.service }}
                </span>

                <!-- Message -->
                <span class="mt-1 block truncate text-sm text-surface-300 md:mt-0">
                  {{ log.message }}
                </span>
              </div>
            </TransitionGroup>

            <!-- Empty state -->
            <div
              v-if="filteredLogs.length === 0"
              class="flex flex-col items-center justify-center px-4 py-12 text-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="mb-3 h-8 w-8 text-surface-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="1.5"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607z" />
              </svg>
              <p class="text-sm text-surface-500">No logs match your filters</p>
            </div>
          </div>

          <!-- Footer status bar -->
          <div class="flex items-center justify-between border-t border-surface-800 px-4 py-2.5 sm:px-6">
            <div class="flex items-center gap-2">
              <span class="h-2 w-2 rounded-full bg-success animate-pulse-dot" />
              <span class="text-xs text-surface-500">
                Live
              </span>
            </div>
            <span class="font-mono text-xs text-surface-600">
              {{ filteredLogs.length }} entries
            </span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
