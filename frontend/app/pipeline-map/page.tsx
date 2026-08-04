import { LeafletMap } from "@/components/LeafletMap";

export default function PipelineMapPage() {
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div><h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Pipeline Map</h2><p className="mt-1 text-sm text-slate-500">Simplified public Calgary research geometry. No live sensor mapping is claimed.</p></div>
        <span className="badge-demo">RESEARCH DATA</span>
      </div>
      <LeafletMap />
      <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm dark:border-slate-700 dark:bg-slate-900">
        <strong>Status legend:</strong> blue lines are public research asset geometry. Live Normal, Warning, Critical and No Recent Data states require a validated local sensor-to-asset mapping.
      </div>
    </div>
  );
}
