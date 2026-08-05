import { PIPELINE_ASSETS_50, type PipelineAsset as CentralPipelineAsset } from "./pipeline-data";

export interface PipelineAsset {
  pipe_id: string;
  location: string;
  zone: string;
  latitude: number;
  longitude: number;
  installation_year: number;
  pipe_age: number;
  material: "Ductile Iron" | "PVC" | "Cast Iron" | "Concrete" | "Steel" | "Polyethylene";
  diameter_mm: number;
  length_m: number;
  max_capacity_lps: number;
  pressure_bar: number;
  flow_rate_lps: number;
  temperature_c: number;
  operational_status: "Active" | "Maintenance Required" | "Under Repair" | "Inactive";
  inspection_status: "Passed" | "Scheduled" | "Pending Review" | "Failed - Action Required";
  risk_score: number; // 0 to 100
  risk_level: "Low" | "Medium" | "High" | "Critical";
  last_inspection_date: string;
}

export const SAMPLE_PIPELINES: PipelineAsset[] = PIPELINE_ASSETS_50 as PipelineAsset[];

export function getPipeSummary(pipes: PipelineAsset[] = SAMPLE_PIPELINES) {
  const total = pipes.length;
  const normal = pipes.filter((p) => p.risk_level === "Low").length;
  const possibleAlerts = pipes.filter((p) => p.risk_level === "Medium" || p.risk_level === "High").length;
  const critical = pipes.filter((p) => p.risk_level === "Critical").length;
  const maintenanceRequired = pipes.filter(
    (p) => p.operational_status === "Maintenance Required" || p.operational_status === "Under Repair" || p.operational_status === "Inactive"
  ).length;

  const avgPressure = Number((pipes.reduce((acc, p) => acc + p.pressure_bar, 0) / (total || 1)).toFixed(2));
  const avgFlow = Number((pipes.reduce((acc, p) => acc + p.flow_rate_lps, 0) / (total || 1)).toFixed(1));

  const zoneMap = new Map<string, { count: number; totalRisk: number }>();
  pipes.forEach((p) => {
    const curr = zoneMap.get(p.zone) ?? { count: 0, totalRisk: 0 };
    zoneMap.set(p.zone, { count: curr.count + 1, totalRisk: curr.totalRisk + p.risk_score });
  });

  const zoneStats = Array.from(zoneMap.entries())
    .map(([zone, data]) => ({
      zone,
      count: data.count,
      avgRisk: Math.round(data.totalRisk / data.count)
    }))
    .sort((a, b) => b.avgRisk - a.avgRisk);

  return {
    total,
    normal,
    possibleAlerts,
    critical,
    maintenanceRequired,
    avgPressure,
    avgFlow,
    highRiskZones: zoneStats.slice(0, 3),
    zoneStats
  };
}
