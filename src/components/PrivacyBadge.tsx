"use client";

import { Shield } from "lucide-react";

export function PrivacyBadge() {
  return (
    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-ev-accent-muted border border-ev-accent/20">
      <Shield className="w-3 h-3 text-ev-accent" strokeWidth={2} />
      <span className="text-[11px] font-sora font-medium tracking-wide text-ev-accent">
        100% Private
      </span>
    </div>
  );
}
