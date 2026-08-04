import { AlertTriangle, CircleCheck, Gauge, ShieldAlert } from "lucide-react";
import { NetworkDiagram } from "@/components/NetworkDiagram";
import { PressureChart } from "@/components/PressureChart";
import { StatusCard } from "@/components/StatusCard";
import { TimeStatus } from "@/components/TimeStatus";

const dashboard = {
  monitored: 1248,
  normal: 1196,
  leakAlerts: 39,
  critical: 13,
  latestSensorTimestamp: "2019-12-31T23:55:00Z"
};

export default function DashboardPage() {
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Network Overview</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Replaying historical research readings as simulated live data.</p>
        </div>
        <span className="badge-demo sm:hidden">DEMO DATA</span>
      </div>

      <TimeStatus latestSensorTimestamp={dashboard.latestSensorTimestamp} />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Network status">
        <StatusCard icon={Gauge} label="Pipelines Monitored" value={dashboard.monitored.toLocaleString()} tone="blue" />
        <StatusCard icon={CircleCheck} label="Operating Normally" value={dashboard.normal.toLocaleString()} tone="green" />
        <StatusCard icon={AlertTriangle} label="Possible Leak Alerts" value={dashboard.leakAlerts} tone="orange" />
        <StatusCard icon={ShieldAlert} label="Critical Inspections" value={dashboard.critical} tone="red" />
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.65fr)_minmax(320px,.9fr)]">
        <article className="card p-4 sm:p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="text-lg font-extrabold">Pipeline Network Map</h3>
            <a href="/pipeline-map" className="text-sm font-bold text-blue-600 hover:underline dark:text-cyan-300">Open map</a>
          </div>
          <NetworkDiagram compact />
        </article>

        <article className="card flex flex-col p-5">
          <h3 className="text-lg font-extrabold">Priority Alert</h3>
          <div className="mt-8 flex items-start gap-4">
            <div className="grid h-20 w-20 shrink-0 place-items-center rounded-full bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-300">
              <AlertTriangle className="h-10 w-10" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-red-600 dark:text-red-300">Possible Leak Detected</div>
              <div className="mt-2 text-xl font-bold">Zone 4</div>
              <div className="mt-5 text-xl font-bold text-red-600 dark:text-red-300">87% probability</div>
              <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">Pressure dropped while inflow increased in this demonstration fixture.</p>
              <span className="mt-5 inline-flex rounded-lg bg-gradient-to-r from-red-600 to-orange-500 px-5 py-2 text-sm font-extrabold text-white">HIGH</span>
            </div>
          </div>
          <a href="/leak-detection" className="mt-auto block min-h-12 rounded-xl bg-gradient-to-r from-blue-700 to-blue-500 px-5 py-3 text-center font-extrabold text-white shadow-lg shadow-blue-500/20">View Details</a>
        </article>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.1fr_1fr]">
        <article className="card p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-extrabold">Pressure Trend (24 Hours)</h3>
            <span className="text-sm text-slate-500">Demo replay</span>
          </div>
          <PressureChart />
        </article>

        <article className="card p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-extrabold">Recent Alerts</h3>
            <a href="/inspection-records" className="text-sm font-bold text-blue-600 dark:text-cyan-300">View all</a>
          </div>
          <div className="mt-3 divide-y divide-slate-200 dark:divide-slate-700">
            {[
              ["critical", "Possible leak detected", "Zone 4", "12 min ago"],
              ["warning", "Unusual pressure fluctuation", "Zone 7", "45 min ago"],
              ["normal", "Inspection recommended", "Zone 2", "2 hours ago"]
            ].map(([level, title, zone, time]) => (
              <div key={title} className="grid grid-cols-[auto_1fr_auto] items-center gap-3 py-4">
                <span className={`grid h-10 w-10 place-items-center rounded-full ${level === "critical" ? "bg-red-50 text-red-600 dark:bg-red-950/40" : level === "warning" ? "bg-orange-50 text-orange-500 dark:bg-orange-950/40" : "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40"}`}>
                  {level === "normal" ? <CircleCheck className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
                </span>
                <div><div className="font-bold">{title}</div><div className="text-sm text-slate-500">{zone}</div></div>
                <time className="text-sm text-slate-500">{time}</time>
              </div>
            ))}
          </div>
        </article>
      </section>

      <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-950 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-100">
        <strong>Important:</strong> AI alerts require technician verification. This dashboard does not confirm a physical leak.
      </div>
    </div>
  );
}
