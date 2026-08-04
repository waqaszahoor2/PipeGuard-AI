"use client";

import dynamic from "next/dynamic";
import { PipelineGlobeSkeleton } from "@/components/PipelineGlobeSkeleton";

const PipelineGlobe = dynamic(
  () => import("@/components/PipelineGlobe").then((mod) => mod.PipelineGlobe),
  {
    ssr: false,
    loading: () => <PipelineGlobeSkeleton />,
  }
);

export default function PipelineMapPage() {
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Pipeline Map</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Interactive 3D Earth Globe, location search, and public utility vector visualization.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="badge-demo">3D WEBGL GLOBE</span>
          <span className="badge-demo">GLOBAL SEARCH</span>
          <span className="badge-demo">PUBLIC MAP DATA</span>
        </div>
      </div>

      <PipelineGlobe />

      <div className="rounded-xl border border-orange-200 bg-orange-50 p-4 text-xs font-semibold leading-5 text-orange-950 dark:border-orange-900 dark:bg-orange-950/30 dark:text-orange-100">
        <strong>Important Notice:</strong> Global pipeline results are based on publicly mapped OpenStreetMap data.
        Coverage may be incomplete, outdated or unavailable. Underground utility records must be verified with the relevant local authority or utility company.
      </div>
    </div>
  );
}
