<script setup lang="ts">
const footerColumns = [
  {
    title: 'Product',
    links: [
      { label: 'Features', href: '#features' },
      { label: 'Pricing', href: '#pricing' },
      { label: 'Docs', href: '/docs' },
      { label: 'Dashboard', href: '/dashboard' },
    ],
  },
  {
    title: 'Developers',
    links: [
      { label: 'API Reference', href: '/docs/api' },
      { label: 'SDKs', href: '/docs/sdks' },
      { label: 'GitHub', href: 'https://github.com/whoisarjen/logify', external: true },
      { label: 'Status', href: '/status' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '/about' },
      { label: 'Blog', href: '/blog' },
      { label: 'Careers', href: '/careers' },
      { label: 'Contact', href: '/contact' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy', href: '/privacy' },
      { label: 'Terms', href: '/terms' },
    ],
  },
]
</script>

<template>
  <footer class="border-t border-surface-800/60 bg-surface-950">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <!-- Main footer content -->
      <div class="grid grid-cols-2 gap-8 py-12 sm:py-16 md:grid-cols-3 lg:grid-cols-6 lg:gap-12">
        <!-- Logo + tagline -->
        <div class="col-span-2 md:col-span-3 lg:col-span-2">
          <NuxtLink to="/" class="inline-flex items-center gap-2.5 group">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 32 32"
              fill="none"
              class="h-8 w-8 transition-transform duration-300 group-hover:scale-110"
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
            <span class="text-gradient text-xl font-bold tracking-tight">Logify</span>
          </NuxtLink>
          <p class="mt-4 max-w-xs text-sm leading-relaxed text-surface-500">
            Open source log management platform. Ingest, search, and visualize your application logs in real-time.
          </p>

          <!-- Social / GitHub -->
          <div class="mt-6 flex items-center gap-3">
            <a
              href="https://github.com/whoisarjen/logify"
              target="_blank"
              rel="noopener noreferrer"
              class="flex h-9 w-9 items-center justify-center rounded-lg border border-surface-800 bg-surface-900/50 text-surface-400 transition-all duration-200 hover:border-surface-700 hover:bg-surface-800 hover:text-surface-200"
              aria-label="GitHub"
            >
              <svg class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path
                  d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
                />
              </svg>
            </a>
          </div>
        </div>

        <!-- Link columns -->
        <div
          v-for="column in footerColumns"
          :key="column.title"
          class="col-span-1"
        >
          <h3 class="text-sm font-semibold text-surface-200">{{ column.title }}</h3>
          <ul class="mt-4 space-y-3">
            <li v-for="link in column.links" :key="link.label">
              <a
                v-if="link.external"
                :href="link.href"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center gap-1 text-sm text-surface-500 transition-colors duration-200 hover:text-surface-300"
              >
                {{ link.label }}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-3 w-3"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fill-rule="evenodd"
                    d="M4.25 5.5a.75.75 0 00-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 00.75-.75v-4a.75.75 0 011.5 0v4A2.25 2.25 0 0112.75 17h-8.5A2.25 2.25 0 012 14.75v-8.5A2.25 2.25 0 014.25 4h5a.75.75 0 010 1.5h-5zm7.25-.75a.75.75 0 01.75-.75h3.5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0V6.31l-5.47 5.47a.75.75 0 01-1.06-1.06l5.47-5.47H12.25a.75.75 0 01-.75-.75z"
                    clip-rule="evenodd"
                  />
                </svg>
              </a>
              <NuxtLink
                v-else
                :to="link.href"
                class="text-sm text-surface-500 transition-colors duration-200 hover:text-surface-300"
              >
                {{ link.label }}
              </NuxtLink>
            </li>
          </ul>
        </div>
      </div>

      <!-- Bottom bar -->
      <div class="flex flex-col items-center justify-between gap-4 border-t border-surface-800/60 py-6 sm:flex-row">
        <p class="text-sm text-surface-600">
          &copy; 2026 Logify Contributors. MIT Licensed.
        </p>
        <a
          href="https://github.com/whoisarjen/logify"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-1.5 text-sm text-surface-600 transition-colors duration-200 hover:text-surface-400"
        >
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
            />
          </svg>
          Star on GitHub
        </a>
      </div>
    </div>
  </footer>
</template>
