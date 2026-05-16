# End-to-end tests

Playwright covers the headline flows a recruiter or QA reviewer is
most likely to click through:

| Spec                | Asserts                                      |
|---------------------|----------------------------------------------|
| `landing.spec.js`   | Landing page renders, legal pages load.      |
| `demo-login.spec.js`| Demo CTA → `/dashboard`, then `/projects`.   |

## Run locally

```bash
# One-off: download the Chromium build Playwright pins to.
npm run test:e2e:install

# Headless run — uses the configs in `playwright.config.js` which
# boots the backend (5500) and the Vite dev server (5173) for you.
npm run test:e2e

# Interactive UI for triaging failures.
npm run test:e2e:ui
```

## Database

By default the suite uses `mongodb://127.0.0.1:27017/worknest-e2e`.
Override via `MONGODB_URI` if you need to point at a sandbox cluster.
Tests should never share a database with development or production
data — the demo-login flow writes real rows.

## CI

The workflow at [`.github/workflows/e2e.yml`](../.github/workflows/e2e.yml)
runs the same `npm run test:e2e` against a MongoDB service container.
HTML reports and traces are uploaded as artefacts on failure.
