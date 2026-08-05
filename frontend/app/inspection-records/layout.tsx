import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Inspection Records | PipeGuard AI",
  description: "Technician field inspection logs, acoustic log findings, work orders, and demo authorization workflows."
};

export default function InspectionRecordsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
