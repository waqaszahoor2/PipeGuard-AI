import { AlertTriangle, CheckCircle2 } from "lucide-react";

export type Prediction = {
  status: "Normal" | "Possible Leak";
  leak_probability: number;
  severity: "Low" | "Medium" | "High" | "Critical";
  suspected_zone: string | null;
  abnormal_sensors: { sensor_id: string; sensor_type: string; status: string; deviation: number }[];
  main_reason: string;
  recommended_action: string;
  warning: string;
  data_mode: string;
  data_timestamp: string;
  prediction_timestamp: string;
  model_version: string;
};

export function ResultPanel({ result }: { result: Prediction }) {
  const leak = result.status === "Possible Leak";
  return (
    <article className={`card border-l-4 p-5 ${leak ? "border-l-red-500" : "border-l-emerald-500"}`} aria-live="polite">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className={`grid h-12 w-12 place-items-center rounded-full ${leak ? "bg-red-50 text-red-600 dark:bg-red-950/40" : "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40"}`}>
            {leak ? <AlertTriangle /> : <CheckCircle2 />}
          </span>
          <div>
            <div className={`text-2xl font-extrabold ${leak ? "text-red-600 dark:text-red-300" : "text-emerald-600 dark:text-emerald-300"}`}>{result.status}</div>
            <div className="mt-1 text-sm text-slate-500">Model version: {result.model_version}</div>
          </div>
        </div>
        <span className="badge-demo">{result.data_mode.toUpperCase()}</span>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/70"><div className="label">Leak probability</div><div className="mt-1 text-2xl font-extrabold">{Math.round(result.leak_probability * 100)}%</div></div>
        <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/70"><div className="label">Severity</div><div className="mt-1 text-2xl font-extrabold">{result.severity}</div></div>
        <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/70"><div className="label">Suspected zone</div><div className="mt-1 text-2xl font-extrabold">{result.suspected_zone ?? "Not localized"}</div></div>
      </div>

      <dl className="mt-5 space-y-4 text-sm">
        <div><dt className="font-bold">Reason</dt><dd className="mt-1 text-slate-600 dark:text-slate-300">{result.main_reason}</dd></div>
        <div><dt className="font-bold">Recommended action</dt><dd className="mt-1 text-slate-600 dark:text-slate-300">{result.recommended_action}</dd></div>
        <div><dt className="font-bold">Dataset timestamp</dt><dd className="mt-1 text-slate-600 dark:text-slate-300">{new Date(result.data_timestamp).toLocaleString()}</dd></div>
        <div><dt className="font-bold">Prediction generated</dt><dd className="mt-1 text-slate-600 dark:text-slate-300">{new Date(result.prediction_timestamp).toLocaleString()}</dd></div>
      </dl>

      {result.abnormal_sensors.length > 0 && (
        <div className="mt-5">
          <h4 className="font-bold">Abnormal sensors</h4>
          <div className="mt-2 flex flex-wrap gap-2">
            {result.abnormal_sensors.map((sensor) => (
              <span key={sensor.sensor_id} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold dark:border-slate-700">
                {sensor.sensor_id} · {sensor.sensor_type} · {sensor.status} ({sensor.deviation})
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="mt-5 rounded-xl border border-orange-200 bg-orange-50 p-4 text-sm font-semibold text-orange-950 dark:border-orange-900 dark:bg-orange-950/30 dark:text-orange-100">
        {result.warning}
      </div>
    </article>
  );
}
