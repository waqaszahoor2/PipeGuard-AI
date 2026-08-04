"use client";

import { useEffect, useState } from "react";

export function TimeStatus({ latestSensorTimestamp }: { latestSensorTimestamp: string }) {
  const [current, setCurrent] = useState<Date | null>(null);
  useEffect(() => {
    setCurrent(new Date());
    const timer = setInterval(() => setCurrent(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  return (
    <div className="grid gap-3 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm dark:border-blue-900 dark:bg-blue-950/30 sm:grid-cols-3">
      <div><div className="label">Current browser time</div><div className="mt-1 font-bold">{current ? current.toLocaleString() : "Loading…"}</div></div>
      <div><div className="label">Time zone</div><div className="mt-1 font-bold">{current ? Intl.DateTimeFormat().resolvedOptions().timeZone : "Loading…"}</div></div>
      <div><div className="label">Latest sensor timestamp</div><div className="mt-1 font-bold">{new Date(latestSensorTimestamp).toLocaleString()}</div></div>
    </div>
  );
}
