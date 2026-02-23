<script setup lang="ts">
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
      <div class="flex h-16 items-center justify-between">
        <!-- Logo -->
        <NuxtLink to="/" class="flex items-center gap-2.5 group" @click="closeMobileMenu">
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

        <!-- Desktop Nav -->
        <div class="hidden md:flex md:items-center md:gap-1">
          <template v-for="link in navLinks" :key="link.label">
            <a
              v-if="link.external"
              :href="link.href"
              target="_blank"
              rel="noopener noreferrer"
              class="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-surface-400 transition-colors duration-200 hover:text-surface-100 hover:bg-surface-800/50"
            >
              {{ link.label }}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-3.5 w-3.5"
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
              class="rounded-lg px-3 py-2 text-sm font-medium text-surface-400 transition-colors duration-200 hover:text-surface-100 hover:bg-surface-800/50"
            >
              {{ link.label }}
            </NuxtLink>
          </template>
        </div>

        <!-- Desktop CTA -->
        <div class="hidden md:flex md:items-center md:gap-3">
          <NuxtLink
            to="/dashboard"
            class="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-primary-600/20 transition-all duration-200 hover:bg-primary-500 hover:shadow-primary-500/30 active:scale-[0.97]"
          >
            Dashboard
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M3 4.25A2.25 2.25 0 015.25 2h5.5A2.25 2.25 0 0113 4.25v2a.75.75 0 01-1.5 0v-2a.75.75 0 00-.75-.75h-5.5a.75.75 0 00-.75.75v11.5c0 .414.336.75.75.75h5.5a.75.75 0 00.75-.75v-2a.75.75 0 011.5 0v2A2.25 2.25 0 0110.75 18h-5.5A2.25 2.25 0 013 15.75V4.25z"
                clip-rule="evenodd"
              />
              <path
                fill-rule="evenodd"
                d="M6 10a.75.75 0 01.75-.75h9.546l-1.048-1.047a.75.75 0 111.06-1.06l2.353 2.353a.75.75 0 010 1.06l-2.353 2.354a.75.75 0 11-1.06-1.06l1.048-1.05H6.75A.75.75 0 016 10z"
                clip-rule="evenodd"
              />
            </svg>
          </NuxtLink>
        </div>

        <!-- Mobile Hamburger -->
        <button
          class="md:hidden flex items-center justify-center rounded-lg p-2 text-surface-400 transition-colors hover:bg-surface-800/50 hover:text-surface-100"
          :aria-expanded="mobileMenuOpen"
          aria-label="Toggle navigation menu"
          @click="toggleMobileMenu"
        >
          <!-- Hamburger icon -->
          <svg
            v-if="!mobileMenuOpen"
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          <!-- Close icon -->
          <svg
            v-else
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6"
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
              class="flex items-center gap-1.5 rounded-lg px-3 py-2.5 text-sm font-medium text-surface-400 transition-colors hover:bg-surface-800/50 hover:text-surface-100"
              @click="closeMobileMenu"
            >
              {{ link.label }}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-3.5 w-3.5"
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
              class="rounded-lg px-3 py-2.5 text-sm font-medium text-surface-400 transition-colors hover:bg-surface-800/50 hover:text-surface-100"
              @click="closeMobileMenu"
            >
              {{ link.label }}
            </NuxtLink>
          </template>

          <div class="mt-2 border-t border-surface-800/50 pt-3">
            <NuxtLink
              to="/dashboard"
              class="flex w-full items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary-600/20 transition-all duration-200 hover:bg-primary-500"
              @click="closeMobileMenu"
            >
              Dashboard
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fill-rule="evenodd"
                  d="M3 4.25A2.25 2.25 0 015.25 2h5.5A2.25 2.25 0 0113 4.25v2a.75.75 0 01-1.5 0v-2a.75.75 0 00-.75-.75h-5.5a.75.75 0 00-.75.75v11.5c0 .414.336.75.75.75h5.5a.75.75 0 00.75-.75v-2a.75.75 0 011.5 0v2A2.25 2.25 0 0110.75 18h-5.5A2.25 2.25 0 013 15.75V4.25z"
                  clip-rule="evenodd"
                />
                <path
                  fill-rule="evenodd"
                  d="M6 10a.75.75 0 01.75-.75h9.546l-1.048-1.047a.75.75 0 111.06-1.06l2.353 2.353a.75.75 0 010 1.06l-2.353 2.354a.75.75 0 11-1.06-1.06l1.048-1.05H6.75A.75.75 0 016 10z"
                  clip-rule="evenodd"
                />
              </svg>
            </NuxtLink>
          </div>
        </div>
      </div>
    </Transition>
  </header>
</template>
