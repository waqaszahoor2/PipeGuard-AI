import { AlertTriangle, CheckCircle2, Database, ShieldCheck } from "lucide-react";

export default function ModelInformationPage() {
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div><h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Model Information</h2><p className="mt-1 text-sm text-slate-500">Transparent artifact status, dataset boundaries and approval decision.</p></div>
        <span className="rounded-full bg-orange-100 px-4 py-2 text-xs font-extrabold text-orange-800 dark:bg-orange-950/50 dark:text-orange-200">NOT APPROVED</span>
      </div>

      <section className="card border-l-4 border-l-orange-500 p-5">
        <div className="flex items-start gap-4"><AlertTriangle className="h-8 w-8 shrink-0 text-orange-500" /><div><h3 className="text-xl font-extrabold">Model training has not been approved</h3><p className="mt-2 max-w-4xl text-sm leading-6 text-slate-600 dark:text-slate-300">Demonstration results are static research examples. Under the supplied any-active-leak target, approximately 97.8% of 2018 rows and 100% of 2019 rows are positive. The latest chronological test period therefore contains one class, so defensible classification metrics cannot be published.</p></div></div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          [Database, "Dataset modules", "BattLeDIM + Calgary"],
          [ShieldCheck, "Approval status", "False"],
          [CheckCircle2, "Feature count", "14 aggregate features"],
          [AlertTriangle, "Selected threshold", "Not selected"]
        ].map(([Icon, label, value]) => {
          const Component = Icon as typeof Database;
          return <article key={String(label)} className="card p-5"><Component className="h-7 w-7 text-blue-600 dark:text-cyan-300" /><div className="mt-4 label">{String(label)}</div><div className="mt-1 text-xl font-extrabold">{String(value)}</div></article>;
        })}
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="card p-5">
          <h3 className="text-xl font-extrabold">Metrics</h3>
          <div className="mt-4 divide-y divide-slate-200 dark:divide-slate-700">
            {["PR-AUC", "Leak-event recall", "Point precision", "False alarms per day", "Detection delay", "Brier score", "Zone localization"].map((metric) => <div key={metric} className="flex items-center justify-between py-3 text-sm"><span>{metric}</span><strong>Not calculated</strong></div>)}
          </div>
          <p className="mt-4 text-sm text-slate-500">A metric is not displayed unless it was actually calculated on a valid split.</p>
        </article>
        <article className="card p-5">
          <h3 className="text-xl font-extrabold">Artifact manifest</h3>
          <dl className="mt-4 space-y-4 text-sm">
            <div><dt className="label">Model version</dt><dd className="mt-1 font-bold">0.1.0-unapproved</dd></div>
            <div><dt className="label">Dataset version</dt><dd className="mt-1 font-bold">Research pack retrieved 2026-08-03</dd></div>
            <div><dt className="label">Feature schema hash</dt><dd className="mt-1 break-all font-mono text-xs">Stored in model_artifacts/artifact_manifest.json</dd></div>
            <div><dt className="label">Approved model hash</dt><dd className="mt-1 font-bold">Not available</dd></div>
            <div><dt className="label">Last approved date</dt><dd className="mt-1 font-bold">Not available</dd></div>
          </dl>
        </article>
      </section>

      <section className="card p-5">
        <h3 className="text-xl font-extrabold">Model limitations</h3>
        <ul className="mt-4 grid gap-3 text-sm leading-6 text-slate-600 dark:text-slate-300 md:grid-cols-2">
          <li>• BattLeDIM is a simulated benchmark network.</li>
          <li>• Calgary assets belong to a different public water system.</li>
          <li>• No physical sensors are connected.</li>
          <li>• Camera attachments are not automatically diagnosed.</li>
          <li>• A suspected zone is not an exact leak location.</li>
          <li>• Technician verification is mandatory.</li>
        </ul>
      </section>
    </div>
  );
}
