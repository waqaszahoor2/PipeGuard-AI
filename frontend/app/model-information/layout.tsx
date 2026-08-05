import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Model Information",
  description: "Machine learning model card, event-aware temporal splitting methodology, and reproducible evaluation metrics."
};

export default function ModelInformationLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
