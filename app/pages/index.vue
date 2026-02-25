<script setup lang="ts">
useHead({
  script: [
    { src: 'https://beamback.whoisarjen.com/widget.js', 'data-api-key': 'ak_QlcNWPdeUqHtem9n-Mr9w', defer: true },
  ],
})
</script>

<template>
  <div>
    <LandingHero />
    <LandingFeatures />
    <LandingLogPreview />
    <LandingPricing />
    <LandingCta />
  </div>
</template>
