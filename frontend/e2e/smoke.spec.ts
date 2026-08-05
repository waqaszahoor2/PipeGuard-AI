import { expect, test } from "@playwright/test";

test.describe("PipeGuard AI Comprehensive End-to-End Production Audit", () => {
  test("1. Root route / redirects immediately to /dashboard", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page).toHaveTitle("Dashboard | PipeGuard AI");
  });

  test("2. Global loader is absent from completed page output", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.getByText("Loading PipeGuard AI Telemetry…")).toHaveCount(0);
  });

  test("3. Pipe Information has separated controls and synthetic description", async ({ page }) => {
    await page.goto("/pipe-information");
    await expect(page.getByText("50 Demo Assets", { exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Download CSV (50)" })).toBeVisible();
  });

  test("4. Map loading resolves or falls back gracefully", async ({ page }) => {
    await page.goto("/pipeline-map");
    await expect(page.getByRole("heading", { name: /Geospatial Pipeline Risk Map/i })).toBeVisible();
    await expect(page.getByText("Loading Interactive Geospatial Engine…")).not.toBeVisible({ timeout: 12_000 });
  });

  test("5. Text is not concatenated across sections", async ({ page }) => {
    await page.goto("/leak-detection");
    await expect(page.getByText(/Prototype ModeResults/)).toHaveCount(0);

    await page.goto("/inspection-records");
    await expect(page.getByText(/WorkflowsAll/)).toHaveCount(0);
  });

  test("6. Inspection Records displays demo role security note and synthetic badges", async ({ page }) => {
    await page.goto("/inspection-records");
    await expect(page.getByText(/Simulated demonstration role/i)).toBeVisible();
    await expect(page.getByText("Synthetic Demo Record").first()).toBeVisible();
  });

  test("7. Model Information renders evaluation artifact and download button", async ({ page }) => {
    await page.goto("/model-information");
    await expect(page.getByText("Download Evaluation Artifact")).toBeVisible();
    await expect(page.getByText("v1.2.0-rf")).toBeVisible();
  });

  test("8. Unique titles across all routes", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveTitle("Dashboard | PipeGuard AI");
    await page.goto("/pipe-information");
    await expect(page).toHaveTitle("Pipe Information | PipeGuard AI");
    await page.goto("/pipeline-map");
    await expect(page).toHaveTitle("Pipeline Map | PipeGuard AI");
    await page.goto("/model-information");
    await expect(page).toHaveTitle("Model Information | PipeGuard AI");
  });
});
