// Playwright E2E configuration.
//
// What we test:
//   The flows a recruiter is most likely to click through manually —
//   landing page renders, demo login provisions a sandbox + lands on
//   the dashboard, regulamin / privacy pages load. These are the
//   "above the fold" guarantees of the project.
//
// What we don't test:
//   Deep CRUD flows. Those are covered by Vitest + Supertest at the
//   API layer where they're cheaper to run and more deterministic.
//
// Servers:
//   - Backend on :5500 from `server/`.
//   - Frontend on :5173 from `client/` (Vite dev server, with the
//     proxy that forwards `/api` and `/socket.io` to the backend).
//   Both are started by Playwright via `webServer`; teardown is
//   handled automatically.

import { defineConfig, devices } from "@playwright/test";

const PORT = 5173;
const baseURL = `http://127.0.0.1:${PORT}`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false, // The demo provisions data in the real DB; serial is safer.
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "html",

  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    // Slow CI runners sometimes take their time on Vite cold-start.
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  webServer: [
    {
      command: "npm start",
      cwd: "./server",
      port: 5500,
      reuseExistingServer: !process.env.CI,
      timeout: 60_000,
      env: {
        NODE_ENV: "test",
        PORT: "5500",
        JWT_SECRET: process.env.JWT_SECRET || "e2e-jwt-secret",
        JWT_REFRESH_SECRET:
          process.env.JWT_REFRESH_SECRET || "e2e-refresh-secret",
        ENCRYPTION_KEY:
          process.env.ENCRYPTION_KEY ||
          "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
        MONGODB_URI:
          process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/worknest-e2e",
        ALLOWED_ORIGINS: `${baseURL},http://localhost:${PORT}`,
      },
    },
    {
      command: "npm run dev -- --port 5173 --strictPort",
      cwd: "./client",
      port: PORT,
      reuseExistingServer: !process.env.CI,
      timeout: 60_000,
      env: {
        VITE_API_TARGET: "http://127.0.0.1:5500",
      },
    },
  ],
});
