export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse p-6" role="status" aria-label="Loading page content">
      <div className="h-8 w-64 rounded-lg bg-slate-200 dark:bg-slate-800" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 rounded-2xl bg-slate-200 dark:bg-slate-800" />
        ))}
      </div>
      <div className="h-64 rounded-2xl bg-slate-200 dark:bg-slate-800" />
    </div>
  );
}
