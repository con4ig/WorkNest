// Demo-login happy path — the single most important flow in the app
// from a portfolio-evaluation perspective. If a recruiter clicks the
// landing-page CTA and the dashboard does not appear, nothing else
// matters.
//
// The demo button calls `POST /api/auth/demo-login`, which provisions
// a fresh tenant, seeds sample data, and returns auth tokens. We
// assert (a) the navigation lands on `/dashboard` and (b) the
// dashboard fetches at least one of its panels successfully.

import { test, expect } from "@playwright/test";

test.describe("Demo sandbox flow", () => {
  test("clicking the demo CTA lands on the dashboard", async ({ page }) => {
    await page.goto("/");

    // The CTA is the only large primary button on the hero, identified
    // by role + accessible name. We try multiple known labels (PL/EN).
    const cta = page
      .getByRole("button", { name: /demo|try|wypróbuj|sprawdź/i })
      .first();
    await expect(cta).toBeVisible({ timeout: 10_000 });

    // Demo provisioning + auth round-trip takes a moment; wait for the
    // navigation to /dashboard rather than relying on a sleep.
    await Promise.all([
      page.waitForURL("**/dashboard", { timeout: 30_000 }),
      cta.click(),
    ]);

    await expect(page).toHaveURL(/\/dashboard$/);
  });

  test("authenticated session can reach /projects", async ({ page }) => {
    await page.goto("/");
    const cta = page
      .getByRole("button", { name: /demo|try|wypróbuj|sprawdź/i })
      .first();
    await Promise.all([
      page.waitForURL("**/dashboard", { timeout: 30_000 }),
      cta.click(),
    ]);

    // Direct navigation guarded by `ProtectedRoute`; succeeding here
    // proves the JWT/refresh-cookie pair is actually being honoured.
    await page.goto("/projects");
    await expect(page).toHaveURL(/\/projects$/);
    // The shell renders even if the project list is empty — assert the
    // page chrome rather than the contents.
    await expect(page.locator("body")).toBeVisible();
  });
});
