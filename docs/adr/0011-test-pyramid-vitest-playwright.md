# ADR-0011: Test pyramid — Vitest (unit/integration) + Playwright (E2E)

## Status

Accepted — 2026-05-16

## Context

WorkNest is a portfolio project that doubles as a real codebase: it
needs tests both for credibility (a reviewer reading the repo should
see how the author tests) and for actual defect prevention as the
codebase grows. The three classical layers of the test pyramid each
solve a different problem and need different tooling:

1. **Unit / component tests** verify pure logic and individual React
   components in isolation. They are the fastest layer and should be
   numerous.
2. **Backend integration tests** exercise the full Express request
   pipeline against a real MongoDB. They catch issues at the
   controller / model / middleware seams that unit tests can't
   reach — including transactional flows like
   `authController.register` which uses `session.withTransaction`.
3. **End-to-end tests** drive a real browser against the running app.
   They catch issues that only manifest with real navigation, real
   network, and real rendering — wiring bugs, CSP misconfiguration,
   broken environment variables.

The constraint: this is an ESM-first project (root and workspace
`package.json` both declare `"type": "module"`). Test runners that
fight ESM add days of yak-shaving.

## Decision

A three-runner pyramid, each tool picked for its layer:

### Backend integration — Vitest + Supertest + mongodb-memory-server

Config: [`server/vitest.config.js`](../../server/vitest.config.js).
Specs in [`server/test/`](../../server/test/):

- [`health.test.js`](../../server/test/health.test.js)
- [`auth.test.js`](../../server/test/auth.test.js)
- [`projects.test.js`](../../server/test/projects.test.js)

Each spec spins up an in-memory MongoDB via `mongodb-memory-server`
**as a replica set**, mounts the Express app, and hits it with
Supertest. The replica set is non-negotiable: `authController`
wraps registration in `session.withTransaction` (which depends on
the multi-tenant contract from
[ADR-0002](0002-multi-tenancy-company-field.md) creating both the
`Company` and the initial `User` atomically), and Mongo transactions
require a replica set even when there's only one node.

Logging is silenced inside tests by
[ADR-0009](0009-structured-logging-pino.md)'s `NODE_ENV=test`
branch, keeping Vitest output legible.

### Frontend unit — Vitest + Testing Library + jsdom

Config: [`client/vitest.config.js`](../../client/vitest.config.js).
Specs live next to the components they exercise as
`*.test.{js,jsx}`. Testing Library forces the "test what the user
sees" stance — queries are by accessible role / label rather than
implementation detail.

Choosing Vitest for *both* the backend and frontend means one
runner, one assertion API, one mental model. The CI matrix becomes
`vitest run` twice.

### E2E — Playwright (Chromium) against a real stack

Config: [`playwright.config.js`](../../playwright.config.js). Specs
in [`e2e/`](../../e2e/):

- [`landing.spec.js`](../../e2e/landing.spec.js)
- [`demo-login.spec.js`](../../e2e/demo-login.spec.js)

Playwright launches a real backend (with a throwaway Mongo) and the
built client, then drives Chromium through happy-path flows. The
demo-login spec ends-to-ends the full sandbox flow described in
[ADR-0004](0004-demo-sandbox-ttl.md).

Only Chromium is wired today; cross-browser is opt-in via
`--project` flags.

## Consequences

+ **Single runner across the JS halves of the stack.** Same syntax,
  same watch mode, same coverage reporter.
+ **Hermetic + fast backend tests.** `mongodb-memory-server` means
  no Docker, no shared state, no flake from a previous run's data.
  The current ~10 backend tests complete in ~3 s.
+ **Replica-set memory server matches production semantics.** The
  auth-flow transaction is exercised in tests with the same code
  path as production, not a degraded "transactions disabled in
  test" mode.
+ **Component tests catch a11y regressions** via Testing Library's
  role-based queries; the Storybook a11y addon
  ([ADR-0012](0012-storybook-design-system.md)) covers the visual
  surface that RTL can't.
+ **Playwright is fast and stable.** Auto-waiting eliminates the
  `sleep(500)` plague familiar from older E2E stacks.
- **`mongodb-memory-server` downloads a ~50 MB Mongo binary** on
  first run. CI caches it; first contributor checkout pays the cost
  once.
- **jsdom is not a real browser.** RTL tests can't catch CSS layout
  bugs, focus-trap issues that require real layout, or browser-only
  APIs (IntersectionObserver, ResizeObserver). Playwright fills
  that gap for critical paths only — the long tail is uncovered by
  design.
- **Three runners = three config files** to keep in step (matchers,
  globals, env vars). Acceptable tax for the separation of
  concerns.

## Alternatives considered

- **Jest.** The historical default. Friction with native ESM in a
  `"type": "module"` workspace is real (experimental VM modules
  flag, transform configuration, mock hoisting quirks). Vitest is
  ESM-native and Jest-compatible enough that the migration cost is
  near-zero. Rejected.
- **Mocha + Chai + Sinon.** Verbose, three packages where one will
  do, slower CI. Rejected.
- **`node:test` (built-in).** Tempting for zero-dependency
  backends; ecosystem (matchers, watch mode, IDE integration) still
  trails Vitest meaningfully. Reconsider for a future minimal-deps
  rewrite.
- **Cypress.** A reasonable Playwright competitor. Slower per spec,
  no parallelism in the open-source tier, and the iframe-based
  runner architecture introduces its own quirks. Rejected.
- **Real Mongo via Docker in CI.** Robust but slow to start and
  requires a runner with Docker. The in-memory server gives 95% of
  the realism at 5% of the boot time.

## Future work

- A cross-tenant **integration test** asserting that the leakage
  risk from [ADR-0002](0002-multi-tenancy-company-field.md) is
  defended against on every tenant-scoped collection.
- A **Socket.IO contract test** for the realtime events from
  [ADR-0010](0010-realtime-socketio-tenant-rooms.md): emit on one
  socket's company, assert silence on another's.
- Coverage gates in CI once the suite stops being a moving target.
- Visual regression snapshots for the Storybook stories from
  [ADR-0012](0012-storybook-design-system.md).
