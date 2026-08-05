import { BrainCircuit, Camera, Gauge, HardHat, MapPinned, Waves } from "lucide-react";

export default function AboutPage() {
  const items = [
    [Gauge, "Hydraulic sensing", "Pressure, flow and tank-level patterns can support early-warning research."],
    [BrainCircuit, "AI warning", "The model estimates a possible leak pattern; it does not confirm physical damage."],
    [MapPinned, "Asset context", "Synthetic demonstration Calgary pipeline assets provide recorded year, material, diameter, length and geometry."],
    [HardHat, "Technician verification", "A qualified technician reviews the suspected zone and records actual findings."],
    [Camera, "Camera inspection", "Images may record visible conditions, but this project does not automatically diagnose them."],
    [Waves, "Specialist inspection", "Acoustic, ultrasonic or electromagnetic methods answer different physical questions."]
  ];
  return (
    <div className="space-y-5">
      <div><h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">About PipeGuard AI</h2><p className="mt-1 text-sm text-slate-500">A responsible data-science and full-stack portfolio prototype.</p></div>
      <section className="card overflow-hidden">
        <div className="bg-gradient-to-br from-navy-950 via-blue-900 to-cyan-700 p-6 text-white sm:p-10">
          <span className="rounded-full bg-white/15 px-4 py-2 text-xs font-extrabold">PORTFOLIO PROTOTYPE</span>
          <h3 className="mt-6 max-w-3xl text-3xl font-extrabold tracking-tight sm:text-5xl">Earlier hydraulic warnings. Clearer inspection support.</h3>
          <p className="mt-5 max-w-3xl text-base leading-7 text-blue-100">PipeGuard AI demonstrates how research sensor data, synthetic demonstration assets, secure APIs and responsive interfaces can support utility decision-making without overstating what AI can detect.</p>
        </div>
      </section>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map(([Icon, title, text]) => {
          const Component = Icon as typeof Gauge;
          return <article key={String(title)} className="card p-5"><span className="grid h-12 w-12 place-items-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-cyan-300"><Component /></span><h3 className="mt-4 text-lg font-extrabold">{String(title)}</h3><p className="mt-2 text-sm leading-6 text-slate-500">{String(text)}</p></article>;
        })}
      </section>
      <section className="card p-5 sm:p-7">
        <h3 className="text-xl font-extrabold">Sensor data versus asset data</h3>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl bg-blue-50 p-5 dark:bg-blue-950/30"><h4 className="font-extrabold">BattLeDIM sensor module</h4><p className="mt-2 text-sm leading-6">Five-minute pressure, flow, tank-level, demand and leakage-flow research records used for chronological replay and modelling.</p></div>
          <div className="rounded-xl bg-emerald-50 p-5 dark:bg-emerald-950/30"><h4 className="font-extrabold">Synthetic Calgary Demonstration Assets</h4><p className="mt-2 text-sm leading-6">Synthetic installation year, material, diameter, length and spatial coordinates used for asset search and geospatial mapping.</p></div>
        </div>
        <p className="mt-5 font-bold">The model detects hydraulic leak patterns in unseen research sensor data using chronological replay.</p>
      </section>
      <section className="rounded-xl border border-orange-200 bg-orange-50 p-5 text-sm leading-6 dark:border-orange-900 dark:bg-orange-950/30">
        <strong>Scientific boundary:</strong> PipeGuard AI cannot independently determine corrosion, wall thickness, maximum hydraulic capacity, remaining lifespan, confirmed cracks or a confirmed leak.
      </section>
    </div>
  );
}
