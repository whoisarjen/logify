<div align="center">
  <br />
  <img src="public/favicon.svg" alt="Logify" width="80" height="80" />
  <h1>Logify</h1>
  <p><strong>Open source log management platform</strong></p>
  <p>Ingest, search, and visualize your application logs in real-time.</p>
  <br />

  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
  [![Nuxt](https://img.shields.io/badge/Nuxt-4-00DC82?logo=nuxt.js&logoColor=white)](https://nuxt.com)
  [![Vue](https://img.shields.io/badge/Vue-3-4FC08D?logo=vue.js&logoColor=white)](https://vuejs.org)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
  [![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-2.1-4baaaa.svg)](CODE_OF_CONDUCT.md)

  [Live Demo](https://logify.whoisarjen.com) &bull; [Documentation](https://logify.whoisarjen.com/docs) &bull; [Report Bug](https://github.com/whoisarjen/logify/issues)

</div>

---

## What is Logify?

Logify is a self-hosted, open source alternative to services like Datadog, Logtail, and Sentry for log management. Ship your application logs to a single endpoint, then search, filter, and visualize them through a modern dashboard.

**Why Logify?**

- **Simple** -- One API endpoint, one API key, done
- **Fast** -- Neon PostgreSQL for blazing reads
- **Self-hosted** -- Your data stays on your servers
- **Open source** -- MIT licensed, no vendor lock-in
- **Modern stack** -- Built with Nuxt 4, Vue 3, and Tailwind CSS v4

## Features

- **Real-time Log Streaming** -- Watch logs flow in with zero delay
- **Powerful Search** -- Full-text search with filters for level, service, time range, and tags
- **API-First Design** -- Simple REST API with comprehensive documentation
- **Rate Limiting** -- Built-in protection with configurable limits per API key
- **Multiple Environments** -- Separate logs by production, staging, and development
- **API Key Management** -- Generate, rotate, and revoke keys from the dashboard
- **Authentication** -- Secure user accounts with session-based auth
- **Dark Mode** -- Beautiful dark theme designed for developers

## Quick Start

### Prerequisites

- [Node.js](https://nodejs.org) >= 20
- npm, pnpm, or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/whoisarjen/logify.git
cd logify

# Install dependencies
npm install

# Create a Neon project at https://neon.tech and get your connection string

# Copy environment variables and set your DATABASE_URL
cp .env.example .env

# Push the database schema to Neon
npx prisma db push

# Start the development server
npm run dev
```

The app will be running at [http://localhost:3000](http://localhost:3000).

### Send Your First Log

After creating an account and generating an API key from the dashboard:

```bash
curl -X POST http://localhost:3000/api/v1/logs \
  -H "X-API-Key: lgfy_your_api_key_here" \
  -H "Content-Type: application/json" \
  -d '{
    "level": "info",
    "message": "User authenticated successfully",
    "service": "auth-service",
    "environment": "production",
    "meta": {
      "userId": "usr_123",
      "method": "oauth"
    }
  }'
```

## API Reference

### Log Ingestion

```
POST /api/v1/logs
```

**Headers:**

| Header | Required | Description |
|--------|----------|-------------|
| `X-API-Key` | Yes | Your API key (`lgfy_...`) |
| `Content-Type` | Yes | `application/json` |

**Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `level` | string | Yes | `debug`, `info`, `warn`, `error`, or `fatal` |
| `message` | string | Yes | The log message |
| `service` | string | No | Service or application name |
| `environment` | string | No | `production`, `staging`, or `development` |
| `timestamp` | string | No | ISO 8601 timestamp (defaults to now) |
| `meta` | object | No | Custom metadata key-value pairs |
| `traceId` | string | No | Distributed trace ID |
| `spanId` | string | No | Span ID for tracing |
| `userId` | string | No | Associated user identifier |
| `requestId` | string | No | Request correlation ID |
| `host` | string | No | Host or server name |
| `tags` | string[] | No | Searchable tags |

**Response:**

```json
{
  "success": true,
  "logId": "abc123..."
}
```

### Rate Limits

| Tier | Requests/day | Monthly Logs |
|------|-------------|-------------|
| Free | 500 | 10,000 |
| Pro | 50,000 | 1,000,000 |
| Enterprise | Custom | Unlimited |

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | [Nuxt 4](https://nuxt.com) |
| **Frontend** | [Vue 3](https://vuejs.org) + [Tailwind CSS v4](https://tailwindcss.com) |
| **Backend** | [Nitro](https://nitro.build) (H3) |
| **Database** | [Neon PostgreSQL](https://neon.tech) + [Prisma ORM](https://www.prisma.io) |
| **Auth** | Session-based with bcrypt + secure cookies |
| **Fonts** | [Inter](https://rsms.me/inter/) + [JetBrains Mono](https://www.jetbrains.com/lp/mono/) |

## Project Structure

```
logify/
├── app/
│   ├── assets/css/         # Global styles (Tailwind)
│   ├── components/
│   │   ├── dashboard/      # Dashboard UI components
│   │   └── landing/        # Landing page components
│   ├── composables/        # Vue composables (useAuth)
│   ├── layouts/            # App layouts (default, dashboard)
│   └── pages/              # File-based routing
│       ├── dashboard/      # Dashboard pages
│       ├── docs.vue        # API documentation
│       ├── pricing.vue     # Pricing page
│       ├── login.vue       # Authentication
│       └── register.vue    # Registration
├── prisma/
│   └── schema.prisma       # Prisma schema definition
├── server/
│   ├── api/
│   │   ├── auth/           # Auth endpoints (login, register, me)
│   │   ├── keys/           # API key management
│   │   ├── logs/           # Log querying & stats
│   │   └── v1/             # Public log ingestion API
│   ├── plugins/            # Nitro plugins (DB init)
│   └── utils/              # DB, auth, rate limiting
├── public/                 # Static assets
├── .github/                # Issue & PR templates
└── nuxt.config.ts          # Nuxt configuration
```

## Environment Variables

```env
# Neon PostgreSQL connection string
DATABASE_URL=postgresql://user:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require

# Secret for session token signing
SESSION_SECRET=your-secret-here
```

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Community

- [GitHub Issues](https://github.com/whoisarjen/logify/issues) -- Bug reports and feature requests
- [GitHub Discussions](https://github.com/whoisarjen/logify/discussions) -- Questions and ideas

## Security

If you discover a security vulnerability, please see our [Security Policy](SECURITY.md) for responsible disclosure guidelines.

## License

Logify is open source software licensed under the [MIT License](LICENSE).

---

<div align="center">
  <sub>Built with Nuxt 4 by the open source community</sub>
</div>
