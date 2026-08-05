import { describe, expect, it } from "vitest";
import { normalizePipelineAssets, PIPELINE_ASSETS_50 } from "../lib/pipeline-data";
import { calculatePipelineSummary } from "../lib/pipeline-summary";

describe("Server-Initialized Data Architecture", () => {
  it("normalizes 50 raw records successfully with 0 rejections", () => {
    const result = normalizePipelineAssets(PIPELINE_ASSETS_50);
    expect(result.records).toHaveLength(50);
    expect(result.rejectedCount).toBe(0);
    expect(result.errors).toHaveLength(0);
  });

  it("calculates correct pipeline totals (50 total, 24 low/normal, 20 warning/high, 6 critical)", () => {
    const summary = calculatePipelineSummary(PIPELINE_ASSETS_50);
    expect(summary.total).toBe(50);
    expect(summary.normal).toBe(24);
    expect(summary.warning).toBe(20);
    expect(summary.critical).toBe(6);
  });

  it("ensures unique pipeline asset IDs across the dataset", () => {
    const ids = PIPELINE_ASSETS_50.map((a) => a.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(50);
  });
});
