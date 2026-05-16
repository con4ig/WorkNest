# ADR-0004: Demo sandbox via unique tenant + TTL cleanup

## Status

Accepted — 2026-05-16

## Context

The landing page exposes a one-click "Try demo" button. The demo must
let the visitor:

- Log in instantly, no signup form.
- See realistic seed data (project, tasks, users, leaves).
- **Not** see anyone else's actions, and not have anyone else see theirs.
- Be cleaned up after use so the cluster doesn't fill with abandoned data.

A single shared demo account fails the third requirement: visitors race
each other, vandalize each others' data, and the first impression
becomes "this app is broken".

## Decision

Each click on the demo button provisions a **fresh, isolated tenant**.
Implementation in
[`authController.demoLogin`](../../server/controllers/authController.js):

1. Generate `demoSuffix = crypto.randomBytes(4).hex` per session.
2. Create a `Company` row with `isDemo: true`, `name: "Demo Company ${suffix}"`,
   and `expiresAt = now + 24h`.
3. Seed three users (admin, HR, employee), one approved leave, one
   project with 75 % progress, one in-progress task. All carry
   `isDemo: true` and `expiresAt`.
4. Issue access + refresh tokens for the demo admin
   ([ADR-0001](0001-jwt-access-refresh-cookie.md)).

Cleanup happens through **two redundant mechanisms**:

- **Eager** on `/logout`: if the bearer is a demo user, every collection
  for that `companyId` is wiped before the cookies are cleared.
- **Lazy** via MongoDB TTL index on `expiresAt`: rows that survive the
  logout path (e.g. tab closed without logout) self-destruct within
  24h.

The multi-tenancy guarantee from
[ADR-0002](0002-multi-tenancy-company-field.md) ensures the demo tenant
is invisible to real customers.

## Consequences

+ Every demo visitor gets a private playground — vandal-proof.
+ No cron job needed: TTL is a Mongo primitive.
+ The 24h TTL is generous enough that a recruiter showing the project
  to a colleague mid-call won't lose state.
+ Demo limits ([`limitDemoResources.js`](../../server/middleware/limitDemoResources.js))
  cap project / task / leave / user counts to prevent a single visitor
  from filling the cluster.
- Provisioning cost ≈ 6 insert operations per click. A burst from
  HackerNews could thrash the write path; mitigated by rate-limiting
  `/api/auth/demo-login` (see [`server.js`](../../server/server.js)).
- Demo tenants pollute the global `Company` collection. Tolerable
  because TTL bounds the population, and `isDemo: true` lets analytics
  exclude them.

## Alternatives considered

- **One shared demo account.** Race conditions, vandalism. Rejected.
- **Read-only demo.** Hides Kanban drag, leave approval flow, project
  CRUD — the most interesting features. Rejected.
- **Ephemeral in-memory mock backend on the frontend.** Doubles the
  data layer; diverges from production behaviour; recruiters cannot
  see real API calls in the network tab. Rejected.
- **Spin up a dedicated container per session.** Cold-start latency
  ruins the "instant" promise. Rejected for this scale.
