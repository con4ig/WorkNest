# Contributing to WorkNest

Thanks for considering a contribution. This document explains how to
get a local environment running, what conventions the project follows,
and what we look for in a pull request.

## Repository layout

```
client/   React 19 + Vite SPA (Tailwind, i18next, dnd-kit, recharts)
server/   Express 5 API (Mongoose 8, JWT, Helmet, Swagger UI)
docs/adr/ Architecture Decision Records
.github/  CI, Dependabot, Semgrep, issue & PR templates
```

The root `package.json` only carries repository-wide tooling
(Husky, lint-staged, commitlint). Application dependencies live inside
`client/` and `server/`.

## Local setup

```bash
# 1. Install root tooling (Husky hooks, lint-staged, commitlint).
npm install

# 2. Backend
cd server
npm install
cp .env.example .env             # fill in MONGODB_URI, JWT_SECRET, etc.
npm run dev                       # http://localhost:5500

# 3. Frontend (new terminal)
cd ../client
npm install
npm run dev                       # http://localhost:5173
```

Docker stack (preferred when you don't want to install MongoDB):

```bash
# For development (with hot-reload/HMR):
docker compose up

# For production-like build:
docker compose -f docker-compose.prod.yml up -d
```

## Tests

```bash
cd server && npm test             # Vitest + Supertest + in-memory MongoDB
cd client && npm run lint         # ESLint
cd client && npm run build        # production build (also a smoke test)
```

CI runs the same commands. PRs that break either job will be flagged.

## Coding conventions

- **English everywhere in source** — code, comments, log lines, error
  messages, identifiers. User-facing copy is translated at the
  i18next layer; see [ADR-0006](docs/adr/0006-i18n-frontend-only.md).
- **Tenant safety.** Every query that touches a tenant-scoped collection
  must include a `company` predicate (or be explicitly `superadmin`).
  See [ADR-0002](docs/adr/0002-multi-tenancy-company-field.md). A
  missing predicate is the single most dangerous bug in this codebase.
- **No secrets in commits.** `.env.example` carries placeholders only.
- **One concern per file** for new modules; co-locate helpers used by
  exactly one consumer.
- **Tests next to the contract they cover.** Backend tests live in
  `server/test/`; each file targets one route family or one cross-cut
  property (e.g. tenant isolation).

## Commit messages

We follow [Conventional Commits](https://www.conventionalcommits.org/),
enforced by `commitlint`. Format:

```
<type>(<scope>): <subject>

[optional body]
[optional footer]
```

Types: `feat`, `fix`, `chore`, `docs`, `test`, `refactor`, `perf`,
`build`, `ci`, `style`, `revert`.

Recognised scopes (non-exhaustive): `client`, `server`, `ci`, `docs`,
`deps`, `infra`, `test`, `auth`, `projects`, `leaves`, `i18n`.

Examples:

```
feat(projects): bulk archive endpoint
fix(auth): clear refresh cookie when sandbox wipe fails
docs(adr): record decision on field-level encryption
chore(deps): bump mongoose from 8.18 to 8.19
```

## Pre-commit hooks

Husky runs two hooks installed by `npm install` at the repository root:

- **`pre-commit`** — `lint-staged` runs Prettier (and ESLint where
  applicable) on staged files only.
- **`commit-msg`** — `commitlint` validates the message against
  the rules above.

If a hook blocks you and you genuinely need to bypass it (rare),
`git commit --no-verify` exists; please don't make a habit of it.

## Pull requests

1. Branch from `main`. Branch names: `<type>/<short-description>`,
   e.g. `feat/bulk-archive`, `fix/auth-cookie-clear`.
2. Keep PRs focused. One concern per PR is far easier to review than a
   sprawling refactor.
3. Update / add tests. Update OpenAPI annotations on `server/routes/*.js`
   when changing an endpoint's contract.
4. Fill in the PR template; the checklist exists to save reviewers
   from chasing the obvious things.
5. CI must be green before merge.

## Architecture decisions

Material decisions (auth, multi-tenancy, encryption, storage choices)
live as ADRs under [`docs/adr/`](docs/adr/). When proposing a change
that contradicts an existing ADR, write a new ADR that supersedes it
rather than editing the original.

## Reporting security issues

**Do not open a public issue for vulnerabilities.** Use GitHub's private
Security Advisories: repo → **Security** tab → **Report a vulnerability**.
See [`SECURITY.md`](SECURITY.md) for the full disclosure policy.

## License

This project is proprietary and confidential. External contributions are not accepted.
