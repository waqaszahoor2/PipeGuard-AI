"use client";

import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Filter,
  Gauge,
  Layers,
  MapPin,
  RefreshCw,
  ShieldAlert,
  Wrench,
  X
} from "lucide-react";
import { useMemo } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { StatusCard } from "@/components/StatusCard";
import { usePipelineData } from "@/providers/PipelineDataProvider";

const HOURLY_TREND = Array.from({ length: 24 }, (_, i) => {
  const hour = `${String(i).padStart(2, "0")}:00`;
  const diurnal = Math.sin(((i - 6) / 24) * 2 * Math.PI) * 0.4;
  return {
    time: hour,
    pressure: Number((4.1 + diurnal * 0.6 + (i === 14 ? -0.8 : 0)).toFixed(2)),
    flow: Number((245 + diurnal * 45 + (i === 14 ? 65 : 0)).toFixed(1)),
    anomalies: i === 14 ? 3 : i === 8 || i === 19 ? 1 : 0
  };
});

const RISK_COLORS = {
  Low: "#10b981",
  Medium: "#f59e0b",
  High: "#f97316",
  Critical: "#ef4444"
};

export default function DashboardPage() {
  const {
    records,
    filteredRecords,
    loading,
    error,
    reload,
    zoneFilter,
    setZoneFilter,
    statusFilter,
    setStatusFilter,
    riskFilter,
    setRiskFilter,
    resetFilters
  } = usePipelineData();

  const summary = useMemo(() => {
    if (!filteredRecords.length) {
      return {
        total: 0,
        normal: 0,
        warning: 0,
        critical: 0,
        avgPressure: "0.0",
        avgFlow: "0.0",
        avgAge: "0",
        avgRisk: "0.0",
        maintenanceRequired: 0,
        zoneStats: []
      };
    }

    const total = filteredRecords.length;
    let normal = 0;
    let warning = 0;
    let critical = 0;
    let totalPressure = 0;
    let totalFlow = 0;
    let totalAge = 0;
    let totalRisk = 0;
    let maintenanceRequired = 0;

    const zoneMap = new Map<string, { count: number; totalRisk: number }>();

    filteredRecords.forEach((p) => {
      const rLevel = p.risk_level;
      const isCritical = rLevel === "Critical";
      const isWarning = rLevel === "High" || rLevel === "Medium";

      if (isCritical) critical++;
      else if (isWarning) warning++;
      else normal++;

      const pVal = p.pressure_bar ?? 0;
      const fVal = p.flow_rate_lps ?? 0;
      const aVal = p.pipe_age ?? 0;
      const rVal = p.risk_score ?? 0;

      totalPressure += pVal;
      totalFlow += fVal;
      totalAge += aVal;
      totalRisk += rVal;

      if (
        p.operational_status === "Maintenance Required" ||
        p.operational_status === "Under Repair" ||
        p.operational_status === "Inactive"
      ) {
        maintenanceRequired++;
      }

      const zName = p.zone || "CALGARY MAIN";
      const currentZone = zoneMap.get(zName) || { count: 0, totalRisk: 0 };
      zoneMap.set(zName, {
        count: currentZone.count + 1,
        totalRisk: currentZone.totalRisk + rVal
      });
    });

    const zoneStats = Array.from(zoneMap.entries()).map(([zone, val]) => ({
      zone,
      count: val.count,
      avgRisk: Number((val.totalRisk / val.count).toFixed(1))
    }));

    return {
      total,
      normal,
      warning,
      critical,
      avgPressure: (totalPressure / total).toFixed(2),
      avgFlow: (totalFlow / total).toFixed(1),
      avgAge: (totalAge / total).toFixed(0),
      avgRisk: (totalRisk / total).toFixed(1),
      maintenanceRequired,
      zoneStats
    };
  }, [filteredRecords]);

  const zones = useMemo(() => Array.from(new Set(records.map((p) => p.zone))).sort(), [records]);
  const statuses = useMemo(() => Array.from(new Set(records.map((p) => p.operational_status))).sort(), [records]);
  const riskLevels = ["Low", "Medium", "High", "Critical"];

  const riskDistribution = useMemo(() => {
    const counts = { Low: 0, Medium: 0, High: 0, Critical: 0 };
    filteredRecords.forEach((p) => {
      const level = p.risk_level;
      if (level in counts) {
        counts[level as keyof typeof counts]++;
      }
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [filteredRecords]);

  const recentAlerts = useMemo(() => {
    return filteredRecords
      .filter((p) => p.risk_level === "Critical" || p.risk_level === "High")
      .slice(0, 5);
  }, [filteredRecords]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />
          ))}
        </div>
      </div>
    );
  }

  if (error && records.length === 0) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center text-rose-900 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-200">
        <ShieldAlert className="mx-auto h-12 w-12 text-rose-600 dark:text-rose-400" />
        <h3 className="mt-4 text-lg font-bold">Failed to Load Dashboard Telemetry</h3>
        <p className="mt-2 text-sm text-rose-700 dark:text-rose-300">{error}</p>
        <button
          onClick={reload}
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-rose-500"
        >
          <RefreshCw className="h-4 w-4" /> Retry Loading Telemetry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Pipeline Telemetry & Risk Dashboard
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Historical telemetry replay and demonstration asset overview computed dynamically from {summary.total} monitored assets.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="badge-demo">SYNTHETIC REPLAY DATA</span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <section className="card p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-extrabold text-slate-700 dark:text-slate-300">
            <Filter className="h-4 w-4 text-blue-600 dark:text-cyan-300" /> Dashboard Filters:
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              className="input py-1.5 text-xs"
              value={zoneFilter}
              onChange={(e) => setZoneFilter(e.target.value)}
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
              className="input py-1.5 text-xs"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Filter by status"
            >
              <option value="">All Operational Statuses</option>
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            <select
              className="input py-1.5 text-xs"
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              aria-label="Filter by risk severity"
            >
              <option value="">All Severity Levels</option>
              {riskLevels.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>

            {(zoneFilter || statusFilter || riskFilter) && (
              <button
                onClick={resetFilters}
                className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline dark:text-cyan-300"
              >
                <X className="h-3.5 w-3.5" /> Clear Filters
              </button>
            )}
          </div>
        </div>
      </section>

      {/* KPI Cards Grid */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatusCard
          icon={Gauge}
          label="Total Pipelines Monitored"
          value={summary.total.toLocaleString()}
          tone="blue"
        />
        <StatusCard
          icon={CheckCircle2}
          label="Operating Normally (Low Risk)"
          value={summary.normal.toLocaleString()}
          tone="green"
        />
        <StatusCard
          icon={AlertTriangle}
          label="Risk Warnings (Med / High)"
          value={summary.warning.toLocaleString()}
          tone="orange"
        />
        <StatusCard
          icon={ShieldAlert}
          label="Critical Action Cases"
          value={summary.critical.toLocaleString()}
          tone="red"
        />
      </section>

      {/* Secondary Metrics Strip */}
      <section className="grid gap-4 sm:grid-cols-3">
        <div className="card p-4">
          <div className="text-xs font-bold text-slate-500 dark:text-slate-400">Average System Pressure</div>
          <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
            {summary.avgPressure} <span className="text-sm font-semibold text-slate-500">bar</span>
          </div>
          <p className="mt-1 text-xs text-slate-400">Baseline target: 3.5 - 5.5 bar</p>
        </div>

        <div className="card p-4">
          <div className="text-xs font-bold text-slate-500 dark:text-slate-400">Average Flow Rate</div>
          <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
            {summary.avgFlow} <span className="text-sm font-semibold text-slate-500">L/s</span>
          </div>
          <p className="mt-1 text-xs text-slate-400">Diurnal variance ± 15%</p>
        </div>

        <div className="card p-4">
          <div className="text-xs font-bold text-slate-500 dark:text-slate-400">Maintenance & Repair</div>
          <div className="mt-2 text-2xl font-black text-amber-600 dark:text-amber-400">
            {summary.maintenanceRequired} <span className="text-sm font-semibold text-slate-500">pipes</span>
          </div>
          <p className="mt-1 text-xs text-slate-400">Active work orders open</p>
        </div>
      </section>

      {/* Main Charts Row 1: Pressure & Flow Trends */}
      <section className="grid gap-6 lg:grid-cols-2">
        <article className="card p-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Network Pressure Trend (24-Hour Replay)
              </h3>
              <p className="text-xs text-slate-500">Average pressure in bar across all active sensors</p>
            </div>
            <span className="text-xs font-mono font-bold text-blue-600 dark:text-cyan-300">
              Avg {summary.avgPressure} bar
            </span>
          </div>

          <div className="mt-6 h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={HOURLY_TREND} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="pressureGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="time" tick={{ fontSize: 11 }} />
                <YAxis domain={[2, 6]} tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    border: "none",
                    borderRadius: "12px",
                    color: "#fff",
                    fontSize: "12px"
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="pressure"
                  stroke="#3b82f6"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#pressureGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="card p-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Network Flow Rate Trend (24-Hour Replay)
              </h3>
              <p className="text-xs text-slate-500">Aggregate discharge in Liters/sec</p>
            </div>
            <span className="text-xs font-mono font-bold text-cyan-600 dark:text-cyan-300">
              Avg {summary.avgFlow} L/s
            </span>
          </div>

          <div className="mt-6 h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={HOURLY_TREND} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="flowGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="time" tick={{ fontSize: 11 }} />
                <YAxis domain={[150, 350]} tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    border: "none",
                    borderRadius: "12px",
                    color: "#fff",
                    fontSize: "12px"
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="flow"
                  stroke="#06b6d4"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#flowGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </article>
      </section>

      {/* Main Charts Row 2: Distributions & Zone Comparison */}
      <section className="grid gap-6 lg:grid-cols-3">
        {/* Risk Level Distribution */}
        <article className="card p-5">
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Risk Severity Distribution</h3>
          <p className="text-xs text-slate-500">Proportion of monitored assets by risk tier</p>

          <div className="mt-4 h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={riskDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {riskDistribution.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={RISK_COLORS[entry.name as keyof typeof RISK_COLORS] || "#3b82f6"}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderRadius: "8px",
                    color: "#fff",
                    fontSize: "12px"
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "12px" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </article>

        {/* Zone Comparison Bar Chart */}
        <article className="card p-5 lg:col-span-2">
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
            High Risk Zones & Asset Volume
          </h3>
          <p className="text-xs text-slate-500">Average risk index (0-100) vs asset count across pressure zones</p>

          <div className="mt-4 h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={summary.zoneStats} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="zone" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderRadius: "8px",
                    color: "#fff",
                    fontSize: "12px"
                  }}
                />
                <Bar dataKey="avgRisk" name="Avg Risk Index" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="count" name="Asset Count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>
      </section>

      {/* Priority Alerts Table */}
      <section className="card p-5">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4 dark:border-slate-700">
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">Priority High-Risk Alerts</h3>
            <p className="text-xs text-slate-500 font-medium">Synthetic Demonstration Findings</p>
          </div>
          <a
            href="/pipe-information"
            className="text-xs font-bold text-blue-600 hover:underline dark:text-cyan-300"
          >
            View All Assets →
          </a>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 dark:bg-slate-800">
              <tr>
                <th className="p-3 font-extrabold">Pipe ID</th>
                <th className="p-3 font-extrabold">Location</th>
                <th className="p-3 font-extrabold">Zone</th>
                <th className="p-3 font-extrabold">Pressure</th>
                <th className="p-3 font-extrabold">Risk Level</th>
                <th className="p-3 font-extrabold">Operational Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700/60">
              {recentAlerts.map((pipe) => (
                <tr key={pipe.pipe_id || pipe.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="p-3 font-mono font-bold text-blue-600 dark:text-cyan-300">{pipe.pipe_id || pipe.id}</td>
                  <td className="p-3">{pipe.location}</td>
                  <td className="p-3 font-semibold">{pipe.zone}</td>
                  <td className="p-3 font-mono">{(pipe.pressure_bar ?? pipe.pressureBar)?.toFixed(1)} bar</td>
                  <td className="p-3">
                    <span
                      className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-black ${
                        pipe.risk_level === "Critical" || pipe.riskLevel === "critical"
                          ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200"
                          : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200"
                      }`}
                    >
                      {pipe.risk_level || pipe.riskLevel} ({pipe.risk_score || pipe.riskScore})
                    </span>
                  </td>
                  <td className="p-3 font-semibold">{pipe.operational_status || pipe.operationalStatus}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Mandatory Disclaimer Footer Box */}
      <div className="rounded-xl border border-blue-200 bg-blue-50/80 px-4 py-3 text-xs text-blue-950 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-200">
        <strong>Responsible Use Warning:</strong> PipeGuard AI is a research and educational prototype using synthetic demonstration telemetry data. It does not confirm physical pipeline leakage, structural damage, corrosion, or remaining asset life. Alerts require verification by qualified technicians using approved inspection methods.
      </div>
    </div>
  );
}
