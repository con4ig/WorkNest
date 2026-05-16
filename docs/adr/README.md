# Architecture Decision Records

This directory captures the significant architectural decisions taken on
WorkNest. Each record documents the context, the choice, the trade-offs,
and the alternatives that were considered.

The format is a lightweight [MADR](https://adr.github.io/madr/) variant:
**Status → Context → Decision → Consequences → Alternatives**.

## Index

| #    | Title                                                            | Status   |
|------|------------------------------------------------------------------|----------|
| 0000 | [Record architecture decisions](0000-record-architecture-decisions.md) | Accepted |
| 0001 | [JWT access + refresh cookie auth](0001-jwt-access-refresh-cookie.md)   | Accepted |
| 0002 | [Multi-tenancy via `company` field](0002-multi-tenancy-company-field.md) | Accepted |
| 0003 | [AES-256-CBC encryption for PII](0003-aes-encryption-pii.md)             | Accepted |
| 0004 | [Demo sandbox: unique company + TTL](0004-demo-sandbox-ttl.md)           | Accepted |
| 0005 | [Lazy-load protected routes](0005-lazy-load-protected-routes.md)         | Accepted |
| 0006 | [i18n strategy: PL + EN, frontend-only](0006-i18n-frontend-only.md)      | Accepted |
| 0007 | [RBAC roles embedded in JWT payload](0007-rbac-roles-in-jwt.md)          | Accepted |
| 0008 | [Soft delete for projects via `isArchived`](0008-soft-delete-projects.md) | Accepted |
| 0009 | [Structured logging with pino + per-request IDs](0009-structured-logging-pino.md) | Accepted |
| 0010 | [Socket.IO real-time with tenant-scoped rooms](0010-realtime-socketio-tenant-rooms.md) | Accepted |
| 0011 | [Test pyramid — Vitest (unit/integration) + Playwright (E2E)](0011-test-pyramid-vitest-playwright.md) | Accepted |
| 0012 | [Storybook for design-system documentation](0012-storybook-design-system.md) | Accepted |

## Conventions

- One decision per file, numbered sequentially `NNNN-kebab-case-title.md`.
- Status values: `Proposed`, `Accepted`, `Deprecated`, `Superseded by ADR-XXXX`.
- ADRs are immutable. To change a decision, write a new ADR that supersedes it.
- Link liberally to source files and other ADRs.
