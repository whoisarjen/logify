<script setup lang="ts">
const emit = defineEmits<{
  toggleSidebar: []
}>()

const { searchQuery, timeRange, environment, isLive, refresh } = useLogFilters()

const timeRanges = [
  { label: '15m', value: '15m' },
  { label: '1h', value: '1h' },
  { label: '6h', value: '6h' },
  { label: '24h', value: '24h' },
  { label: '7d', value: '7d' },
  { label: '30d', value: '30d' },
]

const environments = [
  { label: 'All', value: 'all' },
  { label: 'Production', value: 'production' },
  { label: 'Staging', value: 'staging' },
  { label: 'Development', value: 'development' },
]

function onSearch() {
  refresh()
}

function onRefresh() {
  refresh()
}

function toggleLive() {
  isLive.value = !isLive.value
}

const selectStyle = {
  backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19.5 8.25l-7.5 7.5-7.5-7.5'/%3E%3C/svg%3E\")",
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 8px center',
  backgroundSize: '14px',
}
</script>

<template>
  <header class="sticky top-0 z-30 h-16 shrink-0 border-b border-surface-800 bg-surface-900/80 backdrop-blur-xl">
    <div class="flex items-center gap-3 h-full px-4 lg:px-6">
      <!-- Mobile hamburger -->
      <button
        class="lg:hidden shrink-0 p-2 -ml-2 rounded-lg text-surface-400 hover:text-surface-200 hover:bg-surface-800 transition-colors"
        @click="emit('toggleSidebar')"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>
      </button>

      <!-- Search -->
      <div class="relative flex-1 max-w-md">
        <svg xmlns="http://www.w3.org/2000/svg" class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-500 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search logs..."
          class="w-full h-9 pl-9 pr-3 rounded-lg border border-surface-700 bg-surface-800/50 text-sm text-surface-200 placeholder-surface-500 focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/25 transition-colors"
          @keyup.enter="onSearch"
        >
      </div>

      <!-- Filters (hidden on small screens, visible on md+) -->
      <div class="hidden md:flex items-center gap-2">
        <!-- Time range -->
        <div class="flex items-center rounded-lg border border-surface-700 bg-surface-800/50 overflow-hidden">
          <button
            v-for="range in timeRanges"
            :key="range.value"
            class="px-2.5 py-1.5 text-xs font-medium transition-colors"
            :class="
              timeRange === range.value
                ? 'bg-primary-500/15 text-primary-400'
                : 'text-surface-400 hover:text-surface-200 hover:bg-surface-700/50'
            "
            @click="timeRange = range.value"
          >
            {{ range.label }}
          </button>
        </div>

        <!-- Environment -->
        <select
          v-model="environment"
          class="h-9 px-3 rounded-lg border border-surface-700 bg-surface-800/50 text-xs font-medium text-surface-300 focus:outline-none focus:border-primary-500/50 cursor-pointer appearance-none pr-8"
          :style="selectStyle"
        >
          <option v-for="env in environments" :key="env.value" :value="env.value">
            {{ env.label }}
          </option>
        </select>
      </div>

      <!-- Actions -->
      <div class="flex items-center gap-2 ml-auto shrink-0">
        <!-- Refresh -->
        <button
          class="p-2 rounded-lg text-surface-400 hover:text-surface-200 hover:bg-surface-800 transition-colors"
          title="Refresh"
          @click="onRefresh"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
          </svg>
        </button>

        <!-- Live toggle -->
        <button
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200"
          :class="
            isLive
              ? 'bg-success/15 text-success border border-success/30'
              : 'text-surface-400 border border-surface-700 hover:border-surface-600 hover:text-surface-300'
          "
          @click="toggleLive"
        >
          <span
            class="h-2 w-2 rounded-full"
            :class="isLive ? 'bg-success animate-pulse-dot' : 'bg-surface-600'"
          />
          Live
        </button>
      </div>
    </div>
  </header>
</template>
