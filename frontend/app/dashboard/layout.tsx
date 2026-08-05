import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard | PipeGuard AI",
  description: "Municipal pipeline telemetry monitoring, hydro-dynamic anomaly calculation, and risk distribution overview."
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
