"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return <div className="card mx-auto max-w-xl p-8 text-center"><h2 className="text-2xl font-extrabold">This page could not be loaded</h2><p className="mt-3 text-slate-500">Check the API connection and try again.</p><button onClick={reset} className="mt-6 rounded-xl bg-blue-600 px-5 py-3 font-bold text-white">Try again</button></div>;
}
