import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Upscale",
  description: "Enlarge images 2x to 4x with high-quality interpolation and sharpening. Runs 100% locally.",
};
export default function Layout({ children }: { children: React.ReactNode }) { return children; }
