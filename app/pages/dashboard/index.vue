<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
})

useHead({
  title: 'Dashboard - Logify',
})
</script>

<template>
  <div class="space-y-6 animate-fade-in-up">
    <!-- Page header -->
    <div>
      <h1 class="text-2xl font-bold text-surface-50">Dashboard</h1>
      <p class="text-sm text-surface-500 mt-1">Monitor your application logs in real-time</p>
    </div>

    <!-- Stats cards -->
    <DashboardStatsCards />

    <!-- Log viewer -->
    <DashboardLogViewer />
  </div>
</template>
