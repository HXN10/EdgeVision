"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { GlowingEffect } from "@/components/ui/glowing-effect";

interface ToolCardProps {
  href: string;
  icon: LucideIcon;
  title: string;
  description: string;
  className?: string;
}

export function ToolCard({
  href,
  icon: Icon,
  title,
  description,
  className,
}: ToolCardProps) {
  return (
    <li className={`min-h-[14rem] list-none ${className ?? ""}`}>
      <Link href={href} className="block h-full">
        <div className="relative h-full rounded-[1.25rem] border-[0.75px] border-ev-border p-2 md:rounded-[1.5rem] md:p-3">
          <GlowingEffect
            spread={40}
            glow={true}
            disabled={false}
            proximity={64}
            inactiveZone={0.01}
            borderWidth={3}
          />
          <div className="relative flex h-full flex-col justify-between gap-6 overflow-hidden rounded-xl border-[0.75px] border-ev-border bg-ev-surface/60 p-6 shadow-sm md:p-6">
            <div className="relative flex flex-1 flex-col justify-between gap-3">
              <div className="w-fit rounded-lg border-[0.75px] border-ev-border bg-ev-surface-elevated p-2">
                <Icon className="h-4 w-4 text-ev-accent" strokeWidth={1.5} />
              </div>
              <div className="space-y-3">
                <h3 className="pt-0.5 text-xl leading-[1.375rem] font-semibold font-sora tracking-[-0.04em] md:text-2xl md:leading-[1.875rem] text-ev-text-bright">
                  {title}
                </h3>
                <p className="font-sans text-sm leading-[1.125rem] md:text-base md:leading-[1.375rem] text-ev-text-muted">
                  {description}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </li>
  );
}
