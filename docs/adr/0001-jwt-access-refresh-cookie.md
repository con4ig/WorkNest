# ADR-0001: JWT access token + refresh token in httpOnly cookie

## Status

Accepted — 2026-05-16

## Context

WorkNest is a single-page React app served separately from the Express
API (different origin in production). The auth flow must:

1. Survive page reloads without re-prompting the user.
2. Not expose long-lived credentials to XSS-reachable JavaScript.
3. Support a stateless API tier (no server-side session store).
4. Allow tokens to be revoked on logout (especially for demo accounts
   that wipe their entire sandbox on logout — see [ADR-0004](0004-demo-sandbox-ttl.md)).

## Decision

Two-token pattern, implemented in
[`server/controllers/authController.js`](../../server/controllers/authController.js):

- **Access token** — JWT signed with `JWT_SECRET`, `expiresIn: 15m`.
  Returned in the JSON body of `/login` and `/refresh`. The client keeps
  it in React state (memory only, never localStorage).
- **Refresh token** — JWT signed with a *separate* `JWT_REFRESH_SECRET`,
  `expiresIn: 7d`. Set as an `httpOnly`, `Secure` (prod), `SameSite=None`
  (prod) cookie. JS cannot read it.

The access token carries `_id`, `email`, `role`, `company` so middleware
can authorize without an extra DB round-trip (see
[ADR-0007](0007-rbac-roles-in-jwt.md)).

On `/refresh`, the cookie is validated, the user is re-fetched, and a
fresh access token is issued. On `/logout`, both cookies are cleared and
— for demo users — the sandbox is destroyed.

## Consequences

+ XSS that steals `window` state can use the access token for ≤15 min,
  but **cannot** exfiltrate the refresh token.
+ CSRF is mitigated because the access token (not the cookie) is the
  authorization material for protected endpoints — the cookie alone is
  useless without `Authorization: Bearer`.
+ Stateless API: no Redis / session table.
+ Separate secrets mean a compromised access-token signer cannot mint
  refresh tokens.
- Refresh requires a same-site or `SameSite=None; Secure` cookie, which
  forces HTTPS in production (acceptable).
- No server-side revocation list: a stolen refresh token is usable for
  up to 7 days. Mitigation: short access TTL + rotation on every refresh
  (future work — currently only access rotates).

## Alternatives considered

- **Session cookies + server store.** Requires Redis or sticky sessions;
  adds a dependency for a portfolio-scale app. Rejected.
- **Single long-lived JWT in localStorage.** Trivially stolen by XSS.
  Rejected.
- **OAuth via third-party (Auth0, Clerk).** Vendor lock-in, hides the
  interesting work, and the project is explicitly about demonstrating
  auth design. Rejected.
