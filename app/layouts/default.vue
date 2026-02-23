<template>
  <div class="relative min-h-screen bg-surface-950 text-surface-200">
    <!-- Dot grid background overlay -->
    <div class="pointer-events-none fixed inset-0 bg-grid-dots bg-grid-mask" aria-hidden="true" />

    <LandingNavbar />
    <main class="relative">
      <slot />
    </main>
    <LandingFooter />
  </div>
</template>
