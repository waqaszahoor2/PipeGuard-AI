"use client";

import {
  AlertCircle,
  Eye,
  Filter,
  Layers,
  MapPin,
  RefreshCw,
  Table as TableIcon,
  X
} from "lucide-react";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { SAMPLE_PIPELINES, type PipelineAsset } from "@/lib/pipesData";

// Dynamically import Leaflet client component with SSR disabled
const PipelineMapClient = dynamic(() => import("@/components/PipelineMapClient"), {
  ssr: false,
  loading: () => (
    <div className="grid h-[480px] w-full place-items-center rounded-2xl bg-slate-100 dark:bg-slate-800">
      <div className="flex flex-col items-center gap-3">
        <RefreshCw className="h-7 w-7 animate-spin text-blue-600 dark:text-cyan-300" />
        <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
          Loading Interactive Geospatial Engine…
        </p>
      </div>
    </div>
  )
});

export default function PipelineMapPage() {
  const [pipes, setPipes] = useState<PipelineAsset[]>([]);
  const [selectedPipe, setSelectedPipe] = useState<PipelineAsset | null>(null);
  const [viewMode, setViewMode] = useState<"map" | "table">("map");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [zoneFilter, setZoneFilter] = useState("");
  const [riskFilter, setRiskFilter] = useState("");
  const [materialFilter, setMaterialFilter] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setPipes(SAMPLE_PIPELINES);
      setSelectedPipe(SAMPLE_PIPELINES[0] ?? null);
      setLoading(false);
    }, 200);

    return () => clearTimeout(timer);
  }, []);

  const zones = useMemo(() => Array.from(new Set(pipes.map((p) => p.zone))).sort(), [pipes]);
  const materials = useMemo(() => Array.from(new Set(pipes.map((p) => p.material))).sort(), [pipes]);
  const riskLevels = ["Low", "Medium", "High", "Critical"];

  const filteredPipes = useMemo(() => {
    return pipes.filter((p) => {
      const mZone = !zoneFilter || p.zone === zoneFilter;
      const mRisk = !riskFilter || p.risk_level === riskFilter;
      const mMat = !materialFilter || p.material === materialFilter;
      return mZone && mRisk && mMat;
    });
  }, [pipes, zoneFilter, riskFilter, materialFilter]);

  const handleResetFilters = () => {
    setZoneFilter("");
    setRiskFilter("");
    setMaterialFilter("");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Geospatial Pipeline Risk Map
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Interactive spatial layout of water distribution mains, pressure zones, and risk classifications.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="inline-flex rounded-xl border border-slate-200 bg-slate-100 p-1 dark:border-slate-700 dark:bg-slate-800">
            <button
              onClick={() => setViewMode("map")}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-extrabold transition ${
                viewMode === "map"
                  ? "bg-white text-blue-600 shadow dark:bg-slate-700 dark:text-cyan-300"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              <MapPin className="h-3.5 w-3.5" /> Interactive Map
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-extrabold transition ${
                viewMode === "table"
                  ? "bg-white text-blue-600 shadow dark:bg-slate-700 dark:text-cyan-300"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              <TableIcon className="h-3.5 w-3.5" /> 2D Table View
            </button>
          </div>
          <span className="badge-demo">GEOSPATIAL REPLAY</span>
        </div>
      </div>

      {/* Filter Bar */}
      <section className="card p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-extrabold text-slate-700 dark:text-slate-300">
            <Filter className="h-4 w-4 text-blue-600 dark:text-cyan-300" /> Filter Map Assets:
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              className="input py-1.5 text-xs"
              value={zoneFilter}
              onChange={(e) => setZoneFilter(e.target.value)}
              aria-label="Filter map by zone"
            >
              <option value="">All Zones ({zones.length})</option>
              {zones.map((z) => (
                <option key={z} value={z}>
                  {z}
                </option>
              ))}
            </select>

            <select
              className="input py-1.5 text-xs"
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              aria-label="Filter map by risk level"
            >
              <option value="">All Risk Levels</option>
              {riskLevels.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>

            <select
              className="input py-1.5 text-xs"
              value={materialFilter}
              onChange={(e) => setMaterialFilter(e.target.value)}
              aria-label="Filter map by material"
            >
              <option value="">All Materials</option>
              {materials.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>

            {(zoneFilter || riskFilter || materialFilter) && (
              <button
                onClick={handleResetFilters}
                className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline dark:text-cyan-300"
              >
                <X className="h-3.5 w-3.5" /> Reset
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Main Container */}
      <div className="grid gap-6 xl:grid-cols-[1.4fr_.6fr]">
        {/* Map / Table Primary View */}
        <section className="card p-4 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
              Displaying {filteredPipes.length} Assets on Map
            </span>

            {/* Map Legend */}
            <div className="flex items-center gap-3 text-[11px] font-bold">
              <span className="flex items-center gap-1">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Low
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500" /> Med
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2.5 w-2.5 rounded-full bg-orange-500" /> High
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-500" /> Critical
              </span>
            </div>
          </div>

          {viewMode === "map" ? (
            <div className="h-[480px] w-full">
              <PipelineMapClient
                pipes={filteredPipes}
                selectedPipe={selectedPipe}
                onSelectPipe={(pipe) => setSelectedPipe(pipe)}
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 dark:bg-slate-800">
                  <tr>
                    <th className="p-3 font-extrabold">Pipe ID</th>
                    <th className="p-3 font-extrabold">Location</th>
                    <th className="p-3 font-extrabold">Zone</th>
                    <th className="p-3 font-extrabold">Risk</th>
                    <th className="p-3 font-extrabold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700/60">
                  {filteredPipes.map((p) => (
                    <tr
                      key={p.pipe_id}
                      onClick={() => setSelectedPipe(p)}
                      className={`cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-950/30 ${
                        selectedPipe?.pipe_id === p.pipe_id ? "bg-blue-50 font-bold dark:bg-blue-950/50" : ""
                      }`}
                    >
                      <td className="p-3 font-mono font-bold text-blue-600 dark:text-cyan-300">{p.pipe_id}</td>
                      <td className="p-3">{p.location}</td>
                      <td className="p-3">{p.zone}</td>
                      <td className="p-3">
                        <span
                          className={`inline-flex rounded-md px-2 py-0.5 text-[10px] font-black ${
                            p.risk_level === "Critical"
                              ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200"
                              : p.risk_level === "High"
                              ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200"
                              : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200"
                          }`}
                        >
                          {p.risk_level} ({p.risk_score})
                        </span>
                      </td>
                      <td className="p-3">
                        <button
                          onClick={() => setSelectedPipe(p)}
                          className="text-xs font-bold text-blue-600 hover:underline dark:text-cyan-300"
                        >
                          Inspect
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Selected Asset Details Inspector */}
        <aside className="card p-5">
          <h3 className="text-lg font-black text-slate-900 dark:text-white">Spatial Asset Inspector</h3>
          {selectedPipe ? (
            <div className="mt-4 space-y-4">
              <div className="rounded-xl bg-slate-100 p-4 dark:bg-slate-800">
                <div className="font-mono text-sm font-black text-blue-600 dark:text-cyan-300">
                  {selectedPipe.pipe_id}
                </div>
                <div className="mt-1 text-xs font-semibold text-slate-600 dark:text-slate-300">
                  {selectedPipe.location}
                </div>
              </div>

              <dl className="grid gap-2.5 text-xs sm:grid-cols-2">
                <div className="rounded-lg border border-slate-200 p-2.5 dark:border-slate-700">
                  <dt className="text-slate-500">Zone</dt>
                  <dd className="mt-0.5 font-bold">{selectedPipe.zone}</dd>
                </div>
                <div className="rounded-lg border border-slate-200 p-2.5 dark:border-slate-700">
                  <dt className="text-slate-500">Coordinates</dt>
                  <dd className="mt-0.5 font-mono font-bold">
                    {selectedPipe.latitude.toFixed(4)}, {selectedPipe.longitude.toFixed(4)}
                  </dd>
                </div>
                <div className="rounded-lg border border-slate-200 p-2.5 dark:border-slate-700">
                  <dt className="text-slate-500">Material & Size</dt>
                  <dd className="mt-0.5 font-bold">
                    {selectedPipe.material} ({selectedPipe.diameter_mm} mm)
                  </dd>
                </div>
                <div className="rounded-lg border border-slate-200 p-2.5 dark:border-slate-700">
                  <dt className="text-slate-500">Pressure</dt>
                  <dd className="mt-0.5 font-mono font-bold text-blue-600 dark:text-cyan-300">
                    {selectedPipe.pressure_bar} bar
                  </dd>
                </div>
                <div className="rounded-lg border border-slate-200 p-2.5 dark:border-slate-700">
                  <dt className="text-slate-500">Flow Rate</dt>
                  <dd className="mt-0.5 font-mono font-bold text-cyan-600 dark:text-cyan-300">
                    {selectedPipe.flow_rate_lps} L/s
                  </dd>
                </div>
                <div className="rounded-lg border border-slate-200 p-2.5 dark:border-slate-700">
                  <dt className="text-slate-500">Operational Status</dt>
                  <dd className="mt-0.5 font-bold">{selectedPipe.operational_status}</dd>
                </div>
              </dl>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-500">Risk Assessment Score</span>
                  <span className="font-black text-slate-900 dark:text-white">
                    {selectedPipe.risk_score} / 100 ({selectedPipe.risk_level})
                  </span>
                </div>
                <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                  <div
                    className={`h-full rounded-full ${
                      selectedPipe.risk_level === "Critical"
                        ? "bg-rose-500"
                        : selectedPipe.risk_level === "High"
                        ? "bg-amber-500"
                        : "bg-emerald-500"
                    }`}
                    style={{ width: `${selectedPipe.risk_score}%` }}
                  />
                </div>
              </div>

              <a
                href={`/pipe-information?search=${selectedPipe.pipe_id}`}
                className="mt-2 block w-full rounded-xl bg-slate-900 py-2.5 text-center text-xs font-extrabold text-white hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700"
              >
                Open Full Asset Directory Profile →
              </a>
            </div>
          ) : (
            <p className="mt-4 text-xs text-slate-500">
              Click any map marker or table row to inspect pipeline coordinates and risk attributes.
            </p>
          )}
        </aside>
      </div>
    </div>
  );
}
