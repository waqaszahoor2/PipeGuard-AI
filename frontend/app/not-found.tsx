import Link from "next/link";
import { AlertCircle, ArrowLeft, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="mx-auto my-12 max-w-xl text-center">
      <div className="card p-8 sm:p-10">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-cyan-300">
          <AlertCircle className="h-8 w-8" />
        </div>
        <span className="mt-4 inline-block text-xs font-extrabold tracking-wider text-blue-600 dark:text-cyan-300">
          404 ERROR
        </span>
        <h2 className="mt-2 text-3xl font-black text-slate-900 dark:text-white">Page Not Found</h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
          The requested PipeGuard AI route or asset record could not be located.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-3 text-sm font-extrabold text-white shadow-lg shadow-blue-500/20 hover:opacity-95"
          >
            <Home className="h-4 w-4" /> Go to Dashboard
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            <ArrowLeft className="h-4 w-4" /> Home
          </Link>
        </div>
      </div>
    </div>
  );
}
