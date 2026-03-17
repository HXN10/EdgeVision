"use client";

import { motion } from "framer-motion";

interface ProgressBarProps {
  progress: number;
  stage: string;
}

export function ProgressBar({ progress, stage }: ProgressBarProps) {
  return (
    <div className="w-full space-y-3">
      <div className="flex items-center justify-between">
        <span className="font-sora text-xs tracking-wide text-ev-text-muted uppercase">
          {stage}
        </span>
        <span className="font-sora text-xs text-ev-accent tabular-nums">
          {progress}%
        </span>
      </div>

      <div className="relative h-1.5 w-full rounded-full bg-ev-surface overflow-hidden">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full bg-ev-accent"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        />

        {/* Glow effect on the leading edge */}
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          style={{
            boxShadow: "4px 0 12px rgba(6, 182, 212, 0.5), 0 0 6px rgba(6, 182, 212, 0.3)",
          }}
        />
      </div>
    </div>
  );
}
