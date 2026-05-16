# Changelog

All notable changes to WorkNest are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and the project follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).
Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/);
each release section is derived from the commits it includes.

## [Unreleased]

### Added

- **Real-time Kanban** — Socket.IO over WebSockets with tenant-scoped
  rooms and JWT-authenticated handshake. The project board reflects
  status / archive / restore events across teammates' tabs in real
  time. See [ADR-0010](docs/adr/0010-socket-io-tenant-rooms.md).
- **End-to-end test suite** — Playwright (chromium) covering the
  landing-page render and the demo-login → dashboard flow. Boots
  both servers itself; HTML report + traces uploaded on failure in CI.
- **Lighthouse CI** — performance / a11y / SEO budgets enforced on
  every client-touching PR. Configurable in
  [`client/lighthouserc.cjs`](client/lighthouserc.cjs).
- **Storybook** — design-system catalogue for `Button`, `Input`, and
  `Card` primitives. Light / dark theme toggle mirrors the in-app
  switch; `@storybook/addon-a11y` runs axe-core on every render.
- **Structured logging** — `pino` + `pino-http` with per-request IDs
  propagated via `X-Request-Id`. Secrets and PII are redacted before
  serialization. JSON in production, pretty-printed in development.
- **Frontend tests** — Vitest + Testing Library + jsdom covering
  design-system primitives and the `cn()` Tailwind class-merging
  utility.
- **Backend tests** — Vitest + Supertest + in-process MongoDB
  replica set (`mongodb-memory-server`). 10 tests cover auth flow,
  RBAC, and the cross-tenant isolation guarantee from
  [ADR-0002](docs/adr/0002-multi-tenancy-company-field.md).
- **OpenAPI documentation** — interactive Swagger UI at `/api/docs`
  and machine-readable spec at `/api/docs.json`, built from `@openapi`
  JSDoc on the route handlers.
- **Architecture Decision Records** — `docs/adr/` indexes the
  material decisions taken on the project (auth split, tenant
  isolation, PII encryption, demo sandbox, lazy routing, i18n
  topology, RBAC, soft delete).
- **Husky pre-commit hooks** — `lint-staged` runs Prettier on staged
  files; `commitlint` enforces Conventional Commits on the message.
- **GitHub templates** — issue forms (bug / feature), PR template
  with i18n + ADR checklist, `CONTRIBUTING.md`, `SECURITY.md`.
- **Dependabot** — weekly grouped updates for npm (client + server),
  GitHub Actions, and Docker base images.
- **Semgrep static analysis** — OWASP Top 10 + Node/Express rule
  packs on every PR. CodeQL workflow is shipped disabled and can be
  re-enabled when the repo moves to public or under GHAS.

### Changed

- **Source language** — English everywhere in code, logs, comments,
  and API response messages. User-facing copy is translated at the
  i18next layer; see [ADR-0006](docs/adr/0006-i18n-frontend-only.md).
- **Locale parity** — `client/public/locales/{pl,en}/translation.json`
  are kept at strict parity (699 keys each).
- **Bundle strategy** — protected routes are lazy-loaded; auth and
  legal pages remain eager. See
  [ADR-0005](docs/adr/0005-lazy-load-protected-routes.md).

### Fixed

- 9 production CVEs in `multer` and `path-to-regexp` (DoS / ReDoS)
  and 7 in `react-router-dom`, all resolved by `npm audit fix`.

### Security

- `helmet` Content-Security-Policy hardened (defaults retained);
  `Permissions-Policy` denies geolocation / microphone / camera by
  default. Refresh tokens isolated to an `httpOnly`, `Secure`,
  `SameSite=None` cookie; access tokens never reach storage.

[Unreleased]: ../../compare/main...HEAD
