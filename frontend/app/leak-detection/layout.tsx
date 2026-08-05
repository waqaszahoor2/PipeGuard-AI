import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Leak Detection | PipeGuard AI",
  description: "Hydro-dynamic anomaly evaluation, pressure variation simulation, and vulnerability calculation."
};

export default function LeakDetectionLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
