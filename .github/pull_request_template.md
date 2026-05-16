<!--
Thanks for the contribution. Please fill in the sections below.

Title format: `<type>(<scope>): <subject>` — see `commitlint` config in
the root `package.json`. Examples:
  feat(projects): bulk archive endpoint
  fix(auth): clear refresh cookie on /logout when sandbox wipe fails
  chore(deps): bump express from 5.1.0 to 5.2.0
-->

## Summary

<!-- One or two sentences. What does this PR do and why? -->

## Changes

<!-- Bullet list. Highlight anything reviewers might miss. -->

-
-

## How to verify

<!-- Concrete commands or steps a reviewer can run. -->

```bash
# example
cd server && npm test
```

## Related

<!-- Closes #123, refs #45, relates to ADR-0002, etc. -->

## Checklist

- [ ] Touched code is covered by tests (or I've explained why not).
- [ ] `npm test` (server) passes locally.
- [ ] `npm run lint` and `npm run build` (client) pass locally.
- [ ] Public API changes are reflected in the OpenAPI spec
      (`server/routes/*.js` JSDoc, exposed at `/api/docs`).
- [ ] User-facing strings exist in both `pl/` and `en/` locales.
- [ ] If this changes an architectural decision, an ADR has been
      added or updated under `docs/adr/`.
- [ ] No secrets, PII, or hardcoded production URLs.
