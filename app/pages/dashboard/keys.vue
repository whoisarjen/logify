<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
})

useHead({
  title: 'API Keys - Logify',
})
</script>

<template>
  <div class="animate-fade-in-up">
    <DashboardApiKeysManager />
  </div>
</template>
