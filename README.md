# WorkNest

WorkNest is a professional, multi-tenant HR Management System designed for small and medium-sized businesses. It provides a complete ecosystem for managing employee directories, Kanban-based project tracking, and leave request lifecycles.

Built with a security-first architecture, the platform enforces strict company isolation, field-level encryption for sensitive PII, and comprehensive real-time synchronization.

## Highlights

- **Multi-Tenancy by Design** – Enforces absolute data isolation at the database level across all company tenants.
- **Kanban Project Board** – Drag-and-drop workflow with real-time state updates across connected clients.
- **Leave Management System** – Request and approval pipeline with per-user balance counters and reasoning validations.
- **Security & GDPR Compliance** – AES-256-CBC encryption for sensitive personal identification numbers (PESEL) and secure JWT authentication.
- **Zero-Friction Live Demo** – Instant provisioning of unique sandbox environments with seeded data and automated self-cleanup via TTL indexes.
- **Dual-Language Parity** – Fully localized UI supporting English and Polish with run-time locale detection.

## Tech Stack

- **Frontend:** React 19, Vite, Tailwind CSS, React Router 7, @dnd-kit, React Hook Form, Zod, Recharts, i18next
- **Backend:** Node.js 20, Express 5, Mongoose 8 (MongoDB), Socket.IO, Pino (Structured Logging)
- **Testing & Quality:** Vitest, Playwright, Storybook, ESLint, Prettier, Husky, lint-staged
- **DevOps & Security:** Docker Compose, GitHub Actions, Semgrep, Helmet, CORS, rate-limiting

## Architecture Overview

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

The system separates concerns by keeping authentication tokens strictly in-memory (access tokens) and utilizing HTTP-only, secure, SameSite cookies for session management (refresh tokens).

Detailed implementation history and design trade-offs are documented in the [Architecture Decision Records](docs/adr/).

## Getting Started

### Local Setup

Ensure Node.js v20+ and a MongoDB instance are installed.

1. **Backend Service**

   ```bash
   cd server
   npm install
   cp .env.example .env
   npm run dev
   ```

2. **Frontend Service**
   ```bash
   cd client
   npm install
   npm run dev
   ```

### Docker Setup

Run the entire stack in production-like environments:

```bash
cp server/.env.example server/.env
docker-compose up -d
```

## Quality Assurance & Testing

The project maintains a high-quality codebase backed by automated test suites.

- **Backend Tests (Vitest + Supertest):** Covers authentication flows, role-based access control (RBAC), and rigorous multi-tenant data isolation testing.
- **Frontend Tests (Vitest + React Testing Library):** Verifies key component logic, design system elements, and custom hooks.
- **End-to-End Tests (Playwright):** Simulates critical user paths such as landing pages, demo registration, and navigation.
- **Component Catalog (Storybook):** Documents component states, layouts, and checks compliance with accessibility standards (axe-core).

To execute the test suites:

```bash
# Run backend test suite
cd server && npm test

# Run frontend test suite
cd client && npm test

# Run end-to-end suite
npm run test:e2e
```

## Continuous Integration & Security

Every code change goes through an automated verification pipeline defined in `.github/workflows/`:

- **CI Checks:** Automated workspace-level testing, bundle builds, and production dependency auditing (`npm audit`).
- **E2E Pipeline:** Runs Playwright against a live MongoDB container in headless Chrome.
- **Performance Budgets:** Core Web Vitals and Lighthouse metrics are tracked continuously to prevent regressions.
- **Static Analysis:** Daily and PR-level security scans utilizing Semgrep to identify security vulnerabilities.

## License

Copyright (c) 2026 Szymon (WorkNest). All rights reserved. Proprietary and confidential.
