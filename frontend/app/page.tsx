import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  ClipboardList,
  Droplets,
  Gauge,
  Layers,
  MapPin,
  ShieldCheck,
  Zap
} from "lucide-react";
import { getPipeSummary } from "@/lib/pipesData";

export default function LandingPage() {
  const summary = getPipeSummary();

  return (
    <div className="space-y-12 py-4">
      {/* Hero Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-navy-950 via-slate-900 to-blue-950 p-6 text-white shadow-2xl sm:p-10 lg:p-14">
        <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />
        
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-500/10 px-4 py-1.5 text-xs font-extrabold text-cyan-300">
            <Zap className="h-3.5 w-3.5" /> RESEARCH PROTOTYPE & TELEMETRY SUITE
          </div>

          <h1 className="mt-6 text-3xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
            Pipeline Anomaly & Risk Detection Platform
          </h1>

          <p className="mt-5 text-base leading-relaxed text-slate-300 sm:text-lg">
            PipeGuard AI combines hydro-dynamic baseline telemetry, rule-based anomaly detection, and machine-learning evaluation to support municipal pipeline infrastructure research and technician inspection workflows.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-blue-500/30 transition hover:opacity-95 hover:shadow-cyan-500/40"
            >
              Open Live Dashboard <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/leak-detection"
              className="inline-flex items-center gap-2.5 rounded-xl border border-slate-700 bg-slate-800/80 px-6 py-3.5 text-sm font-bold text-slate-200 transition hover:bg-slate-800 hover:text-white"
            >
              <Droplets className="h-4 w-4 text-cyan-400" /> Run Anomaly Detection
            </Link>
          </div>
        </div>

        {/* Quick Stats Strip */}
        <div className="relative z-10 mt-12 grid grid-cols-2 gap-4 border-t border-slate-800/80 pt-8 sm:grid-cols-4">
          <div>
            <div className="text-2xl font-black text-white sm:text-3xl">{summary.total}</div>
            <div className="mt-1 text-xs font-semibold text-slate-400">Monitored Assets</div>
          </div>
          <div>
            <div className="text-2xl font-black text-emerald-400 sm:text-3xl">{summary.normal}</div>
            <div className="mt-1 text-xs font-semibold text-slate-400">Optimal Baseline</div>
          </div>
          <div>
            <div className="text-2xl font-black text-amber-400 sm:text-3xl">{summary.possibleAlerts}</div>
            <div className="mt-1 text-xs font-semibold text-slate-400">Risk Warnings</div>
          </div>
          <div>
            <div className="text-2xl font-black text-rose-400 sm:text-3xl">{summary.critical}</div>
            <div className="mt-1 text-xs font-semibold text-slate-400">Critical Priority</div>
          </div>
        </div>
      </section>

      {/* Responsible Use Disclaimer */}
      <section className="rounded-2xl border border-amber-200 bg-amber-50/90 p-5 dark:border-amber-900/60 dark:bg-amber-950/40">
        <div className="flex items-start gap-4">
          <AlertTriangle className="mt-0.5 h-6 w-6 shrink-0 text-amber-600 dark:text-amber-400" />
          <div className="text-sm leading-relaxed text-amber-950 dark:text-amber-200">
            <strong>Mandatory Research Disclaimer:</strong> PipeGuard AI is a research and educational prototype. It does not confirm physical pipeline leakage, structural damage, corrosion, or remaining asset life. Alerts require verification by qualified technicians using approved inspection methods.
          </div>
        </div>
      </section>

      {/* Feature Navigation Cards */}
      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Core Monitoring Modules
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Explore the pipeline monitoring suite and research evaluation tools.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/dashboard"
            className="group card p-6 transition duration-200 hover:-translate-y-1 hover:border-blue-500/50 hover:shadow-xl"
          >
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-cyan-300">
              <Gauge className="h-6 w-6" />
            </div>
            <h3 className="mt-5 text-lg font-black text-slate-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-cyan-300">
              Network Dashboard
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              Real-time telemetry aggregation, zone comparisons, pressure/flow trend analysis, and status distributions.
            </p>
            <div className="mt-4 flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-cyan-300">
              View Overview <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </Link>

          <Link
            href="/leak-detection"
            className="group card p-6 transition duration-200 hover:-translate-y-1 hover:border-blue-500/50 hover:shadow-xl"
          >
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-cyan-50 text-cyan-600 dark:bg-cyan-950/60 dark:text-cyan-300">
              <Droplets className="h-6 w-6" />
            </div>
            <h3 className="mt-5 text-lg font-black text-slate-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-cyan-300">
              Leak Anomaly Calculator
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              Evaluate pressure drops, flow variations, and asset attributes using our research feature calculator.
            </p>
            <div className="mt-4 flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-cyan-300">
              Run Anomaly Tool <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </Link>

          <Link
            href="/pipeline-map"
            className="group card p-6 transition duration-200 hover:-translate-y-1 hover:border-blue-500/50 hover:shadow-xl"
          >
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-300">
              <MapPin className="h-6 w-6" />
            </div>
            <h3 className="mt-5 text-lg font-black text-slate-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-cyan-300">
              Interactive Pipeline Map
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              Geospatial asset mapping with marker clustering, risk-level indicators, 2D fallback view, and tabular data options.
            </p>
            <div className="mt-4 flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-cyan-300">
              Explore Map <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </Link>

          <Link
            href="/pipe-information"
            className="group card p-6 transition duration-200 hover:-translate-y-1 hover:border-blue-500/50 hover:shadow-xl"
          >
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-300">
              <Layers className="h-6 w-6" />
            </div>
            <h3 className="mt-5 text-lg font-black text-slate-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-cyan-300">
              Pipe Asset Records
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              Searchable database of 50+ pipeline assets with installation dates, materials, diameters, and risk scores.
            </p>
            <div className="mt-4 flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-cyan-300">
              Search Assets <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </Link>

          <Link
            href="/inspection-records"
            className="group card p-6 transition duration-200 hover:-translate-y-1 hover:border-blue-500/50 hover:shadow-xl"
          >
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-300">
              <ClipboardList className="h-6 w-6" />
            </div>
            <h3 className="mt-5 text-lg font-black text-slate-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-cyan-300">
              Inspection Workflows
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              Technician observation entry, approval queues, field report generation, and status tracking.
            </p>
            <div className="mt-4 flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-cyan-300">
              View Workflows <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </Link>

          <Link
            href="/model-information"
            className="group card p-6 transition duration-200 hover:-translate-y-1 hover:border-blue-500/50 hover:shadow-xl"
          >
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-300">
              <BrainCircuit className="h-6 w-6" />
            </div>
            <h3 className="mt-5 text-lg font-black text-slate-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-cyan-300">
              Model Evaluation & Card
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              Transparent ML evaluation metrics, dataset split specifications, model status, and limitations.
            </p>
            <div className="mt-4 flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-cyan-300">
              View Model Card <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </Link>
        </div>
      </section>

      {/* System Highlights */}
      <section className="card p-8 sm:p-10">
        <h2 className="text-xl font-black text-slate-900 dark:text-white sm:text-2xl">
          Scientific Integrity & Methodology Highlights
        </h2>
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          <div className="flex gap-4">
            <ShieldCheck className="h-6 w-6 shrink-0 text-blue-600 dark:text-cyan-300" />
            <div>
              <h4 className="font-extrabold text-slate-900 dark:text-white">Event-Aware Splitting</h4>
              <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                Prevents data leakage by grouping continuous leakage events together rather than randomly splitting rows across time.
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <Activity className="h-6 w-6 shrink-0 text-blue-600 dark:text-cyan-300" />
            <div>
              <h4 className="font-extrabold text-slate-900 dark:text-white">Dual Validation Baseline</h4>
              <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                Compares rule-based hydraulic heuristics against Logistic Regression, Decision Trees, and Random Forests.
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <CheckCircle2 className="h-6 w-6 shrink-0 text-blue-600 dark:text-cyan-300" />
            <div>
              <h4 className="font-extrabold text-slate-900 dark:text-white">Technician-in-the-Loop</h4>
              <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                Maintains explicit separation between AI model outputs and technician-confirmed physical findings.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
