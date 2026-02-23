<script setup lang="ts">
const copied = ref(false)
const installCommand = 'curl -sSL https://logify.whoisarjen.com/install | sh'

function copyCommand() {
  navigator.clipboard.writeText(installCommand)
  copied.value = true
  setTimeout(() => { copied.value = false }, 2000)
}

const sectionRef = useReveal()
</script>

<template>
  <section ref="sectionRef" class="reveal relative overflow-hidden py-24 sm:py-32">
    <!-- Gradient background -->
    <div class="pointer-events-none absolute inset-0">
      <div class="absolute inset-0 bg-linear-to-b from-transparent via-primary-950/20 to-transparent" />
      <div class="absolute top-1/2 left-1/2 h-100 w-150 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary-500/8 blur-3xl" />
    </div>

    <div class="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
      <!-- Heading -->
      <h2 class="text-3xl font-bold text-surface-50 sm:text-4xl lg:text-5xl" style="letter-spacing: -0.025em">
        Ready to simplify your
        <span class="text-gradient">logging</span>?
      </h2>

      <!-- Subheading -->
      <p class="mx-auto mt-6 max-w-2xl text-lg text-surface-400 sm:text-xl">
        Get started in under a minute. Open source, self-hostable, no credit card required.
      </p>

      <!-- Terminal install command -->
      <div class="mx-auto mt-10 max-w-xl">
        <div class="code-block glow-sm flex items-center gap-3 px-4 py-3 sm:px-5">
          <span class="select-none text-surface-600">$</span>
          <code class="flex-1 truncate text-sm text-surface-300">{{ installCommand }}</code>
          <button
            class="shrink-0 rounded-md p-1.5 text-surface-500 transition-colors hover:bg-surface-800 hover:text-surface-300"
            title="Copy to clipboard"
            @click="copyCommand"
          >
            <svg v-if="!copied" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
            </svg>
            <svg v-else class="h-4 w-4 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </button>
        </div>
      </div>

      <!-- CTA buttons -->
      <div class="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
        <NuxtLink
          to="/login"
          class="group inline-flex items-center gap-2 rounded-xl bg-primary-600 px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-primary-600/25 transition-all duration-200 hover:bg-primary-500 hover:shadow-primary-500/30 hover:-translate-y-0.5 active:translate-y-0 sm:text-base"
        >
          Get Started Free
          <svg class="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </NuxtLink>

        <a
          href="https://github.com/whoisarjen/logify"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-2 rounded-xl border border-surface-700 bg-surface-900/50 px-7 py-3 text-sm font-semibold text-surface-300 transition-all duration-200 hover:border-surface-600 hover:bg-surface-800/50 hover:text-surface-100 hover:-translate-y-0.5 active:translate-y-0 sm:text-base"
        >
          <svg class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
          </svg>
          Star on GitHub
        </a>
      </div>

      <!-- Social proof -->
      <div class="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-surface-500">
        <div class="flex items-center gap-2">
          <svg class="h-4 w-4 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Free &amp; open source
        </div>
        <div class="flex items-center gap-2">
          <svg class="h-4 w-4 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          No credit card required
        </div>
        <div class="flex items-center gap-2">
          <svg class="h-4 w-4 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Self-host or cloud
        </div>
      </div>
    </div>
  </section>
</template>
