"use client";

import {
  AlertTriangle,
  BarChart2,
  BookOpen,
  BrainCircuit,
  CheckCircle2,
  Database,
  FileText,
  Layers,
  RefreshCw,
  ShieldAlert,
  Sparkles
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

export interface EvaluationArtifact {
  modelVersion: string;
  datasetVersion: string;
  datasetHash: string;
  sourceDataset: string;
  trainingDate: string;
  gitCommitSha: string;
  featureNames: string[];
  eventGroupingMethod: string;
  trainEventCount: number;
  validationEventCount: number;
  testEventCount: number;
  classCounts: Record<string, Record<string, number>>;
  threshold: number;
  metrics: {
    precision: number;
    recall: number;
    f1: number;
    prAuc: number;
    falseAlarmsPerDay: number;
    eventRecall: number;
    detectionDelayHours: number;
    confusionMatrix: number[][];
  };
  modelComparisons: {
    name: string;
    precision: number;
    recall: number;
    f1: number;
    pr_auc: number;
    false_alarms: number;
  }[];
  featureImportances: {
    feature: string;
    importance: number;
  }[];
  randomSeed: number;
  approvalStatus: string;
  limitations: string;
}

export default function ModelInformationPage() {
  const [data, setData] = useState<EvaluationArtifact | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchArtifact = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/model/evaluation-v1.2.json");
      if (!res.ok) {
        throw new Error("Artifact HTTP response not OK");
      }
      const json = await res.json();
      if (!json.modelVersion || !json.metrics) {
        throw new Error("Invalid artifact format");
      }
      setData(json);
    } catch (err) {
      console.warn("Failed to load evaluation artifact:", err);
      setError("Metrics unavailable — reproducible evaluation artifact was not found.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArtifact();
  }, []);

  return (
    <div className="space-y-8">
      {/* Prominent Model Status Banner */}
      <section className="rounded-2xl border border-rose-300 bg-rose-500/10 p-5 text-rose-950 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-200">
        <div className="flex items-start gap-4">
          <ShieldAlert className="mt-0.5 h-6 w-6 shrink-0 text-rose-600 dark:text-rose-400" />
          <div className="text-xs leading-relaxed font-semibold">
            <strong className="text-sm font-black block mb-1.5">MODEL STATUS: RESEARCH PROTOTYPE / NOT APPROVED FOR OPERATIONAL USE</strong>
            This machine learning pipeline is designed solely for research evaluation and benchmarking against municipal hydraulic datasets. It is NOT certified for autonomous emergency dispatch, valve shutoff, or unverified field decisions.
          </div>
        </div>
      </section>

      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Machine Learning Model Card & Evaluation
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Reproducible specifications, event-aware temporal splitting methodology, and baseline comparisons.
          </p>
        </div>
        <span className="badge-demo">MODEL CARD v1.2</span>
      </div>

      {loading ? (
        <div className="card p-12 text-center">
          <RefreshCw className="mx-auto h-8 w-8 animate-spin text-blue-600 dark:text-cyan-300" />
          <p className="mt-4 text-sm font-bold text-slate-600 dark:text-slate-400">Loading Reproducible Model Evaluation Artifact…</p>
        </div>
      ) : error || !data ? (
        <div className="rounded-2xl border border-rose-300 bg-rose-50 p-8 text-center text-rose-900 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200">
          <AlertTriangle className="mx-auto h-12 w-12 text-rose-600 dark:text-rose-400" />
          <h3 className="mt-4 text-lg font-bold">Metrics Unavailable</h3>
          <p className="mt-2 text-sm">{error || "Reproducible evaluation artifact was not found."}</p>
          <button
            onClick={fetchArtifact}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-500"
          >
            <RefreshCw className="h-4 w-4" /> Retry Loading Artifact
          </button>
        </div>
      ) : (
        <>
          {/* Model Overview Summary */}
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="card p-4">
              <div className="text-xs font-bold text-slate-500">Model Version</div>
              <div className="mt-1 text-lg font-black text-slate-900 dark:text-white">{data.modelVersion}</div>
              <div className="mt-1 text-[11px] text-blue-600 dark:text-cyan-300">Commit SHA: {data.gitCommitSha}</div>
            </div>
            <div className="card p-4">
              <div className="text-xs font-bold text-slate-500">Splitting Protocol</div>
              <div className="mt-1 text-lg font-black text-slate-900 dark:text-white">{data.eventGroupingMethod}</div>
              <div className="mt-1 text-[11px] text-emerald-600 dark:text-emerald-400">Events: {data.trainEventCount} train / {data.testEventCount} test</div>
            </div>
            <div className="card p-4">
              <div className="text-xs font-bold text-slate-500">PR-AUC Score</div>
              <div className="mt-1 text-lg font-black text-slate-900 dark:text-white">{data.metrics.prAuc}</div>
              <div className="mt-1 text-[11px] text-amber-600 dark:text-amber-400">Source: {data.sourceDataset}</div>
            </div>
            <div className="card p-4">
              <div className="text-xs font-bold text-slate-500">False Alarms Rate</div>
              <div className="mt-1 text-lg font-black text-slate-900 dark:text-white">{data.metrics.falseAlarmsPerDay} / day</div>
              <div className="mt-1 text-[11px] text-cyan-600 dark:text-cyan-300">Detection Delay: {data.metrics.detectionDelayHours} hrs</div>
            </div>
          </section>

          {/* Metadata Provenance Box */}
          <section className="card p-4 text-xs font-mono grid gap-2 sm:grid-cols-2 lg:grid-cols-4 bg-slate-50 dark:bg-slate-950/60">
            <div>
              <span className="text-slate-500">Dataset Hash:</span> <span className="font-bold text-blue-600 dark:text-cyan-300">{data.datasetHash.slice(0, 12)}...</span>
            </div>
            <div>
              <span className="text-slate-500">Dataset Version:</span> <span className="font-bold">{data.datasetVersion}</span>
            </div>
            <div>
              <span className="text-slate-500">Training Date:</span> <span className="font-bold">{new Date(data.trainingDate).toLocaleDateString()}</span>
            </div>
            <div>
              <span className="text-slate-500">Random Seed:</span> <span className="font-bold">{data.randomSeed}</span>
            </div>
          </section>

          {/* Visual Analytics Grid */}
          <section className="grid gap-6 lg:grid-cols-2">
            {/* Model Performance Comparison Bar Chart */}
            <article className="card p-5">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Model Performance Comparison (PR-AUC & F1)
              </h3>
              <p className="text-xs text-slate-500">Benchmarking rule-based heuristic against machine learning classifiers</p>

              <div className="mt-4 h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.modelComparisons} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis dataKey="name" tick={{ fontSize: 9 }} />
                    <YAxis domain={[0, 1]} tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#0f172a",
                        borderRadius: "8px",
                        color: "#fff",
                        fontSize: "12px"
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: "11px" }} />
                    <Bar dataKey="f1" name="F1 Score" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="pr_auc" name="PR-AUC" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </article>

            {/* Feature Importance Chart */}
            <article className="card p-5">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Feature Importance Weight Distribution
              </h3>
              <p className="text-xs text-slate-500">Relative contribution percentage to anomaly classification</p>

              <div className="mt-4 h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={data.featureImportances}
                    margin={{ top: 10, right: 20, left: 40, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis type="number" domain={[0, 50]} tick={{ fontSize: 11 }} />
                    <YAxis dataKey="feature" type="category" tick={{ fontSize: 10 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#0f172a",
                        borderRadius: "8px",
                        color: "#fff",
                        fontSize: "12px"
                      }}
                    />
                    <Bar dataKey="importance" name="Importance %" fill="#f59e0b" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </article>
          </section>

          {/* Dataset Splitting & Event Leakage Prevention */}
          <section className="card p-6 space-y-4">
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              Event-Aware Temporal Splitting Protocol
            </h3>
            <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
              Standard random k-fold cross-validation suffers severe data leakage when applied to continuous time-series telemetry, as adjacent timestamps from the same leakage event appear in both train and test folds. PipeGuard AI enforces <strong>Group-Aware Event Holdout</strong>:
            </p>

            <div className="grid gap-4 md:grid-cols-3 pt-2">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
                <div className="text-xs font-extrabold text-blue-600 dark:text-cyan-300">1. Event Grouping</div>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                  Contiguous active leak windows are assigned a unique event ID to guarantee they are never split across train/validation/test boundaries.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
                <div className="text-xs font-extrabold text-blue-600 dark:text-cyan-300">2. Buffer Gaps</div>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                  A 24-hour chronological gap buffer is maintained between training and evaluation windows to eliminate autocorrelation leakage.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
                <div className="text-xs font-extrabold text-blue-600 dark:text-cyan-300">3. Class Balance Check</div>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                  Holdout sets require at least two active classes. If a chronological split yields single-class evaluation, approval is blocked.
                </p>
              </div>
            </div>
          </section>

          {/* Model Benchmark Table */}
          <section className="card p-5">
            <h3 className="text-lg font-black text-slate-900 dark:text-white">Comprehensive Model Benchmark</h3>
            <p className="text-xs text-slate-500 mb-4">Evaluated on holdout event test split</p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 dark:bg-slate-800">
                  <tr>
                    <th className="p-3 font-extrabold">Model Architecture</th>
                    <th className="p-3 font-extrabold">Precision</th>
                    <th className="p-3 font-extrabold">Recall</th>
                    <th className="p-3 font-extrabold">F1 Score</th>
                    <th className="p-3 font-extrabold">PR-AUC</th>
                    <th className="p-3 font-extrabold">False Alarms/Day</th>
                    <th className="p-3 font-extrabold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700/60">
                  {data.modelComparisons.map((row) => (
                    <tr key={row.name} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="p-3 font-bold text-slate-900 dark:text-white">{row.name}</td>
                      <td className="p-3 font-mono">{row.precision.toFixed(2)}</td>
                      <td className="p-3 font-mono">{row.recall.toFixed(2)}</td>
                      <td className="p-3 font-mono font-bold text-blue-600 dark:text-cyan-300">{row.f1.toFixed(2)}</td>
                      <td className="p-3 font-mono font-bold text-cyan-600 dark:text-cyan-300">{row.pr_auc.toFixed(2)}</td>
                      <td className="p-3 font-mono">{row.false_alarms.toFixed(1)}</td>
                      <td className="p-3">
                        <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                          Research Benchmark
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Intended & Prohibited Use Card */}
          <section className="grid gap-6 md:grid-cols-2">
            <div className="card p-6 border-emerald-200 dark:border-emerald-900/60">
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-extrabold text-sm">
                <CheckCircle2 className="h-5 w-5" /> Intended & Permitted Uses
              </div>
              <ul className="mt-3 space-y-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                <li>• Hydraulic benchmark algorithm evaluation.</li>
                <li>• Decision support for prioritizing field inspection schedules.</li>
                <li>• Educational training for municipal telemetry analysis.</li>
                <li>• Historical replay visualization of pressure anomalies.</li>
              </ul>
            </div>

            <div className="card p-6 border-rose-200 dark:border-rose-900/60">
              <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400 font-extrabold text-sm">
                <ShieldAlert className="h-5 w-5" /> Explicitly Prohibited Uses
              </div>
              <ul className="mt-3 space-y-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                <li>• Autonomous closure of isolation valves without human review.</li>
                <li>• Automated emergency dispatch without technician verification.</li>
                <li>• Unverified structural condition or lifespan guarantees.</li>
                <li>• Safety-critical real-time control loops.</li>
              </ul>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
