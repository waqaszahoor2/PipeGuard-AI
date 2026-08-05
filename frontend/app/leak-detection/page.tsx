"use client";

import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Download,
  Droplets,
  HelpCircle,
  Info,
  RefreshCw,
  RotateCcw,
  ShieldAlert,
  Zap
} from "lucide-react";
import { useState } from "react";
import { usePipelineData } from "@/providers/PipelineDataProvider";
import type { PipelineAsset } from "@/lib/pipeline-data";

interface EvaluationResult {
  riskScore: number;
  riskLevel: "Low" | "Medium" | "High" | "Critical";
  contributingFactors: string[];
  recommendedAction: string;
  confidence: string;
}

export default function LeakDetectionPage() {
  const { records } = usePipelineData();

  // Input fields
  const [selectedAssetId, setSelectedAssetId] = useState<string>("");
  const [pressure, setPressure] = useState<number>(4.2);
  const [flowRate, setFlowRate] = useState<number>(180);
  const [temperature, setTemperature] = useState<number>(11.5);
  const [pipeAge, setPipeAge] = useState<number>(35);
  const [diameter, setDiameter] = useState<number>(300);
  const [material, setMaterial] = useState<string>("Cast Iron");
  const [zone, setZone] = useState<string>("DOWNTOWN");
  const [pressureDrop, setPressureDrop] = useState<number>(0.8);
  const [flowVariation, setFlowVariation] = useState<number>(25.0);

  const [result, setResult] = useState<EvaluationResult | null>(null);
  const [evaluating, setEvaluating] = useState<boolean>(false);

  // Asset Selector Handler
  const handleSelectAsset = (assetId: string) => {
    setSelectedAssetId(assetId);
    if (!assetId) return;
    const p = records.find((r) => r.pipe_id === assetId || r.id === assetId);
    if (p) {
      setPressure(p.pressure_bar ?? p.pressureBar ?? 4.5);
      setFlowRate(p.flow_rate_lps ?? p.flowRate ?? 200);
      setTemperature(p.temperature_c ?? p.temperatureC ?? 10.5);
      setPipeAge(p.pipe_age ?? p.age ?? 25);
      setDiameter(p.diameter_mm ?? p.diameterMm ?? 300);
      const score = p.risk_score ?? p.riskScore ?? 0;
      setPressureDrop(p.recentPressureDropBar ?? (score > 70 ? 1.5 : 0.2));
      setFlowVariation(p.recentFlowVariationLs ?? (score > 70 ? 35.0 : 5.0));
      setResult(null);
    }
  };

  // Preset Handlers
  const setPresetNormal = () => {
    setSelectedAssetId("");
    setPressure(4.8);
    setFlowRate(210);
    setTemperature(10.5);
    setPipeAge(15);
    setDiameter(300);
    setMaterial("Ductile Iron");
    setZone("WEST CALGARY");
    setPressureDrop(0.1);
    setFlowVariation(2.0);
    setResult(null);
  };

  const setPresetMinorAnomaly = () => {
    setSelectedAssetId("");
    setPressure(3.9);
    setFlowRate(235);
    setTemperature(11.8);
    setPipeAge(40);
    setDiameter(250);
    setMaterial("Cast Iron");
    setZone("NORTH HILL");
    setPressureDrop(0.6);
    setFlowVariation(18.5);
    setResult(null);
  };

  const setPresetMajorAnomaly = () => {
    setSelectedAssetId("");
    setPressure(2.6);
    setFlowRate(340);
    setTemperature(13.2);
    setPipeAge(55);
    setDiameter(350);
    setMaterial("Cast Iron");
    setZone("DOWNTOWN");
    setPressureDrop(1.9);
    setFlowVariation(48.0);
    setResult(null);
  };

  const setPresetAgedCastIron = () => {
    setSelectedAssetId("");
    setPressure(3.1);
    setFlowRate(190);
    setTemperature(12.5);
    setPipeAge(62);
    setDiameter(200);
    setMaterial("Cast Iron");
    setZone("GLENMORE");
    setPressureDrop(1.2);
    setFlowVariation(30.0);
    setResult(null);
  };

  const handleReset = () => {
    setPresetNormal();
  };

  const handleEvaluate = () => {
    setEvaluating(true);

    setTimeout(() => {
      // Hydro-dynamic & age heuristics rule calculator
      let score = 10;
      const factors: string[] = [];

      // Pressure drop factor
      if (pressureDrop > 1.5) {
        score += 40;
        factors.push(`Severe pressure drop of ${pressureDrop.toFixed(1)} bar exceeds nominal hydraulic tolerance.`);
      } else if (pressureDrop > 0.5) {
        score += 20;
        factors.push(`Moderate pressure drop of ${pressureDrop.toFixed(1)} bar detected.`);
      }

      // Flow variation factor
      if (Math.abs(flowVariation) > 35) {
        score += 25;
        factors.push(`Flow rate deviation of ${flowVariation > 0 ? "+" : ""}${flowVariation.toFixed(1)} L/s indicates potential downstream leakage or line rupture.`);
      } else if (Math.abs(flowVariation) > 15) {
        score += 12;
        factors.push(`Elevated flow variance (${flowVariation.toFixed(1)} L/s) relative to historical baseline.`);
      }

      // Material & Pipe Age vulnerability
      if (material === "Cast Iron") {
        if (pipeAge > 50) {
          score += 22;
          factors.push(`Cast Iron material at age ${pipeAge} years carries high vulnerability to tuberculation and graphitic corrosion.`);
        } else if (pipeAge > 30) {
          score += 12;
          factors.push(`Cast Iron construction (age ${pipeAge} years) increases failure probability.`);
        }
      } else if (material === "Ductile Iron" && pipeAge > 45) {
        score += 10;
        factors.push(`Aging Ductile Iron pipeline (${pipeAge} years) approaching maintenance threshold.`);
      }

      // Low operating pressure threshold
      if (pressure < 3.0) {
        score += 15;
        factors.push(`Operating pressure (${pressure.toFixed(1)} bar) below minimum distribution standard.`);
      }

      score = Math.min(99, Math.max(5, score));

      let level: "Low" | "Medium" | "High" | "Critical" = "Low";
      let action = "Routine telemetry monitoring recommended. No immediate physical intervention required.";

      if (score >= 80) {
        level = "Critical";
        action = "Deploy immediate field technician team for acoustic leak correlation and visual inspection within 12 hours.";
      } else if (score >= 60) {
        level = "High";
        action = "Schedule high-priority technician field inspection and monitor pressure sensors closely for next 24 hours.";
      } else if (score >= 35) {
        level = "Medium";
        action = "Flag segment for upcoming routine maintenance cycle. Re-verify telemetry after next diurnal cycle.";
      }

      setResult({
        riskScore: score,
        riskLevel: level,
        contributingFactors: factors.length > 0 ? factors : ["All operating telemetry metrics fall within optimal nominal range."],
        recommendedAction: action,
        confidence: "Research Heuristic Baseline (Non-Approved Production Model)"
      });

      setEvaluating(false);
    }, 300);
  };

  const downloadReport = () => {
    if (!result) return;
    const reportText = `PIPEGUARD AI - ANOMALY DETECTION REPORT
Generated: ${new Date().toLocaleString()}
--------------------------------------------------------
RESEARCH PROTOTYPE EVALUATION SUMMARY

INPUT TELEMETRY METRICS:
- Selected Asset: ${selectedAssetId || "Custom Parameters"}
- Zone: ${zone}
- Material: ${material}
- Pipe Age: ${pipeAge} years
- Diameter: ${diameter} mm
- Operating Pressure: ${pressure} bar
- Flow Rate: ${flowRate} L/s
- Fluid Temperature: ${temperature} °C
- Recent Pressure Drop: ${pressureDrop} bar
- Recent Flow Variation: ${flowVariation} L/s

EVALUATION RESULT:
- Risk Index: ${result.riskScore} / 100
- Severity Tier: ${result.riskLevel}
- Model Baseline: ${result.confidence}

CONTRIBUTING FACTORS:
${result.contributingFactors.map((f) => `- ${f}`).join("\n")}

RECOMMENDED TECHNICIAN ACTION:
${result.recommendedAction}

--------------------------------------------------------
DISCLAIMER:
This result is generated by an unapproved research prototype for educational and algorithm evaluation purposes.
System DOES NOT confirm physical leakage, corrosion depth, wall thickness, or remaining pipe lifespan.
All physical actions require technician verification.
`;

    const blob = new Blob([reportText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `pipeguard_anomaly_report_${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Prominent Mandatory Disclaimer Banner */}
      <section className="rounded-2xl border border-amber-300 bg-amber-500/10 p-4 text-amber-950 dark:border-amber-700/60 dark:bg-amber-950/40 dark:text-amber-200">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-6 w-6 shrink-0 text-amber-600 dark:text-amber-400" />
          <div className="text-xs leading-relaxed font-semibold">
            <strong className="text-sm font-black block mb-1.5">Demonstration & Research Prototype Mode</strong>
            Results are for research, educational, and algorithm evaluation purposes and are NOT generated by an approved production model. PipeGuard AI does not confirm physical leakage, structural damage, corrosion depth, or remaining pipe lifespan.
          </div>
        </div>
      </section>

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Pipeline Leak & Anomaly Calculator
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Simulate operating pressure drops, flow variations, and physical pipe attributes to compute vulnerability metrics.
          </p>
        </div>
        <span className="badge-demo">HEURISTIC EVALUATOR</span>
      </div>

      {/* Load Monitored Asset Selector & Preset Buttons */}
      <section className="card p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-extrabold text-slate-700 dark:text-slate-300">
            <span>Load Telemetry From Monitored Asset:</span>
          </div>

          <div className="w-full sm:w-auto">
            <select
              className="input py-1.5 text-xs font-mono font-bold"
              value={selectedAssetId}
              onChange={(e) => handleSelectAsset(e.target.value)}
              aria-label="Load telemetry from asset"
            >
              <option value="">-- Select Monitored Pipeline Asset ({records.length}) --</option>
              {records.map((r) => {
                const id = r.pipe_id || r.id;
                return (
                  <option key={id} value={id}>
                    {id} - {r.zone} ({r.material}, {r.risk_level || r.riskLevel} Risk)
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-200 dark:border-slate-700">
          <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
            Or Choose Scenario Preset:
          </span>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={setPresetNormal}
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              Normal Baseline
            </button>
            <button
              onClick={setPresetMinorAnomaly}
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              Minor Flow Anomaly
            </button>
            <button
              onClick={setPresetMajorAnomaly}
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              Major Pressure Loss
            </button>
            <button
              onClick={setPresetAgedCastIron}
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              Aged Cast Iron
            </button>
          </div>
        </div>
      </section>

      {/* Main Grid: Inputs Form & Result Card */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Form Inputs */}
        <section className="card p-6 space-y-5">
          <h3 className="text-lg font-black text-slate-900 dark:text-white">Telemetry & Asset Parameters</h3>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Operating Pressure (bar)</label>
              <input
                type="number"
                step="0.1"
                className="input font-mono"
                value={pressure}
                onChange={(e) => setPressure(parseFloat(e.target.value) || 0)}
              />
            </div>

            <div>
              <label className="label">Flow Rate (L/s)</label>
              <input
                type="number"
                step="1"
                className="input font-mono"
                value={flowRate}
                onChange={(e) => setFlowRate(parseFloat(e.target.value) || 0)}
              />
            </div>

            <div>
              <label className="label">Recent Pressure Drop (bar)</label>
              <input
                type="number"
                step="0.1"
                className="input font-mono"
                value={pressureDrop}
                onChange={(e) => setPressureDrop(parseFloat(e.target.value) || 0)}
              />
            </div>

            <div>
              <label className="label">Flow Rate Variation (L/s)</label>
              <input
                type="number"
                step="0.5"
                className="input font-mono"
                value={flowVariation}
                onChange={(e) => setFlowVariation(parseFloat(e.target.value) || 0)}
              />
            </div>

            <div>
              <label className="label">Fluid Temperature (°C)</label>
              <input
                type="number"
                step="0.1"
                className="input font-mono"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value) || 0)}
              />
            </div>

            <div>
              <label className="label">Pipe Age (years)</label>
              <input
                type="number"
                step="1"
                className="input font-mono"
                value={pipeAge}
                onChange={(e) => setPipeAge(parseInt(e.target.value) || 0)}
              />
            </div>

            <div>
              <label className="label">Pipe Diameter (mm)</label>
              <input
                type="number"
                step="10"
                className="input font-mono"
                value={diameter}
                onChange={(e) => setDiameter(parseInt(e.target.value) || 0)}
              />
            </div>

            <div>
              <label className="label">Pipe Material</label>
              <select
                className="input"
                value={material}
                onChange={(e) => setMaterial(e.target.value)}
              >
                <option value="Cast Iron">Cast Iron</option>
                <option value="Ductile Iron">Ductile Iron</option>
                <option value="PVC">PVC</option>
                <option value="Steel">Steel</option>
                <option value="Polyethylene">Polyethylene</option>
                <option value="Concrete">Concrete</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="label">Pressure Zone</label>
              <select className="input" value={zone} onChange={(e) => setZone(e.target.value)}>
                <option value="DOWNTOWN">DOWNTOWN</option>
                <option value="BROADCAST HILL">BROADCAST HILL</option>
                <option value="GLENMORE">GLENMORE</option>
                <option value="WEST CALGARY">WEST CALGARY</option>
                <option value="NORTH HILL">NORTH HILL</option>
                <option value="OGDEN">OGDEN</option>
                <option value="NOSE HILL">NOSE HILL</option>
                <option value="MIDNAPORE">MIDNAPORE</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Reset Default
            </button>

            <button
              onClick={handleEvaluate}
              disabled={evaluating}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-2.5 text-xs font-extrabold text-white shadow-lg shadow-blue-500/20 hover:opacity-95 disabled:opacity-50"
            >
              {evaluating ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" /> Evaluating…
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4" /> Calculate Risk Score
                </>
              )}
            </button>
          </div>
        </section>

        {/* Evaluation Output Section */}
        <section className="card p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">Anomaly Analysis Output</h3>

            {result ? (
              <div className="mt-5 space-y-5">
                {/* Risk Score Gauge Box */}
                <div
                  className={`rounded-2xl p-5 border ${
                    result.riskLevel === "Critical"
                      ? "border-rose-300 bg-rose-50 dark:border-rose-900/60 dark:bg-rose-950/40"
                      : result.riskLevel === "High"
                      ? "border-amber-300 bg-amber-50 dark:border-amber-900/60 dark:bg-amber-950/40"
                      : result.riskLevel === "Medium"
                      ? "border-yellow-300 bg-yellow-50 dark:border-yellow-900/60 dark:bg-yellow-950/40"
                      : "border-emerald-300 bg-emerald-50 dark:border-emerald-900/60 dark:bg-emerald-950/40"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                      Calculated Risk Index
                    </span>
                    <span
                      className={`inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-black ${
                        result.riskLevel === "Critical"
                          ? "bg-rose-600 text-white"
                          : result.riskLevel === "High"
                          ? "bg-amber-600 text-white"
                          : result.riskLevel === "Medium"
                          ? "bg-yellow-600 text-white"
                          : "bg-emerald-600 text-white"
                      }`}
                    >
                      {result.riskLevel} Tier
                    </span>
                  </div>

                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-4xl font-black text-slate-900 dark:text-white">
                      {result.riskScore}
                    </span>
                    <span className="text-sm font-bold text-slate-500">/ 100</span>
                  </div>

                  <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                    <div
                      className={`h-full transition-all duration-500 ${
                        result.riskLevel === "Critical"
                          ? "bg-rose-500"
                          : result.riskLevel === "High"
                          ? "bg-amber-500"
                          : result.riskLevel === "Medium"
                          ? "bg-yellow-500"
                          : "bg-emerald-500"
                      }`}
                      style={{ width: `${result.riskScore}%` }}
                    />
                  </div>
                </div>

                {/* Contributing Factors */}
                <div>
                  <h4 className="text-xs font-extrabold tracking-wider uppercase text-slate-500">
                    Main Contributing Factors
                  </h4>
                  <ul className="mt-2 space-y-2 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                    {result.contributingFactors.map((factor, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-blue-600 dark:text-cyan-300" />
                        <span>{factor}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Recommended Next Action */}
                <div className="rounded-xl border border-blue-200 bg-blue-50/80 p-4 dark:border-blue-900/60 dark:bg-blue-950/40">
                  <div className="flex items-center gap-2 text-xs font-extrabold text-blue-950 dark:text-cyan-300">
                    <CheckCircle2 className="h-4 w-4" /> Recommended Technician Protocol
                  </div>
                  <p className="mt-1 text-xs font-semibold leading-relaxed text-blue-900 dark:text-slate-200">
                    {result.recommendedAction}
                  </p>
                </div>
              </div>
            ) : (
              <div className="my-12 text-center text-slate-500 dark:text-slate-400">
                <Droplets className="mx-auto h-12 w-12 opacity-30" />
                <p className="mt-3 text-sm font-bold">No evaluation computed yet.</p>
                <p className="mt-1 text-xs">
                  Select a monitored asset above or fill in parameters, then click &quot;Calculate Risk Score&quot;.
                </p>
              </div>
            )}
          </div>

          {result && (
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4 dark:border-slate-700">
              <span className="text-[11px] font-mono text-slate-400">{result.confidence}</span>
              <button
                onClick={downloadReport}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700"
              >
                <Download className="h-3.5 w-3.5" /> Download Report (.txt)
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
