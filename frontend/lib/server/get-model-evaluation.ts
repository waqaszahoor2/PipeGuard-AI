import "server-only";

import rawEvaluation from "@/data/model/evaluation-v1.2.json";

export function getModelEvaluation() {
  if (!rawEvaluation || !rawEvaluation.modelVersion) {
    return {
      evaluation: null,
      error: "Metrics unavailable — reproducible evaluation evidence could not be loaded."
    };
  }

  return {
    evaluation: rawEvaluation,
    error: null
  };
}
