"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function ErrorPage({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("PipeGuard AI Error Boundary caught an error:", error);
  }, [error]);

  return (
    <div className="mx-auto my-12 max-w-xl text-center">
      <div className="card p-8 sm:p-10">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
          <AlertTriangle className="h-8 w-8" />
        </div>
        <span className="mt-4 inline-block text-xs font-extrabold tracking-wider text-rose-600 dark:text-rose-400">
          APPLICATION ERROR
        </span>
        <h2 className="mt-2 text-3xl font-black text-slate-900 dark:text-white">Something went wrong</h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
          An error occurred while rendering this page or fetching telemetry data.
        </p>
        {error?.message && (
          <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50/50 p-3 text-left font-mono text-xs text-rose-900 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-200">
            {error.message}
          </div>
        )}

        <button
          onClick={reset}
          className="mt-8 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-blue-500/20 hover:opacity-95"
        >
          <RefreshCw className="h-4 w-4" /> Try Again
        </button>
      </div>
    </div>
  );
}
