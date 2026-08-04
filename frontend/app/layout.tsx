import type { Metadata } from "next";
import "leaflet/dist/leaflet.css";
import "./globals.css";
import { Shell } from "@/components/Shell";
import { ThemeProvider } from "@/components/ThemeProvider";

export const metadata: Metadata = {
  title: {
    default: "PipeGuard AI | Pipeline Anomaly & Risk Detection Platform",
    template: "%s | PipeGuard AI"
  },
  description:
    "Municipal pipeline telemetry monitoring, hydro-dynamic anomaly calculation, and technician inspection workflow platform research prototype.",
  keywords: [
    "PipeGuard AI",
    "Pipeline Leak Detection",
    "Municipal Water Monitoring",
    "Telemetry Anomaly Detection",
    "Hydro-dynamic Telemetry",
    "BattLeDIM Benchmark",
    "Calgary Water Mains"
  ],
  authors: [{ name: "PipeGuard AI Engineering Team" }],
  metadataBase: new URL("https://pipe-guard-ai.vercel.app"),
  openGraph: {
    title: "PipeGuard AI | Pipeline Telemetry & Risk Analytics",
    description: "Municipal pipeline telemetry monitoring, anomaly calculation, and technician inspection research prototype.",
    url: "https://pipe-guard-ai.vercel.app",
    siteName: "PipeGuard AI",
    locale: "en_US",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "PipeGuard AI | Pipeline Monitoring Platform",
    description: "Hydro-dynamic anomaly calculation and technician inspection workflow research prototype."
  },
  robots: {
    index: true,
    follow: true
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <Shell>{children}</Shell>
        </ThemeProvider>
      </body>
    </html>
  );
}
