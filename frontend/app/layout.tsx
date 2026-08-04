import type { Metadata } from "next";
import "leaflet/dist/leaflet.css";
import "./globals.css";
import { Shell } from "@/components/Shell";
import { ThemeProvider } from "@/components/ThemeProvider";

export const metadata: Metadata = {
  title: {
    default: "PipeGuard AI",
    template: "%s | PipeGuard AI"
  },
  description: "Water leak detection and pipeline inspection support research prototype."
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
