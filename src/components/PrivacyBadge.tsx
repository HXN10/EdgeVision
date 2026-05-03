"use client";

import { Shield } from "lucide-react";

export function PrivacyBadge() {
  return (
    <div className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur">
      <Shield className="w-3 h-3 text-ev-accent" strokeWidth={2} />
      <span className="text-[11px] font-sora font-medium tracking-[0.16em] text-ev-accent uppercase">
        100% Private
      </span>
    </div>
  );
}
