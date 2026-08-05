import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pipeline Map | PipeGuard AI",
  description: "Interactive geospatial pipeline risk map, spatial inspector, and asset filtering engine."
};

export default function PipelineMapLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
