# 💼 WorkNest — All-in-One HR Management System

WorkNest is a professional, full-stack HR management platform designed for SMBs.
It features a complete ecosystem for managing employees, projects, leave
requests, and team activity — wrapped in a premium UI and built on a
multi-tenant, security-first backend.

<p>
  <a href="../../actions/workflows/ci.yml"><img alt="CI"
    src="../../actions/workflows/ci.yml/badge.svg"></a>
  <a href="../../actions/workflows/semgrep.yml"><img alt="Semgrep"
    src="../../actions/workflows/semgrep.yml/badge.svg"></a>
  <a href="../../actions/workflows/e2e.yml"><img alt="E2E"
    src="../../actions/workflows/e2e.yml/badge.svg"></a>
  <a href="../../actions/workflows/lighthouse.yml"><img alt="Lighthouse"
    src="../../actions/workflows/lighthouse.yml/badge.svg"></a>
  <a href="https://github.com/topics/mern-stack"><img alt="Stack"
    src="https://img.shields.io/badge/Stack-MERN-emerald"></a>
  <img alt="Node" src="https://img.shields.io/badge/Node-20.x-339933?logo=node.js&logoColor=white">
  <img alt="React" src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white">
  <img alt="MongoDB" src="https://img.shields.io/badge/MongoDB-8-47A248?logo=mongodb&logoColor=white">
  <a href="LICENSE"><img alt="License"
    src="https://img.shields.io/badge/License-MIT-teal"></a>
</p>

## 🌟 Key features

- **Personal sandboxed demo** — every visitor gets a unique, isolated
  tenant with seeded data. See [ADR-0004](docs/adr/0004-demo-sandbox-ttl.md).
- **Project board** — Kanban with drag-and-drop, list and grid views,
  bulk actions, soft archive ([ADR-0008](docs/adr/0008-soft-delete-projects.md)).
- **Leave management** — request, approve/reject, per-user usage stats,
  14 leave types with conditional reason validation.
- **Analytics dashboard** — headcount, status distribution, weekly
  activity, project progress.
- **Multi-tenant by design** — strict company isolation enforced on
  every query ([ADR-0002](docs/adr/0002-multi-tenancy-company-field.md)).
- **GDPR-aware** — AES-256-CBC field-level encryption for PESEL and
  identity documents ([ADR-0003](docs/adr/0003-aes-encryption-pii.md)).
- **i18n** — full PL / EN parity (699 keys each), runtime detection.
- **Live updates** — Socket.IO over WebSockets, tenant-scoped rooms,
  JWT-authenticated handshake. The Kanban board reflects status,
  archive, and restore actions across teammates' tabs in real time.

## 🚀 Tech stack

| Layer    | Tools |
|----------|-------|
| Frontend | React 19, Vite, Tailwind CSS, React Router 7, @dnd-kit, react-hook-form + Zod, Recharts, i18next |
| Backend  | Node.js 20, Express 5, Mongoose 8, JWT, Helmet, express-rate-limit |
| Security | Access + refresh JWT split, AES-256-CBC for PII, CSP, RBAC, demo-tenant TTL cleanup |
| DevOps   | Docker Compose (dev + prod), GitHub Actions CI, CodeQL, Dependabot |
| Docs     | OpenAPI 3 (Swagger UI), Architecture Decision Records |

## 📐 Architecture

```text
┌─────────────────┐         ┌───────────────────────┐         ┌──────────────┐
│  React 19 SPA   │  HTTPS  │  Express 5 API        │  TCP    │  MongoDB 8   │
│  (Vite + Nginx) │ ──────▶ │  /api/auth            │ ──────▶ │  Tenant rows │
│                 │ ◀────── │  /api/projects        │ ◀────── │  + TTL index │
│  - i18n PL/EN   │  JSON   │  /api/tasks           │  BSON   │              │
│  - Lazy routes  │         │  /api/leaves /comments│         │              │
│  - JWT in mem   │         │  /api/users /activities│         │              │
│  - Refresh ckie │         │  /api/docs (Swagger)  │         │              │
└─────────────────┘         └───────────────────────┘         └──────────────┘
        │                            │
        │  httpOnly refresh cookie   │
        └────────────────────────────┘
```

See the [Architecture Decision Records](docs/adr/) for a deeper dive into
auth, multi-tenancy, the demo sandbox, lazy loading, and more.
[`CONTEXT.md`](CONTEXT.md) provides a domain-navigation guide for new
contributors — data models, key middleware, auth flow, and real-time
event catalogue in one place.

## 📖 API documentation

Interactive Swagger UI is exposed by the running server at:

```
http://localhost:5500/api/docs
```

The raw OpenAPI 3 spec is at `/api/docs.json`. All seven route files
(`auth`, `project`, `task`, `comment`, `leave`, `user`, `activity`) are
annotated in-source via `@openapi` JSDoc on
[`server/routes/*.js`](server/routes), covering every endpoint.

## 🛠️ Getting started

### Prerequisites

- Node.js v20+
- MongoDB (Atlas or local)

### Local install

```bash
git clone https://github.com/yourusername/worknest.git
cd worknest

# 1. Backend
cd server
npm install
cp .env.example .env             # set MONGODB_URI, JWT_SECRET, JWT_REFRESH_SECRET, ENCRYPTION_KEY
npm run dev                       # http://localhost:5500

# 2. Frontend (in a second terminal)
cd ../client
npm install
npm run dev                       # http://localhost:5173
```

### Docker (recommended)

The fastest way to run WorkNest — no Node.js or MongoDB setup required.

```bash
# Production
cp server/.env.example server/.env
docker-compose up -d              # http://localhost

# Development with hot reload
docker-compose -f docker-compose.dev.yml up

# Stop
docker-compose down
```

## 🔐 Demo sandbox (zero-friction onboarding)

The landing page exposes a "Try demo" button that:

1. Provisions a unique `Company` per click (no shared state between
   visitors).
2. Seeds three users, one project, one task, one approved leave.
3. Issues short-lived auth ([ADR-0001](docs/adr/0001-jwt-access-refresh-cookie.md)).
4. Self-destructs on `/logout` and via a 24-hour MongoDB TTL index.

Per-tenant resource caps in
[`limitDemoResources.js`](server/middleware/limitDemoResources.js) keep
the cluster well-behaved. Full rationale:
[ADR-0004](docs/adr/0004-demo-sandbox-ttl.md).

## 🧱 Engineering decisions

| ADR | Topic |
|-----|-------|
| [0000](docs/adr/0000-record-architecture-decisions.md) | Record architecture decisions |
| [0001](docs/adr/0001-jwt-access-refresh-cookie.md) | JWT access + refresh cookie auth |
| [0002](docs/adr/0002-multi-tenancy-company-field.md) | Multi-tenancy via `company` field |
| [0003](docs/adr/0003-aes-encryption-pii.md) | AES-256-CBC for sensitive PII |
| [0004](docs/adr/0004-demo-sandbox-ttl.md) | Demo sandbox: unique tenant + TTL |
| [0005](docs/adr/0005-lazy-load-protected-routes.md) | Lazy-load protected routes |
| [0006](docs/adr/0006-i18n-frontend-only.md) | i18n on the frontend only |
| [0007](docs/adr/0007-rbac-roles-in-jwt.md) | RBAC roles embedded in JWT |
| [0008](docs/adr/0008-soft-delete-projects.md) | Soft delete via `isArchived` |
| [0009](docs/adr/0009-structured-logging-pino.md) | Structured logging with Pino |
| [0010](docs/adr/0010-realtime-socketio-tenant-rooms.md) | Real-time: Socket.IO tenant rooms |
| [0011](docs/adr/0011-test-pyramid-vitest-playwright.md) | Test pyramid: Vitest + Playwright |
| [0012](docs/adr/0012-storybook-design-system.md) | Storybook design-system catalogue |

## 🧪 Tests

### Backend — Vitest + Supertest + in-memory MongoDB replica set

The replica-set is real (`mongodb-memory-server` → `MongoMemoryReplSet`)
so the auth controller's `session.withTransaction` flow runs the same
code path as production. **25 tests** across 6 suites cover:

- `/api/health` liveness probe.
- `/api/auth/register` happy path, missing-fields validation, and
  duplicate-email rejection.
- `/api/auth/login` token issuance and credential rejection.
- `/api/auth/refresh` round-trip via the `httpOnly` cookie.
- `POST /api/projects` RBAC (admin vs employee → 403).
- **Cross-tenant isolation** — an HR user from tenant B receives `404`
  when guessing the project ID of tenant A (the canonical guarantee
  from [ADR-0002](docs/adr/0002-multi-tenancy-company-field.md)).
- Task RBAC: only admins can create tasks; HR role passes; cross-tenant
  task creation and listing are blocked with `404`.
- Comment lifecycle: post, delete own, forbid deleting another user's
  comment, cross-tenant comment isolation.
- Leave lifecycle: approve, reject-without-reason validation, delete
  pending, refuse to delete approved, cross-tenant delete blocked.

### Frontend — Vitest + Testing Library + jsdom

**24 tests** across 6 suites cover the design-system primitives,
utilities, hooks, and services:

- `cn()` Tailwind class merging (truthy filter, dedupe, clsx forms).
- `<Button />` rendering, click handling, `isLoading` disabled state,
  variant classes, ref forwarding.
- `<Input />` placeholder, controlled `value` + `onChange`.
- `<ConfirmationModal />` — renders/hides, confirm/cancel/X callbacks,
  variant styling (danger vs primary).
- `useCountUp` hook — initial value, animated completion, mid-animation
  intermediate values, endValue prop changes.
- `realtime.js` service — `connectRealtime(null)` no-ops, JWT token
  forwarded, `getSocket()` lifecycle, `disconnectRealtime()` teardown.

### End-to-end — Playwright (chromium)

The recruiter happy path: landing renders, legal pages load, the demo
CTA spins up a sandbox tenant and lands on `/dashboard`, and
authenticated navigation to `/projects` succeeds. Spec lives under
[`e2e/`](e2e/), config in [`playwright.config.js`](playwright.config.js).

```bash
# Backend (Vitest + Supertest)
cd server && npm test

# Frontend (Vitest + RTL)
cd client && npm test

# Browser E2E (boots both servers itself)
npm run test:e2e:install   # one-off, downloads the chromium build
npm run test:e2e
```

### Storybook — design-system catalogue

[`Button`](client/src/components/ui/Button.stories.jsx),
[`Input`](client/src/components/ui/Input.stories.jsx), and
[`Card`](client/src/components/ui/Card.stories.jsx) ship with stories
covering every variant, size, and state. The `@storybook/addon-a11y`
panel runs axe-core against each story.

```bash
cd client && npm run storybook   # http://localhost:6006
cd client && npm run build-storybook
```

## 🤖 CI & automation

- **GitHub Actions** — parallel workflows per PR / push to `main`:
  - [`ci.yml`](.github/workflows/ci.yml) — client (lint + Vitest +
    build), server (Node `--check` + Vitest + boot smoke), and
    `npm audit --audit-level=moderate` for both workspaces.
  - [`e2e.yml`](.github/workflows/e2e.yml) — Playwright on chromium
    against a MongoDB service container; HTML report + traces uploaded
    on failure.
  - [`lighthouse.yml`](.github/workflows/lighthouse.yml) — Lighthouse
    CI with performance/accessibility/SEO budgets (see
    [`client/lighthouserc.cjs`](client/lighthouserc.cjs)). Probes the
    landing page on every client-touching PR.
  - [`semgrep.yml`](.github/workflows/semgrep.yml) — static-analysis
    scan covering OWASP Top 10 + Node/Express packs.
  - [`codeql.yml.disabled`](.github/workflows/codeql.yml.disabled) —
    drop-in for repos under GitHub Advanced Security; rename to
    activate.
- **Semgrep** — weekly + PR static analysis (OWASP Top 10, Node/Express
  rule packs). Config: [`.github/workflows/semgrep.yml`](.github/workflows/semgrep.yml).
  CodeQL workflow is also present
  ([`codeql.yml.disabled`](.github/workflows/codeql.yml.disabled)) and
  can be re-activated by renaming once the repo is public or covered by
  GitHub Advanced Security.
- **Dependabot** — weekly grouped updates for npm (client + server),
  GitHub Actions, and Docker base images.
  Config: [`.github/dependabot.yml`](.github/dependabot.yml).
- **Pre-commit hooks** (Husky + lint-staged + commitlint) — Prettier
  on staged files, Conventional Commits enforcement on the message.
  Configured at the repository root.
- **Structured logging** — `pino` JSON logs in production with a
  per-request ID propagated via `X-Request-Id`. Secrets and PII are
  redacted before serialization. See [`server/lib/logger.js`](server/lib/logger.js)
  and [`server/middleware/requestLogger.js`](server/middleware/requestLogger.js).

## 📜 License

Distributed under the [MIT License](LICENSE).
