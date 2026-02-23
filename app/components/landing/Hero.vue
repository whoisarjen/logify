<script setup lang="ts">
const codeLines = [
  { text: 'curl -X POST https://logify.whoisarjen.com/api/v1/logs \\' },
  { text: '  -H "X-API-Key: lgfy_your_api_key" \\' },
  { text: '  -H "Content-Type: application/json" \\' },
  { text: "  -d '{" },
  { text: '    "level": "info",' },
  { text: '    "message": "User authenticated successfully",' },
  { text: '    "service": "auth-service",' },
  { text: '    "meta": { "userId": "usr_123", "method": "oauth" }' },
  { text: "  }'" },
]

const visibleLines = ref(0)
const typingComplete = ref(false)

function lineClass(text: string) {
  if (text.startsWith('curl')) return 'text-success'
  if (text.includes('-H') || text.includes('-d')) return 'text-primary-400'
  if (text.includes('"level"') || text.includes('"message"') || text.includes('"service"') || text.includes('"meta"')) return 'text-warning'
  return 'text-surface-300'
}

onMounted(() => {
  const interval = setInterval(() => {
    if (visibleLines.value < codeLines.length) {
      visibleLines.value++
    } else {
      typingComplete.value = true
      clearInterval(interval)
    }
  }, 250)
})
</script>

<template>
  <section class="relative overflow-hidden pt-28 pb-20 sm:pt-36 sm:pb-28">
    <!-- Layered background effects -->
    <div class="pointer-events-none absolute inset-0" aria-hidden="true">
      <div class="absolute top-[-10%] left-1/2 -translate-x-1/2 h-150 w-225 rounded-full bg-primary-600/7 blur-[120px]" />
      <div class="absolute top-[30%] left-1/4 h-100 w-100 rounded-full bg-primary-500/4 blur-[100px]" />
    </div>

    <div class="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="text-center">
        <!-- Badge -->
        <div
          class="animate-fade-in-up mb-8 inline-flex items-center gap-2 rounded-full border border-primary-500/20 bg-primary-500/6 px-4 py-1.5 animate-border-glow"
        >
          <span class="h-2 w-2 rounded-full bg-primary-400 animate-pulse-dot" />
          <span class="text-sm font-medium text-primary-300">Open Source Log Management</span>
        </div>

        <!-- Heading -->
        <h1
          class="animate-fade-in-up mx-auto max-w-4xl text-4xl font-extrabold text-white sm:text-5xl md:text-6xl lg:text-7xl"
          style="animation-delay: 0.1s; letter-spacing: -0.025em"
        >
          Logs that actually
          <br class="hidden sm:block" />
          <span class="text-gradient">make sense</span>
        </h1>

        <!-- Subheading -->
        <p
          class="animate-fade-in-up mx-auto mt-6 max-w-xl text-base leading-relaxed text-surface-400 sm:text-lg"
          style="animation-delay: 0.2s"
        >
          Ingest, search, and visualize your application logs in real-time.
          Open source. Self-host or use our cloud.
        </p>

        <!-- CTAs -->
        <div
          class="animate-fade-in-up mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
          style="animation-delay: 0.3s"
        >
          <NuxtLink
            to="/register"
            class="group inline-flex items-center gap-2 rounded-xl bg-primary-600 px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-primary-600/25 transition-all duration-200 hover:bg-primary-500 hover:shadow-primary-500/30 hover:-translate-y-0.5 active:translate-y-0 sm:text-base"
          >
            Get Started Free
            <svg
              class="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
              fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"
            >
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
            View on GitHub
          </a>
        </div>
      </div>

      <!-- Code Block -->
      <div
        class="animate-fade-in-up mx-auto mt-16 max-w-3xl sm:mt-20"
        style="animation-delay: 0.5s"
      >
        <div class="code-block glow overflow-hidden">
          <!-- Code header -->
          <div class="flex items-center justify-between border-b border-surface-800/80 px-4 py-3">
            <div class="flex items-center gap-1.5">
              <span class="h-3 w-3 rounded-full bg-surface-700 transition-colors hover:bg-error/60" />
              <span class="h-3 w-3 rounded-full bg-surface-700 transition-colors hover:bg-warning/60" />
              <span class="h-3 w-3 rounded-full bg-surface-700 transition-colors hover:bg-success/60" />
            </div>
            <div class="flex items-center gap-2">
              <span class="animate-pulse-dot h-1.5 w-1.5 rounded-full bg-success" />
              <span class="text-xs text-surface-500">Terminal</span>
            </div>
          </div>

          <!-- Code content -->
          <div class="overflow-x-auto p-4 sm:p-6">
            <pre class="text-[13px] leading-relaxed sm:text-sm"><template
                v-for="(line, index) in codeLines"
                :key="index"
              ><Transition
                  enter-active-class="transition duration-300 ease-out"
                  enter-from-class="opacity-0 translate-x-1"
                  enter-to-class="opacity-100 translate-x-0"
                ><span
                    v-if="index < visibleLines"
                    class="block"
                  ><span class="text-surface-600 select-none mr-3 inline-block w-4 text-right text-[11px]">{{ index + 1 }}</span><span class="text-surface-500 select-none">{{ index === 0 ? '$ ' : '  ' }}</span><span
                      :class="lineClass(line.text)"
                    >{{ line.text }}</span></span></Transition></template><span
                v-if="!typingComplete"
                class="inline-block h-4 w-0.5 animate-pulse bg-primary-400 ml-7"
              /></pre>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
