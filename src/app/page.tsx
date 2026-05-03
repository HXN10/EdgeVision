"use client";

import { motion } from "framer-motion";
import {
  Eraser,
  ImagePlus,
  SunMedium,
  Crop,
  FileDown,
  Maximize,
  Sparkles,
} from "lucide-react";
import { PrivacyBadge } from "@/components/PrivacyBadge";
import { ToolCard } from "@/components/ToolCard";
import { ThemeToggle } from "@/components/ThemeToggle";

const tools = [
  {
    href: "/remove-background",
    icon: Eraser,
    title: "Remove Background",
    eyebrow: "cutout studio",
    description: "AI-powered background removal that runs entirely on your device.",
    gradient: "from-sky-300 via-cyan-400 to-blue-500",
    accent: "text-sky-300",
  },
  {
    href: "/replace-background",
    icon: ImagePlus,
    title: "Replace Background",
    eyebrow: "set builder",
    description: "Swap backgrounds with solid colors or your own custom images.",
    gradient: "from-fuchsia-400 via-pink-400 to-orange-300",
    accent: "text-pink-300",
  },
  {
    href: "/enhance",
    icon: SunMedium,
    title: "Auto Enhance",
    eyebrow: "color grade",
    description: "One-click brightness, contrast, and color correction with manual fine-tuning.",
    gradient: "from-amber-200 via-yellow-400 to-orange-500",
    accent: "text-amber-200",
  },
  {
    href: "/smart-crop",
    icon: Crop,
    title: "Smart Crop",
    eyebrow: "frame finder",
    description: "Preset ratios for Instagram, YouTube, Stories, and freehand selection.",
    gradient: "from-lime-300 via-emerald-400 to-teal-500",
    accent: "text-emerald-300",
  },
  {
    href: "/compress",
    icon: FileDown,
    title: "Compress",
    eyebrow: "weight room",
    description: "Reduce file size with quality, format, and dimension controls.",
    gradient: "from-violet-300 via-purple-500 to-indigo-500",
    accent: "text-violet-300",
  },
  {
    href: "/upscale",
    icon: Maximize,
    title: "Upscale",
    eyebrow: "pixel forge",
    description: "Enlarge images 2x–4x with sharpening.",
    gradient: "from-cyan-200 via-indigo-400 to-fuchsia-500",
    accent: "text-cyan-200",
  },
  {
    href: "/denoise",
    icon: Sparkles,
    title: "Denoise",
    eyebrow: "grain sweep",
    description: "Remove grain and noise from photos.",
    gradient: "from-rose-300 via-red-400 to-orange-400",
    accent: "text-rose-300",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const },
  },
};

const stagger = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

export default function Home() {
  return (
    <div className="relative min-h-dvh overflow-hidden flex flex-col">
      <div className="pointer-events-none absolute left-1/2 top-20 h-72 w-[44rem] -translate-x-1/2 rounded-full bg-gradient-to-r from-cyan-400/10 via-fuchsia-400/10 to-amber-300/10 blur-3xl" />

      <header className="relative z-10 w-full border-b border-white/10 bg-ev-black/35 backdrop-blur-xl">
        <div className="max-w-[1200px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="relative flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] shadow-[0_0_30px_rgba(125,211,252,0.18)]">
              <span className="h-3 w-3 rounded-full bg-ev-accent shadow-[0_0_20px_rgba(125,211,252,0.75)]" />
            </span>
            <span className="font-sora text-xl font-bold tracking-[-0.06em] bg-clip-text text-transparent bg-gradient-to-r from-ev-text-bright via-sky-200 to-fuchsia-200">
              EdgeVision
            </span>
          </div>
          <div className="flex items-center gap-3">
            <PrivacyBadge />
            <ThemeToggle />
          </div>
        </div>
      </header>


      <main className="relative z-10 flex-1 w-full max-w-[1200px] mx-auto px-6 py-14 md:py-20">
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="space-y-12 md:space-y-16"
        >

          <motion.div variants={fadeUp} className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 backdrop-blur">
                <span className="h-1.5 w-1.5 rounded-full bg-ev-accent shadow-[0_0_16px_rgba(125,211,252,0.8)]" />
                <span className="font-sora text-[11px] font-medium uppercase tracking-[0.24em] text-ev-text-muted">
                  local creative image lab
                </span>
              </div>

              <div className="space-y-5">
                <h1 className="max-w-[10ch] font-sora text-5xl font-semibold leading-[0.92] tracking-[-0.085em] text-ev-text-bright md:text-7xl lg:text-8xl">
                  Edit like a studio.
                  <span className="block bg-gradient-to-r from-sky-200 via-fuchsia-200 to-amber-100 bg-clip-text text-transparent">
                    Stay offline.
                  </span>
                </h1>
                <p className="max-w-[54ch] text-base leading-8 text-ev-text-muted md:text-lg">
                  A browser-native suite for quick image cuts, crops, color fixes,
                  compression, and cleanup. No upload queue. No generic dashboard chrome.
                </p>
              </div>
            </div>

            <div className="relative min-h-[18rem] overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] p-4 shadow-[0_30px_100px_rgba(0,0,0,0.3)] backdrop-blur-xl">
              <div className="absolute -left-14 top-10 h-36 w-36 rounded-full bg-fuchsia-400/30 blur-3xl" />
              <div className="absolute -right-12 -top-10 h-44 w-44 rounded-full bg-cyan-300/25 blur-3xl" />
              <div className="relative h-full min-h-[16rem] rounded-[1.5rem] border border-white/10 bg-[#0b0b12]/75 p-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-rose-300" />
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-200" />
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
                  </div>
                  <span className="font-sora text-[10px] uppercase tracking-[0.24em] text-ev-text-muted">
                    private render
                  </span>
                </div>
                <div className="grid h-[13rem] grid-cols-[0.85fr_1.15fr] gap-3 pt-4">
                  <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-sky-300/30 via-fuchsia-300/20 to-amber-200/20 p-3">
                    <div className="h-full rounded-xl bg-[radial-gradient(circle_at_35%_28%,rgba(255,255,255,0.8),transparent_12%),radial-gradient(circle_at_54%_42%,rgba(125,211,252,0.7),transparent_18%),linear-gradient(145deg,rgba(244,114,182,0.55),rgba(15,23,42,0.25))]" />
                  </div>
                  <div className="space-y-3">
                    <div className="h-16 rounded-2xl border border-white/10 bg-white/[0.05] p-3">
                      <div className="mb-2 h-1.5 w-20 rounded-full bg-cyan-200/70" />
                      <div className="h-1.5 w-full rounded-full bg-white/10">
                        <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-cyan-200 to-fuchsia-300 shadow-[0_0_18px_rgba(125,211,252,0.45)]" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="h-24 rounded-2xl border border-white/10 bg-white/[0.04]" />
                      <div className="h-24 rounded-2xl border border-white/10 bg-gradient-to-br from-amber-200/20 to-fuchsia-300/10" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>


          <motion.ul
            variants={fadeUp}
            className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:gap-5"
          >
            {tools.map((tool, i) => (
              <ToolCard
                key={tool.href}
                {...tool}
                index={i}
                className={i === tools.length - 1 ? "md:col-span-3 md:min-h-[11rem]" : ""}
              />
            ))}
          </motion.ul>


          <motion.div variants={fadeUp} className="pt-4">
            <p className="font-sora text-[11px] uppercase tracking-[0.22em] text-ev-text-muted/50 leading-relaxed">
              Powered by WebAssembly and on-device AI inference.
            </p>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}
