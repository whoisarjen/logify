<script setup lang="ts">
definePageMeta({
  layout: false,
})

useHead({
  title: 'Sign In - Logify',
})

const { login, loading, error, clearError } = useAuth()

const email = ref('')
const password = ref('')

async function handleSubmit() {
  try {
    await login(email.value, password.value)
  }
  catch {
    // Error is handled by the composable
  }
}

watch([email, password], () => {
  clearError()
})
</script>

<template>
  <div class="relative min-h-screen bg-surface-950 text-surface-200 flex flex-col">
    <!-- Background decoration -->
    <div class="pointer-events-none fixed inset-0 bg-grid-dots bg-grid-mask" aria-hidden="true" />
    <div class="pointer-events-none absolute top-1/4 left-1/2 -translate-x-1/2 h-100 w-150 rounded-full bg-primary-600/5 blur-[120px]" aria-hidden="true" />

    <!-- Logo header -->
    <div class="flex justify-center pt-12 pb-8">
      <NuxtLink to="/" class="flex items-center gap-2.5 group">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 32 32"
          fill="none"
          class="h-9 w-9 transition-transform duration-300 group-hover:scale-110"
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
        <span class="text-gradient text-2xl font-bold tracking-tight">Logify</span>
      </NuxtLink>
    </div>

    <!-- Card -->
    <div class="relative flex-1 flex items-start justify-center px-4">
      <div class="w-full max-w-sm animate-fade-in-up">
        <div class="rounded-2xl border border-surface-800 bg-surface-900/70 backdrop-blur-sm p-8">
          <div class="text-center mb-8">
            <h1 class="text-xl font-bold text-surface-50">Welcome back</h1>
            <p class="text-sm text-surface-500 mt-1">Sign in to your account</p>
          </div>

          <!-- Error -->
          <div
            v-if="error"
            class="flex items-center gap-2 p-3 mb-6 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            {{ error }}
          </div>

          <form class="space-y-4" @submit.prevent="handleSubmit">
            <div>
              <label for="email" class="block text-sm font-medium text-surface-300 mb-1.5">Email</label>
              <input
                id="email"
                v-model="email"
                type="email"
                required
                autocomplete="email"
                placeholder="you@example.com"
                class="w-full h-10 px-3 rounded-lg border border-surface-700 bg-surface-800/50 text-sm text-surface-200 placeholder-surface-500 focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/25 transition-colors"
              >
            </div>

            <div>
              <label for="password" class="block text-sm font-medium text-surface-300 mb-1.5">Password</label>
              <input
                id="password"
                v-model="password"
                type="password"
                required
                autocomplete="current-password"
                placeholder="Your password"
                class="w-full h-10 px-3 rounded-lg border border-surface-700 bg-surface-800/50 text-sm text-surface-200 placeholder-surface-500 focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/25 transition-colors"
              >
            </div>

            <button
              type="submit"
              :disabled="loading || !email || !password"
              class="w-full h-10 rounded-lg bg-primary-600 text-sm font-semibold text-white shadow-lg shadow-primary-600/20 transition-all duration-200 hover:bg-primary-500 hover:shadow-primary-500/30 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <svg
                v-if="loading"
                class="animate-spin h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              {{ loading ? 'Signing in...' : 'Sign In' }}
            </button>
          </form>
        </div>

        <p class="text-center text-sm text-surface-500 mt-6">
          Don't have an account?
          <NuxtLink to="/register" class="text-primary-400 hover:text-primary-300 font-medium transition-colors">
            Sign up
          </NuxtLink>
        </p>
      </div>
    </div>
  </div>
</template>
