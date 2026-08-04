"use client";

import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type PipeRecord = {
  pipe_id: string;
  pressure_zone: string;
  status: string;
  length_m: number;
  diameter_mm: number | null;
  material: string;
  installation_year: number;
  calculated_age_2026: number;
  latest_pressure: string;
  latest_flow: string;
  last_inspection: string;
  historical_breaks: string;
  current_alert: string;
  data_source: string;
};

export default function PipeInformationPage() {
  const [records, setRecords] = useState<PipeRecord[]>([]);
  const [query, setQuery] = useState("");
  const [material, setMaterial] = useState("");
  const [selected, setSelected] = useState<PipeRecord | null>(null);
  useEffect(() => {
    fetch("/calgary_pipe_sample.json").then((r) => r.json()).then((rows: PipeRecord[]) => { setRecords(rows); setSelected(rows[0] ?? null); });
  }, []);
  const materials = useMemo(() => [...new Set(records.map((row) => row.material))].sort(), [records]);
  const filtered = useMemo(() => records.filter((row) => {
    const haystack = `${row.pipe_id} ${row.pressure_zone} ${row.material}`.toLowerCase();
    return haystack.includes(query.toLowerCase()) && (!material || row.material === material);
  }), [records, query, material]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div><h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Pipe Information</h2><p className="mt-1 text-sm text-slate-500">Search public asset attributes without mixing Calgary and BattLeDIM records.</p></div>
        <span className="badge-demo">RESEARCH DATA</span>
      </div>
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm font-semibold dark:border-blue-900 dark:bg-blue-950/30">
        Pipe age is calculated from the recorded installation year. It is not predicted by AI.
      </div>

      <section className="card p-4">
        <div className="grid gap-3 md:grid-cols-[1fr_220px]">
          <label className="relative"><span className="sr-only">Search pipeline records</span><Search className="pointer-events-none absolute left-3 top-3 h-5 w-5 text-slate-400" /><input className="input pl-10" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Pipeline ID, zone or material" /></label>
          <select className="input" value={material} onChange={(e) => setMaterial(e.target.value)} aria-label="Filter by material"><option value="">All materials</option>{materials.map((value) => <option key={value}>{value}</option>)}</select>
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_.8fr]">
        <section className="card overflow-hidden">
          <div className="border-b border-slate-200 p-4 font-bold dark:border-slate-700">{filtered.length} sample records</div>
          <div className="max-h-[650px] overflow-auto">
            <table className="hidden w-full text-left text-sm md:table">
              <thead className="sticky top-0 bg-slate-100 dark:bg-slate-800"><tr><th className="p-3">Pipeline</th><th className="p-3">Zone</th><th className="p-3">Material</th><th className="p-3">Year</th><th className="p-3">Diameter</th></tr></thead>
              <tbody>{filtered.map((row) => <tr key={row.pipe_id} onClick={() => setSelected(row)} className="cursor-pointer border-t border-slate-200 hover:bg-blue-50 dark:border-slate-700 dark:hover:bg-blue-950/20"><td className="max-w-48 truncate p-3 font-semibold">{row.pipe_id}</td><td className="p-3">{row.pressure_zone}</td><td className="p-3">{row.material}</td><td className="p-3">{row.installation_year}</td><td className="p-3">{row.diameter_mm ?? "N/A"} mm</td></tr>)}</tbody>
            </table>
            <div className="divide-y divide-slate-200 dark:divide-slate-700 md:hidden">
              {filtered.map((row) => <button key={row.pipe_id} onClick={() => setSelected(row)} className="block min-h-24 w-full p-4 text-left hover:bg-blue-50 dark:hover:bg-blue-950/20"><div className="truncate font-bold">{row.pipe_id}</div><div className="mt-2 grid grid-cols-2 gap-2 text-xs text-slate-500"><span>{row.material}</span><span>{row.installation_year}</span><span>{row.pressure_zone}</span><span>{row.diameter_mm ?? "N/A"} mm</span></div></button>)}
            </div>
          </div>
        </section>

        <aside className="card p-5">
          <h3 className="text-xl font-extrabold">Pipeline Details</h3>
          {selected ? (
            <dl className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
              {[
                ["Pipeline ID", selected.pipe_id],
                ["Pressure zone", selected.pressure_zone],
                ["Installation year", selected.installation_year],
                ["Calculated age (2026)", `${selected.calculated_age_2026} years`],
                ["Material", selected.material],
                ["Diameter", selected.diameter_mm ? `${selected.diameter_mm} mm` : "Not available"],
                ["Length", `${selected.length_m} m`],
                ["Latest pressure", selected.latest_pressure],
                ["Latest flow", selected.latest_flow],
                ["Break history", selected.historical_breaks],
                ["Last inspection", selected.last_inspection],
                ["Current alert", selected.current_alert],
                ["Data source", selected.data_source]
              ].map(([label, value]) => <div key={String(label)}><dt className="label">{label}</dt><dd className="mt-1 break-words font-bold">{value}</dd></div>)}
            </dl>
          ) : <p className="mt-4 text-sm text-slate-500">No record selected.</p>}
        </aside>
      </div>
    </div>
  );
}
