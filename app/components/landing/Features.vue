<script setup lang="ts">
const features = [
  {
    title: 'Real-time Log Streaming',
    description: 'Watch logs flow in real-time with zero delay. Live tail your production services and catch issues as they happen.',
    large: true,
    icon: 'stream',
  },
  {
    title: 'Powerful Search',
    description: 'Full-text search with filters for level, service, time range. Find that one error in millions of entries.',
    large: false,
    icon: 'search',
  },
  {
    title: 'API-First Design',
    description: 'Simple REST API. One endpoint, one API key, done. Integrate in under 5 minutes.',
    large: false,
    icon: 'api',
  },
  {
    title: 'Rate Limiting',
    description: 'Built-in protection with configurable limits per key. Never worry about runaway log volumes.',
    large: false,
    icon: 'shield',
  },
  {
    title: 'Multiple Environments',
    description: 'Separate logs by environment: production, staging, dev. Switch context without losing focus.',
    large: false,
    icon: 'layers',
  },
  {
    title: 'Open Source',
    description: 'MIT licensed. Self-host or use our cloud. Your data, your rules. Full transparency, no vendor lock-in.',
    large: true,
    icon: 'code',
  },
]

const sectionRef = useReveal()
</script>

<template>
  <section id="features" ref="sectionRef" class="reveal relative py-24 sm:py-32">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <!-- Section header -->
      <div class="mx-auto max-w-2xl text-center">
        <span class="text-sm font-semibold uppercase tracking-wider text-primary-400">Features</span>
        <h2 class="mt-3 text-3xl font-bold text-white sm:text-4xl lg:text-5xl" style="letter-spacing: -0.025em">
          Everything you need to
          <span class="text-gradient">monitor your stack</span>
        </h2>
        <p class="mt-4 text-base text-surface-400 sm:text-lg">
          From ingestion to insight, Logify covers the full observability pipeline.
        </p>
      </div>

      <!-- Bento Grid -->
      <div class="stagger-children mt-16 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-5">
        <div
          v-for="feature in features"
          :key="feature.title"
          :class="[
            'group relative overflow-hidden rounded-2xl border border-surface-800/60 bg-surface-900/50 p-6 transition-all duration-300 hover:border-primary-500/20 hover:bg-surface-900/80 sm:p-8',
            feature.large ? 'sm:col-span-2 lg:col-span-2' : '',
          ]"
        >
          <!-- Hover glow -->
          <div
            class="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            aria-hidden="true"
          >
            <div class="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-primary-600/8 blur-3xl" />
          </div>

          <div class="relative">
            <!-- Icon -->
            <div class="mb-4 flex h-10 w-10 items-center justify-center rounded-lg border border-surface-700/50 bg-surface-800/80 text-primary-400 transition-colors duration-300 group-hover:border-primary-500/30 group-hover:text-primary-300 sm:h-12 sm:w-12">
              <svg v-if="feature.icon === 'stream'" class="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M12 17.25h8.25" />
                <circle cx="6" cy="17.25" r="2" fill="currentColor" class="animate-pulse-dot" />
              </svg>
              <svg v-else-if="feature.icon === 'search'" class="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607z" />
              </svg>
              <svg v-else-if="feature.icon === 'api'" class="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" />
              </svg>
              <svg v-else-if="feature.icon === 'shield'" class="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
              <svg v-else-if="feature.icon === 'layers'" class="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6.429 9.75 2.25 12l4.179 2.25m0-4.5 5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L21.75 12l-4.179 2.25m0 0 4.179 2.25L12 21.75 2.25 16.5l4.179-2.25m11.142 0-5.571 3-5.571-3" />
              </svg>
              <svg v-else-if="feature.icon === 'code'" class="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5a17.92 17.92 0 0 1-8.716-2.247m0 0A8.966 8.966 0 0 1 3 12c0-1.264.26-2.466.73-3.558" />
              </svg>
            </div>

            <h3 class="text-lg font-semibold text-white sm:text-xl">{{ feature.title }}</h3>
            <p class="mt-2 text-sm leading-relaxed text-surface-400 sm:text-base">{{ feature.description }}</p>

            <!-- Live log decoration for streaming card -->
            <div
              v-if="feature.large && feature.icon === 'stream'"
              class="mt-6 flex items-center gap-3"
              aria-hidden="true"
            >
              <div class="flex items-center gap-1.5">
                <span class="h-2 w-2 rounded-full bg-success animate-pulse-dot" />
                <span class="font-mono text-xs text-success">LIVE</span>
              </div>
              <div class="flex-1 rounded-md border border-surface-800 bg-surface-950/50 px-3 py-2 font-mono text-xs text-surface-500">
                <span class="text-surface-600">[{{ new Date().toISOString().split('T')[0] }}]</span>
                <span class="ml-1 text-info">INFO</span>
                <span class="ml-1 text-surface-400">auth-service</span>
                <span class="ml-1 text-surface-500">Request processed in 42ms</span>
              </div>
            </div>

            <!-- Open source decoration -->
            <div
              v-if="feature.large && feature.icon === 'code'"
              class="mt-6 flex items-center gap-4"
              aria-hidden="true"
            >
              <div class="flex items-center gap-2 rounded-md border border-surface-800 bg-surface-950/50 px-3 py-2 font-mono text-xs">
                <span class="text-success">MIT</span>
                <span class="text-surface-600">|</span>
                <span class="text-surface-400">Self-hosted</span>
                <span class="text-surface-600">|</span>
                <span class="text-primary-400">Cloud</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
