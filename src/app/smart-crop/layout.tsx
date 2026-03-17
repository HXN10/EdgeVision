import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Smart Crop",
  description: "Crop images to preset aspect ratios for Instagram, YouTube, Stories, or draw a custom selection. Runs locally.",
};
export default function Layout({ children }: { children: React.ReactNode }) { return children; }
