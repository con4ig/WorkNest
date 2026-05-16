# ADR-0010: Socket.IO real-time with tenant-scoped rooms

## Status

Accepted — 2026-05-16

## Context

The Kanban board ([`client/src/components/KanbanView.jsx`](../../client/src/components/KanbanView.jsx),
mounted by [`Projects.jsx`](../../client/src/pages/Projects.jsx)) is
the primary collaborative surface in WorkNest: multiple teammates
drag cards across columns, archive projects, and toggle statuses in
quick succession.

Before this change the board only reflected the local client's
mutations. Two HR coordinators editing the same board would see
divergent state until one of them refreshed — and even then a stale
optimistic update could overwrite the other's work. We needed:

1. Server-pushed updates to every signed-in tenant member as soon as
   a mutation commits.
2. Strict tenant isolation: a project change in company A must never
   reach a socket connected as company B (see
   [ADR-0002](0002-multi-tenancy-company-field.md)).
3. Auth that doesn't grow a new credential — sockets should use the
   same access token as REST.
4. Graceful degradation: if the WS connection drops, the app keeps
   working via plain REST until reconnect.

## Decision

Adopt **[Socket.IO](https://socket.io)** bound to the same Node HTTP
server that already serves the Express API. The full server module is
[`server/lib/realtime.js`](../../server/lib/realtime.js); the listener
is attached in [`server/server.js`](../../server/server.js) via
`initRealtime(httpServer, { corsOrigins })`.

The contract is small and uniform:

- **Auth.** Every socket must present a valid JWT in the handshake.
  The server reads it from `socket.handshake.auth.token`, falling
  back to `?token=` and `Authorization: Bearer` for non-browser
  clients. It is verified with the same `JWT_SECRET` used by the
  REST layer ([ADR-0001](0001-jwt-access-refresh-cookie.md)). Invalid
  or missing tokens fail the handshake with `UNAUTHENTICATED`.
- **Tenant room.** After auth, the socket joins exactly one room:
  `company:<companyId>`. There is no broadcast primitive that can
  reach a different room — server-side tenant isolation by
  construction. The client neither knows nor needs to know which
  room it's in.
- **Emission helper.** Controllers don't import `socket.io`; they
  call `emitToCompany(companyId, event, payload)`. The helper is a
  no-op when realtime isn't initialised (e.g. inside Vitest, see
  [ADR-0011](0011-test-pyramid-vitest-playwright.md)).
- **Events.** Three today, fired from
  [`server/controllers/projectController.js`](../../server/controllers/projectController.js)
  after the mutation commits:
  - `project:status-changed` `{ projectId, status, updatedBy, at }`
  - `project:archived` `{ projectId, by, at }` (see
    [ADR-0008](0008-soft-delete-projects.md))
  - `project:restored` `{ projectId, by, at }`
- **Client.** A singleton socket lives in
  [`client/src/services/realtime.js`](../../client/src/services/realtime.js).
  `connectRealtime(token)` is called from
  [`AuthContext`](../../client/src/context/AuthContext.jsx) on login
  / refresh; `disconnectRealtime()` runs on logout. Components
  subscribe via [`useProjectRealtime`](../../client/src/hooks/useProjectRealtime.js).
  When the socket is `null` (no auth, or reconnect exhausted),
  components fall back to manual refresh — the page never breaks.

Adding a new event is one helper function + one controller call. No
new wiring.

## Consequences

+ **Same port, no extra infrastructure.** Socket.IO attaches to the
  existing HTTP listener; nothing new to provision, no separate
  domain or certificate.
+ **Defence in depth on tenant isolation.** Even if a controller
  forgot the `company` predicate on a Mongo query (the risk
  documented in [ADR-0002](0002-multi-tenancy-company-field.md)),
  the real-time fan-out still couldn't cross tenants — the room
  topology blocks it.
+ **Reconnect + transport fallback for free.** The client retries
  with exponential back-off (capped at 8 attempts, 10 s ceiling) and
  falls back to long-polling on networks that block WebSocket.
+ **No new credential.** The 15-minute access token from
  [ADR-0001](0001-jwt-access-refresh-cookie.md) doubles as the
  socket credential. One revocation story, not two.
- **Stateful connections complicate horizontal scaling.** A single
  Node instance is fine today; once the API scales out, Socket.IO
  needs the Redis adapter (`@socket.io/redis-adapter`) so a room
  emit on instance A reaches subscribers on instance B. Flagged as
  future work.
- **Token TTL applies to the handshake.** After 15 minutes the
  socket can still be connected, but it was authenticated with an
  expired token. We don't currently re-verify mid-connection;
  hardening this (re-handshake on refresh, or periodic `auth.token`
  refresh) is future work.
- **WebSocket upgrade complicates some PaaS configs** (sticky
  sessions, idle-connection timeouts). Documented in the deploy
  notes.

## Alternatives considered

- **Native `ws`.** Smaller dependency, no room primitive, no
  reconnect, no transport fallback. Building auth + per-tenant
  routing + reconnect on top would re-implement Socket.IO badly.
  Rejected.
- **Server-Sent Events (SSE).** Server-to-client only, no
  bidirectional channel, no rooms. Workable for pure notification
  fan-out but doesn't compose with future features (presence,
  typing indicators). Rejected.
- **Polling every N seconds.** Inferior UX (lag), wastes requests,
  doesn't scale to many concurrent boards. Rejected.
- **Third-party service (Pusher, Ably, Supabase Realtime).** Solves
  the problem but adds a vendor, a billing line, and a second auth
  story. Rejected for portfolio scale; reconsider if we ever need
  guaranteed delivery or presence at scale.

## Future work

- **Redis adapter** for multi-instance fan-out.
- **Mid-connection token refresh** to remove the 15-minute auth
  staleness window.
- **More events.** `task:*` updates and presence indicators are the
  obvious next additions, each ~10 lines of code given the contract
  above.
- **Backpressure / rate-limit** per socket so a runaway client can't
  flood a tenant room.
