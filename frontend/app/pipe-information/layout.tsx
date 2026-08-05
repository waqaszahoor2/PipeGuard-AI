import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pipe Information | PipeGuard AI",
  description: "Comprehensive municipal pipeline telemetry inventory, filtering, and telemetry records."
};

export default function PipeInformationLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
