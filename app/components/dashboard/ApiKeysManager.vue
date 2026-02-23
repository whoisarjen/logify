<script setup lang="ts">
const { projects, selected } = useProject()

interface ApiKey {
  id: string
  projectId: string
  name: string
  keyPrefix: string
  lastUsedAt: string | null
  createdAt: string
  revokedAt: string | null
  isActive: boolean
}

const loading = ref(false)
const apiKeys = ref<ApiKey[]>([])

const showGenerateModal = ref(false)
const newKeyName = ref('')
const newKeyProjectId = ref('')
const generatedKey = ref<string | null>(null)
const keyCopied = ref(false)
const generating = ref(false)
const revoking = ref<string | null>(null)
const generateError = ref<string | null>(null)
const revokeError = ref<string | null>(null)

async function fetchKeys() {
  loading.value = true
  try {
    const data = await $fetch<{ keys: ApiKey[] }>('/api/keys')
    apiKeys.value = data.keys
  } catch {
    apiKeys.value = []
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchKeys()
})

const filteredKeys = computed(() => {
  if (!selected.value) return apiKeys.value
  return apiKeys.value.filter(k => k.projectId === selected.value!.id)
})

function openGenerateModal() {
  newKeyName.value = ''
  newKeyProjectId.value = selected.value?.id || ''
  generatedKey.value = null
  keyCopied.value = false
  generateError.value = null
  showGenerateModal.value = true
}

function closeModal() {
  showGenerateModal.value = false
  generatedKey.value = null
}

async function generateKey() {
  if (!newKeyName.value.trim() || !newKeyProjectId.value) return

  generating.value = true
  try {
    const data = await $fetch<{ apiKey: { id: string; key: string; projectId: string; name: string; prefix: string; createdAt: string } }>('/api/keys', {
      method: 'POST',
      body: {
        name: newKeyName.value.trim(),
        projectId: newKeyProjectId.value,
      },
    })

    generatedKey.value = data.apiKey.key

    apiKeys.value.unshift({
      id: data.apiKey.id,
      projectId: data.apiKey.projectId,
      name: data.apiKey.name,
      keyPrefix: data.apiKey.prefix,
      lastUsedAt: null,
      createdAt: data.apiKey.createdAt,
      revokedAt: null,
      isActive: true,
    })
  } catch (err: any) {
    generateError.value = err?.data?.message || err?.message || 'Failed to generate API key. Please try again.'
  } finally {
    generating.value = false
  }
}

async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    keyCopied.value = true
    setTimeout(() => {
      keyCopied.value = false
    }, 2000)
  } catch {
    // Fallback
  }
}

async function copyPrefix(prefix: string) {
  try {
    await navigator.clipboard.writeText(prefix)
  } catch {
    // Fallback
  }
}

async function revokeKey(id: string) {
  revoking.value = id
  try {
    await $fetch(`/api/keys/${id}`, { method: 'DELETE' })
    const key = apiKeys.value.find(k => k.id === id)
    if (key) {
      key.isActive = false
      key.revokedAt = new Date().toISOString()
    }
  } catch (err: any) {
    revokeError.value = err?.data?.message || err?.message || 'Failed to revoke API key. Please try again.'
    setTimeout(() => { revokeError.value = null }, 4000)
  } finally {
    revoking.value = null
  }
}

function getProjectName(projectId: string): string {
  const project = projects.value.find(p => p.id === projectId)
  return project?.name || projectId
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString()
}

function relativeTime(dateStr: string | null): string {
  if (!dateStr) return 'Never'
  const diff = Date.now() - new Date(dateStr).getTime()
  const seconds = Math.floor(diff / 1000)
  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}
</script>

<template>
  <div>
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="text-xl font-bold text-surface-50">Your API Keys</h2>
        <p class="text-sm text-surface-500 mt-1">Manage keys used to ingest logs via the REST API</p>
      </div>
      <button
        class="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary-600 text-white text-sm font-semibold shadow-lg shadow-primary-600/20 transition-all duration-200 hover:bg-primary-500 hover:shadow-primary-500/30 active:scale-[0.97]"
        @click="openGenerateModal"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        Generate New Key
      </button>
    </div>

    <!-- Revoke error -->
    <div
      v-if="revokeError"
      class="flex items-center gap-2 p-3 mb-4 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
      </svg>
      {{ revokeError }}
    </div>

    <!-- Loading skeleton -->
    <div v-if="loading" class="rounded-xl border border-surface-800 bg-surface-900/50 overflow-hidden">
      <div class="divide-y divide-surface-800/50">
        <div v-for="i in 3" :key="i" class="flex items-center gap-4 px-5 py-4 animate-pulse">
          <div class="h-4 w-32 rounded bg-surface-800" />
          <div class="h-4 w-24 rounded bg-surface-800" />
          <div class="h-4 w-28 rounded bg-surface-800" />
          <div class="h-4 flex-1 rounded bg-surface-800" />
        </div>
      </div>
    </div>

    <!-- Keys table -->
    <div v-else class="rounded-xl border border-surface-800 bg-surface-900/50 overflow-hidden">
      <!-- Table header -->
      <div class="hidden md:grid grid-cols-12 gap-4 px-5 py-3 border-b border-surface-800 bg-surface-900/80 text-xs font-medium text-surface-500 uppercase tracking-wider">
        <div class="col-span-3">Name</div>
        <div class="col-span-2">Key</div>
        <div class="col-span-2">Project</div>
        <div class="col-span-1">Created</div>
        <div class="col-span-2">Last Used</div>
        <div class="col-span-1">Status</div>
        <div class="col-span-1">Actions</div>
      </div>

      <!-- Table body -->
      <div class="divide-y divide-surface-800/50">
        <div
          v-for="key in filteredKeys"
          :key="key.id"
          class="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 px-5 py-4 md:items-center hover:bg-surface-800/20 transition-colors"
        >
          <!-- Name -->
          <div class="md:col-span-3">
            <span class="md:hidden text-xs text-surface-500 mr-2">Name:</span>
            <span class="text-sm font-medium text-surface-200">{{ key.name }}</span>
          </div>

          <!-- Key prefix -->
          <div class="md:col-span-2">
            <span class="md:hidden text-xs text-surface-500 mr-2">Key:</span>
            <code class="text-xs font-mono text-surface-400 bg-surface-800 px-2 py-1 rounded">{{ key.keyPrefix }}...</code>
          </div>

          <!-- Project -->
          <div class="md:col-span-2">
            <span class="md:hidden text-xs text-surface-500 mr-2">Project:</span>
            <span class="text-sm text-surface-400">{{ getProjectName(key.projectId) }}</span>
          </div>

          <!-- Created -->
          <div class="md:col-span-1">
            <span class="md:hidden text-xs text-surface-500 mr-2">Created:</span>
            <span class="text-xs text-surface-500">{{ formatDate(key.createdAt) }}</span>
          </div>

          <!-- Last Used -->
          <div class="md:col-span-2">
            <span class="md:hidden text-xs text-surface-500 mr-2">Last Used:</span>
            <span class="text-xs text-surface-500">{{ relativeTime(key.lastUsedAt) }}</span>
          </div>

          <!-- Status -->
          <div class="md:col-span-1">
            <span class="md:hidden text-xs text-surface-500 mr-2">Status:</span>
            <span
              class="inline-flex items-center gap-1.5 text-xs font-medium"
              :class="key.isActive ? 'text-emerald-400' : 'text-red-400'"
            >
              <span
                class="h-1.5 w-1.5 rounded-full"
                :class="key.isActive ? 'bg-emerald-400' : 'bg-red-400'"
              />
              {{ key.isActive ? 'Active' : 'Revoked' }}
            </span>
          </div>

          <!-- Actions -->
          <div class="md:col-span-1 flex items-center gap-1.5 mt-2 md:mt-0">
            <button
              class="p-1.5 rounded-lg text-surface-500 hover:text-surface-300 hover:bg-surface-800 transition-colors"
              title="Copy key prefix"
              @click="copyPrefix(key.keyPrefix)"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
              </svg>
            </button>
            <button
              v-if="key.isActive"
              class="p-1.5 rounded-lg text-surface-500 hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-40"
              title="Revoke key"
              :disabled="revoking === key.id"
              @click="revokeKey(key.id)"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
                <path stroke-linecap="round" stroke-linejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Empty state -->
      <div v-if="filteredKeys.length === 0" class="flex flex-col items-center justify-center py-16 px-4">
        <div class="flex items-center justify-center h-14 w-14 rounded-2xl bg-surface-800/50 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7 text-surface-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
          </svg>
        </div>
        <p class="text-surface-300 font-medium mb-1">No API keys yet</p>
        <p class="text-surface-500 text-sm text-center">Generate your first key to start sending logs.</p>
      </div>
    </div>

    <!-- Generate Modal -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition-opacity duration-200"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition-opacity duration-150"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="showGenerateModal"
          class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          @click.self="closeModal"
        >
          <Transition
            enter-active-class="transition-all duration-200 ease-out"
            enter-from-class="opacity-0 scale-95"
            enter-to-class="opacity-100 scale-100"
            leave-active-class="transition-all duration-150 ease-in"
            leave-from-class="opacity-100 scale-100"
            leave-to-class="opacity-0 scale-95"
          >
            <div
              v-if="showGenerateModal"
              class="w-full max-w-lg rounded-2xl border border-surface-700 bg-surface-900 shadow-2xl"
            >
              <!-- Modal header -->
              <div class="flex items-center justify-between px-6 py-4 border-b border-surface-800">
                <h3 class="text-lg font-semibold text-surface-100">Generate API Key</h3>
                <button
                  class="p-1.5 rounded-lg text-surface-500 hover:text-surface-300 hover:bg-surface-800 transition-colors"
                  @click="closeModal"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <!-- Modal body -->
              <div class="px-6 py-5">
                <!-- Before generation -->
                <div v-if="!generatedKey" class="space-y-4">
                  <div
                    v-if="generateError"
                    class="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                    </svg>
                    {{ generateError }}
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-surface-300 mb-1.5">Key Name</label>
                    <input
                      v-model="newKeyName"
                      type="text"
                      placeholder="e.g., Production API Key"
                      class="w-full h-10 px-3 rounded-lg border border-surface-700 bg-surface-800/50 text-sm text-surface-200 placeholder-surface-500 focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/25 transition-colors"
                    >
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-surface-300 mb-1.5">Project</label>
                    <select
                      v-model="newKeyProjectId"
                      class="w-full h-10 px-3 rounded-lg border border-surface-700 bg-surface-800/50 text-sm text-surface-300 focus:outline-none focus:border-primary-500/50 cursor-pointer"
                    >
                      <option v-for="project in projects" :key="project.id" :value="project.id">
                        {{ project.name }}
                      </option>
                    </select>
                  </div>
                </div>

                <!-- After generation - show the key -->
                <div v-else class="space-y-4">
                  <div class="flex items-start gap-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-amber-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                    </svg>
                    <p class="text-sm text-amber-200/90">
                      Save this key now. It will not be shown again.
                    </p>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-surface-300 mb-1.5">Your API Key</label>
                    <div class="flex items-center gap-2">
                      <code class="flex-1 px-3 py-2.5 rounded-lg border border-surface-700 bg-surface-800 text-sm font-mono text-surface-200 break-all select-all">
                        {{ generatedKey }}
                      </code>
                      <button
                        class="shrink-0 px-3 py-2.5 rounded-lg border text-sm font-medium transition-all duration-200"
                        :class="
                          keyCopied
                            ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                            : 'border-surface-700 text-surface-300 hover:bg-surface-800'
                        "
                        @click="copyToClipboard(generatedKey!)"
                      >
                        {{ keyCopied ? 'Copied!' : 'Copy' }}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Modal footer -->
              <div class="flex items-center justify-end gap-3 px-6 py-4 border-t border-surface-800">
                <button
                  class="px-4 py-2 rounded-lg text-sm font-medium text-surface-400 hover:text-surface-200 hover:bg-surface-800 transition-colors"
                  @click="closeModal"
                >
                  {{ generatedKey ? 'Done' : 'Cancel' }}
                </button>
                <button
                  v-if="!generatedKey"
                  class="px-4 py-2 rounded-lg text-sm font-semibold bg-primary-600 text-white shadow-lg shadow-primary-600/20 transition-all duration-200 hover:bg-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  :disabled="!newKeyName.trim() || !newKeyProjectId || generating"
                  @click="generateKey"
                >
                  {{ generating ? 'Generating...' : 'Generate Key' }}
                </button>
              </div>
            </div>
          </Transition>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
