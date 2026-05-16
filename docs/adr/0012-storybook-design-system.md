# ADR-0012: Storybook for design-system documentation

## Status

Accepted — 2026-05-16

## Context

WorkNest has a small but growing set of UI primitives under
[`client/src/components/ui/`](../../client/src/components/ui/) —
Button, Input, Card, and friends — built on Tailwind tokens and a
light/dark theme toggle managed by
[`ThemeContext`](../../client/src/context/ThemeContext.jsx).

Two problems were getting harder to ignore:

1. **No discoverable catalogue.** A new contributor wanting to know
   "what variants does our Button support?" had to grep the
   codebase. Reviewers — including recruiters skimming the repo —
   couldn't see the design-system thinking without reading source.
2. **No isolated harness.** Component-level a11y and visual issues
   only surfaced when the component happened to be mounted inside a
   real page, often with unrelated context wrapping it. By that
   point the bug was harder to attribute.

Storybook is the obvious answer; the only real questions were which
version, which addons, and how much surface to commit to maintaining.

## Decision

Adopt **Storybook 9** with the `react-vite` framework. Configuration
lives in [`client/.storybook/main.js`](../../client/.storybook/main.js)
and [`client/.storybook/preview.js`](../../client/.storybook/preview.js);
the landing page is
[`client/src/Introduction.mdx`](../../client/src/Introduction.mdx).

Initial scope:

- **Stories for the UI primitives** in
  [`client/src/components/ui/`](../../client/src/components/ui/):
  - [`Button.stories.jsx`](../../client/src/components/ui/Button.stories.jsx)
  - [`Input.stories.jsx`](../../client/src/components/ui/Input.stories.jsx)
  - [`Card.stories.jsx`](../../client/src/components/ui/Card.stories.jsx)
- **Addons.** `@storybook/addon-a11y` runs axe-core on every story
  render, surfacing a11y violations in the toolbar. `addon-docs`
  generates auto-docs from JSDoc + arg-types so the story file
  doubles as the component spec.
- **Theme parity.** A toolbar toggle mirrors the in-app
  light/dark switch from `ThemeContext`, so every story is
  exercised in both modes and Tailwind dark-mode classes don't rot
  unnoticed.
- **Tokens, not magic numbers.** Stories consume the same Tailwind
  config the app does — no separate "Storybook stylesheet" — so a
  token change propagates to the catalogue automatically.

Storybook 9 specifically (rather than 8.x) was the only version with
ergonomic peer-compat for the Vite 7 the client already runs on at
the time of writing; Storybook 8 required either a Vite downgrade or
overrides we were not willing to ship.

## Consequences

+ **Visual catalogue.** Every primitive renders in isolation with
  controls for every prop. New contributors and reviewers can grok
  the system without reading JSX.
+ **a11y enforced per component.** axe runs on every render; a
  regression (missing label, low-contrast pair, non-semantic
  element) lights up immediately, before it ships to a page where
  the symptom is one of many.
+ **Theme regressions surface fast.** Toggling the toolbar verifies
  both modes for every story. Pairs naturally with the test
  pyramid from [ADR-0011](0011-test-pyramid-vitest-playwright.md)
  for the dynamic surface.
+ **Documentation lives next to code.** `addon-docs` auto-generates
  the prop table; the story is the spec.
- **Storybook 9 is newer.** Some community addons hadn't caught up
  at adoption time; we deliberately use only first-party addons to
  avoid that risk surface.
- **Stories are extra surface area.** Every component now carries
  a `.stories.jsx` sibling that has to be updated when the
  component's API changes. The cost is real but small — the
  catalogue pays it back the first time a prop is renamed and the
  story-driven build fails.
- **Bundle / build time** for the static catalogue is non-trivial.
  Storybook is not part of the production client bundle, so this
  cost is paid only by contributors and the docs deployment.

## Alternatives considered

- **Ladle.** Lighter and faster than Storybook for pure stories,
  but the addon ecosystem (a11y, docs, design tokens) is shallower
  and recruiter recognition is lower. Rejected for now;
  reconsider if Storybook's build time becomes painful.
- **A bespoke `/dev/components` route inside the app.** Cheapest
  to build, but missing every Storybook affordance (controls,
  auto-docs, a11y, isolation, theme toolbar) we'd then have to
  re-implement. Rejected.
- **No catalogue.** The prior state. Reviewers couldn't see the
  design-system intent without code-spelunking, and component-level
  a11y violations only surfaced in page-level testing. Rejected.
- **Pattern Lab / Fractal.** Framework-agnostic but not
  React-native; Storybook is the path of least resistance for a
  React-only stack.

## Future work

- **Stories for the layout shells** (Card grids, modal scaffolds)
  once they stabilise.
- **Visual regression snapshots** wired into CI — Storybook +
  Chromatic or Playwright's screenshot mode. Pairs with the E2E
  layer of [ADR-0011](0011-test-pyramid-vitest-playwright.md).
- **Design-token documentation page** auto-generated from the
  Tailwind config, so the colour palette / spacing scale are
  visible in the catalogue.
- **i18n preview** — a locale toolbar that flips every story
  between the languages from
  [ADR-0006](0006-i18n-frontend-only.md) to catch
  string-overflow / RTL bugs early.
