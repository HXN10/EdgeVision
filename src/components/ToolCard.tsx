"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { GlowingEffect } from "@/components/ui/glowing-effect";

interface ToolCardProps {
  href: string;
  icon: LucideIcon;
  title: string;
  description: string;
  eyebrow: string;
  gradient: string;
  accent: string;
  index: number;
  className?: string;
}

export function ToolCard({
  href,
  icon: Icon,
  title,
  description,
  eyebrow,
  gradient,
  accent,
  index,
  className,
}: ToolCardProps) {
  return (
    <li className={`group min-h-[15rem] list-none ${className ?? ""}`}>
      <Link href={href} className="block h-full focus-visible:rounded-[1.75rem]">
        <div className="relative h-full rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-2 shadow-[0_24px_80px_rgba(0,0,0,0.22)] transition-transform duration-300 ease-premium group-hover:-translate-y-1 md:p-3">
          <GlowingEffect
            spread={40}
            glow={true}
            disabled={false}
            proximity={64}
            inactiveZone={0.01}
            borderWidth={3}
          />
          <div className="relative flex h-full flex-col justify-between gap-8 overflow-hidden rounded-[1.25rem] border border-white/10 bg-ev-surface/72 p-6 shadow-sm backdrop-blur md:p-6">
            <div
              className={`absolute -right-12 -top-16 h-40 w-40 rounded-full bg-gradient-to-br ${gradient} opacity-35 blur-2xl transition-opacity duration-300 group-hover:opacity-60`}
            />
            <div className="absolute bottom-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />

            <div className="relative flex items-start justify-between gap-4">
              <div className={`w-fit rounded-2xl border border-white/10 bg-gradient-to-br ${gradient} p-2.5 shadow-[0_12px_30px_rgba(0,0,0,0.28)]`}>
                <Icon className="h-4 w-4 text-white" strokeWidth={1.7} />
              </div>
              <span className="font-sora text-[10px] font-medium uppercase tracking-[0.28em] text-ev-text-muted/70">
                {String(index + 1).padStart(2, "0")}
              </span>
            </div>

            <div className="relative space-y-4">
              <div className="space-y-1.5">
                <p className={`font-sora text-[10px] font-semibold uppercase tracking-[0.24em] ${accent}`}>
                  {eyebrow}
                </p>
                <h3 className="pt-0.5 font-sora text-2xl font-semibold leading-[1.85rem] tracking-[-0.055em] text-ev-text-bright md:text-[1.7rem] md:leading-[2rem]">
                  {title}
                </h3>
              </div>
              <p className="max-w-[28ch] text-sm leading-6 text-ev-text-muted md:text-[0.95rem]">
                {description}
              </p>
            </div>
          </div>
        </div>
      </Link>
    </li>
  );
}
