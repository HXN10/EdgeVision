import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Auto Enhance",
  description: "One-click photo enhancement with brightness, contrast, saturation, sharpness, and warmth sliders. Runs locally.",
};
export default function Layout({ children }: { children: React.ReactNode }) { return children; }
