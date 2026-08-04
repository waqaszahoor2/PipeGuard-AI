import { Loader2, Globe } from "lucide-react";

export function PipelineGlobeSkeleton() {
  return (
    <div className="card relative flex min-h-[540px] w-full flex-col items-center justify-center overflow-hidden bg-slate-900 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.15)_0%,transparent_70%)]" />
      <div className="relative z-10 flex flex-col items-center gap-4 text-center">
        <div className="grid h-16 w-16 place-items-center rounded-full border border-cyan-500/30 bg-cyan-950/40 text-cyan-400 shadow-xl shadow-cyan-500/10">
          <Globe className="h-8 w-8 animate-pulse" />
        </div>
        <div>
          <h3 className="text-lg font-extrabold text-white">Initializing 3D WebGL Earth Globe</h3>
          <p className="mt-1 text-xs font-semibold text-slate-400">Loading MapLibre WebGL projection system...</p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-800/80 px-4 py-1.5 text-xs font-bold text-slate-300 backdrop-blur-md">
          <Loader2 className="h-3.5 w-3.5 animate-spin text-cyan-400" />
          <span>Rendering Earth Atmosphere</span>
        </div>
      </div>
    </div>
  );
}
