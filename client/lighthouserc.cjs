// Lighthouse CI configuration.
//
// `lhci autorun` builds the SPA, serves the `dist/` directory on an
// ephemeral port, and probes the routes listed below. Scores and
// budgets fail the run if they regress.
//
// Notes:
// - We only probe public-by-default routes. The Landing page is the
//   recruiter's first impression and the budget mirrors that priority.
// - Tailwind's full design-system CSS is non-trivial, so the
//   performance bar is set realistically (above 0.85, not 0.95).
// - SPA fallback is enabled so client-side routes resolve to index.html.

module.exports = {
  ci: {
    collect: {
      // `npm run build` runs first; we then serve dist/ statically.
      startServerCommand: "npx serve dist -l 4173 --single",
      startServerReadyPattern: "Accepting connections|Serving|Local:",
      url: [
        "http://127.0.0.1:4173/",
        "http://127.0.0.1:4173/login",
        "http://127.0.0.1:4173/regulamin",
      ],
      numberOfRuns: 3,
      settings: {
        preset: "desktop",
        // Skip categories we don't claim to satisfy on a static SPA
        // shell (no SSR meta, no robots.txt requirements yet).
        onlyCategories: [
          "performance",
          "accessibility",
          "best-practices",
          "seo",
        ],
      },
    },
    assert: {
      assertions: {
        "categories:performance": ["warn", { minScore: 0.85 }],
        "categories:accessibility": ["error", { minScore: 0.9 }],
        "categories:best-practices": ["warn", { minScore: 0.9 }],
        "categories:seo": ["warn", { minScore: 0.9 }],

        // Concrete budgets — these are what recruiters actually see.
        "first-contentful-paint": ["warn", { maxNumericValue: 2000 }],
        "largest-contentful-paint": ["warn", { maxNumericValue: 2500 }],
        "cumulative-layout-shift": ["error", { maxNumericValue: 0.1 }],
        "total-blocking-time": ["warn", { maxNumericValue: 300 }],

        // Suppress findings that are noisy on a vanilla Vite build but
        // not actionable here.
        "uses-http2": "off",
        "csp-xss": "off",
        "is-on-https": "off",
      },
    },
    upload: {
      // Use the free temporary public storage so PR comments link to a
      // hosted report. Switch to `lhci-server` for a self-hosted setup.
      target: "temporary-public-storage",
    },
  },
};
