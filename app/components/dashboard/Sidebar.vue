<script setup lang="ts">
const route = useRoute()
const { user, logout } = useAuth()
const { projects, selected, fetchProjects, selectProject } = useProject()

const sidebarOpen = ref(false)

const navItems = [
  {
    label: 'Logs',
    to: '/dashboard',
    icon: 'logs',
  },
  {
    label: 'API Keys',
    to: '/dashboard/keys',
    icon: 'keys',
  },
]

const projectDropdownOpen = ref(false)

function onSelectProject(project: { id: string; name: string }) {
  selectProject(project as any)
  projectDropdownOpen.value = false
}

function isActive(path: string) {
  if (path === '/dashboard') {
    return route.path === '/dashboard' || route.path === '/dashboard/'
  }
  return route.path.startsWith(path)
}

function toggleSidebar() {
  sidebarOpen.value = !sidebarOpen.value
}

function closeSidebar() {
  sidebarOpen.value = false
}

const userInitials = computed(() => {
  const name = user.value?.name || 'User'
  return name
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
})

// Close sidebar on route change (mobile)
watch(() => route.path, () => {
  sidebarOpen.value = false
})

// Close project dropdown when clicking outside
function onClickOutsideProject(e: Event) {
  const target = e.target as HTMLElement
  if (!target.closest('.project-selector')) {
    projectDropdownOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', onClickOutsideProject)
  fetchProjects()
})

onUnmounted(() => {
  document.removeEventListener('click', onClickOutsideProject)
})

// Expose toggle for the topbar hamburger
defineExpose({ toggleSidebar })
</script>

<template>
  <!-- Mobile overlay -->
  <Transition
    enter-active-class="transition-opacity duration-300"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition-opacity duration-200"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="sidebarOpen"
      class="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
      @click="closeSidebar"
    />
  </Transition>

  <!-- Sidebar -->
  <aside
    class="fixed top-0 left-0 z-50 h-screen w-60 flex flex-col bg-surface-900 border-r border-surface-800 transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto"
    :class="sidebarOpen ? 'translate-x-0' : '-translate-x-full'"
  >
    <!-- Logo -->
    <div class="flex items-center gap-2.5 px-5 h-16 shrink-0 border-b border-surface-800">
      <NuxtLink to="/" class="flex items-center gap-2.5 group">
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
    </div>

    <!-- Navigation -->
    <nav class="flex-1 overflow-y-auto px-3 py-4">
      <ul class="space-y-1">
        <li v-for="item in navItems" :key="item.to">
          <NuxtLink
            :to="item.to"
            class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200"
            :class="
              isActive(item.to)
                ? 'bg-primary-500/10 text-primary-400 border-l-2 border-primary-500 ml-0 pl-2.5'
                : 'text-surface-400 hover:text-surface-200 hover:bg-surface-800/60'
            "
          >
            <!-- Logs icon -->
            <svg v-if="item.icon === 'logs'" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
              <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>

            <!-- Keys icon -->
            <svg v-else-if="item.icon === 'keys'" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
            </svg>

            <span>{{ item.label }}</span>
          </NuxtLink>
        </li>
      </ul>

      <!-- Separator -->
      <div class="my-4 border-t border-surface-800" />

      <!-- Project selector -->
      <div class="project-selector relative">
        <button
          class="flex items-center gap-2 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-surface-300 hover:bg-surface-800/60 transition-colors"
          @click.stop="projectDropdownOpen = !projectDropdownOpen"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0 text-surface-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
            <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
          </svg>
          <span class="truncate flex-1 text-left">{{ selected?.name || 'Select project' }}</span>
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0 text-surface-500 transition-transform" :class="projectDropdownOpen ? 'rotate-180' : ''" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </button>

        <!-- Dropdown -->
        <Transition
          enter-active-class="transition duration-150 ease-out"
          enter-from-class="opacity-0 scale-95"
          enter-to-class="opacity-100 scale-100"
          leave-active-class="transition duration-100 ease-in"
          leave-from-class="opacity-100 scale-100"
          leave-to-class="opacity-0 scale-95"
        >
          <div
            v-if="projectDropdownOpen"
            class="absolute left-0 right-0 mt-1 rounded-lg border border-surface-700 bg-surface-850 shadow-xl z-50"
          >
            <ul class="py-1">
              <li v-for="project in projects" :key="project.id">
                <button
                  class="flex items-center gap-2 w-full px-3 py-2 text-sm transition-colors text-left"
                  :class="
                    selected?.id === project.id
                      ? 'text-primary-400 bg-primary-500/10'
                      : 'text-surface-300 hover:bg-surface-800'
                  "
                  @click="onSelectProject(project)"
                >
                  <span class="w-1.5 h-1.5 rounded-full shrink-0" :class="selected?.id === project.id ? 'bg-primary-400' : 'bg-surface-600'" />
                  <span class="truncate">{{ project.name }}</span>
                </button>
              </li>
              <li v-if="projects.length === 0">
                <span class="block px-3 py-2 text-sm text-surface-500">No projects</span>
              </li>
            </ul>
          </div>
        </Transition>
      </div>
    </nav>

    <!-- User section -->
    <div class="shrink-0 border-t border-surface-800 p-3">
      <div class="flex items-center gap-3 px-2 py-2">
        <img
          v-if="user?.avatar"
          :src="user.avatar"
          :alt="user.name || 'Avatar'"
          class="h-8 w-8 rounded-full object-cover shrink-0"
          referrerpolicy="no-referrer"
        >
        <div
          v-else
          class="flex items-center justify-center h-8 w-8 rounded-full bg-primary-600 text-white text-xs font-semibold shrink-0"
        >
          {{ userInitials }}
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-surface-200 truncate">
            {{ user?.name || 'User' }}
          </p>
          <p class="text-xs text-surface-500 truncate">
            {{ user?.email || '' }}
          </p>
        </div>
        <button
          class="shrink-0 p-1.5 rounded-lg text-surface-500 hover:text-surface-300 hover:bg-surface-800 transition-colors"
          title="Log out"
          @click="logout"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
          </svg>
        </button>
      </div>
    </div>
  </aside>
</template>
