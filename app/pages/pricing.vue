<script setup lang="ts">
interface FaqItem {
  question: string
  answer: string
}

const faqs: FaqItem[] = [
  {
    question: 'Can I use Logify for free?',
    answer:
      'Yes! The Free tier includes 10,000 logs per month, 1 project, and 7-day retention. It is designed for side projects, personal apps, and hobby developers who want professional log management without any cost.',
  },
  {
    question: 'What happens if I exceed my log limit?',
    answer:
      'When you reach your monthly log limit, new logs will be queued but not ingested until your limit resets at the start of the next billing cycle. You will receive a notification at 80% and 100% usage so you can upgrade if needed. No data is lost during the queuing period.',
  },
  {
    question: 'How does log retention work?',
    answer:
      'Log retention determines how long your logs are stored and searchable. Free plans retain logs for 7 days, Pro for 30 days, and Enterprise for 90 days. After the retention period, logs are automatically purged. Enterprise customers can request custom retention periods.',
  },
  {
    question: 'Can I self-host Logify?',
    answer:
      'Absolutely. Logify is fully open source and can be self-hosted on your own infrastructure. Self-hosting gives you full control over your data, unlimited logs, and no usage caps. Check out our GitHub repository and documentation for deployment guides.',
  },
  {
    question: 'What payment methods do you accept?',
    answer:
      'When paid plans launch, we will accept all major credit cards (Visa, Mastercard, American Express) via Stripe. Enterprise customers can also pay via invoice with NET-30 terms. All plans will be billed monthly with the option to save with annual billing.',
  },
]

const openIndex = ref<number | null>(null)

function toggle(index: number) {
  openIndex.value = openIndex.value === index ? null : index
}
</script>

<template>
  <div class="min-h-screen">
    <!-- Page header -->
    <div class="pt-24 sm:pt-32 pb-8 sm:pb-12">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 class="text-4xl sm:text-5xl lg:text-6xl font-bold text-surface-50 mb-4">
          <span class="text-gradient">Pricing</span>
        </h1>
        <p class="text-lg sm:text-xl text-surface-400 max-w-2xl mx-auto">
          Choose the plan that fits your project. Upgrade or downgrade anytime.
        </p>
      </div>
    </div>

    <!-- Pricing section (reused component) -->
    <LandingPricing />

    <!-- FAQ section -->
    <section class="py-20 sm:py-28">
      <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 class="text-2xl sm:text-3xl font-bold text-surface-50 text-center mb-12">
          Frequently asked questions
        </h2>

        <div class="space-y-4">
          <div
            v-for="(faq, index) in faqs"
            :key="index"
            class="rounded-xl border border-surface-800 bg-surface-900/50 overflow-hidden transition-colors duration-200"
            :class="{ 'border-surface-700': openIndex === index }"
          >
            <button
              class="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
              @click="toggle(index)"
            >
              <span class="text-base font-medium text-surface-200">
                {{ faq.question }}
              </span>
              <svg
                class="w-5 h-5 shrink-0 text-surface-500 transition-transform duration-200"
                :class="{ 'rotate-180': openIndex === index }"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </button>

            <Transition
              enter-active-class="transition-all duration-200 ease-out"
              enter-from-class="max-h-0 opacity-0"
              enter-to-class="max-h-96 opacity-100"
              leave-active-class="transition-all duration-200 ease-in"
              leave-from-class="max-h-96 opacity-100"
              leave-to-class="max-h-0 opacity-0"
            >
              <div v-show="openIndex === index" class="overflow-hidden">
                <div class="px-6 pb-5 text-sm text-surface-400 leading-relaxed">
                  {{ faq.answer }}
                </div>
              </div>
            </Transition>
          </div>
        </div>

        <!-- Bottom contact CTA -->
        <div class="mt-16 text-center">
          <p class="text-surface-400 mb-4">
            Still have questions?
          </p>
          <a
            href="mailto:contact@logify.dev"
            class="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-surface-700 hover:border-surface-600 bg-surface-900/50 hover:bg-surface-800/50 text-surface-200 font-medium text-sm transition-all duration-200"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
            Contact us
          </a>
        </div>
      </div>
    </section>
  </div>
</template>
