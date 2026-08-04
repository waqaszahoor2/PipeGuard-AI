"use client";

import { useEffect, useMemo, useState } from "react";

type Node = { id: string; coordinates: [number, number]; status: "normal" | "warning" | "critical"; zone?: string | null };
type Network = { nodes: Node[]; edges: { from: number; to: number }[] };

const tone = {
  normal: "#10b981",
  warning: "#f59e0b",
  critical: "#ef4444"
};

export function NetworkDiagram({ compact = false }: { compact?: boolean }) {
  const [network, setNetwork] = useState<Network | null>(null);
  useEffect(() => {
    fetch("/dashboard_network.json").then((r) => r.json()).then(setNetwork).catch(() => setNetwork(null));
  }, []);
  const points = useMemo(() => {
    if (!network) return [];
    const xs = network.nodes.map((node) => node.coordinates[0]);
    const ys = network.nodes.map((node) => node.coordinates[1]);
    const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
    return network.nodes.map((node) => ({
      ...node,
      x: 30 + ((node.coordinates[0] - minX) / (maxX - minX || 1)) * 740,
      y: 35 + (1 - (node.coordinates[1] - minY) / (maxY - minY || 1)) * (compact ? 210 : 330)
    }));
  }, [network, compact]);

  if (!network) return <div className="grid h-72 place-items-center text-sm text-slate-500">Loading network map…</div>;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-[radial-gradient(circle_at_20%_20%,rgba(14,165,233,.08),transparent_35%),linear-gradient(135deg,#f8fafc,#eef6ff)] dark:border-slate-700 dark:bg-[linear-gradient(135deg,#071529,#0b1f3b)]">
      <svg viewBox={`0 0 800 ${compact ? 280 : 410}`} className={compact ? "h-64 w-full" : "h-[370px] w-full"} role="img" aria-label="Demonstration pipeline network with status nodes">
        <defs>
          <pattern id="grid" width="36" height="36" patternUnits="userSpaceOnUse">
            <path d="M 36 0 L 0 0 0 36" fill="none" stroke="currentColor" strokeOpacity=".08" strokeWidth="1" />
          </pattern>
          <filter id="glow">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" className="text-slate-500" />
        {network.edges.map((edge, index) => {
          const a = points[edge.from], b = points[edge.to];
          return <line key={index} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#1689ee" strokeWidth="5" strokeLinecap="round" opacity=".85" />;
        })}
        {points.map((node) => (
          <g key={node.id}>
            {node.status === "critical" && <circle cx={node.x} cy={node.y} r="30" fill="none" stroke="#ef4444" strokeWidth="3" opacity=".35" filter="url(#glow)" />}
            <circle cx={node.x} cy={node.y} r={node.status === "critical" ? 13 : 10} fill={tone[node.status]} stroke="white" strokeWidth="4" />
            {node.zone && (
              <g transform={`translate(${node.x + 18} ${node.y - 28})`}>
                <rect width="86" height="34" rx="8" fill="#ef4444" />
                <text x="43" y="22" textAnchor="middle" fontSize="16" fontWeight="700" fill="white">{node.zone}</text>
              </g>
            )}
          </g>
        ))}
      </svg>
      <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 flex-wrap items-center justify-center gap-4 rounded-xl border border-slate-200 bg-white/95 px-4 py-2 text-xs font-semibold text-slate-600 shadow dark:border-slate-600 dark:bg-slate-900/95 dark:text-slate-300">
        {Object.entries(tone).map(([key, value]) => (
          <span key={key} className="flex items-center gap-2"><i className="h-3 w-3 rounded-full" style={{ background: value }} />{key === "warning" ? "Possible Leak" : key[0].toUpperCase() + key.slice(1)}</span>
        ))}
      </div>
    </div>
  );
}
