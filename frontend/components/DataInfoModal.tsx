"use client";

import { Info, X } from "lucide-react";

export function DataInfoModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="card max-w-lg p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 text-blue-600 dark:text-cyan-400">
            <Info className="h-6 w-6" />
            <h3 id="modal-title" className="text-xl font-extrabold text-slate-900 dark:text-white">Public Pipeline Data Notice</h3>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white" aria-label="Close dialog">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 space-y-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
          <p>Global pipeline results displayed on this map are sourced from publicly mapped <strong>OpenStreetMap</strong> data.</p>
          <ul className="list-disc space-y-2 pl-5 font-medium">
            <li><strong>Crowdsourced Coverage:</strong> Pipeline records differ significantly by country, region, and municipality. Many underground municipal networks are not publicly mapped.</li>
            <li><strong>Approximate Coordinates:</strong> Underground pipeline geometries may be approximate or simplified.</li>
            <li><strong>No Excavation Use:</strong> This data is provided strictly for research and visualization. Underground utility records must be verified with local utility authorities before any field excavation or maintenance work.</li>
            <li><strong>PipeGuard AI Isolation:</strong> Public OpenStreetMap pipelines are not connected to PipeGuard hydraulic sensors and are not assigned AI leak risk probabilities.</li>
          </ul>
        </div>

        <div className="mt-6 flex justify-end">
          <button onClick={onClose} className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-500/20 hover:bg-blue-700">
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
}
