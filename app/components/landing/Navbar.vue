<script setup lang="ts">
// Non-httpOnly flag cookie set alongside the session cookie — readable by client JS.
const loggedIn = useCookie('logify_logged_in')

const mobileMenuOpen = ref(false)

const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Docs', href: '/docs' },
  {
    label: 'GitHub',
    href: 'https://github.com/whoisarjen/logify',
    external: true,
  },
]

function toggleMobileMenu() {
  mobileMenuOpen.value = !mobileMenuOpen.value
}

function closeMobileMenu() {
  mobileMenuOpen.value = false
}
</script>

<template>
  <header class="fixed top-0 left-0 right-0 z-50 glass">
    <nav class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="flex h-14 items-center justify-between">
        <!-- Logo -->
        <NuxtLink to="/" class="flex items-center gap-2 group" @click="closeMobileMenu">
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

        <!-- Desktop Nav -->
        <div class="hidden md:flex md:items-center md:gap-1">
          <template v-for="link in navLinks" :key="link.label">
            <a
              v-if="link.external"
              :href="link.href"
              target="_blank"
              rel="noopener noreferrer"
              class="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-surface-400 transition-colors duration-200 hover:text-surface-200"
            >
              {{ link.label }}
              <svg class="h-3 w-3 opacity-50" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M3.5 3.5h5v5M8.5 3.5L3.5 8.5" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </a>
            <NuxtLink
              v-else
              :to="link.href"
              class="rounded-lg px-3 py-1.5 text-sm text-surface-400 transition-colors duration-200 hover:text-surface-200"
            >
              {{ link.label }}
            </NuxtLink>
          </template>
        </div>

        <!-- Desktop CTA -->
        <div class="hidden md:flex md:items-center md:gap-3">
          <template v-if="loggedIn">
            <NuxtLink
              to="/dashboard"
              class="inline-flex items-center gap-1.5 rounded-lg bg-primary-600 px-4 py-1.5 text-sm font-medium text-white transition-all duration-200 hover:bg-primary-500 active:scale-[0.97]"
            >
              Dashboard
              <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </NuxtLink>
          </template>
          <template v-else>
            <NuxtLink
              to="/login"
              class="px-3 py-1.5 text-sm text-surface-400 transition-colors hover:text-surface-200"
            >
              Sign In
            </NuxtLink>
            <NuxtLink
              to="/login"
              class="inline-flex items-center gap-1.5 rounded-lg bg-primary-600 px-4 py-1.5 text-sm font-medium text-white transition-all duration-200 hover:bg-primary-500 active:scale-[0.97]"
            >
              Get Started
              <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </NuxtLink>
          </template>
        </div>

        <!-- Mobile Hamburger -->
        <button
          class="md:hidden flex items-center justify-center rounded-lg p-2 text-surface-400 transition-colors hover:text-surface-200"
          :aria-expanded="mobileMenuOpen"
          aria-label="Toggle navigation menu"
          @click="toggleMobileMenu"
        >
          <svg
            v-if="!mobileMenuOpen"
            class="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          <svg
            v-else
            class="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </nav>

    <!-- Mobile Menu -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div
        v-if="mobileMenuOpen"
        class="md:hidden border-t border-surface-800/50 px-4 pb-4 pt-2"
      >
        <div class="flex flex-col gap-1">
          <template v-for="link in navLinks" :key="link.label">
            <a
              v-if="link.external"
              :href="link.href"
              target="_blank"
              rel="noopener noreferrer"
              class="flex items-center gap-1.5 rounded-lg px-3 py-2.5 text-sm text-surface-400 transition-colors hover:text-surface-200"
              @click="closeMobileMenu"
            >
              {{ link.label }}
              <svg class="h-3 w-3 opacity-50" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M3.5 3.5h5v5M8.5 3.5L3.5 8.5" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </a>
            <NuxtLink
              v-else
              :to="link.href"
              class="rounded-lg px-3 py-2.5 text-sm text-surface-400 transition-colors hover:text-surface-200"
              @click="closeMobileMenu"
            >
              {{ link.label }}
            </NuxtLink>
          </template>

          <div class="mt-2 flex flex-col gap-2 border-t border-surface-800/50 pt-3">
            <template v-if="loggedIn">
              <NuxtLink
                to="/dashboard"
                class="flex w-full items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:bg-primary-500"
                @click="closeMobileMenu"
              >
                Dashboard
                <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </NuxtLink>
            </template>
            <template v-else>
              <NuxtLink
                to="/login"
                class="flex w-full items-center justify-center rounded-lg border border-surface-700 px-4 py-2.5 text-sm text-surface-300 transition-colors hover:border-surface-600 hover:text-surface-200"
                @click="closeMobileMenu"
              >
                Sign In
              </NuxtLink>
              <NuxtLink
                to="/login"
                class="flex w-full items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:bg-primary-500"
                @click="closeMobileMenu"
              >
                Get Started
                <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </NuxtLink>
            </template>
          </div>
        </div>
      </div>
    </Transition>
  </header>
</template>
