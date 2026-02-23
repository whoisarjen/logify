<script setup lang="ts">
const sidebarRef = ref<InstanceType<typeof DashboardSidebar> | null>(null)

function toggleSidebar() {
  sidebarRef.value?.toggleSidebar()
}
</script>

<template>
  <div class="min-h-screen bg-surface-950 text-surface-200 flex">
    <DashboardSidebar ref="sidebarRef" />
    <div class="flex-1 flex flex-col min-w-0 lg:ml-0">
      <DashboardTopbar @toggle-sidebar="toggleSidebar" />
      <main class="flex-1 p-4 lg:p-6 overflow-auto">
        <slot />
      </main>
    </div>
  </div>
</template>
