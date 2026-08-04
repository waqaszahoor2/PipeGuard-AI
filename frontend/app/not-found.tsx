import Link from "next/link";
export default function NotFound() {
  return <div className="card mx-auto max-w-xl p-8 text-center"><h2 className="text-2xl font-extrabold">Page not found</h2><p className="mt-3 text-slate-500">The requested PipeGuard AI page does not exist.</p><Link className="mt-6 inline-flex rounded-xl bg-blue-600 px-5 py-3 font-bold text-white" href="/dashboard">Return to dashboard</Link></div>;
}
