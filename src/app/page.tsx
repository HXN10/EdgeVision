"use client";

import { motion } from "framer-motion";
import { Cpu } from "lucide-react";
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
    description: "AI-powered background removal that runs entirely on your device.",
  },
  {
    href: "/replace-background",
    icon: ImagePlus,
    title: "Replace Background",
    description: "Swap backgrounds with solid colors or your own custom images.",
  },
  {
    href: "/enhance",
    icon: SunMedium,
    title: "Auto Enhance",
    description: "One-click brightness, contrast, and color correction with manual fine-tuning.",
  },
  {
    href: "/smart-crop",
    icon: Crop,
    title: "Smart Crop",
    description: "Preset ratios for Instagram, YouTube, Stories, and freehand selection.",
  },
  {
    href: "/compress",
    icon: FileDown,
    title: "Compress",
    description: "Reduce file size with quality, format, and dimension controls.",
  },
  {
    href: "/upscale",
    icon: Maximize,
    title: "Upscale",
    description: "Enlarge images 2x–4x with sharpening.",
  },
  {
    href: "/denoise",
    icon: Sparkles,
    title: "Denoise",
    description: "Remove grain and noise from photos.",
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
    <div className="min-h-dvh flex flex-col">

      <header className="w-full border-b border-ev-border/50">
        <div className="max-w-[1200px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-sora text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-ev-text-bright to-ev-accent">
              EdgeVision
            </span>
          </div>
          <div className="flex items-center gap-3">
            <PrivacyBadge />
            <ThemeToggle />
          </div>
        </div>
      </header>


      <main className="flex-1 w-full max-w-[1200px] mx-auto px-6 py-16 md:py-24">
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="space-y-12"
        >

          <motion.div variants={fadeUp} className="space-y-4">
            <h1 className="font-sora text-3xl md:text-4xl font-semibold tracking-tight text-ev-text-bright leading-tight">
              Image tools that run
              <br />
              <span className="text-ev-accent">in your browser</span>
            </h1>
            <p className="text-ev-text-muted text-base leading-relaxed max-w-[50ch]">
              Professional image editing powered by on-device AI.
              Nothing leaves your machine.
            </p>
          </motion.div>


          <motion.ul
            variants={fadeUp}
            className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:gap-5"
          >
            {tools.map((tool, i) => (
              <ToolCard
                key={tool.href}
                {...tool}
                className={i === tools.length - 1 ? "md:col-span-3 md:min-h-[10rem]" : ""}
              />
            ))}
          </motion.ul>


          <motion.div variants={fadeUp} className="pt-4">
            <p className="text-[11px] text-ev-text-muted/50 leading-relaxed">
              Powered by WebAssembly and on-device AI inference.
            </p>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}
