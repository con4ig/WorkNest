# WorkNest — Repository Context

> High-signal orientation document for human contributors and AI coding
> assistants (Claude Code, Cursor, Copilot Workspace). Read this plus
> `README.md` and you should be able to land a change without flailing.

---

## 1. What this project is

WorkNest is a portfolio-grade, multi-tenant HR management platform built
on the MERN stack (MongoDB, Express 5, React 19, Node 20). Every visitor
to the landing page can spin up a personal **demo sandbox tenant** that
self-destructs after 24 hours, so the same deployment safely hosts both
real and ephemeral data. The product covers employees, projects, tasks,
comments, leave requests, an audit log, and a live Kanban — all isolated
per `Company`.

## 2. Domain language (ubiquitous terms)

The same vocabulary shows up in models, controllers, routes, components,
and ADRs. Use these terms verbatim — do not invent synonyms.

| Term              | Meaning                                                                                                       | Where it lives                                                       |
| ----------------- | ------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| Company           | The tenant. Every other domain document references a `company` ObjectId. Unique by `name`.                    | `server/models/Company.js`                                            |
| Demo Company      | A `Company` with `isDemo: true` and an `expiresAt` TTL. Auto-deleted by MongoDB after 24h.                    | `server/models/Company.js`, ADR-0004                                  |
| User              | An authenticated principal. Roles: `admin`, `hr`, `employee`, `superadmin`. HR fields (PESEL, salary, etc.).   | `server/models/User.js`                                               |
| Invitation        | A short code (`crypto.randomBytes(8).hex`) tying a future `User` to a `Company` and target role. TTL-indexed.  | `server/models/Invitation.js`                                         |
| Project           | A unit of work. Has `status` (`pending`/`running`/`completed`/`on-hold`), `priority`, `isArchived`, `progress`, and `assignedUsers[]`. | `server/models/Project.js`, ADR-0008 |
| Task              | A child of `Project`. Status `todo`/`in-progress`/`completed`, `order` for Kanban drag.                       | `server/models/Task.js`                                               |
| Comment           | Attached to a `Project` or `Task`. Tracked in the activity log on create/delete.                              | `server/models/Comment.js`                                            |
| Activity          | Audit log entry. Enum of 14 actions: `project_created`, `status_changed`, `task_completed`, etc.              | `server/models/Activity.js`                                           |
| Leave             | Time-off request. 15 `leaveType` values (vacation, on_demand, maternity, paternity, parental, sick, …). Status `pending`/`approved`/`rejected`. | `server/models/Leave.js` |
| Tenant isolation  | Every Mongo query must include a `company` predicate (or be explicitly `superadmin`). Missing predicate = data leak. | `server/controllers/*.js`, ADR-0002                       |
| PII encryption    | `peselOrId` and identity fields go through AES-256-CBC encrypt/decrypt hooks on the User schema.              | `server/models/User.js`, ADR-0003                                     |
| Realtime room     | A Socket.IO room named `company:<companyId>`. All emits are scoped to it.                                      | `server/lib/realtime.js`                                              |

## 3. High-level architecture

```text
┌──────────────────────────────────────┐                  ┌─────────────────────────────────────────────┐
│  React 19 SPA  (Vite + Nginx)        │                  │  Express 5 API  (Node 20)                    │
│  - i18next PL/EN, runtime detect     │   HTTPS + WSS    │  ┌─────────────────────────────────────────┐ │
│  - React Router 7, lazy /protected   │ ───────────────▶ │  │ helmet (CSP, COOP, refer-policy)         │ │
│  - axios + interceptor (401 refresh) │ ◀─────────────── │  │ cors  (allowlist)                        │ │
│  - socket.io-client, JWT in handshake│   JSON + WS      │  │ requestLogger  (pino-http, X-Request-Id) │ │
│  - JWT access in memory              │                  │  │ rate-limit  (auth 50/15min, api 1000/10) │ │
│  - Refresh JWT in httpOnly cookie    │                  │  │ /api/auth   /api/projects   /api/tasks   │ │
└──────────────────────────────────────┘                  │  │ /api/users  /api/leaves     /api/comments│ │
                ▲                                         │  │ /api/activities             /api/docs    │ │
                │                                         │  └────────────────┬────────────────────────┘ │
                │                                         │                   │                          │
                │   Socket.IO bound to same http.Server   │  ┌────────────────▼────────────────────────┐ │
                └────────────────────────────────────────▶│  │ Socket.IO server                         │ │
                    (rooms: company:<id>, JWT handshake)  │  │   io.use(jwt.verify) → socket.join(room) │ │
                                                          │  └──────────────────────────────────────────┘ │
                                                          └─────────────┬───────────────────────────────┘
                                                                        │ Mongoose 8
                                                                        ▼
                                                          ┌─────────────────────────────────────────────┐
                                                          │  MongoDB 8                                  │
                                                          │  - One collection per resource              │
                                                          │  - `company` field on every tenant doc      │
                                                          │  - TTL index on Company.expiresAt + Invite  │
                                                          │  - AES-256-CBC field encryption (User.pesel)│
                                                          └─────────────────────────────────────────────┘
```

Auth flow (see ADR-0001):

```
POST /api/auth/login  ──▶  { user, accessToken }              (15-min JWT in JSON body)
                       └─▶  Set-Cookie: refreshToken=…; HttpOnly; Secure; SameSite=None
GET  /api/<resource>  ──▶  Authorization: Bearer <accessToken>
POST /api/auth/refresh ─▶  reads refresh cookie → new accessToken (no body input)
```

## 4. Codebase map

### Server (`server/`)

```
server/
├── app.js                       — configured Express app, no .listen() (so tests can mount it)
├── server.js                    — entrypoint: http.Server, initRealtime, mongoose.connect
├── swagger.js                   — OpenAPI 3 spec base + schema components
├── lib/
│   ├── logger.js                — pino; pretty in dev, JSON in prod; redacts auth + *.password + peselOrId
│   └── realtime.js              — Socket.IO server, JWT handshake, `emitToCompany(id, event, payload)`
├── middleware/
│   ├── authenticate.js          — verify Bearer JWT, load User (populate company), attach req.user
│   ├── authorize.js             — `authorize('admin','hr')` role gate, returns 403 on mismatch
│   ├── limitDemoResources.js    — caps Demo tenants at 5 projects / 20 tasks / 20 leaves / 10 users
│   └── requestLogger.js         — pino-http; X-Request-Id echo; silences /api/health and /api/docs
├── controllers/                 — one file per resource; all enforce the `company` predicate
│   ├── authController.js        — register, login, refresh, logout, demo-tenant provision (txn)
│   ├── projectController.js     — CRUD, archive/restore, bulk, weekly stats, status emit
│   ├── taskController.js        — CRUD, reorder for Kanban
│   ├── commentController.js     — CRUD + activity logging
│   ├── leaveController.js       — request, approve, reject, per-user stats
│   ├── userController.js        — HR fields, role change, CSV import, profile image
│   └── activityController.js    — read-only audit log feed
├── routes/                      — Express routers; `@openapi` JSDoc lives here, not on controllers
│   ├── auth.js  project.js  task.js  leave.js  comment.js
│   ├── user.js  activity.js  email.js
├── models/                      — Mongoose schemas
│   ├── Company.js               — `isDemo`, `expiresAt` TTL index
│   ├── User.js                  — encrypt/decrypt setters/getters on peselOrId
│   ├── Project.js  Task.js  Comment.js  Activity.js  Leave.js
│   ├── Invitation.js            — `expiresAt` TTL, unique 16-char hex code
│   └── Otp.js                   — password-reset tokens
├── scripts/
│   ├── migrateUsers.js
│   └── migrateUsersToCompany.js
└── test/                        — Vitest + Supertest + mongodb-memory-server (MongoMemoryReplSet)
    ├── setup.js  helpers.js
    ├── health.test.js  auth.test.js  projects.test.js
```

### Client (`client/src/`)

```
client/src/
├── main.jsx                     — Router + providers; lazy() splits all /protected pages
├── App.jsx                      — landing page (public)
├── i18n.js                      — i18next + http-backend + language-detector
├── config.js                    — VITE_API_URL resolution
├── styles/                      — Tailwind layers, CSS variables for theme tokens
├── context/
│   ├── AuthContext.jsx          — user/token state, login/logout/refresh, axios wiring
│   └── ThemeContext.jsx         — light/dark, persisted in localStorage
├── services/
│   ├── api.js                   — axios instance + interceptor (refresh on 401)
│   └── realtime.js              — socket.io-client singleton, JWT in handshake.auth
├── hooks/
│   ├── useProjectRealtime.js    — subscribes to project:* events, mutates local cache
│   └── useCountUp.js            — animated dashboard counters
├── components/
│   ├── ui/                      — Button, Input, Card primitives + Storybook stories + tests
│   ├── layout/                  — Layout, Sidebar (authenticated shell)
│   ├── common/                  — LanguageSwitcher, CustomSelect
│   ├── projects/                — ProjectCard, ProjectRow, FilterControls, BulkActionsHeader
│   ├── employees/               — ImportModal, RoleChangeModal, ImportResultModal
│   ├── KanbanBoard.jsx          — @dnd-kit drag target, posts task reorder
│   ├── KanbanView.jsx ListView.jsx GridView.jsx ViewSwitcher.jsx
│   ├── AddProjectModal.jsx  InlineCreateTask.jsx  UserManagementModal.jsx
│   ├── RequestLeaveModal.jsx    — Zod + react-hook-form; conditional `reason` on certain types
│   ├── CalendarComponent.jsx    — react-big-calendar wrapper
│   ├── ProtectedRoute.jsx       — gate, redirects unauthenticated to /login
│   ├── AxiosInterceptorManager.jsx
│   └── Navbar.jsx LoadingScreen.jsx ConfirmationModal.jsx TaskItem.jsx
├── pages/                       — one route component per file
│   ├── Landing.jsx  Login.jsx  Register.jsx  Forgot.jsx
│   ├── Terms.jsx  PrivacyPolicy.jsx
│   ├── Dashboard.jsx  Projects.jsx  ProjectDetails.jsx
│   ├── EmployeeList.jsx  UserDetails.jsx  Upload.jsx
│   ├── MyLeaves.jsx  LeaveApprovals.jsx
│   ├── GenerateCode.jsx  ForcePasswordChange.jsx
│   └── ErrorBoundary.jsx
├── lib/utils.js                 — `cn()` clsx + tailwind-merge
├── utils/translations.js        — leave-type labels, status labels
└── test/                        — Vitest + jsdom + RTL setup
```

## 5. Key invariants (do not break these)

1. **Tenant isolation is non-negotiable.** Every Mongo query that touches a
   tenant-scoped collection (`Project`, `Task`, `Comment`, `Activity`, `Leave`,
   `User`, `Invitation`) MUST include the `company` predicate. The only
   exception is `req.user.role === "superadmin"`, in which case the predicate
   is intentionally omitted. A missing predicate is a cross-tenant data leak.
   See [`server/controllers/projectController.js`](server/controllers/projectController.js)
   for the canonical pattern, and [ADR-0002](docs/adr/0002-multi-tenancy-company-field.md).
2. **PII goes through encrypt/decrypt hooks.** `peselOrId` (and any future
   identity-document fields) MUST use the AES-256-CBC setter/getter on the
   User schema. Never store plaintext PESEL. See [ADR-0003](docs/adr/0003-aes-encryption-pii.md).
3. **API responses are English.** All user-facing translation happens on the
   frontend via i18next; the backend returns canonical English messages and
   enum values. See [ADR-0006](docs/adr/0006-i18n-frontend-only.md).
4. **i18n parity.** New user-facing strings need keys in BOTH
   `client/public/locales/pl/translation.json` AND
   `client/public/locales/en/translation.json`. Current parity: 699/699 keys.
5. **JWT split is intentional.** Access tokens live in JS memory and are sent
   as `Authorization: Bearer`. Refresh tokens live in an httpOnly + Secure +
   SameSite cookie and are only readable by `POST /api/auth/refresh`. Do not
   move either across that boundary. See [ADR-0001](docs/adr/0001-jwt-access-refresh-cookie.md).
6. **Realtime is defence in depth, not authorization.** Sockets re-verify the
   JWT in the handshake AND scope every emit to `company:<id>` — but the
   controller's `company` predicate is still what actually protects the data.
7. **Conventional Commits are enforced** by commitlint + Husky. Allowed
   scopes: `client`, `server`, `ci`, `docs`, `deps`, `infra`, `test`, `auth`,
   `projects`, `leaves`, `i18n`. Header max length 100.
8. **Pre-commit runs lint-staged Prettier** on staged files (client uses its
   own `prettier.config.mjs`; server + root use defaults). Never `--no-verify`
   without explicit user instruction.
9. **Soft delete only for projects.** Use `isArchived: true` + `restoreProject`,
   never `Project.deleteOne` from a UI flow. See [ADR-0008](docs/adr/0008-soft-delete-projects.md).
10. **Demo tenants are resource-capped.** New endpoints that create
    tenant-scoped documents should compose `limitDemoResources` into the
    middleware chain before the controller.

## 6. How to add a feature (recipe)

1. Branch from `main` with a Conventional Commits-friendly name:
   `feat/<scope>-<short-desc>` (e.g. `feat/projects-bulk-archive`).
2. **Route.** Add or update an Express route in `server/routes/<resource>.js`.
   Include the `@openapi` JSDoc block — Swagger UI at `/api/docs` is generated
   from it. Compose middleware in order: `authenticate` → `authorize(...)` →
   `limitDemoResources` (if it creates resources) → handler.
3. **Controller.** Add the handler in `server/controllers/<resource>Controller.js`.
   First lines must establish the `company` predicate (mirror
   `getProjects` in `projectController.js`). If the mutation should be
   broadcast to teammates, call `emitToCompany(req.user.company._id, '<event>', payload)`
   AFTER the DB write succeeds.
4. **Test.** Add a Vitest + Supertest case under `server/test/`. The harness
   uses `mongodb-memory-server` with a replica set, so `session.withTransaction`
   works. At minimum cover: (a) happy path, (b) tenant isolation
   (a user from tenant B must receive 404 when guessing tenant A's resource id),
   (c) RBAC where applicable.
5. **Frontend.** Add or update a page in `client/src/pages/` and any
   reusable pieces in `client/src/components/`. Keep new routes lazy-loaded
   in `main.jsx` if they sit behind `<ProtectedRoute />`. Reuse the design
   primitives in `components/ui/` rather than rolling new styles.
6. **i18n.** Add keys to BOTH locale files
   (`client/public/locales/pl/translation.json` and `…/en/translation.json`).
   Run the client to verify no missing-key warnings.
7. **ADR.** If the change alters an invariant in section 5 or introduces a
   new architectural axis, add a new ADR under `docs/adr/` following the
   `Status → Context → Decision → Consequences → Alternatives` template.
8. **Commit.** Conventional format: `<type>(<scope>): <subject>`. CI must
   be green before merge — see section 7 for what runs.

## 7. Test, lint, and build commands

All commands assume you are at the repository root unless noted.

```bash
# Backend unit + integration tests (Vitest + Supertest + in-memory MongoDB replica set)
cd server && npm test                    # → look at server/test/ for failures
cd server && npm run test:watch          # interactive

# Frontend unit tests (Vitest + jsdom + Testing Library)
cd client && npm test                    # → look at client/src/**/*.test.jsx

# Frontend lint
cd client && npm run lint                # eslint.config.js, React Hooks + react-refresh rules

# Frontend production build (sanity check)
cd client && npm run build               # → client/dist/

# Browser E2E (Playwright, chromium). Boots both servers itself.
npm run test:e2e:install                 # one-off
npm run test:e2e                         # → playwright-report/ on failure

# Storybook (design-system catalogue, axe-core a11y panel)
cd client && npm run storybook           # http://localhost:6006
cd client && npm run build-storybook

# Backend dev server (nodemon, port 5500)
cd server && npm run dev

# Frontend dev server (Vite, port 5173)
cd client && npm run dev

# Lighthouse CI (perf + a11y + SEO budgets on landing page)
cd client && npm run lhci                # requires built dist/

# Whole-repo Docker (production-like)
docker-compose up -d                     # http://localhost
docker-compose -f docker-compose.dev.yml up   # hot reload

# Pre-commit (runs automatically via Husky on `git commit`)
npm run lint-staged                      # prettier on staged files
```

CI replicates the above in `.github/workflows/` — `ci.yml`, `e2e.yml`,
`lighthouse.yml`, `semgrep.yml`.

## 8. Where to start (links)

- [`README.md`](README.md) — product overview, stack, screenshots.
- [`CONTRIBUTING.md`](CONTRIBUTING.md) — setup, branch naming, PR etiquette.
- [`docs/adr/`](docs/adr/) — the eight architecture decisions; read 0001
  (auth), 0002 (multi-tenancy), and 0004 (demo TTL) first.
- [`server/lib/realtime.js`](server/lib/realtime.js) — the cleanest single
  file in the codebase; read it to grok the Socket.IO + tenant-room model.
- [`server/controllers/projectController.js`](server/controllers/projectController.js) —
  the canonical example of the tenant-isolation query pattern. Copy this
  shape whenever you add a new controller.
- [`server/app.js`](server/app.js) — the middleware chain in one place.
- [`client/src/main.jsx`](client/src/main.jsx) — the route map and provider
  stack at a glance.
- [`server/test/projects.test.js`](server/test/projects.test.js) — the
  canonical tenant-isolation regression test; mirror it for any new resource.
- API reference: run the server and visit `http://localhost:5500/api/docs`.
