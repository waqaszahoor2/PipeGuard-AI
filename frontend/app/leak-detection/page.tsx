"use client";

import { AlertTriangle, FileSpreadsheet, FlaskConical, RadioTower, SlidersHorizontal, UploadCloud } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { apiFetch, ApiError } from "@/lib/api";
import { ResultPanel, type Prediction } from "@/components/ResultPanel";

type Feature = {
  name: string;
  group: string;
  unit: string;
  description: string;
  min: number;
  max: number;
  required: boolean;
};
type Schema = { schema_version: string; features: Feature[] };

const tabs = [
  { id: "demo", label: "Demo Mode", icon: FlaskConical },
  { id: "manual", label: "Manual Mode", icon: SlidersHorizontal },
  { id: "csv", label: "CSV Mode", icon: FileSpreadsheet },
  { id: "live", label: "Future Live Mode", icon: RadioTower }
] as const;

function getMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 503) return "An approved model is not available. Demo Mode remains available.";
    return error.message;
  }
  return "The API is unavailable. Start the FastAPI backend and check NEXT_PUBLIC_API_BASE_URL.";
}

export default function LeakDetectionPage() {
  const [active, setActive] = useState<(typeof tabs)[number]["id"]>("demo");
  const [schema, setSchema] = useState<Schema | null>(null);
  const [result, setResult] = useState<Prediction | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [manual, setManual] = useState<Record<string, number>>({});
  const [timestamp, setTimestamp] = useState("2019-01-01T00:00");
  const [file, setFile] = useState<File | null>(null);
  const [csvInfo, setCsvInfo] = useState<string | null>(null);

  useEffect(() => {
    fetch("/feature_schema.json")
      .then((r) => r.json())
      .then((payload: Schema) => {
        setSchema(payload);
        setManual(Object.fromEntries(payload.features.map((feature) => [feature.name, (feature.min + feature.max) / 2])));
      })
      .catch(() => setError("Feature schema could not be loaded."));
  }, []);

  const groups = useMemo(() => {
    const map = new Map<string, Feature[]>();
    schema?.features.forEach((feature) => map.set(feature.group, [...(map.get(feature.group) ?? []), feature]));
    return [...map.entries()];
  }, [schema]);

  async function runDemo(kind: "normal" | "leak") {
    setBusy(true); setError(null); setResult(null);
    try {
      setResult(await apiFetch<Prediction>(`/api/v1/predict/demo/${kind}`, { method: "POST" }));
    } catch (err) {
      setError(getMessage(err));
    } finally {
      setBusy(false);
    }
  }

  async function runManual(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true); setError(null); setResult(null);
    try {
      const payload = { timestamp: new Date(timestamp).toISOString(), ...manual };
      setResult(await apiFetch<Prediction>("/api/v1/predict/manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      }));
    } catch (err) {
      setError(getMessage(err));
    } finally {
      setBusy(false);
    }
  }

  async function validateCsv() {
    if (!file) return;
    setBusy(true); setError(null); setCsvInfo(null);
    const form = new FormData();
    form.append("file", file);
    try {
      const payload = await apiFetch<{ rows: number }>("/api/v1/predict/csv", { method: "POST", body: form });
      setCsvInfo(`${payload.rows} rows were validated and analysed.`);
    } catch (err) {
      setError(getMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Leak Detection</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Compare research demo fixtures, validate manual features or upload a schema-matched CSV.</p>
      </div>

      <div className="card overflow-x-auto p-2">
        <div className="flex min-w-max gap-2">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => { setActive(id); setError(null); setResult(null); }} className={`flex min-h-11 items-center gap-2 rounded-xl px-4 text-sm font-bold ${active === id ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"}`}>
              <Icon className="h-4 w-4" />{label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-950 dark:border-red-900 dark:bg-red-950/30 dark:text-red-100">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" /><span>{error}</span>
        </div>
      )}

      {active === "demo" && (
        <section className="grid gap-4 lg:grid-cols-2">
          <article className="card p-5">
            <span className="badge-demo">DEMO DATA</span>
            <h3 className="mt-4 text-xl font-extrabold">Research replay examples</h3>
            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">These static fixtures demonstrate the result interface. They are not live readings and are not approved production predictions.</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <button disabled={busy} onClick={() => runDemo("normal")} className="min-h-12 rounded-xl bg-emerald-600 px-4 font-bold text-white disabled:opacity-50">Try Normal Example</button>
              <button disabled={busy} onClick={() => runDemo("leak")} className="min-h-12 rounded-xl bg-red-600 px-4 font-bold text-white disabled:opacity-50">Try Leak Example</button>
            </div>
            <button disabled className="mt-3 min-h-12 w-full rounded-xl border border-slate-200 px-4 font-bold text-slate-400 dark:border-slate-700">Replay historical unseen sample — requires approved model</button>
          </article>
          <article className="card p-5">
            <h3 className="text-xl font-extrabold">What the result means</h3>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
              <li><strong>Normal:</strong> the research feature pattern does not cross the selected warning threshold.</li>
              <li><strong>Possible Leak:</strong> an early-warning pattern needs technician review.</li>
              <li><strong>Suspected zone:</strong> a research localization aid, not an exact leak coordinate.</li>
              <li><strong>Abnormal sensors:</strong> signals contributing to the warning.</li>
            </ul>
          </article>
        </section>
      )}

      {active === "manual" && (
        <form onSubmit={runManual} className="space-y-4">
          <div className="card p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div><h3 className="text-xl font-extrabold">Manual feature entry</h3><p className="mt-1 text-sm text-slate-500">Generated from feature_schema.json.</p></div>
              <span className="rounded-full bg-slate-100 px-3 py-2 text-xs font-bold dark:bg-slate-800">Schema {schema?.schema_version ?? "…"}</span>
            </div>
            <label className="mt-5 block">
              <span className="label">Dataset timestamp</span>
              <input className="input mt-1 max-w-sm" type="datetime-local" value={timestamp} onChange={(e) => setTimestamp(e.target.value)} required />
            </label>
          </div>
          {groups.map(([group, features]) => (
            <fieldset key={group} className="card p-5">
              <legend className="px-2 text-lg font-extrabold">{group}</legend>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {features.map((feature) => (
                  <label key={feature.name} className="block">
                    <span className="label">{feature.name} ({feature.unit})</span>
                    <input
                      className="input mt-1"
                      type="number"
                      step="any"
                      min={feature.min}
                      max={feature.max}
                      value={manual[feature.name] ?? ""}
                      onChange={(e) => setManual((current) => ({ ...current, [feature.name]: Number(e.target.value) }))}
                      required
                    />
                    <span className="mt-1 block text-xs leading-5 text-slate-500">{feature.description}. Expected {feature.min} to {feature.max}.</span>
                  </label>
                ))}
              </div>
            </fieldset>
          ))}
          <button disabled={busy || !schema} className="min-h-12 w-full rounded-xl bg-gradient-to-r from-blue-700 to-blue-500 px-5 font-extrabold text-white disabled:opacity-50">
            {busy ? "Analysing…" : "Analyse Manual Reading"}
          </button>
        </form>
      )}

      {active === "csv" && (
        <section className="grid gap-4 lg:grid-cols-[1.1fr_.9fr]">
          <article className="card p-5">
            <h3 className="text-xl font-extrabold">Upload sensor feature CSV</h3>
            <p className="mt-2 text-sm text-slate-500">Maximum 4 MB, maximum 5,000 rows, exact columns and order, valid finite numeric values and unique timestamps.</p>
            <label className="mt-6 grid min-h-52 cursor-pointer place-items-center rounded-2xl border-2 border-dashed border-blue-300 bg-blue-50/60 p-6 text-center dark:border-blue-800 dark:bg-blue-950/20">
              <div><UploadCloud className="mx-auto h-12 w-12 text-blue-600 dark:text-cyan-300" /><div className="mt-3 font-extrabold">{file ? file.name : "Choose a CSV file"}</div><div className="mt-1 text-sm text-slate-500">Drag-and-drop support uses the browser file picker.</div></div>
              <input className="sr-only" type="file" accept=".csv,text/csv" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
            </label>
            <button onClick={validateCsv} disabled={!file || busy} className="mt-4 min-h-12 w-full rounded-xl bg-blue-600 px-5 font-extrabold text-white disabled:opacity-50">{busy ? "Validating…" : "Validate and Analyse"}</button>
            {csvInfo && <div className="mt-4 rounded-xl bg-emerald-50 p-4 text-sm font-semibold text-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-100">{csvInfo}</div>}
          </article>
          <article className="card p-5">
            <h3 className="text-xl font-extrabold">CSV requirements</h3>
            <a href="/pipeguard_template.csv" download className="mt-4 inline-flex min-h-11 items-center rounded-xl border border-blue-300 px-4 font-bold text-blue-700 hover:bg-blue-50 dark:border-blue-800 dark:text-cyan-300">Download CSV Template</a>
            <div className="mt-5 max-h-80 overflow-auto rounded-xl border border-slate-200 dark:border-slate-700">
              <table className="w-full text-left text-xs">
                <thead className="sticky top-0 bg-slate-100 dark:bg-slate-800"><tr><th className="p-3">Column</th><th className="p-3">Unit</th></tr></thead>
                <tbody>{schema?.features.map((feature) => <tr key={feature.name} className="border-t border-slate-200 dark:border-slate-700"><td className="p-3 font-semibold">{feature.name}</td><td className="p-3">{feature.unit}</td></tr>)}</tbody>
              </table>
            </div>
          </article>
        </section>
      )}

      {active === "live" && (
        <section className="card p-5 sm:p-8">
          <span className="rounded-full bg-slate-200 px-3 py-2 text-xs font-extrabold text-slate-700 dark:bg-slate-700 dark:text-slate-100">DISABLED PREVIEW</span>
          <h3 className="mt-5 text-2xl font-extrabold">Future Live Sensor Architecture</h3>
          <div className="mt-8 grid gap-3 md:grid-cols-5">
            {["Physical sensors", "Secure gateway", "Sensor API", "Validation", "PipeGuard AI"].map((item, index) => (
              <div key={item} className="relative rounded-xl border border-slate-200 bg-slate-50 p-4 text-center font-bold dark:border-slate-700 dark:bg-slate-800">
                {item}{index < 4 && <span className="absolute -right-3 top-1/2 hidden -translate-y-1/2 text-blue-500 md:block">→</span>}
              </div>
            ))}
          </div>
          <div className="mt-8 rounded-xl border border-orange-200 bg-orange-50 p-4 font-semibold text-orange-950 dark:border-orange-900 dark:bg-orange-950/30 dark:text-orange-100">No physical sensors are currently connected.</div>
        </section>
      )}

      {result && <ResultPanel result={result} />}
    </div>
  );
}
