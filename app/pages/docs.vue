<script setup lang="ts">
interface NavSection {
  id: string
  label: string
  icon: string
}

const sections: NavSection[] = [
  { id: 'getting-started', label: 'Getting Started', icon: 'rocket' },
  { id: 'authentication', label: 'Authentication', icon: 'key' },
  { id: 'log-ingestion', label: 'Log Ingestion API', icon: 'upload' },
  { id: 'rate-limits', label: 'Rate Limits', icon: 'gauge' },
  { id: 'sdks', label: 'SDKs', icon: 'package' },
  { id: 'dashboard', label: 'Dashboard', icon: 'layout' },
]

const activeSection = ref('getting-started')
const mobileNavOpen = ref(false)

const activeTab = ref<'curl' | 'javascript' | 'python'>('curl')

const curlExample = `curl -X POST https://api.logify.dev/api/v1/logs \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: your-api-key-here" \\
  -d '{
    "level": "info",
    "message": "User signed in successfully",
    "service": "auth-service",
    "environment": "production",
    "meta": {
      "userId": "usr_12345",
      "method": "oauth"
    },
    "tags": ["auth", "login"]
  }'`

const jsExample = `const response = await fetch("https://api.logify.dev/api/v1/logs", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-API-Key": "your-api-key-here",
  },
  body: JSON.stringify({
    level: "info",
    message: "User signed in successfully",
    service: "auth-service",
    environment: "production",
    meta: {
      userId: "usr_12345",
      method: "oauth",
    },
    tags: ["auth", "login"],
  }),
});

const data = await response.json();
console.log(data);`

const pythonExample = `import requests

response = requests.post(
    "https://api.logify.dev/api/v1/logs",
    headers={
        "Content-Type": "application/json",
        "X-API-Key": "your-api-key-here",
    },
    json={
        "level": "info",
        "message": "User signed in successfully",
        "service": "auth-service",
        "environment": "production",
        "meta": {
            "userId": "usr_12345",
            "method": "oauth",
        },
        "tags": ["auth", "login"],
    },
)

print(response.json())`

const successResponse = `{
  "success": true,
  "data": {
    "id": "log_abc123def456",
    "level": "info",
    "message": "User signed in successfully",
    "service": "auth-service",
    "environment": "production",
    "timestamp": "2026-02-23T10:30:00.000Z",
    "meta": {
      "userId": "usr_12345",
      "method": "oauth"
    },
    "tags": ["auth", "login"]
  }
}`

const errorResponse = `{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid log level. Must be one of: debug, info, warn, error, fatal",
    "details": [
      {
        "field": "level",
        "message": "Invalid enum value"
      }
    ]
  }
}`

const rateLimitResponse = `{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Rate limit exceeded. Try again in 45 seconds.",
    "retryAfter": 45
  }
}`

interface BodyField {
  name: string
  type: string
  required: boolean
  description: string
}

const bodyFields: BodyField[] = [
  { name: 'level', type: '"debug" | "info" | "warn" | "error" | "fatal"', required: true, description: 'The severity level of the log entry.' },
  { name: 'message', type: 'string', required: true, description: 'The log message content.' },
  { name: 'service', type: 'string', required: false, description: 'Name of the service or application emitting the log.' },
  { name: 'environment', type: '"production" | "staging" | "development"', required: false, description: 'The deployment environment.' },
  { name: 'timestamp', type: 'string (ISO 8601)', required: false, description: 'Custom timestamp. Defaults to server time if omitted.' },
  { name: 'meta', type: 'object', required: false, description: 'Arbitrary key-value pairs for custom metadata.' },
  { name: 'traceId', type: 'string', required: false, description: 'Distributed trace ID for correlating logs across services.' },
  { name: 'spanId', type: 'string', required: false, description: 'Span ID within a distributed trace.' },
  { name: 'userId', type: 'string', required: false, description: 'The user associated with this log entry.' },
  { name: 'requestId', type: 'string', required: false, description: 'Request correlation ID for tracking a single request.' },
  { name: 'host', type: 'string', required: false, description: 'The hostname or server name where the log originated.' },
  { name: 'tags', type: 'string[]', required: false, description: 'Array of searchable tags for filtering and categorization.' },
]

function scrollToSection(id: string) {
  activeSection.value = id
  mobileNavOpen.value = false
  const el = document.getElementById(id)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

onMounted(() => {
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          activeSection.value = entry.target.id
        }
      }
    },
    { rootMargin: '-80px 0px -60% 0px', threshold: 0 },
  )

  for (const section of sections) {
    const el = document.getElementById(section.id)
    if (el) observer.observe(el)
  }

  onUnmounted(() => observer.disconnect())
})
</script>

<template>
  <div class="min-h-screen">
    <!-- Mobile nav toggle -->
    <div class="lg:hidden sticky top-0 z-40 bg-surface-950/90 backdrop-blur-md border-b border-surface-800">
      <div class="px-4 py-3 flex items-center justify-between">
        <h1 class="text-lg font-semibold text-surface-100">Documentation</h1>
        <button
          class="p-2 rounded-lg text-surface-400 hover:text-surface-200 hover:bg-surface-800 transition-colors"
          @click="mobileNavOpen = !mobileNavOpen"
        >
          <svg v-if="!mobileNavOpen" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
          <svg v-else class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Mobile nav dropdown -->
      <Transition
        enter-active-class="transition-all duration-200 ease-out"
        enter-from-class="max-h-0 opacity-0"
        enter-to-class="max-h-96 opacity-100"
        leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="max-h-96 opacity-100"
        leave-to-class="max-h-0 opacity-0"
      >
        <nav v-show="mobileNavOpen" class="overflow-hidden border-t border-surface-800">
          <ul class="py-2 px-4 space-y-1">
            <li v-for="section in sections" :key="section.id">
              <button
                class="w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors"
                :class="activeSection === section.id
                  ? 'text-primary-400 bg-primary-500/10'
                  : 'text-surface-400 hover:text-surface-200 hover:bg-surface-800/50'"
                @click="scrollToSection(section.id)"
              >
                {{ section.label }}
              </button>
            </li>
          </ul>
        </nav>
      </Transition>
    </div>

    <div class="max-w-[90rem] mx-auto flex">
      <!-- Desktop sidebar -->
      <aside class="hidden lg:block w-64 shrink-0">
        <nav class="sticky top-24 p-6 pr-4 max-h-[calc(100vh-6rem)] overflow-y-auto">
          <h2 class="text-xs font-semibold uppercase tracking-wider text-surface-500 mb-4 px-3">
            Documentation
          </h2>
          <ul class="space-y-1">
            <li v-for="section in sections" :key="section.id">
              <button
                class="w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150"
                :class="activeSection === section.id
                  ? 'text-primary-400 bg-primary-500/10 border-l-2 border-primary-500'
                  : 'text-surface-400 hover:text-surface-200 hover:bg-surface-800/50 border-l-2 border-transparent'"
                @click="scrollToSection(section.id)"
              >
                {{ section.label }}
              </button>
            </li>
          </ul>

          <!-- Sidebar footer -->
          <div class="mt-8 pt-6 border-t border-surface-800 px-3">
            <a
              href="https://github.com/whoisarjen/logify"
              target="_blank"
              rel="noopener noreferrer"
              class="flex items-center gap-2 text-xs text-surface-500 hover:text-surface-300 transition-colors"
            >
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              Edit on GitHub
            </a>
          </div>
        </nav>
      </aside>

      <!-- Main content -->
      <main class="flex-1 min-w-0 px-4 sm:px-6 lg:px-12 py-12 lg:py-16">
        <div class="max-w-4xl">

          <!-- ========================================== -->
          <!-- Getting Started -->
          <!-- ========================================== -->
          <section id="getting-started" class="scroll-mt-24 mb-20">
            <h1 class="text-3xl sm:text-4xl font-bold text-surface-50 mb-4">
              Getting Started
            </h1>
            <p class="text-lg text-surface-400 mb-8">
              Logify is an open-source log management platform that lets you ingest, search, and
              visualize your application logs in real-time. Get up and running in under 5 minutes.
            </p>

            <!-- Quick start steps -->
            <div class="space-y-6">
              <div class="flex gap-4">
                <div class="flex items-center justify-center w-8 h-8 rounded-full bg-primary-500/20 text-primary-400 text-sm font-bold shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <h3 class="text-base font-semibold text-surface-200 mb-1">Create an account</h3>
                  <p class="text-sm text-surface-400">
                    Sign up at
                    <code class="px-1.5 py-0.5 rounded bg-surface-800 text-primary-400 text-xs font-mono">logify.dev</code>
                    to get access to your dashboard. No credit card required.
                  </p>
                </div>
              </div>

              <div class="flex gap-4">
                <div class="flex items-center justify-center w-8 h-8 rounded-full bg-primary-500/20 text-primary-400 text-sm font-bold shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <h3 class="text-base font-semibold text-surface-200 mb-1">Create a project</h3>
                  <p class="text-sm text-surface-400">
                    Navigate to your dashboard and create a new project. Each project has its own
                    isolated log stream, API keys, and team settings.
                  </p>
                </div>
              </div>

              <div class="flex gap-4">
                <div class="flex items-center justify-center w-8 h-8 rounded-full bg-primary-500/20 text-primary-400 text-sm font-bold shrink-0 mt-0.5">
                  3
                </div>
                <div>
                  <h3 class="text-base font-semibold text-surface-200 mb-1">Generate an API key</h3>
                  <p class="text-sm text-surface-400">
                    Go to
                    <strong class="text-surface-300">Project Settings &rarr; API Keys</strong>
                    and generate a new key. Keep it safe -- you will need it to authenticate requests.
                  </p>
                </div>
              </div>

              <div class="flex gap-4">
                <div class="flex items-center justify-center w-8 h-8 rounded-full bg-primary-500/20 text-primary-400 text-sm font-bold shrink-0 mt-0.5">
                  4
                </div>
                <div>
                  <h3 class="text-base font-semibold text-surface-200 mb-1">Send your first log</h3>
                  <p class="text-sm text-surface-400 mb-4">
                    Use the REST API to send a log entry. Here is a quick example:
                  </p>
                  <div class="code-block p-4 overflow-x-auto">
                    <pre class="text-surface-300"><span class="text-primary-400">curl</span> -X POST https://api.logify.dev/api/v1/logs \
  -H <span class="text-success">"Content-Type: application/json"</span> \
  -H <span class="text-success">"X-API-Key: your-api-key"</span> \
  -d <span class="text-success">'{"level":"info","message":"Hello from Logify!"}'</span></pre>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- ========================================== -->
          <!-- Authentication -->
          <!-- ========================================== -->
          <section id="authentication" class="scroll-mt-24 mb-20">
            <h2 class="text-2xl sm:text-3xl font-bold text-surface-50 mb-4">
              Authentication
            </h2>
            <p class="text-surface-400 mb-6">
              All API requests must be authenticated using an API key. API keys are scoped to a
              single project and can be created or revoked from your dashboard.
            </p>

            <h3 class="text-lg font-semibold text-surface-200 mb-3">How API keys work</h3>
            <ul class="space-y-2.5 mb-8">
              <li class="flex items-start gap-3 text-sm text-surface-400">
                <svg class="w-5 h-5 shrink-0 mt-0.5 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                Each API key is tied to a specific project. Logs sent with that key are stored in the corresponding project.
              </li>
              <li class="flex items-start gap-3 text-sm text-surface-400">
                <svg class="w-5 h-5 shrink-0 mt-0.5 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                Keys are shown only once at creation time. Store them securely in environment variables.
              </li>
              <li class="flex items-start gap-3 text-sm text-surface-400">
                <svg class="w-5 h-5 shrink-0 mt-0.5 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                You can revoke a key at any time. Revoked keys immediately stop working.
              </li>
              <li class="flex items-start gap-3 text-sm text-surface-400">
                <svg class="w-5 h-5 shrink-0 mt-0.5 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                The number of API keys you can create depends on your plan (Free: 1, Pro: 10, Enterprise: unlimited).
              </li>
            </ul>

            <h3 class="text-lg font-semibold text-surface-200 mb-3">Using your API key</h3>
            <p class="text-sm text-surface-400 mb-4">
              Pass your API key in the
              <code class="px-1.5 py-0.5 rounded bg-surface-800 text-primary-400 text-xs font-mono">X-API-Key</code>
              header with every request:
            </p>
            <div class="code-block p-4 overflow-x-auto mb-6">
              <pre class="text-surface-300">X-API-Key: logify_k_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx</pre>
            </div>

            <div class="p-4 rounded-xl border border-warning/20 bg-warning/5">
              <div class="flex items-start gap-3">
                <svg class="w-5 h-5 shrink-0 text-warning mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
                <div>
                  <p class="text-sm font-medium text-warning">Security notice</p>
                  <p class="text-xs text-surface-400 mt-1">
                    Never expose your API key in client-side code, public repositories, or browser requests.
                    Always send logs from your backend or a secure server environment.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <!-- ========================================== -->
          <!-- Log Ingestion API -->
          <!-- ========================================== -->
          <section id="log-ingestion" class="scroll-mt-24 mb-20">
            <h2 class="text-2xl sm:text-3xl font-bold text-surface-50 mb-4">
              Log Ingestion API
            </h2>
            <p class="text-surface-400 mb-8">
              The log ingestion endpoint accepts structured log data and stores it in your project.
              Logs are available for search and streaming within seconds of ingestion.
            </p>

            <!-- Endpoint -->
            <div class="mb-8">
              <h3 class="text-lg font-semibold text-surface-200 mb-3">Endpoint</h3>
              <div class="code-block p-4 flex items-center gap-3 overflow-x-auto">
                <span class="inline-flex items-center px-2.5 py-1 rounded-md bg-success/20 text-success text-xs font-bold uppercase tracking-wide">
                  POST
                </span>
                <code class="text-surface-200">/api/v1/logs</code>
              </div>
            </div>

            <!-- Headers -->
            <div class="mb-8">
              <h3 class="text-lg font-semibold text-surface-200 mb-3">Headers</h3>
              <div class="overflow-x-auto">
                <table class="w-full text-sm">
                  <thead>
                    <tr class="border-b border-surface-800">
                      <th class="text-left py-3 px-4 text-surface-400 font-medium">Header</th>
                      <th class="text-left py-3 px-4 text-surface-400 font-medium">Value</th>
                      <th class="text-left py-3 px-4 text-surface-400 font-medium">Required</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr class="border-b border-surface-800/50">
                      <td class="py-3 px-4">
                        <code class="text-primary-400 font-mono text-xs">Content-Type</code>
                      </td>
                      <td class="py-3 px-4 text-surface-300">application/json</td>
                      <td class="py-3 px-4">
                        <span class="text-success text-xs font-medium">Yes</span>
                      </td>
                    </tr>
                    <tr>
                      <td class="py-3 px-4">
                        <code class="text-primary-400 font-mono text-xs">X-API-Key</code>
                      </td>
                      <td class="py-3 px-4 text-surface-300">Your project API key</td>
                      <td class="py-3 px-4">
                        <span class="text-success text-xs font-medium">Yes</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Body schema -->
            <div class="mb-10">
              <h3 class="text-lg font-semibold text-surface-200 mb-3">Request body</h3>
              <div class="overflow-x-auto">
                <table class="w-full text-sm">
                  <thead>
                    <tr class="border-b border-surface-800">
                      <th class="text-left py-3 px-4 text-surface-400 font-medium">Field</th>
                      <th class="text-left py-3 px-4 text-surface-400 font-medium">Type</th>
                      <th class="text-left py-3 px-4 text-surface-400 font-medium hidden sm:table-cell">Required</th>
                      <th class="text-left py-3 px-4 text-surface-400 font-medium">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="field in bodyFields"
                      :key="field.name"
                      class="border-b border-surface-800/50"
                    >
                      <td class="py-3 px-4">
                        <code class="text-primary-400 font-mono text-xs">{{ field.name }}</code>
                      </td>
                      <td class="py-3 px-4">
                        <code class="text-surface-400 font-mono text-xs">{{ field.type }}</code>
                      </td>
                      <td class="py-3 px-4 hidden sm:table-cell">
                        <span
                          class="text-xs font-medium"
                          :class="field.required ? 'text-success' : 'text-surface-500'"
                        >
                          {{ field.required ? 'Yes' : 'No' }}
                        </span>
                      </td>
                      <td class="py-3 px-4 text-surface-400">
                        <span v-if="field.required" class="sm:hidden text-success text-xs font-medium mr-1">Required.</span>
                        {{ field.description }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Example requests -->
            <div class="mb-10">
              <h3 class="text-lg font-semibold text-surface-200 mb-4">Example requests</h3>

              <!-- Language tabs -->
              <div class="flex gap-1 mb-0 border-b border-surface-800">
                <button
                  class="px-4 py-2.5 text-sm font-medium transition-colors relative"
                  :class="activeTab === 'curl'
                    ? 'text-primary-400'
                    : 'text-surface-500 hover:text-surface-300'"
                  @click="activeTab = 'curl'"
                >
                  cURL
                  <span
                    v-if="activeTab === 'curl'"
                    class="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500"
                  />
                </button>
                <button
                  class="px-4 py-2.5 text-sm font-medium transition-colors relative"
                  :class="activeTab === 'javascript'
                    ? 'text-primary-400'
                    : 'text-surface-500 hover:text-surface-300'"
                  @click="activeTab = 'javascript'"
                >
                  JavaScript
                  <span
                    v-if="activeTab === 'javascript'"
                    class="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500"
                  />
                </button>
                <button
                  class="px-4 py-2.5 text-sm font-medium transition-colors relative"
                  :class="activeTab === 'python'
                    ? 'text-primary-400'
                    : 'text-surface-500 hover:text-surface-300'"
                  @click="activeTab = 'python'"
                >
                  Python
                  <span
                    v-if="activeTab === 'python'"
                    class="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500"
                  />
                </button>
              </div>

              <div class="code-block rounded-t-none p-4 overflow-x-auto">
                <pre v-if="activeTab === 'curl'" class="text-surface-300">{{ curlExample }}</pre>
                <pre v-else-if="activeTab === 'javascript'" class="text-surface-300">{{ jsExample }}</pre>
                <pre v-else class="text-surface-300">{{ pythonExample }}</pre>
              </div>
            </div>

            <!-- Response formats -->
            <div>
              <h3 class="text-lg font-semibold text-surface-200 mb-4">Response formats</h3>

              <!-- Success response -->
              <div class="mb-6">
                <div class="flex items-center gap-2 mb-2">
                  <span class="inline-flex items-center px-2 py-0.5 rounded-md bg-success/20 text-success text-xs font-bold">
                    200
                  </span>
                  <span class="text-sm text-surface-300 font-medium">Success</span>
                </div>
                <div class="code-block p-4 overflow-x-auto">
                  <pre class="text-surface-300">{{ successResponse }}</pre>
                </div>
              </div>

              <!-- Error response -->
              <div class="mb-6">
                <div class="flex items-center gap-2 mb-2">
                  <span class="inline-flex items-center px-2 py-0.5 rounded-md bg-error/20 text-error text-xs font-bold">
                    422
                  </span>
                  <span class="text-sm text-surface-300 font-medium">Validation Error</span>
                </div>
                <div class="code-block p-4 overflow-x-auto">
                  <pre class="text-surface-300">{{ errorResponse }}</pre>
                </div>
              </div>

              <!-- Rate limit response -->
              <div>
                <div class="flex items-center gap-2 mb-2">
                  <span class="inline-flex items-center px-2 py-0.5 rounded-md bg-warning/20 text-warning text-xs font-bold">
                    429
                  </span>
                  <span class="text-sm text-surface-300 font-medium">Rate Limit Exceeded</span>
                </div>
                <div class="code-block p-4 overflow-x-auto">
                  <pre class="text-surface-300">{{ rateLimitResponse }}</pre>
                </div>
              </div>
            </div>
          </section>

          <!-- ========================================== -->
          <!-- Rate Limits -->
          <!-- ========================================== -->
          <section id="rate-limits" class="scroll-mt-24 mb-20">
            <h2 class="text-2xl sm:text-3xl font-bold text-surface-50 mb-4">
              Rate Limits
            </h2>
            <p class="text-surface-400 mb-8">
              API rate limits protect the platform and ensure fair usage across all users.
              Limits are applied per API key.
            </p>

            <div class="overflow-x-auto mb-8">
              <table class="w-full text-sm">
                <thead>
                  <tr class="border-b border-surface-800">
                    <th class="text-left py-3 px-4 text-surface-400 font-medium">Plan</th>
                    <th class="text-left py-3 px-4 text-surface-400 font-medium">Rate Limit</th>
                    <th class="text-left py-3 px-4 text-surface-400 font-medium">Burst</th>
                    <th class="text-left py-3 px-4 text-surface-400 font-medium hidden sm:table-cell">Monthly Cap</th>
                  </tr>
                </thead>
                <tbody>
                  <tr class="border-b border-surface-800/50">
                    <td class="py-3 px-4 text-surface-300 font-medium">Free</td>
                    <td class="py-3 px-4 text-surface-400">100 req/min</td>
                    <td class="py-3 px-4 text-surface-400">20 req/sec</td>
                    <td class="py-3 px-4 text-surface-400 hidden sm:table-cell">10,000 logs</td>
                  </tr>
                  <tr class="border-b border-surface-800/50">
                    <td class="py-3 px-4 text-surface-300 font-medium">Pro</td>
                    <td class="py-3 px-4 text-surface-400">1,000 req/min</td>
                    <td class="py-3 px-4 text-surface-400">100 req/sec</td>
                    <td class="py-3 px-4 text-surface-400 hidden sm:table-cell">1,000,000 logs</td>
                  </tr>
                  <tr>
                    <td class="py-3 px-4 text-surface-300 font-medium">Enterprise</td>
                    <td class="py-3 px-4 text-surface-400">Custom</td>
                    <td class="py-3 px-4 text-surface-400">Custom</td>
                    <td class="py-3 px-4 text-surface-400 hidden sm:table-cell">Unlimited</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 class="text-lg font-semibold text-surface-200 mb-3">Rate limit headers</h3>
            <p class="text-sm text-surface-400 mb-4">
              Every API response includes rate limit information in the headers:
            </p>
            <div class="code-block p-4 overflow-x-auto mb-8">
              <pre class="text-surface-300">X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1708700400</pre>
            </div>

            <h3 class="text-lg font-semibold text-surface-200 mb-3">Handling rate limits</h3>
            <p class="text-sm text-surface-400 mb-4">
              When you hit a rate limit, the API returns a
              <code class="px-1.5 py-0.5 rounded bg-surface-800 text-warning text-xs font-mono">429 Too Many Requests</code>
              response. Implement exponential backoff in your client:
            </p>
            <div class="code-block p-4 overflow-x-auto">
              <pre class="text-surface-300"><span class="text-primary-400">async function</span> <span class="text-surface-200">sendLogWithRetry</span>(payload, retries = 3) {
  <span class="text-primary-400">for</span> (<span class="text-primary-400">let</span> i = 0; i &lt; retries; i++) {
    <span class="text-primary-400">const</span> res = <span class="text-primary-400">await</span> fetch(<span class="text-success">"/api/v1/logs"</span>, {
      method: <span class="text-success">"POST"</span>,
      headers: { <span class="text-success">"X-API-Key"</span>: API_KEY },
      body: JSON.stringify(payload),
    });

    <span class="text-primary-400">if</span> (res.status !== 429) <span class="text-primary-400">return</span> res.json();

    <span class="text-primary-400">const</span> retryAfter = res.headers.get(<span class="text-success">"Retry-After"</span>) || 2 ** i;
    <span class="text-primary-400">await</span> <span class="text-primary-400">new</span> Promise(r =&gt; setTimeout(r, retryAfter * 1000));
  }
  <span class="text-primary-400">throw new</span> Error(<span class="text-success">"Rate limit exceeded after retries"</span>);
}</pre>
            </div>
          </section>

          <!-- ========================================== -->
          <!-- SDKs -->
          <!-- ========================================== -->
          <section id="sdks" class="scroll-mt-24 mb-20">
            <h2 class="text-2xl sm:text-3xl font-bold text-surface-50 mb-4">
              SDKs
            </h2>
            <p class="text-surface-400 mb-8">
              Official SDKs are coming soon to make integration even easier. In the meantime,
              you can use the REST API directly from any language.
            </p>

            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <!-- Node.js -->
              <div class="p-5 rounded-xl border border-surface-800 bg-surface-900/50">
                <div class="flex items-center gap-3 mb-3">
                  <div class="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                    <svg class="w-5 h-5 text-success" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M11.998 24c-.321 0-.641-.084-.922-.247l-2.936-1.737c-.438-.245-.224-.332-.08-.383.585-.203.703-.249 1.328-.604.065-.037.151-.023.218.017l2.256 1.339a.29.29 0 00.272 0l8.795-5.076a.277.277 0 00.134-.238V6.921a.28.28 0 00-.137-.242L12.135 1.6a.272.272 0 00-.27 0L3.078 6.68a.281.281 0 00-.138.243v10.15c0 .099.053.19.138.236l2.409 1.392c1.307.654 2.108-.116 2.108-.891V7.787c0-.142.114-.253.256-.253h1.115c.139 0 .255.112.255.253v10.021c0 1.745-.95 2.745-2.604 2.745-.508 0-.909 0-2.026-.551L2.28 18.675a1.857 1.857 0 01-.922-1.604V6.921c0-.659.353-1.275.922-1.603L11.076.242a1.925 1.925 0 011.846 0l8.794 5.076c.57.329.924.944.924 1.603v10.15a1.86 1.86 0 01-.924 1.604l-8.794 5.076a1.835 1.835 0 01-.924.249z" />
                    </svg>
                  </div>
                  <div>
                    <h4 class="text-sm font-semibold text-surface-200">Node.js / TypeScript</h4>
                    <span class="text-xs text-surface-500">Coming soon</span>
                  </div>
                </div>
                <div class="code-block p-3 text-xs overflow-x-auto">
                  <pre class="text-surface-500">npm install @logify/node</pre>
                </div>
              </div>

              <!-- Python -->
              <div class="p-5 rounded-xl border border-surface-800 bg-surface-900/50">
                <div class="flex items-center gap-3 mb-3">
                  <div class="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center">
                    <svg class="w-5 h-5 text-info" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M14.25.18l.9.2.73.26.59.3.45.32.34.34.25.34.16.33.1.3.04.26.02.2-.01.13V8.5l-.05.63-.13.55-.21.46-.26.38-.3.31-.33.25-.35.19-.35.14-.33.1-.3.07-.26.04-.21.02H8.77l-.69.05-.59.14-.5.22-.41.27-.33.32-.27.35-.2.36-.15.37-.1.35-.07.32-.04.27-.02.21v3.06H3.17l-.21-.03-.28-.07-.32-.12-.35-.18-.36-.26-.36-.36-.35-.46-.32-.59-.28-.73-.21-.88-.14-1.05-.05-1.23.06-1.22.16-1.04.24-.87.32-.71.36-.57.4-.44.42-.33.42-.24.4-.16.36-.1.32-.05.24-.01h.16l.06.01h8.16v-.83H6.18l-.01-2.75-.02-.37.05-.34.11-.31.17-.28.25-.26.31-.23.38-.2.44-.18.51-.15.58-.12.64-.1.71-.06.77-.04.84-.02 1.27.05zm-6.3 1.98l-.23.33-.08.41.08.41.23.34.33.22.41.09.41-.09.33-.22.23-.34.08-.41-.08-.41-.23-.33-.33-.22-.41-.09-.41.09-.33.22zM21.1 6.11l.28.06.32.12.35.18.36.27.36.35.35.47.32.59.28.73.21.89.14 1.04.05 1.23-.06 1.23-.16 1.04-.24.86-.32.71-.36.57-.4.45-.42.33-.42.24-.4.16-.36.09-.32.05-.24.02-.16-.01h-8.22v.82h5.84l.01 2.76.02.36-.05.34-.11.31-.17.29-.25.25-.31.24-.38.2-.44.17-.51.15-.58.13-.64.09-.71.07-.77.04-.84.01-1.27-.04-1.07-.14-.9-.2-.73-.25-.59-.3-.45-.33-.34-.34-.25-.34-.16-.33-.1-.3-.04-.25-.02-.2.01-.13v-5.34l.05-.64.13-.54.21-.46.26-.38.3-.32.33-.24.35-.2.35-.14.33-.1.3-.06.26-.04.21-.02.13-.01h5.84l.69-.05.59-.14.5-.21.41-.28.33-.32.27-.35.2-.36.15-.36.1-.35.07-.32.04-.28.02-.21V6.07h2.09l.14.01.21.03zm-6.47 14.25l-.23.33-.08.41.08.41.23.33.33.23.41.08.41-.08.33-.23.23-.33.08-.41-.08-.41-.23-.33-.33-.23-.41-.08-.41.08-.33.23z" />
                    </svg>
                  </div>
                  <div>
                    <h4 class="text-sm font-semibold text-surface-200">Python</h4>
                    <span class="text-xs text-surface-500">Coming soon</span>
                  </div>
                </div>
                <div class="code-block p-3 text-xs overflow-x-auto">
                  <pre class="text-surface-500">pip install logify-python</pre>
                </div>
              </div>

              <!-- Go -->
              <div class="p-5 rounded-xl border border-surface-800 bg-surface-900/50">
                <div class="flex items-center gap-3 mb-3">
                  <div class="w-10 h-10 rounded-lg bg-primary-500/10 flex items-center justify-center">
                    <svg class="w-5 h-5 text-primary-400" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M1.811 10.231c-.047 0-.058-.023-.035-.059l.246-.315c.023-.035.081-.058.128-.058h4.172c.046 0 .058.035.035.07l-.199.303c-.023.036-.082.07-.117.07zM.047 11.306c-.047 0-.059-.023-.035-.058l.245-.316c.023-.035.082-.058.129-.058h5.328c.047 0 .07.035.058.07l-.093.28c-.012.047-.058.07-.105.07zm2.828 1.075c-.047 0-.059-.035-.035-.07l.163-.292c.023-.035.07-.07.117-.07h2.337c.047 0 .07.035.07.082l-.023.28c0 .047-.047.082-.082.082zm12.129-2.36c-.736.187-1.239.327-1.963.514-.176.046-.187.058-.34-.117-.174-.199-.303-.327-.548-.444-.737-.362-1.45-.257-2.115.175-.789.514-1.195 1.273-1.183 2.197.011.916.627 1.672 1.532 1.8.793.116 1.462-.152 1.987-.737.105-.128.199-.269.303-.398H12.73c-.245 0-.304-.152-.222-.35.152-.362.432-.966.596-1.273a.315.315 0 01.292-.187h4.253c-.023.316-.023.631-.07.947a4.983 4.983 0 01-.958 2.29c-.841 1.11-1.94 1.8-3.324 1.963-1.12.14-2.15-.07-3.048-.76-.841-.643-1.356-1.519-1.532-2.57-.21-1.227.07-2.36.724-3.395.735-1.17 1.788-1.963 3.118-2.302.944-.245 1.882-.21 2.768.21.643.304 1.146.76 1.532 1.356.116.164.105.257-.07.327z" />
                    </svg>
                  </div>
                  <div>
                    <h4 class="text-sm font-semibold text-surface-200">Go</h4>
                    <span class="text-xs text-surface-500">Coming soon</span>
                  </div>
                </div>
                <div class="code-block p-3 text-xs overflow-x-auto">
                  <pre class="text-surface-500">go get github.com/logify/logify-go</pre>
                </div>
              </div>
            </div>

            <div class="mt-8 p-4 rounded-xl border border-primary-500/20 bg-primary-500/5">
              <div class="flex items-start gap-3">
                <svg class="w-5 h-5 shrink-0 text-primary-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                </svg>
                <div>
                  <p class="text-sm font-medium text-primary-300">Want to contribute an SDK?</p>
                  <p class="text-xs text-surface-400 mt-1">
                    We welcome community SDKs in any language. Check out our
                    <a href="https://github.com/whoisarjen/logify" target="_blank" class="text-primary-400 hover:text-primary-300 transition-colors underline">
                      contributing guide
                    </a>
                    on GitHub to get started.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <!-- ========================================== -->
          <!-- Dashboard -->
          <!-- ========================================== -->
          <section id="dashboard" class="scroll-mt-24 mb-20">
            <h2 class="text-2xl sm:text-3xl font-bold text-surface-50 mb-4">
              Dashboard
            </h2>
            <p class="text-surface-400 mb-8">
              The Logify dashboard provides a real-time view of your logs with powerful search
              and filtering capabilities.
            </p>

            <div class="space-y-8">
              <!-- Log Viewer -->
              <div>
                <h3 class="text-lg font-semibold text-surface-200 mb-3">Log Viewer</h3>
                <p class="text-sm text-surface-400 mb-4">
                  The main log viewer displays a real-time feed of your ingested logs. Each log entry
                  shows the timestamp, severity level, service name, and message. Click any entry to
                  expand its full details including metadata, trace IDs, and tags.
                </p>
                <div class="code-block p-4 overflow-x-auto">
                  <div class="space-y-2 text-xs">
                    <div class="flex items-center gap-3">
                      <span class="text-surface-500 w-44 shrink-0">2026-02-23 10:30:01</span>
                      <span class="px-1.5 py-0.5 rounded text-xs font-medium bg-info/20 text-info w-12 text-center">INFO</span>
                      <span class="text-surface-500 w-24 shrink-0">auth-svc</span>
                      <span class="text-surface-300">User signed in successfully</span>
                    </div>
                    <div class="flex items-center gap-3">
                      <span class="text-surface-500 w-44 shrink-0">2026-02-23 10:30:02</span>
                      <span class="px-1.5 py-0.5 rounded text-xs font-medium bg-warning/20 text-warning w-12 text-center">WARN</span>
                      <span class="text-surface-500 w-24 shrink-0">api-gw</span>
                      <span class="text-surface-300">Rate limit approaching threshold</span>
                    </div>
                    <div class="flex items-center gap-3">
                      <span class="text-surface-500 w-44 shrink-0">2026-02-23 10:30:03</span>
                      <span class="px-1.5 py-0.5 rounded text-xs font-medium bg-error/20 text-error w-12 text-center">ERROR</span>
                      <span class="text-surface-500 w-24 shrink-0">payments</span>
                      <span class="text-surface-300">Payment processing failed: timeout</span>
                    </div>
                    <div class="flex items-center gap-3">
                      <span class="text-surface-500 w-44 shrink-0">2026-02-23 10:30:04</span>
                      <span class="px-1.5 py-0.5 rounded text-xs font-medium bg-debug/20 text-debug w-12 text-center">DEBUG</span>
                      <span class="text-surface-500 w-24 shrink-0">worker</span>
                      <span class="text-surface-300">Job queue processed: 142 items</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Search -->
              <div>
                <h3 class="text-lg font-semibold text-surface-200 mb-3">Search</h3>
                <p class="text-sm text-surface-400 mb-4">
                  Full-text search across all log messages and metadata. Use the search bar to find
                  specific logs instantly. Searches support the following syntax:
                </p>
                <div class="code-block p-4 overflow-x-auto">
                  <pre class="text-surface-300 text-xs"><span class="text-surface-500"># Simple text search</span>
payment failed

<span class="text-surface-500"># Search by field</span>
service:auth-service level:error

<span class="text-surface-500"># Search with tags</span>
tag:deployment environment:production

<span class="text-surface-500"># Search by trace ID</span>
traceId:abc-123-def-456</pre>
                </div>
              </div>

              <!-- Filters -->
              <div>
                <h3 class="text-lg font-semibold text-surface-200 mb-3">Filters</h3>
                <p class="text-sm text-surface-400 mb-4">
                  Use the sidebar filters to narrow down logs by:
                </p>
                <ul class="space-y-2 mb-4">
                  <li class="flex items-start gap-3 text-sm text-surface-400">
                    <svg class="w-5 h-5 shrink-0 mt-0.5 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    <span><strong class="text-surface-300">Log level</strong> -- Filter by debug, info, warn, error, or fatal</span>
                  </li>
                  <li class="flex items-start gap-3 text-sm text-surface-400">
                    <svg class="w-5 h-5 shrink-0 mt-0.5 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    <span><strong class="text-surface-300">Service</strong> -- Filter by service or application name</span>
                  </li>
                  <li class="flex items-start gap-3 text-sm text-surface-400">
                    <svg class="w-5 h-5 shrink-0 mt-0.5 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    <span><strong class="text-surface-300">Environment</strong> -- Filter by production, staging, or development</span>
                  </li>
                  <li class="flex items-start gap-3 text-sm text-surface-400">
                    <svg class="w-5 h-5 shrink-0 mt-0.5 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    <span><strong class="text-surface-300">Time range</strong> -- Select a custom time window or use presets (last 15m, 1h, 24h, 7d)</span>
                  </li>
                  <li class="flex items-start gap-3 text-sm text-surface-400">
                    <svg class="w-5 h-5 shrink-0 mt-0.5 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    <span><strong class="text-surface-300">Tags</strong> -- Filter by one or more searchable tags</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          <!-- Page bottom nav -->
          <div class="pt-8 mt-8 border-t border-surface-800">
            <div class="flex items-center justify-between">
              <p class="text-sm text-surface-500">
                Was this page helpful? Let us know on
                <a href="https://github.com/whoisarjen/logify" target="_blank" class="text-primary-400 hover:text-primary-300 transition-colors">
                  GitHub
                </a>.
              </p>
              <button
                class="text-sm text-surface-500 hover:text-surface-300 transition-colors"
                @click="scrollToSection('getting-started')"
              >
                Back to top
              </button>
            </div>
          </div>

        </div>
      </main>
    </div>
  </div>
</template>
