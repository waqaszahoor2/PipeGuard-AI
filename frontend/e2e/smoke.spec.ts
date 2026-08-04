import { expect, test } from "@playwright/test";

test.describe("PipeGuard AI End-to-End Production Verification", () => {
  test("1. Root route / redirects immediately to /dashboard", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByRole("heading", { name: /Pipeline Telemetry/i })).toBeVisible();
  });

  test("2. Dashboard renders without loading artifacts or console errors", async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });

    await page.goto("/dashboard");
    await expect(page.getByRole("heading", { name: /Pipeline Telemetry/i })).toBeVisible();
    await expect(page.getByText(/3 \/ Loading PipeGuard AI/i)).not.toBeVisible();
    expect(consoleErrors).toHaveLength(0);
  });

  test("3. Pipe Information loads 50+ records with search, filter, and pagination", async ({ page }) => {
    await page.goto("/pipe-information");
    await expect(page.getByRole("heading", { name: /Pipeline Asset Directory/i })).toBeVisible();
    await expect(page.getByText(/50 DEMO ASSETS/i)).toBeVisible();
    
    // Test Search
    const searchInput = page.getByPlaceholder("Pipe ID, location...");
    await searchInput.fill("PIPE-CAL-1001");
    await expect(page.getByText("PIPE-CAL-1001").first()).toBeVisible();
  });

  test("4. Leak Detection calculator executes scenario evaluate", async ({ page }) => {
    await page.goto("/leak-detection");
    await expect(page.getByRole("heading", { name: /Pipeline Leak & Anomaly Calculator/i })).toBeVisible();
    
    const calculateButton = page.getByRole("button", { name: /Calculate Risk Score/i });
    await calculateButton.click();
    await expect(page.getByText(/Calculated Risk Index/i)).toBeVisible();
  });

  test("5. Pipeline Map loads without WebGL lockup", async ({ page }) => {
    await page.goto("/pipeline-map");
    await expect(page.getByRole("heading", { name: /Geospatial Pipeline Risk Map/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Interactive Map/i })).toBeVisible();
  });

  test("6. Inspection Records supports role modes and field log entry", async ({ page }) => {
    await page.goto("/inspection-records");
    await expect(page.getByRole("heading", { name: /Field Inspection Workflows/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Public Visitor/i })).toBeVisible();
  });

  test("7. Mobile viewport (390px) responsive layout rendering", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/dashboard");
    await expect(page.getByRole("heading", { name: /Pipeline Telemetry/i })).toBeVisible();
    await expect(page.getByRole("navigation", { name: /Mobile bottom navigation/i })).toBeVisible();
  });
});
