# ADR-0002: Multi-tenancy via `company` discriminator field

## Status

Accepted — 2026-05-16

## Context

WorkNest is a B2B SaaS where each company (tenant) sees only its own
users, projects, tasks, leaves, and activity. Tenants must be strictly
isolated: an HR admin in company A must never observe data from
company B, even via direct ID guessing.

Three classical isolation strategies exist:

1. **Database-per-tenant** — full physical isolation.
2. **Schema-per-tenant** — shared DB, separate schemas.
3. **Shared schema, discriminator column** — every row tagged with a
   tenant ID; queries filter on it.

## Decision

Adopt strategy **(3)**: every tenant-scoped collection
(`User`, `Project`, `Task`, `Comment`, `Leave`, `Activity`, `Invitation`)
carries a required `company: ObjectId` field referencing the
`Company` collection.

The contract: **every controller MUST add `company: req.user.company`
to its Mongo query** (or, for `superadmin`, explicitly skip the filter).
This is enforced by convention; see e.g.
[`projectController.js`](../../server/controllers/projectController.js)
where every `find`, `findOne`, `updateMany`, and `deleteMany` includes
the company predicate.

The `superadmin` role is the single explicit escape hatch and is granted
only outside the registration flow.

## Consequences

+ One MongoDB cluster, one connection pool, one set of indexes — cheap
  to operate at portfolio scale.
+ Cross-tenant analytics (admin dashboards, aggregate stats) are trivial
  to add without federated queries.
+ The demo sandbox ([ADR-0004](0004-demo-sandbox-ttl.md)) becomes a
  one-line `deleteMany({ company: demoCompanyId })`.
- **Sharing model = one missing filter from a data leak.** This is the
  single largest correctness risk in the codebase.
- Indexes must include `company` as a prefix for every tenant-scoped
  query to stay fast at scale (e.g. `{ company: 1, status: 1 }`).
- A noisy tenant degrades shared resources (acceptable for SMB SaaS).

## Mitigations for the leak risk

- Authorization middleware (`authenticate`) populates
  `req.user.company` from the DB on every request — never trusted from
  the token alone for sensitive operations.
- Every collection where leakage would be material has a corresponding
  test (planned) that asserts cross-tenant `findOne` returns `null`.
- Code review checklist requires a `company` predicate on every new
  query in a tenant-scoped collection.

## Alternatives considered

- **Database-per-tenant.** Strongest isolation, but operational cost
  (N connections, N migration runs, backup fan-out) is unjustified at
  this stage. Reconsider if SOC 2 / HIPAA enters scope.
- **Schema-per-tenant.** MongoDB doesn't have schemas in the SQL sense;
  emulating it with collection prefixes loses Mongoose model reuse.
  Rejected.
- **Row-level security via a DB feature.** Not native to MongoDB.
