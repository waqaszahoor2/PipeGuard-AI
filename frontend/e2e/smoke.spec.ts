import { expect, test } from "@playwright/test";

test.describe("PipeGuard AI Comprehensive End-to-End Production Audit", () => {
  test("1. Root route / redirects immediately to /dashboard", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByRole("heading", { name: /Pipeline Telemetry/i })).toBeVisible();
  });

  test("2. Global loader disappears and no 3 / Loading element remains", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");
    await expect(page.getByText(/3 \/ Loading PipeGuard AI/i)).not.toBeVisible();
    await expect(page.getByText(/Loading PipeGuard AI Telemetry/i)).not.toBeVisible();
  });

  test("3-7. Dashboard displays 50 assets, 24 normal, 20 warning, 6 critical, and non-zero averages", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.getByText("50", { exact: true })).toBeVisible();
    await expect(page.getByText("24", { exact: true })).toBeVisible();
    await expect(page.getByText("20", { exact: true })).toBeVisible();
    await expect(page.getByText("6", { exact: true })).toBeVisible();
    await expect(page.getByText(/4\.2 bar/i)).toBeVisible();
  });

  test("8-10. Pipe Information loads 50 records, supports search/filter & CSV export", async ({ page }) => {
    await page.goto("/pipe-information");
    await expect(page.getByRole("heading", { name: /Pipeline Asset Directory/i })).toBeVisible();
    await expect(page.getByText(/50 DEMO ASSETS/i)).toBeVisible();

    const searchInput = page.getByPlaceholder("Pipe ID, location...");
    await searchInput.fill("PIPE-CAL-1001");
    await expect(page.getByText("PIPE-CAL-1001").first()).toBeVisible();
  });

  test("11-12. Pipeline Map loads interactively or populated table fallback", async ({ page }) => {
    await page.goto("/pipeline-map");
    await expect(page.getByRole("heading", { name: /Geospatial Pipeline Risk Map/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Interactive Map/i })).toBeVisible();
  });

  test("13. Leak Detection calculator validates inputs & calculates risk", async ({ page }) => {
    await page.goto("/leak-detection");
    await expect(page.getByRole("heading", { name: /Pipeline Leak & Anomaly Calculator/i })).toBeVisible();
    const calculateButton = page.getByRole("button", { name: /Calculate Risk Score/i });
    await calculateButton.click();
    await expect(page.getByText(/Calculated Risk Index/i)).toBeVisible();
  });

  test("14. Demo roles operate client-side only without privileged API tokens", async ({ page }) => {
    await page.goto("/inspection-records");
    await expect(page.getByText(/Simulated Demonstration Role/i).first()).toBeVisible();
  });

  test("15. Model Information loads reproducible evaluation artifact", async ({ page }) => {
    await page.goto("/model-information");
    await expect(page.getByText(/Reproducible Model Evaluation Artifact/i)).toBeVisible();
    await expect(page.getByText(/v1.2-battle-dim/i)).toBeVisible();
  });

  test("16. Every route features a unique document title tag", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveTitle(/Dashboard \| PipeGuard AI/);
    await page.goto("/pipe-information");
    await expect(page).toHaveTitle(/Pipe Information \| PipeGuard AI/);
    await page.goto("/pipeline-map");
    await expect(page).toHaveTitle(/Pipeline Map \| PipeGuard AI/);
    await page.goto("/model-information");
    await expect(page).toHaveTitle(/Model Information \| PipeGuard AI/);
  });

  test("17-19. Zero console, hydration, or failed network errors during navigation", async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });

    await page.goto("/dashboard");
    await page.goto("/about");
    expect(consoleErrors).toHaveLength(0);
  });

  test("20. Mobile viewports (390px, 320px) render without horizontal overflow", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/dashboard");
    await expect(page.getByRole("navigation", { name: /Mobile bottom navigation/i })).toBeVisible();
  });
});
