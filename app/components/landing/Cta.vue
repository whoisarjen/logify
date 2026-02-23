<template>
  <section class="relative py-24 sm:py-32 overflow-hidden">
    <!-- Gradient background -->
    <div class="absolute inset-0 pointer-events-none">
      <div class="absolute inset-0 bg-gradient-to-b from-transparent via-primary-950/20 to-transparent" />
      <div
        class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-primary-500/8 rounded-full blur-3xl"
      />
    </div>

    <div class="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
      <!-- Heading -->
      <h2 class="text-3xl sm:text-4xl lg:text-5xl font-bold text-surface-50 mb-6">
        Ready to simplify your
        <span class="text-gradient">logging</span>?
      </h2>

      <!-- Subheading -->
      <p class="text-lg sm:text-xl text-surface-400 max-w-2xl mx-auto mb-10">
        Join the open source community and start shipping better logs today.
      </p>

      <!-- CTA buttons -->
      <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
        <NuxtLink
          to="/docs"
          class="group inline-flex items-center gap-2.5 px-8 py-3.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-semibold text-base transition-all duration-200 shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 hover:-translate-y-0.5"
        >
          Get Started
          <svg
            class="w-5 h-5 transition-transform duration-200 group-hover:translate-x-0.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </NuxtLink>

        <a
          href="https://github.com/whoisarjen/logify"
          target="_blank"
          rel="noopener noreferrer"
          class="group inline-flex items-center gap-2.5 px-8 py-3.5 rounded-xl border border-surface-700 hover:border-surface-600 bg-surface-900/50 hover:bg-surface-800/50 text-surface-200 font-semibold text-base transition-all duration-200 hover:-translate-y-0.5"
        >
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
          </svg>
          Star on GitHub
        </a>
      </div>

      <!-- Social proof hint -->
      <div class="mt-12 flex items-center justify-center gap-6 text-sm text-surface-500">
        <div class="flex items-center gap-2">
          <svg class="w-4 h-4 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Free &amp; open source
        </div>
        <div class="flex items-center gap-2">
          <svg class="w-4 h-4 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          No credit card required
        </div>
        <div class="hidden sm:flex items-center gap-2">
          <svg class="w-4 h-4 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Self-host or cloud
        </div>
      </div>
    </div>
  </section>
</template>
