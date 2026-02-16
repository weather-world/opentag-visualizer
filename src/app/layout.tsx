import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OpenTag Visualizer — LoL Esports Tag System",
  description: "Interactive visualization of the OpenTag system for LoL esports analysis. 218 entities, 4,506 tags, 141 auto-discovered patterns.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
