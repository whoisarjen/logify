<script setup lang="ts">
const footerLinks = [
  { label: 'Features', href: '#features' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Docs', href: '/docs' },
  { label: 'Dashboard', href: '/dashboard' },
]
</script>

<template>
  <footer class="border-t border-surface-800/60 bg-surface-950">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="flex flex-col items-center gap-8 py-12 sm:flex-row sm:justify-between sm:py-10">
        <!-- Logo + tagline -->
        <div class="flex flex-col items-center gap-3 sm:items-start">
          <NuxtLink to="/" class="inline-flex items-center gap-2 group">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 32 32"
              fill="none"
              class="h-7 w-7 transition-transform duration-300 group-hover:scale-110"
            >
              <rect width="32" height="32" rx="8" fill="#4F46E5" />
              <path
                d="M8 10h16M8 16h12M8 22h8"
                stroke="white"
                stroke-width="2.5"
                stroke-linecap="round"
              />
              <circle cx="24" cy="22" r="3" fill="#A5B4FC" />
            </svg>
            <span class="text-gradient text-lg font-bold tracking-tight">Logify</span>
          </NuxtLink>
          <p class="max-w-xs text-center text-sm text-surface-500 sm:text-left">
            Open source log management. Ingest, search, and visualize your logs in real-time.
          </p>
        </div>

        <!-- Links -->
        <div class="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          <NuxtLink
            v-for="link in footerLinks"
            :key="link.label"
            :to="link.href"
            class="text-sm text-surface-500 transition-colors hover:text-surface-300"
          >
            {{ link.label }}
          </NuxtLink>
          <a
            href="https://github.com/whoisarjen/logify"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-1 text-sm text-surface-500 transition-colors hover:text-surface-300"
          >
            GitHub
            <svg class="h-3 w-3 opacity-50" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M3.5 3.5h5v5M8.5 3.5L3.5 8.5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </a>
        </div>
      </div>

      <!-- Bottom bar -->
      <div class="flex flex-col items-center justify-between gap-3 border-t border-surface-800/60 py-6 sm:flex-row">
        <p class="text-xs text-surface-600">
          &copy; {{ new Date().getFullYear() }} Logify Contributors. MIT Licensed.
        </p>
        <a
          href="https://github.com/whoisarjen/logify"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-1.5 text-xs text-surface-600 transition-colors hover:text-surface-400"
        >
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
          </svg>
          Star on GitHub
        </a>
      </div>
    </div>
  </footer>
</template>
