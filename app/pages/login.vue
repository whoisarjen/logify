<script setup lang="ts">
definePageMeta({
  layout: false,
})

useHead({
  title: 'Sign In - Logify',
})

const { signIn, loading, error, checkOAuthError, clearError } = useAuth()

onMounted(() => {
  checkOAuthError()
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
            <h1 class="text-xl font-bold text-surface-50">Welcome to Logify</h1>
            <p class="text-sm text-surface-500 mt-1">Sign in to manage your logs</p>
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
            <button class="ml-auto text-red-400/60 hover:text-red-400 transition-colors" @click="clearError">
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Google Sign In -->
          <button
            :disabled="loading"
            class="w-full flex items-center justify-center gap-3 h-11 rounded-lg border border-surface-700 bg-surface-800/50 text-sm font-medium text-surface-200 transition-all duration-200 hover:border-surface-600 hover:bg-surface-800 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            @click="signIn"
          >
            <svg v-if="loading" class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <template v-else>
              <!-- Google "G" logo -->
              <svg class="h-5 w-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Continue with Google
            </template>
          </button>

          <p class="mt-6 text-center text-xs text-surface-600">
            By signing in, you agree to our Terms of Service.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
