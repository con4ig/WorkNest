# ADR-0007: RBAC roles embedded in the JWT access token

## Status

Accepted — 2026-05-16

## Context

Every authenticated endpoint needs to answer two questions before doing
work:

1. **Who is this user?** (`_id`, `company`)
2. **What may they do?** (`role` ∈ `{employee, hr, admin, superadmin}`)

The naive answer — fetch the user from MongoDB on every request — adds
a round-trip to every protected call and a load spike on the user
collection during traffic bursts.

## Decision

The access token (see [ADR-0001](0001-jwt-access-refresh-cookie.md))
carries the user's `role` and `company` in its claims. The
`authenticate` middleware verifies the signature and **still** loads
the user from MongoDB — but uses the populated `company` for the live
permission check, while `role` is treated as a fast-path hint:

```js
// server/middleware/authenticate.js
const decoded = jwt.verify(token, process.env.JWT_SECRET);
const user = await User.findById(decoded._id)
  .populate("company")
  .select("-password");
req.user = user;            // canonical: from DB
```

The `authorize(...roles)` middleware then checks `req.user.role` against
the allowed set on the route. See
[`server/routes/project.js`](../../server/routes/project.js) for the
pattern: `router.post("/", authenticate, authorize("admin", "hr"), ...)`.

`superadmin` is the explicit cross-tenant escape hatch:
[ADR-0002](0002-multi-tenancy-company-field.md) skips the `company`
filter for that role.

## Consequences

+ Routes declare their authorization inline and read like English:
  `authenticate, authorize("admin", "hr"), createProject`.
+ The role enum is short and stable; new roles are an additive change.
+ JWT payload stays small (well under cookie/header limits).
+ The DB fetch in `authenticate` doubles as a "user still exists / not
  banned" check on every request — there is no stale-token window
  beyond the 15-minute access TTL.
- A role change (promotion, demotion) takes effect at most 15 minutes
  after the next refresh, because the **current** access token still
  carries the old role string. Acceptable for HR-grade churn.
- The `role` claim is duplicated between JWT and DB — if they ever
  drift, the DB is the source of truth (the middleware re-reads it).
- Fine-grained permissions (per-project, per-document) would outgrow
  this scheme; ABAC / policy engine (Casbin, OPA) would be needed.
  Out of scope.

## Alternatives considered

- **Fetch user + role from DB on every request, no JWT claims.**
  Simpler but every endpoint pays a DB round-trip. Rejected as
  premature optimization — we already do the fetch, but having the
  role *also* in the claim documents the contract and enables
  client-side role-gated UI without a `/me` call.
- **No middleware; check role in every controller.** Repetitive and
  error-prone. Rejected.
- **Policy engine (Casbin / OPA).** Overkill for four roles and a flat
  permission matrix. Revisit if per-resource permissions ever land.
