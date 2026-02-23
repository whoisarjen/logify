<script setup lang="ts">
interface PricingFeature {
  text: string
}

interface PricingTier {
  name: string
  price: string
  period: string
  description: string
  features: PricingFeature[]
  highlighted: boolean
  cta: string
}

const tiers: PricingTier[] = [
  {
    name: 'Free',
    price: '$0',
    period: '/month',
    description: 'For side projects and hobby devs',
    features: [
      { text: '10,000 logs/month' },
      { text: '1 project' },
      { text: '7-day retention' },
      { text: 'Community support' },
      { text: '1 API key' },
    ],
    highlighted: false,
    cta: 'Coming Soon',
  },
  {
    name: 'Pro',
    price: '$29',
    period: '/month',
    description: 'For growing teams and startups',
    features: [
      { text: '1M logs/month' },
      { text: '10 projects' },
      { text: '30-day retention' },
      { text: 'Email support' },
      { text: '10 API keys' },
      { text: 'Alerts & webhooks' },
    ],
    highlighted: true,
    cta: 'Coming Soon',
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'For large organizations',
    features: [
      { text: 'Unlimited logs' },
      { text: 'Unlimited projects' },
      { text: '90-day retention' },
      { text: 'Priority support' },
      { text: 'Unlimited API keys' },
      { text: 'SSO & SAML' },
      { text: 'Custom integrations' },
    ],
    highlighted: false,
    cta: 'Coming Soon',
  },
]
</script>

<template>
  <section id="pricing" class="relative py-24 sm:py-32 overflow-hidden">
    <!-- Background decoration -->
    <div class="absolute inset-0 pointer-events-none">
      <div
        class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-primary-500/5 rounded-full blur-3xl"
      />
    </div>

    <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Section header -->
      <div class="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
        <h2 class="text-3xl sm:text-4xl lg:text-5xl font-bold text-surface-50 mb-4">
          Simple, transparent
          <span class="text-gradient">pricing</span>
        </h2>
        <p class="text-lg sm:text-xl text-surface-400">
          Start free, scale as you grow. All plans include core features.
        </p>
      </div>

      <!-- Pricing cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-6 max-w-6xl mx-auto">
        <div
          v-for="tier in tiers"
          :key="tier.name"
          class="relative flex flex-col rounded-2xl border transition-all duration-300"
          :class="[
            tier.highlighted
              ? 'border-primary-500/50 bg-surface-900/80 scale-[1.02] md:scale-105 shadow-2xl animate-border-glow z-10'
              : 'border-surface-800 bg-surface-900/50 hover:border-surface-700',
          ]"
        >
          <!-- Recommended badge -->
          <div
            v-if="tier.highlighted"
            class="absolute -top-4 left-1/2 -translate-x-1/2"
          >
            <span
              class="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold bg-primary-500 text-white shadow-lg shadow-primary-500/25"
            >
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.562.562 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
              </svg>
              Recommended
            </span>
          </div>

          <!-- Card content -->
          <div class="p-8 flex-1 flex flex-col">
            <!-- Tier header -->
            <div class="mb-8">
              <h3 class="text-lg font-semibold text-surface-200 mb-2">
                {{ tier.name }}
              </h3>
              <div class="flex items-baseline gap-1 mb-3">
                <span
                  class="text-4xl sm:text-5xl font-bold tracking-tight"
                  :class="tier.highlighted ? 'text-primary-400' : 'text-surface-50'"
                >
                  {{ tier.price }}
                </span>
                <span v-if="tier.period" class="text-surface-500 text-lg">
                  {{ tier.period }}
                </span>
              </div>
              <p class="text-sm text-surface-400">
                {{ tier.description }}
              </p>
            </div>

            <!-- Features list -->
            <ul class="space-y-3.5 mb-8 flex-1">
              <li
                v-for="feature in tier.features"
                :key="feature.text"
                class="flex items-start gap-3 text-sm text-surface-300"
              >
                <svg
                  class="w-5 h-5 shrink-0 mt-0.5"
                  :class="tier.highlighted ? 'text-primary-400' : 'text-success'"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                <span>{{ feature.text }}</span>
              </li>
            </ul>

            <!-- CTA button -->
            <button
              disabled
              class="w-full py-3 px-6 rounded-xl text-sm font-semibold transition-all duration-200 cursor-not-allowed"
              :class="[
                tier.highlighted
                  ? 'bg-primary-500/20 text-primary-300 border border-primary-500/30'
                  : 'bg-surface-800 text-surface-400 border border-surface-700',
              ]"
            >
              <span class="flex items-center justify-center gap-2">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {{ tier.cta }}
              </span>
            </button>
          </div>
        </div>
      </div>

      <!-- Bottom note -->
      <p class="text-center text-sm text-surface-500 mt-12">
        All plans include log search, real-time streaming, and the REST API.
        <br class="hidden sm:block">
        Need something custom?
        <a href="mailto:contact@logify.dev" class="text-primary-400 hover:text-primary-300 transition-colors">
          Get in touch
        </a>
      </p>
    </div>
  </section>
</template>
