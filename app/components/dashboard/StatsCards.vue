<script setup lang="ts">
const { selected } = useProject()
const { refreshTrigger } = useLogFilters()

interface StatsResponse {
  total: number
  byLevel: Record<string, number>
  byService: { service: string; count: number }[]
  byEnvironment: { environment: string; count: number }[]
  recentActivity: { hour: string; count: number }[]
}

const stats = ref<StatsResponse | null>(null)
const loading = ref(false)

async function fetchStats() {
  if (!selected.value) return

  loading.value = true
  try {
    stats.value = await $fetch<StatsResponse>('/api/logs/stats', {
      query: { projectId: selected.value.id },
    })
  } catch {
    stats.value = null
  } finally {
    loading.value = false
  }
}

watch(selected, () => {
  fetchStats()
}, { immediate: true })

watch(refreshTrigger, () => {
  fetchStats()
})

const totalLogs = computed(() => stats.value?.total ?? 0)
const errorCount = computed(() => (stats.value?.byLevel?.error ?? 0) + (stats.value?.byLevel?.fatal ?? 0))
const errorRate = computed(() => {
  if (totalLogs.value === 0) return '0%'
  return ((errorCount.value / totalLogs.value) * 100).toFixed(1) + '%'
})
const serviceCount = computed(() => stats.value?.byService?.length ?? 0)
const warnCount = computed(() => stats.value?.byLevel?.warn ?? 0)

const sparklineBars = computed(() => {
  const activity = stats.value?.recentActivity ?? []
  if (activity.length === 0) return Array(12).fill(0)
  const counts = activity.map(a => a.count)
  const max = Math.max(...counts, 1)
  return counts.slice(-12).map(c => Math.round((c / max) * 100))
})

function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K'
  return String(n)
}

const cards = computed(() => [
  {
    label: 'Total Logs',
    value: formatNumber(totalLogs.value),
    icon: 'logs',
    color: 'primary',
  },
  {
    label: 'Error Rate',
    value: errorRate.value,
    icon: 'error',
    color: 'error',
  },
  {
    label: 'Warnings',
    value: formatNumber(warnCount.value),
    icon: 'clock',
    color: 'warning',
  },
  {
    label: 'Active Services',
    value: String(serviceCount.value),
    icon: 'services',
    color: 'success',
  },
])

function getBarColor(color: string) {
  const colors: Record<string, string> = {
    primary: 'bg-primary-500',
    error: 'bg-error',
    warning: 'bg-warning',
    success: 'bg-success',
  }
  return colors[color] || 'bg-primary-500'
}

function getIconBgColor(color: string) {
  const colors: Record<string, string> = {
    primary: 'bg-primary-500/10 text-primary-400',
    error: 'bg-red-500/10 text-red-400',
    warning: 'bg-amber-500/10 text-amber-400',
    success: 'bg-emerald-500/10 text-emerald-400',
  }
  return colors[color] || 'bg-primary-500/10 text-primary-400'
}
</script>

<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
    <!-- Loading skeleton -->
    <template v-if="loading">
      <div
        v-for="i in 4"
        :key="i"
        class="rounded-xl border border-surface-800 bg-surface-900/50 p-5 animate-pulse"
      >
        <div class="flex items-start justify-between mb-4">
          <div class="h-10 w-10 rounded-lg bg-surface-800" />
        </div>
        <div class="mb-3">
          <div class="h-7 w-24 rounded bg-surface-800 mb-2" />
          <div class="h-4 w-16 rounded bg-surface-800" />
        </div>
        <div class="flex items-end gap-[3px] h-8">
          <div v-for="j in 12" :key="j" class="flex-1 rounded-sm bg-surface-800" :style="{ height: `${20 + j * 5}%` }" />
        </div>
      </div>
    </template>

    <!-- Stat cards -->
    <template v-else>
      <div
        v-for="stat in cards"
        :key="stat.label"
        class="rounded-xl border border-surface-800 bg-surface-900/50 p-5 transition-all duration-200 hover:border-surface-700 hover:bg-surface-900/80"
      >
        <div class="flex items-start justify-between mb-4">
          <div
            class="flex items-center justify-center h-10 w-10 rounded-lg"
            :class="getIconBgColor(stat.color)"
          >
            <!-- Logs icon -->
            <svg v-if="stat.icon === 'logs'" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>

            <!-- Error icon -->
            <svg v-else-if="stat.icon === 'error'" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>

            <!-- Clock icon -->
            <svg v-else-if="stat.icon === 'clock'" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>

            <!-- Services icon -->
            <svg v-else-if="stat.icon === 'services'" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5.25 14.25h13.5m-13.5 0a3 3 0 01-3-3m3 3a3 3 0 100 6h13.5a3 3 0 100-6m-16.5-3a3 3 0 013-3h13.5a3 3 0 013 3m-19.5 0a4.5 4.5 0 01.9-2.7L5.737 5.1a3.375 3.375 0 012.7-1.35h7.126c1.062 0 2.062.5 2.7 1.35l2.587 3.45a4.5 4.5 0 01.9 2.7m0 0a3 3 0 01-3 3m0 3h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008zm-3 6h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008z" />
            </svg>
          </div>
        </div>

        <!-- Value -->
        <div class="mb-3">
          <p class="text-2xl font-bold text-surface-50 tracking-tight">
            {{ stat.value }}
          </p>
          <p class="text-sm text-surface-500 mt-0.5">
            {{ stat.label }}
          </p>
        </div>

        <!-- Sparkline (CSS-only bar chart) -->
        <div class="flex items-end gap-[3px] h-8">
          <div
            v-for="(bar, i) in sparklineBars"
            :key="i"
            class="flex-1 rounded-sm transition-all duration-300 opacity-60 hover:opacity-100"
            :class="getBarColor(stat.color)"
            :style="{ height: `${Math.max(bar, 4)}%` }"
          />
        </div>
      </div>
    </template>
  </div>
</template>
