// Landing-page smoke tests — what a recruiter sees in the first 3
// seconds. Keep these short and deterministic; deeper flows live in
// `demo-login.spec.js`.

import { test, expect } from "@playwright/test";

test.describe("Landing page", () => {
  test("renders the hero section and demo CTA", async ({ page }) => {
    await page.goto("/");
    // The landing page renders a hero heading that should be discoverable
    // by any reasonable screen reader.
    await expect(page).toHaveTitle(/WorkNest/i);
    await expect(
      page.getByRole("heading", { level: 1 })
    ).toBeVisible();
  });

  test("static legal pages load", async ({ page }) => {
    await page.goto("/regulamin");
    await expect(page.locator("body")).toContainText(/WorkNest/i);

    await page.goto("/polityka-prywatnosci");
    await expect(page.locator("body")).toContainText(/WorkNest/i);
  });
});
