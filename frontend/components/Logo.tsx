import { Droplet, Shield } from "lucide-react";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3" aria-label="PipeGuard AI">
      <div className="relative grid h-12 w-12 place-items-center rounded-2xl border border-cyan-300/60 bg-cyan-400/10 text-cyan-300">
        <Shield className="h-9 w-9" strokeWidth={1.8} />
        <Droplet className="absolute h-4 w-4 translate-y-1 text-cyan-200" />
      </div>
      {!compact && (
        <div>
          <div className="text-lg font-extrabold tracking-tight text-white">PipeGuard AI</div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-cyan-200/80">
            Research support
          </div>
        </div>
      )}
    </div>
  );
}
