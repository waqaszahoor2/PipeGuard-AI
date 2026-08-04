import { expect, test } from "@playwright/test";

test("dashboard and navigation render", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page.getByRole("heading", { name: "Network Overview" })).toBeVisible();
  await expect(page.getByText("DEMO DATA").first()).toBeVisible();
});

test("mobile leak detection route renders", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/leak-detection");
  await expect(page.getByRole("heading", { name: "Leak Detection" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Try Leak Example" })).toBeVisible();
});
