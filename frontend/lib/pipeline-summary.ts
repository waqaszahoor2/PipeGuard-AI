import type { PipelineAsset } from "@/lib/pipeline-data";

export function calculatePipelineSummary(records: PipelineAsset[]) {
  const total = records.length;
  const normal = records.filter(
    (record) => record.risk_level === "Low" || record.operationalStatus === "normal"
  ).length;

  const warning = records.filter(
    (record) =>
      record.risk_level === "Medium" ||
      record.risk_level === "High" ||
      record.operationalStatus === "warning"
  ).length;

  const critical = records.filter(
    (record) => record.risk_level === "Critical" || record.operationalStatus === "critical"
  ).length;

  const average = (values: number[]) =>
    values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;

  return {
    total,
    normal,
    warning,
    critical,
    averagePressure: average(records.map((record) => record.pressure_bar)),
    averageFlow: average(records.map((record) => record.flow_rate_lps)),
    averageRisk: average(records.map((record) => record.risk_score))
  };
}
