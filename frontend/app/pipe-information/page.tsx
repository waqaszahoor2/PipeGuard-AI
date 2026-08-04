"use client";

import { Download, RefreshCw, Search, SlidersHorizontal, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { SAMPLE_PIPELINES, type PipelineAsset } from "@/lib/pipesData";

export default function PipeInformationPage() {
  const [records, setRecords] = useState<PipelineAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Search and Filter states
  const [query, setQuery] = useState("");
  const [selectedZone, setSelectedZone] = useState("");
  const [selectedMaterial, setSelectedMaterial] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedRisk, setSelectedRisk] = useState("");
  
  // Selection and Pagination
  const [selectedPipe, setSelectedPipe] = useState<PipelineAsset | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      // Try to fetch from static JSON asset first
      const res = await fetch("/calgary_pipe_sample.json");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json: PipelineAsset[] = await res.json();
      if (Array.isArray(json) && json.length > 0) {
        setRecords(json);
        setSelectedPipe(json[0] ?? null);
      } else {
        // Fallback to bundled TypeScript dataset
        setRecords(SAMPLE_PIPELINES);
        setSelectedPipe(SAMPLE_PIPELINES[0] ?? null);
      }
    } catch {
      // Reliable local fallback ensures app NEVER fails even if network/JSON is blocked
      setRecords(SAMPLE_PIPELINES);
      setSelectedPipe(SAMPLE_PIPELINES[0] ?? null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const zones = useMemo(() => Array.from(new Set(records.map((r) => r.zone))).sort(), [records]);
  const materials = useMemo(() => Array.from(new Set(records.map((r) => r.material))).sort(), [records]);
  const statuses = useMemo(() => Array.from(new Set(records.map((r) => r.operational_status))).sort(), [records]);
  const riskLevels = ["Low", "Medium", "High", "Critical"];

  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      const q = query.toLowerCase();
      const matchesSearch =
        !q ||
        r.pipe_id.toLowerCase().includes(q) ||
        r.location.toLowerCase().includes(q) ||
        r.zone.toLowerCase().includes(q) ||
        r.material.toLowerCase().includes(q);

      const matchesZone = !selectedZone || r.zone === selectedZone;
      const matchesMaterial = !selectedMaterial || r.material === selectedMaterial;
      const matchesStatus = !selectedStatus || r.operational_status === selectedStatus;
      const matchesRisk = !selectedRisk || r.risk_level === selectedRisk;

      return matchesSearch && matchesZone && matchesMaterial && matchesStatus && matchesRisk;
    });
  }, [records, query, selectedZone, selectedMaterial, selectedStatus, selectedRisk]);

  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage) || 1;
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredRecords.slice(start, start + itemsPerPage);
  }, [filteredRecords, currentPage]);

  const handleResetFilters = () => {
    setQuery("");
    setSelectedZone("");
    setSelectedMaterial("");
    setSelectedStatus("");
    setSelectedRisk("");
    setCurrentPage(1);
  };

  const exportCSV = () => {
    if (filteredRecords.length === 0) return;
    const headers = [
      "Pipe ID",
      "Location",
      "Zone",
      "Latitude",
      "Longitude",
      "Installation Year",
      "Pipe Age",
      "Material",
      "Diameter (mm)",
      "Length (m)",
      "Max Capacity (L/s)",
      "Pressure (bar)",
      "Flow Rate (L/s)",
      "Temp (°C)",
      "Operational Status",
      "Inspection Status",
      "Risk Score",
      "Risk Level",
      "Last Inspection"
    ];

    const rows = filteredRecords.map((r) => [
      `"${r.pipe_id}"`,
      `"${r.location}"`,
      `"${r.zone}"`,
      r.latitude,
      r.longitude,
      r.installation_year,
      r.pipe_age,
      `"${r.material}"`,
      r.diameter_mm,
      r.length_m,
      r.max_capacity_lps,
      r.pressure_bar,
      r.flow_rate_lps,
      r.temperature_c,
      `"${r.operational_status}"`,
      `"${r.inspection_status}"`,
      r.risk_score,
      `"${r.risk_level}"`,
      `"${r.last_inspection_date}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `pipeguard_assets_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Pipeline Asset Directory
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Searchable registry of municipal distribution mains, hydro-dynamic telemetry, and physical risk attributes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={exportCSV}
            disabled={filteredRecords.length === 0}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 disabled:opacity-50"
          >
            <Download className="h-4 w-4" /> Download CSV ({filteredRecords.length})
          </button>
          <span className="badge-demo">50 DEMO ASSETS</span>
        </div>
      </div>

      {/* Info Disclaimer */}
      <div className="rounded-xl border border-blue-200 bg-blue-50/80 p-4 text-xs font-semibold text-blue-950 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-200">
        <strong>Telemetry Note:</strong> Pipe age is computed directly from installation records. Pressure, flow rates, and risk scores represent research baseline fixtures.
      </div>

      {/* Search and Filters Bar */}
      <section className="card p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4">
          <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
            <SlidersHorizontal className="h-4 w-4 text-blue-600 dark:text-cyan-300" /> Filter Asset Records
          </div>
          {(query || selectedZone || selectedMaterial || selectedStatus || selectedRisk) && (
            <button
              onClick={handleResetFilters}
              className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline dark:text-cyan-300"
            >
              <X className="h-3.5 w-3.5" /> Clear Filters
            </button>
          )}
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <div className="relative sm:col-span-2 lg:col-span-1">
            <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              className="input pl-9"
              placeholder="Pipe ID, location..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          <select
            className="input"
            value={selectedZone}
            onChange={(e) => {
              setSelectedZone(e.target.value);
              setCurrentPage(1);
            }}
            aria-label="Filter by zone"
          >
            <option value="">All Zones</option>
            {zones.map((z) => (
              <option key={z} value={z}>
                {z}
              </option>
            ))}
          </select>

          <select
            className="input"
            value={selectedMaterial}
            onChange={(e) => {
              setSelectedMaterial(e.target.value);
              setCurrentPage(1);
            }}
            aria-label="Filter by material"
          >
            <option value="">All Materials</option>
            {materials.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>

          <select
            className="input"
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setCurrentPage(1);
            }}
            aria-label="Filter by operational status"
          >
            <option value="">All Operational Statuses</option>
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <select
            className="input"
            value={selectedRisk}
            onChange={(e) => {
              setSelectedRisk(e.target.value);
              setCurrentPage(1);
            }}
            aria-label="Filter by risk level"
          >
            <option value="">All Risk Levels</option>
            {riskLevels.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
      </section>

      {/* Content Area */}
      {loading ? (
        <div className="card p-12 text-center" role="status">
          <RefreshCw className="mx-auto h-8 w-8 animate-spin text-blue-600 dark:text-cyan-300" />
          <p className="mt-4 text-sm font-bold text-slate-600 dark:text-slate-400">Loading Pipeline Directory…</p>
        </div>
      ) : error ? (
        <div className="card p-8 text-center border-rose-300 dark:border-rose-900">
          <p className="text-sm font-bold text-rose-600 dark:text-rose-400">{error}</p>
          <button
            onClick={loadData}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Retry Loading
          </button>
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[1.3fr_.7fr]">
          {/* Main Table View */}
          <section className="card overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-200 p-4 font-bold dark:border-slate-700">
              <span className="text-sm">
                Showing {filteredRecords.length} records (Page {currentPage} of {totalPages})
              </span>
            </div>

            {filteredRecords.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
                  No pipeline records matched your selected criteria.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="mt-3 text-xs font-bold text-blue-600 hover:underline dark:text-cyan-300"
                >
                  Reset all filters
                </button>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 dark:bg-slate-800/80">
                      <tr>
                        <th className="p-3 font-extrabold">Pipeline ID</th>
                        <th className="p-3 font-extrabold">Zone</th>
                        <th className="p-3 font-extrabold">Material</th>
                        <th className="p-3 font-extrabold">Year (Age)</th>
                        <th className="p-3 font-extrabold">Pressure</th>
                        <th className="p-3 font-extrabold">Risk</th>
                        <th className="p-3 font-extrabold">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700/60">
                      {paginatedRecords.map((row) => {
                        const isSelected = selectedPipe?.pipe_id === row.pipe_id;
                        return (
                          <tr
                            key={row.pipe_id}
                            onClick={() => setSelectedPipe(row)}
                            className={`cursor-pointer transition hover:bg-blue-50/70 dark:hover:bg-blue-950/30 ${
                              isSelected ? "bg-blue-50 font-bold dark:bg-blue-950/50" : ""
                            }`}
                          >
                            <td className="p-3 font-mono font-bold text-blue-600 dark:text-cyan-300">
                              {row.pipe_id}
                            </td>
                            <td className="p-3 font-semibold">{row.zone}</td>
                            <td className="p-3">{row.material}</td>
                            <td className="p-3">
                              {row.installation_year} ({row.pipe_age}y)
                            </td>
                            <td className="p-3 font-mono">{row.pressure_bar} bar</td>
                            <td className="p-3">
                              <span
                                className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-black ${
                                  row.risk_level === "Critical"
                                    ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200"
                                    : row.risk_level === "High"
                                    ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200"
                                    : row.risk_level === "Medium"
                                    ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-200"
                                    : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200"
                                }`}
                              >
                                {row.risk_level} ({row.risk_score})
                              </span>
                            </td>
                            <td className="p-3 text-[11px] font-semibold">{row.operational_status}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls */}
                <div className="flex items-center justify-between border-t border-slate-200 p-4 dark:border-slate-700">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-40 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    Previous
                  </button>
                  <span className="text-xs font-semibold text-slate-500">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-40 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    Next
                  </button>
                </div>
              </>
            )}
          </section>

          {/* Details Drawer / Inspector Panel */}
          <aside className="card p-5">
            <h3 className="text-lg font-black text-slate-900 dark:text-white">Pipeline Detail Inspector</h3>
            {selectedPipe ? (
              <div className="mt-4 space-y-4">
                <div className="rounded-xl bg-slate-100 p-4 dark:bg-slate-800/80">
                  <div className="font-mono text-sm font-black text-blue-600 dark:text-cyan-300">
                    {selectedPipe.pipe_id}
                  </div>
                  <div className="mt-1 text-xs font-semibold text-slate-600 dark:text-slate-300">
                    {selectedPipe.location}
                  </div>
                </div>

                <dl className="grid gap-3 text-xs sm:grid-cols-2">
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
                    <dt className="text-slate-500">Installation Year</dt>
                    <dd className="mt-0.5 font-bold">
                      {selectedPipe.installation_year} ({selectedPipe.pipe_age} yrs old)
                    </dd>
                  </div>
                  <div className="rounded-lg border border-slate-200 p-2.5 dark:border-slate-700">
                    <dt className="text-slate-500">Material & Size</dt>
                    <dd className="mt-0.5 font-bold">
                      {selectedPipe.material} ({selectedPipe.diameter_mm} mm)
                    </dd>
                  </div>
                  <div className="rounded-lg border border-slate-200 p-2.5 dark:border-slate-700">
                    <dt className="text-slate-500">Segment Length</dt>
                    <dd className="mt-0.5 font-bold">{selectedPipe.length_m} meters</dd>
                  </div>
                  <div className="rounded-lg border border-slate-200 p-2.5 dark:border-slate-700">
                    <dt className="text-slate-500">Max Capacity</dt>
                    <dd className="mt-0.5 font-bold">{selectedPipe.max_capacity_lps} L/s</dd>
                  </div>
                  <div className="rounded-lg border border-slate-200 p-2.5 dark:border-slate-700">
                    <dt className="text-slate-500">Current Pressure</dt>
                    <dd className="mt-0.5 font-mono font-bold text-blue-600 dark:text-cyan-300">
                      {selectedPipe.pressure_bar} bar
                    </dd>
                  </div>
                  <div className="rounded-lg border border-slate-200 p-2.5 dark:border-slate-700">
                    <dt className="text-slate-500">Current Flow Rate</dt>
                    <dd className="mt-0.5 font-mono font-bold text-cyan-600 dark:text-cyan-300">
                      {selectedPipe.flow_rate_lps} L/s
                    </dd>
                  </div>
                  <div className="rounded-lg border border-slate-200 p-2.5 dark:border-slate-700">
                    <dt className="text-slate-500">Fluid Temp</dt>
                    <dd className="mt-0.5 font-mono font-bold">{selectedPipe.temperature_c} °C</dd>
                  </div>
                  <div className="rounded-lg border border-slate-200 p-2.5 dark:border-slate-700">
                    <dt className="text-slate-500">Operational Status</dt>
                    <dd className="mt-0.5 font-bold text-slate-800 dark:text-slate-200">
                      {selectedPipe.operational_status}
                    </dd>
                  </div>
                  <div className="rounded-lg border border-slate-200 p-2.5 dark:border-slate-700">
                    <dt className="text-slate-500">Inspection Status</dt>
                    <dd className="mt-0.5 font-bold">{selectedPipe.inspection_status}</dd>
                  </div>
                  <div className="rounded-lg border border-slate-200 p-2.5 dark:border-slate-700">
                    <dt className="text-slate-500">Last Inspected</dt>
                    <dd className="mt-0.5 font-bold">{selectedPipe.last_inspection_date}</dd>
                  </div>
                </dl>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/40">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500">Research Risk Index</span>
                    <span className="text-sm font-black text-slate-900 dark:text-white">
                      {selectedPipe.risk_score} / 100 ({selectedPipe.risk_level})
                    </span>
                  </div>
                  <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                    <div
                      className={`h-full rounded-full transition-all ${
                        selectedPipe.risk_level === "Critical"
                          ? "bg-rose-500"
                          : selectedPipe.risk_level === "High"
                          ? "bg-amber-500"
                          : selectedPipe.risk_level === "Medium"
                          ? "bg-yellow-500"
                          : "bg-emerald-500"
                      }`}
                      style={{ width: `${selectedPipe.risk_score}%` }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <p className="mt-4 text-xs text-slate-500">Select a pipeline asset row to view complete telemetry details.</p>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}
