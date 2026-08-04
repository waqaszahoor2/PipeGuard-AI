export default function Loading() {
  return (
    <div className="grid min-h-[50vh] place-items-center" role="status" aria-live="polite">
      <div className="flex flex-col items-center gap-4">
        <div className="relative h-12 w-12">
          <div className="absolute inset-0 rounded-full border-4 border-blue-200 dark:border-blue-900" />
          <div className="absolute inset-0 animate-spin rounded-full border-4 border-blue-600 border-t-transparent dark:border-cyan-400 dark:border-t-transparent" />
        </div>
        <div className="text-sm font-extrabold tracking-wide text-slate-600 dark:text-slate-300">
          Loading PipeGuard AI Telemetry…
        </div>
      </div>
    </div>
  );
}
