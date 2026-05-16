# ADR-0009: Structured logging with pino + per-request IDs

## Status

Accepted — 2026-05-16

## Context

Early in the project, HTTP traffic was logged with `morgan` in the
`dev` format and ad-hoc `console.log` statements elsewhere. That worked
for a single developer tailing one terminal, but it doesn't survive
contact with production:

1. **Unstructured strings are not greppable.** "User logged in" prints
   the same regardless of which tenant, which user, or which request it
   belongs to. Correlating a customer-reported failure across the API
   log, a Mongo slow query, and a Sentry event becomes archaeology.
2. **No redaction.** `morgan` happily prints `Authorization` headers
   and any `req.body` a developer dumps. A leaked log shipper is then
   a credential leak.
3. **Multi-tenant context is invisible.** ADR-0002 makes `company` the
   tenant key; the access log doesn't know it exists.
4. **Downstream log shippers want JSON.** Loki, Better Stack, and
   CloudWatch Insights parse line-delimited JSON natively and fight
   anything else.

## Decision

Adopt [pino](https://github.com/pinojs/pino) as the only logger, with
[`pino-http`](https://github.com/pinojs/pino-http) for the HTTP access
log. Configuration lives in
[`server/lib/logger.js`](../../server/lib/logger.js) and
[`server/middleware/requestLogger.js`](../../server/middleware/requestLogger.js)
and is wired into the Express pipeline from
[`server/app.js`](../../server/app.js) (with the listener bound from
[`server/server.js`](../../server/server.js)).

Mode selection is driven entirely by `NODE_ENV`:

- **production** — single-line JSON to stdout. The platform (Render,
  Fly, Docker host) ships it onward.
- **development** — piped through `pino-pretty` with colour and
  short timestamps. Same fields, human-readable.
- **test** — level pinned to `error` so Vitest output stays clean
  (see [ADR-0011](0011-test-pyramid-vitest-playwright.md)).

Three behaviours are non-negotiable:

1. **Redaction.** The `redact` config in `logger.js` strips
   `req.headers.authorization`, `req.headers.cookie`,
   `res.headers['set-cookie']`, and any field path matching
   `*.password`, `*.token`, `*.accessToken`, `*.refreshToken`, or
   `*.peselOrId`. Replacement is `"[REDACTED]"`. This is defence in
   depth — the right answer is still "don't log secrets" — but it
   stops accidents like `logger.info(req.body)` from becoming
   incidents.
2. **Per-request IDs.** `pino-http` generates a UUID per request and
   echoes it back as the `X-Request-Id` response header. If the
   client (or an upstream proxy) already set `X-Request-Id`, that
   value is respected — useful for tracing a single user action
   across CDN → API → DB.
3. **Tenant surfacing.** The `req` serializer reaches into
   `req.raw.user` (populated by `authenticate`, see
   [ADR-0001](0001-jwt-access-refresh-cookie.md) and
   [ADR-0007](0007-rbac-roles-in-jwt.md)) and adds `userId` and
   `company` to every authenticated access-log line. Tenant-scoped
   queries in production logs become a single `jq` filter.

Health probes, `/ping`, the favicon, and `/api/docs/*` are silenced
from the access log — Render and similar PaaS hit `/api/health` every
few seconds and would otherwise dominate the volume.

## Consequences

+ **Queryable logs.** `jq 'select(.company == "...")'` slices a
  production tail by tenant in one line.
+ **Defence-in-depth redaction** for the most common secret/PII paths,
  including the AES-encrypted `peselOrId` from
  [ADR-0003](0003-aes-encryption-pii.md) (belt and braces — the field
  is encrypted at rest, but log lines escape that boundary).
+ **Per-request correlation.** A user emailing a bug report with the
  `X-Request-Id` from a failure screen lets us jump straight to the
  log line.
+ **pino is fast.** Benchmarks put it at ~5× winston for the same
  workload; the access-log middleware is no longer the slowest piece
  of every request.
- **Raw JSON is unfriendly to `tail -f`** without piping through
  `pino-pretty`. A `LOG_LEVEL=debug npm run dev` is the documented
  workaround locally.
- **Per-request ID adds ~30 bytes of response header** on every API
  hit. Negligible on the wire, but worth knowing.
- **No log aggregation is provisioned yet** — logs live wherever the
  platform's stdout collector dumps them. Wiring Better Stack / Loki
  is future work.

## Alternatives considered

- **`morgan`.** The status quo. Zero structure, no redaction, no
  request IDs. Useful only as a one-liner during early development.
- **`winston`.** More featureful but slower; the API is heavier and
  the transport ecosystem is split between maintained and
  abandoned. Rejected.
- **`bunyan`.** The spiritual ancestor of pino, now effectively
  abandoned (last meaningful release several years ago).
- **`console.log` everywhere.** No levels, no structure, no
  redaction, no correlation. Rejected.

## Future work

- Ship logs to Better Stack (or similar) and pin a dashboard for
  5xx rate per tenant.
- Add OpenTelemetry trace IDs alongside request IDs so the same
  correlation works for downstream services when they exist.
- Audit-log the `superadmin` escape hatch from
  [ADR-0002](0002-multi-tenancy-company-field.md) on a separate
  pino logger writing to a tamper-evident sink.
