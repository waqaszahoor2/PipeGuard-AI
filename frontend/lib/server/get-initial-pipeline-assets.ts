import "server-only";

import rawPipelineAssets from "@/data/pipelines.json";
import {
  normalizePipelineAssets,
  type PipelineAsset
} from "@/lib/pipeline-data";

export type InitialPipelineResult = {
  records: PipelineAsset[];
  rejectedCount: number;
  source: "bundled-synthetic-demo";
  loadedAt: string;
};

export function getInitialPipelineAssets(): InitialPipelineResult {
  const result = normalizePipelineAssets(rawPipelineAssets);

  if (result.records.length === 0) {
    throw new Error(
      "Bundled pipeline dataset was loaded but no valid records were accepted."
    );
  }

  return {
    records: result.records,
    rejectedCount: result.rejectedCount,
    source: "bundled-synthetic-demo",
    loadedAt: new Date().toISOString()
  };
}
