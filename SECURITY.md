# Security policy

## Supported versions

WorkNest is a single-trunk portfolio project; security fixes land on
`main` and the deployed demo. No long-term support branches exist.

## Reporting a vulnerability

**Please do not open a public GitHub issue for security problems.**

Use GitHub's private vulnerability reporting:

```
Repo → Security tab → Report a vulnerability
```

If you cannot use that flow, contact the maintainer through the email
listed on the GitHub profile.

A response should arrive within 5 working days. Critical issues (data
exposure, authentication bypass, remote code execution) will be
triaged the same business day where possible.

## What counts as a vulnerability

- Authentication bypass or privilege escalation.
- Cross-tenant data exposure (see
  [ADR-0002](docs/adr/0002-multi-tenancy-company-field.md)).
- Recovery of sensitive PII (PESEL, identity documents) from a database
  dump (see [ADR-0003](docs/adr/0003-aes-encryption-pii.md)).
- Token theft via XSS, CSRF, or cookie scope errors (see
  [ADR-0001](docs/adr/0001-jwt-access-refresh-cookie.md)).
- Injection vulnerabilities (NoSQL, command, header).
- Insecure secret storage in source control or logs.

## Out of scope

- The demo sandbox is intentionally short-lived and resource-capped;
  exhausting it is not a vulnerability ([ADR-0004](docs/adr/0004-demo-sandbox-ttl.md)).
- Self-XSS that requires the reporter to paste attacker code into their
  own browser console.
- Volumetric attacks against the public demo.
- Missing security headers on the marketing landing page that contains
  no user data.
- Reports based on automated scanner output without a working proof of
  concept.

## Defence-in-depth measures in place

- JWT split: short-lived access token + `httpOnly` refresh cookie.
- Tenant isolation enforced on every query.
- Field-level AES-256-CBC encryption on PESEL / ID fields.
- Helmet with Content-Security-Policy, Permissions-Policy, and
  cross-origin headers.
- Rate limiting on `/api/auth/*` and global `/api/*`.
- Bcrypt password hashing with salt rounds = 10.
- CodeQL / Semgrep static analysis on every push.
- Weekly Dependabot updates grouped by ecosystem.

## Disclosure

Once a fix has shipped, we will credit the reporter (with their
permission) in the corresponding GitHub Security Advisory.
