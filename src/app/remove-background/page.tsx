"use client";

import { useCallback, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { RotateCcw, X } from "lucide-react";
import { useBackgroundRemoval } from "@/hooks/useBackgroundRemoval";
import { detectBrowserCompat, type BrowserCompatReport } from "@/lib/browserCompat";
import { DropZone } from "@/components/DropZone";
import { ProgressBar } from "@/components/ProgressBar";
import { BeforeAfterSlider } from "@/components/BeforeAfterSlider";
import { DownloadButton } from "@/components/DownloadButton";
import { BrowserCompat } from "@/components/BrowserCompat";
import { ToolLayout } from "@/components/ToolLayout";

export default function RemoveBackgroundPage() {
  const {
    state,
    progress,
    stage,
    originalUrl,
    resultUrl,
    resultBlob,
    error,
    processImage,
    reset,
    cancel,
  } = useBackgroundRemoval();

  const [compatReport] = useState<BrowserCompatReport>(() => detectBrowserCompat());

  const handleFileAccepted = useCallback(
    (file: File) => {
      processImage(file);
    },
    [processImage]
  );

  return (
    <ToolLayout
      title="Remove Background"
      description="AI-powered background removal that runs entirely on your device."
    >

      {compatReport && compatReport.warnings.length > 0 && (
        <BrowserCompat report={compatReport} />
      )}


      <AnimatePresence mode="wait">

        {state === "idle" && (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <DropZone onFileAccepted={handleFileAccepted} />
          </motion.div>
        )}


        {state === "validating" && (
          <motion.div
            key="validating"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="glass-panel rounded-lg p-8 flex items-center justify-center"
          >
            <div className="flex items-center gap-3 text-ev-text-muted">
              <div className="w-4 h-4 border-2 border-ev-accent/30 border-t-ev-accent rounded-full animate-spin" />
              <span className="font-sora text-sm">Validating file…</span>
            </div>
          </motion.div>
        )}


        {state === "processing" && (
          <motion.div
            key="processing"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-6"
          >
            {originalUrl && (
              <div
                className="rounded-lg overflow-hidden bg-ev-surface flex items-center justify-center"
                style={{ maxHeight: "400px" }}
              >
                <img
                  src={originalUrl}
                  alt="Processing"
                  className="w-full h-auto opacity-60"
                  style={{ maxHeight: "400px", objectFit: "contain" }}
                />
              </div>
            )}

            <div className="glass-panel rounded-lg p-6 space-y-4">
              <ProgressBar progress={progress} stage={stage} />
              <button
                onClick={cancel}
                className="
                  inline-flex items-center gap-1.5 
                  text-xs text-ev-text-muted hover:text-ev-text
                  transition-colors duration-200
                "
              >
                <X className="w-3 h-3" strokeWidth={2} />
                Cancel
              </button>
            </div>
          </motion.div>
        )}


        {state === "complete" && originalUrl && resultUrl && (
          <motion.div
            key="complete"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-6"
          >
            <BeforeAfterSlider
              beforeSrc={originalUrl}
              afterSrc={resultUrl}
            />

            <div className="flex items-center justify-between gap-4 flex-wrap">
              {resultBlob && <DownloadButton blob={resultBlob} />}

              <button
                onClick={reset}
                className="
                  inline-flex items-center gap-2 
                  px-5 py-3 rounded-lg
                  border border-ev-border text-ev-text-muted
                  font-sora text-sm
                  transition-colors duration-200
                  hover:border-ev-accent/30 hover:text-ev-text
                "
              >
                <RotateCcw className="w-3.5 h-3.5" strokeWidth={2} />
                New Image
              </button>
            </div>
          </motion.div>
        )}


        {state === "error" && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-4"
          >
            <div className="rounded-lg border border-ev-danger/30 bg-red-500/5 p-6">
              <p className="font-sora text-sm text-ev-danger mb-1">
                Processing Failed
              </p>
              <p className="text-xs text-ev-text-muted">{error}</p>
            </div>
            <button
              onClick={reset}
              className="
                inline-flex items-center gap-2 
                px-5 py-3 rounded-lg
                border border-ev-border text-ev-text-muted
                font-sora text-sm
                transition-colors duration-200
                hover:border-ev-accent/30 hover:text-ev-text
              "
            >
              <RotateCcw className="w-3.5 h-3.5" strokeWidth={2} />
              Try Again
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </ToolLayout>
  );
}
