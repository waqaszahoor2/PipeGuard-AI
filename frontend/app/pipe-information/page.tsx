"use client";

import { Download, RefreshCw, Search, SlidersHorizontal, X } from "lucide-react";
import { useMemo, useState } from "react";
import { usePipelineData } from "@/providers/PipelineDataProvider";
import type { PipelineAsset } from "@/lib/pipeline-data";

export default function PipeInformationPage() {
  const {
    records,
    filteredRecords,
    loading,
    error,
    reload,
    searchQuery,
    setSearchQuery,
    zoneFilter,
    setZoneFilter,
    materialFilter,
    setMaterialFilter,
    riskFilter,
    setRiskFilter,
    statusFilter,
    setStatusFilter,
    inspectionFilter,
    setInspectionFilter,
    resetFilters
  } = usePipelineData();

  const [selectedPipe, setSelectedPipe] = useState<PipelineAsset | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const activeSelectedPipe = selectedPipe || filteredRecords[0] || records[0] || null;

  const zones = useMemo(() => Array.from(new Set(records.map((r) => r.zone))).sort(), [records]);
  const materials = useMemo(() => Array.from(new Set(records.map((r) => r.material))).sort(), [records]);
  const statuses = useMemo(() => Array.from(new Set(records.map((r) => r.operational_status || r.operationalStatus))).sort(), [records]);
  const inspections = useMemo(() => Array.from(new Set(records.map((r) => r.inspection_status || r.inspectionStatus))).sort(), [records]);
  const riskLevels = ["Low", "Medium", "High", "Critical"];

  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage) || 1;
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredRecords.slice(start, start + itemsPerPage);
  }, [filteredRecords, currentPage]);

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
      `"${r.pipe_id || r.id}"`,
      `"${r.location}"`,
      `"${r.zone}"`,
      r.latitude,
      r.longitude,
      r.installation_year || r.installationYear,
      r.pipe_age || r.age,
      `"${r.material}"`,
      r.diameter_mm || r.diameterMm,
      r.length_m || r.lengthM,
      r.max_capacity_lps || r.capacity,
      r.pressure_bar || r.pressureBar,
      r.flow_rate_lps || r.flowRate,
      r.temperature_c || r.temperatureC,
      `"${r.operational_status || r.operationalStatus}"`,
      `"${r.inspection_status || r.inspectionStatus}"`,
      r.risk_score || r.riskScore,
      `"${r.risk_level || r.riskLevel}"`,
      `"${r.last_inspection_date || r.lastInspectionDate}"`
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
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
            Searchable registry of synthetic demonstration distribution mains, replayed telemetry, and research risk attributes.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span
            className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-cyan-300"
            aria-label={`${records.length} synthetic demonstration assets`}
          >
            {records.length} Demo Assets
          </span>

          <button
            type="button"
            onClick={exportCSV}
            disabled={filteredRecords.length === 0}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-blue-700 disabled:opacity-50"
          >
            <Download className="h-4 w-4" /> Download CSV ({filteredRecords.length})
          </button>
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
          {(searchQuery || zoneFilter || materialFilter || statusFilter || riskFilter || inspectionFilter) && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline dark:text-cyan-300"
            >
              <X className="h-3.5 w-3.5" /> Clear Filters
            </button>
          )}
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
          <div className="relative sm:col-span-2 lg:col-span-1">
            <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              className="input pl-9"
              placeholder="Pipe ID, location..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          <select
            className="input"
            value={zoneFilter}
            onChange={(e) => {
              setZoneFilter(e.target.value);
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
            value={materialFilter}
            onChange={(e) => {
              setMaterialFilter(e.target.value);
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
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            aria-label="Filter by operational status"
          >
            <option value="">All Statuses</option>
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <select
            className="input"
            value={inspectionFilter}
            onChange={(e) => {
              setInspectionFilter(e.target.value);
              setCurrentPage(1);
            }}
            aria-label="Filter by inspection status"
          >
            <option value="">All Inspections</option>
            {inspections.map((i) => (
              <option key={i} value={i}>
                {i}
              </option>
            ))}
          </select>

          <select
            className="input"
            value={riskFilter}
            onChange={(e) => {
              setRiskFilter(e.target.value);
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
      ) : error && records.length === 0 ? (
        <div className="card p-8 text-center border-rose-300 dark:border-rose-900">
          <p className="text-sm font-bold text-rose-600 dark:text-rose-400">{error}</p>
          <button
            onClick={reload}
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
                  onClick={resetFilters}
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
                        const id = row.pipe_id || row.id;
                        const isSelected = activeSelectedPipe?.pipe_id === id || activeSelectedPipe?.id === id;
                        const rLevel = row.risk_level || row.riskLevel;
                        const rScore = row.risk_score || row.riskScore;
                        return (
                          <tr
                            key={id}
                            onClick={() => setSelectedPipe(row)}
                            className={`cursor-pointer transition hover:bg-blue-50/70 dark:hover:bg-blue-950/30 ${
                              isSelected ? "bg-blue-50 font-bold dark:bg-blue-950/50" : ""
                            }`}
                          >
                            <td className="p-3 font-mono font-bold text-blue-600 dark:text-cyan-300">
                              {id}
                            </td>
                            <td className="p-3 font-semibold">{row.zone}</td>
                            <td className="p-3">{row.material}</td>
                            <td className="p-3">
                              {row.installation_year || row.installationYear} ({row.pipe_age || row.age}y)
                            </td>
                            <td className="p-3 font-mono">{(row.pressure_bar || row.pressureBar)?.toFixed(1)} bar</td>
                            <td className="p-3">
                              <span
                                className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-black ${
                                  rLevel === "Critical"
                                    ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200"
                                    : rLevel === "High"
                                    ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200"
                                    : rLevel === "Medium"
                                    ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-200"
                                    : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200"
                                }`}
                              >
                                {rLevel} ({rScore})
                              </span>
                            </td>
                            <td className="p-3 text-[11px] font-semibold">{row.operational_status || row.operationalStatus}</td>
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
            {activeSelectedPipe ? (
              <div className="mt-4 space-y-4">
                <div className="rounded-xl bg-slate-100 p-4 dark:bg-slate-800/80">
                  <div className="font-mono text-sm font-black text-blue-600 dark:text-cyan-300">
                    {activeSelectedPipe.pipe_id || activeSelectedPipe.id}
                  </div>
                  <div className="mt-1 text-xs font-semibold text-slate-600 dark:text-slate-300">
                    {activeSelectedPipe.location}
                  </div>
                </div>

                <dl className="grid gap-3 text-xs sm:grid-cols-2">
                  <div className="rounded-lg border border-slate-200 p-2.5 dark:border-slate-700">
                    <dt className="text-slate-500">Zone</dt>
                    <dd className="mt-0.5 font-bold">{activeSelectedPipe.zone}</dd>
                  </div>
                  <div className="rounded-lg border border-slate-200 p-2.5 dark:border-slate-700">
                    <dt className="text-slate-500">Coordinates</dt>
                    <dd className="mt-0.5 font-mono font-bold">
                      {activeSelectedPipe.latitude.toFixed(4)}, {activeSelectedPipe.longitude.toFixed(4)}
                    </dd>
                  </div>
                  <div className="rounded-lg border border-slate-200 p-2.5 dark:border-slate-700">
                    <dt className="text-slate-500">Installation Year</dt>
                    <dd className="mt-0.5 font-bold">
                      {activeSelectedPipe.installation_year || activeSelectedPipe.installationYear} ({activeSelectedPipe.pipe_age || activeSelectedPipe.age} yrs old)
                    </dd>
                  </div>
                  <div className="rounded-lg border border-slate-200 p-2.5 dark:border-slate-700">
                    <dt className="text-slate-500">Material & Size</dt>
                    <dd className="mt-0.5 font-bold">
                      {activeSelectedPipe.material} ({activeSelectedPipe.diameter_mm || activeSelectedPipe.diameterMm} mm)
                    </dd>
                  </div>
                  <div className="rounded-lg border border-slate-200 p-2.5 dark:border-slate-700">
                    <dt className="text-slate-500">Segment Length</dt>
                    <dd className="mt-0.5 font-bold">{activeSelectedPipe.length_m || activeSelectedPipe.lengthM} meters</dd>
                  </div>
                  <div className="rounded-lg border border-slate-200 p-2.5 dark:border-slate-700">
                    <dt className="text-slate-500">Max Capacity</dt>
                    <dd className="mt-0.5 font-bold">{activeSelectedPipe.max_capacity_lps || activeSelectedPipe.capacity} L/s</dd>
                  </div>
                  <div className="rounded-lg border border-slate-200 p-2.5 dark:border-slate-700">
                    <dt className="text-slate-500">Current Pressure</dt>
                    <dd className="mt-0.5 font-mono font-bold text-blue-600 dark:text-cyan-300">
                      {(activeSelectedPipe.pressure_bar || activeSelectedPipe.pressureBar)?.toFixed(1)} bar
                    </dd>
                  </div>
                  <div className="rounded-lg border border-slate-200 p-2.5 dark:border-slate-700">
                    <dt className="text-slate-500">Current Flow Rate</dt>
                    <dd className="mt-0.5 font-mono font-bold text-cyan-600 dark:text-cyan-300">
                      {(activeSelectedPipe.flow_rate_lps || activeSelectedPipe.flowRate)?.toFixed(1)} L/s
                    </dd>
                  </div>
                  <div className="rounded-lg border border-slate-200 p-2.5 dark:border-slate-700">
                    <dt className="text-slate-500">Fluid Temp</dt>
                    <dd className="mt-0.5 font-mono font-bold">{activeSelectedPipe.temperature_c || activeSelectedPipe.temperatureC} °C</dd>
                  </div>
                  <div className="rounded-lg border border-slate-200 p-2.5 dark:border-slate-700">
                    <dt className="text-slate-500">Operational Status</dt>
                    <dd className="mt-0.5 font-bold text-slate-800 dark:text-slate-200">
                      {activeSelectedPipe.operational_status || activeSelectedPipe.operationalStatus}
                    </dd>
                  </div>
                  <div className="rounded-lg border border-slate-200 p-2.5 dark:border-slate-700">
                    <dt className="text-slate-500">Inspection Status</dt>
                    <dd className="mt-0.5 font-bold">{activeSelectedPipe.inspection_status || activeSelectedPipe.inspectionStatus}</dd>
                  </div>
                  <div className="rounded-lg border border-slate-200 p-2.5 dark:border-slate-700">
                    <dt className="text-slate-500">Last Inspected</dt>
                    <dd className="mt-0.5 font-bold">{activeSelectedPipe.last_inspection_date || activeSelectedPipe.lastInspectionDate}</dd>
                  </div>
                </dl>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/40">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500">Research Risk Index</span>
                    <span className="text-sm font-black text-slate-900 dark:text-white">
                      {activeSelectedPipe.risk_score || activeSelectedPipe.riskScore} / 100 ({activeSelectedPipe.risk_level || activeSelectedPipe.riskLevel})
                    </span>
                  </div>
                  <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                    <div
                      className={`h-full rounded-full transition-all ${
                        activeSelectedPipe.risk_level === "Critical" || activeSelectedPipe.riskLevel === "critical"
                          ? "bg-rose-500"
                          : activeSelectedPipe.risk_level === "High" || activeSelectedPipe.riskLevel === "high"
                          ? "bg-amber-500"
                          : activeSelectedPipe.risk_level === "Medium" || activeSelectedPipe.riskLevel === "medium"
                          ? "bg-yellow-500"
                          : "bg-emerald-500"
                      }`}
                      style={{ width: `${activeSelectedPipe.risk_score || activeSelectedPipe.riskScore}%` }}
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
