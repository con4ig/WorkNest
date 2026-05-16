# ADR-0006: i18n on the frontend only; backend speaks English

## Status

Accepted — 2026-05-16

## Context

WorkNest targets Polish SMBs but the codebase also serves as a portfolio
piece read by international reviewers. The product needs to display
Polish to its users; the engineering surface (logs, error responses,
identifiers, comments) needs to be readable to non-Polish-speaking
reviewers.

Two places translation can live:

1. **Backend.** The API returns localized strings; the frontend just
   renders them.
2. **Frontend.** The API returns stable English (or codes); the
   frontend translates for display.

## Decision

All translation lives in the **frontend** via `i18next` +
`react-i18next` with `i18next-http-backend` loading
`client/public/locales/{pl,en}/translation.json` on demand. Language is
detected via `i18next-browser-languagedetector` (cookie / localStorage /
`Accept-Language`).

The **backend** (controllers, models, middleware, logs, error responses)
is exclusively English. API messages such as
`{ message: "Invalid credentials" }` are stable identifiers, not display
copy. The frontend either maps known messages to i18n keys or renders
them verbatim with a translated fallback.

Translation files are kept in **strict parity** — every key exists in
both `pl/` and `en/` (currently 699/699; verified by tooling).

## Consequences

+ Backend logs are searchable and shareable globally — no Polish
  characters in stack traces or Sentry events.
+ Adding a third locale is a frontend-only change.
+ Translators never touch the API or its tests.
+ Caching: locale JSONs are static assets, served with long-lived
  cache headers, fetched once per user per version.
- The frontend must own the mapping from API error strings to
  localized copy. A new backend error message that the frontend
  doesn't recognise falls through to the English original.
- Server-rendered HTML emails (future) would have to re-implement
  localization or call out to a translation service.
- SEO meta tags in `client/index.html` are static English; per-language
  SSR is out of scope.

## Alternatives considered

- **Backend-localized responses.** Forces the API to know about UI
  copy, couples server tests to translation strings, and breaks the
  log-readability goal. Rejected.
- **Single language (PL only).** Excludes international reviewers.
  Rejected — this is also a portfolio.
- **i18n via React Intl / FormatJS.** Heavier API for the same outcome
  at WorkNest's scale; the project already uses i18next idioms.
- **Backend returns error codes, frontend maps codes → copy.** Cleaner
  long-term but more upfront work; deferred. Current English messages
  are de-facto stable enough to serve the same role.
