# ADR-0005: Lazy-load protected routes, eager-load auth pages

## Status

Accepted — 2026-05-16

## Context

The initial bundle determines time-to-interactive on the landing page —
which is the single most-visited surface and the one a recruiter sees
first. Shipping the Kanban view, calendar, charts library, drag-and-drop
runtime, and leave-approval modals to a logged-out visitor is wasteful.

React 18+ `React.lazy` plus Vite's automatic code-splitting makes
per-route splitting essentially free at the source level.

## Decision

In [`client/src/main.jsx`](../../client/src/main.jsx):

- **Eager**: `Login`, `Register`, `Forgot`, `Terms`, `PrivacyPolicy`,
  `App` (Landing). These are reachable without auth and small.
- **Lazy** (`React.lazy(() => import(...))`): `Dashboard`, `EmployeeList`,
  `Projects`, `ProjectDetails`, `MyLeaves`, `LeaveApprovals`,
  `UserDetails`, `Upload`, `GenerateCode`, `ForcePasswordChange`.

A single `<Suspense fallback={<LoadingScreen />}>` boundary wraps the
router. The fallback is intentionally lightweight (no Tailwind utility
churn) so the first frame after navigation is cheap.

## Consequences

+ Landing-page JS payload excludes `recharts`, `@dnd-kit/*`,
  `react-big-calendar`, `react-datepicker` — by far the largest deps.
+ Each protected route is fetched only when the user navigates to it,
  cached by the browser thereafter.
+ Easy to add new protected pages without re-thinking bundle strategy.
- A user navigating from `/login` to `/dashboard` pays a one-time
  network cost for the dashboard chunk. Mitigated by `<link rel="modulepreload">`
  hints (future work) and by the chunk landing in HTTP cache for
  subsequent visits.
- The Suspense fallback is visible on a slow connection. The
  `LoadingScreen` is designed to match the eventual layout to minimise
  perceived shift.

## Alternatives considered

- **Eager-load everything.** Simpler mental model; sacrifices LCP on
  the landing page, which is the recruiter's first impression.
  Rejected.
- **Per-feature manual chunks via `build.rollupOptions.output.manualChunks`.**
  Marginal gains over automatic splitting; couples the build config to
  route structure. Deferred until profiling shows a need.
- **Route-level prefetch on hover.** Worth doing once authenticated
  navigation patterns are measured. Tracked as future work.
