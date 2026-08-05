import { describe, expect, it } from "vitest";
import { convertToCSV, getPipelineStats, PIPELINE_ASSETS_50, PipelineAssetSchema } from "./pipeline-data";

describe("Pipeline Data Module & Validation Suite", () => {
  it("validates all 50 pipeline assets against Zod schema", () => {
    expect(PIPELINE_ASSETS_50).toHaveLength(50);
    PIPELINE_ASSETS_50.forEach((asset) => {
      const result = PipelineAssetSchema.safeParse(asset);
      expect(result.success).toBe(true);
    });
  });

  it("reconciles exact dataset risk breakdown: Total=50, Normal=24, Warning=20, Critical=6", () => {
    const stats = getPipelineStats(PIPELINE_ASSETS_50);
    expect(stats.total).toBe(50);
    expect(stats.normal).toBe(24);
    expect(stats.warning).toBe(20);
    expect(stats.critical).toBe(6);
  });

  it("generates valid CSV content containing header and 50 rows", () => {
    const csv = convertToCSV(PIPELINE_ASSETS_50);
    const lines = csv.split("\n");
    expect(lines).toHaveLength(51); // 1 header + 50 asset rows
    expect(lines[0]).toContain("pipe_id,location,zone");
    expect(lines[1]).toContain("PIPE-CAL-1002");
  });
});
