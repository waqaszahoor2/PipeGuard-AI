import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { convertToCSV, getPipelineStats, PIPELINE_ASSETS_50, PipelineAssetSchema } from "./pipeline-data";

describe("Pipeline Data Module & Validation Suite", () => {
  it("validates deployed public/data/pipelines.json using cross-platform path", () => {
    const jsonPath = path.resolve(process.cwd(), "public", "data", "pipelines.json");
    expect(fs.existsSync(jsonPath)).toBe(true);

    const rawData = fs.readFileSync(jsonPath, "utf-8");
    const records = JSON.parse(rawData);

    expect(Array.isArray(records)).toBe(true);
    expect(records).toHaveLength(50);

    records.forEach((record: unknown) => {
      const result = PipelineAssetSchema.safeParse(record);
      expect(result.success).toBe(true);
    });

    const stats = getPipelineStats(records);
    expect(stats.total).toBe(50);
    expect(stats.normal).toBe(24);
    expect(stats.warning).toBe(20);
    expect(stats.critical).toBe(6);
  });

  it("validates all 50 pipeline assets in memory against Zod schema", () => {
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
