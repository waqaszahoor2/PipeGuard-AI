import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About | PipeGuard AI",
  description: "PipeGuard AI research project background, architectural design, data provenance, and engineering team."
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
