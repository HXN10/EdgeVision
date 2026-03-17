import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Remove Background",
  description: "AI-powered background removal that runs 100% locally in your browser. No uploads, no servers.",
};
export default function Layout({ children }: { children: React.ReactNode }) { return children; }
