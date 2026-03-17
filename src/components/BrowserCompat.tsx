"use client";

import { motion } from "framer-motion";
import { AlertTriangle, Monitor } from "lucide-react";
import type { BrowserCompatReport } from "@/lib/browserCompat";

interface BrowserCompatProps {
  report: BrowserCompatReport;
}

export function BrowserCompat({ report }: BrowserCompatProps) {
  if (report.warnings.length === 0) return null;

  const isCritical = !report.isSupported;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className={`
        w-full rounded-lg p-5 border
        ${
          isCritical
            ? "border-ev-danger/30 bg-red-500/5"
            : "border-yellow-500/20 bg-yellow-500/5"
        }
      `}
    >
      <div className="flex items-start gap-3">
        {isCritical ? (
          <AlertTriangle
            className="w-5 h-5 text-ev-danger shrink-0 mt-0.5"
            strokeWidth={1.5}
          />
        ) : (
          <Monitor
            className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5"
            strokeWidth={1.5}
          />
        )}
        <div className="space-y-2">
          <p
            className={`font-sora text-sm font-medium ${
              isCritical ? "text-ev-danger" : "text-yellow-500"
            }`}
          >
            {isCritical
              ? "Browser Not Supported"
              : "Limited Browser Support"}
          </p>
          <ul className="space-y-1">
            {report.warnings.map((warning, index) => (
              <li
                key={index}
                className="text-xs text-ev-text-muted leading-relaxed"
              >
                {warning}
              </li>
            ))}
          </ul>
          {isCritical && (
            <p className="text-xs text-ev-text-muted mt-2">
              Please use a recent version of Chrome, Edge, or Firefox for the
              best experience.
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
