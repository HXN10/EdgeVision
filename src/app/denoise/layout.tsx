import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Denoise",
  description: "Reduce grain and noise from photos while preserving edges and detail. Runs 100% locally in your browser.",
};
export default function Layout({ children }: { children: React.ReactNode }) { return children; }
