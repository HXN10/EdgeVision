"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { RotateCcw, Wand2, MousePointer, Eraser, Check } from "lucide-react";
import { useObjectRemoval } from "@/hooks/useObjectRemoval";
import { DropZone } from "@/components/DropZone";
import { ProgressBar } from "@/components/ProgressBar";
import { BeforeAfterSlider } from "@/components/BeforeAfterSlider";
import { DownloadButton } from "@/components/DownloadButton";
import { ToolLayout } from "@/components/ToolLayout";
import { SAMCanvas } from "@/components/remove-object/SAMCanvas";

export default function RemoveObjectPage() {
  const {
    state,
    progress,
    stage,
    originalUrl,
    resultUrl,
    resultBlob,
    error,
    maskDataUrl,
    processImage,
    applyInpainting,
    reset,
    cancel,
    hasMask,
  } = useObjectRemoval();

  const handleFileAccepted = useCallback(
    (file: File) => {
      processImage(file);
    },
    [processImage]
  );

  const handleRemoveObject = useCallback(() => {
    applyInpainting();
  }, [applyInpainting]);

  return (
    <ToolLayout
      title="Remove Object"
      description="Click on an object to select it, then let AI remove and fill the space."
    >
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

        {state === "selecting" && originalUrl && (
          <motion.div
            key="selecting"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-6"
          >
            <div className="rounded-lg overflow-hidden bg-ev-surface">
              <SAMCanvas
                imageUrl={originalUrl}
                onMaskCreated={(maskUrl) => {
                  // Mask is handled internally
                }}
              />
            </div>

            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-2 text-sm text-ev-text-muted">
                <MousePointer className="w-4 h-4" />
                <span>Click on the object you want to remove</span>
              </div>

              <div className="flex items-center gap-3">
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

                <button
                  onClick={handleRemoveObject}
                  disabled={!hasMask}
                  className="
                    inline-flex items-center gap-2 
                    px-7 py-3 rounded-lg
                    bg-ev-accent text-ev-black
                    font-sora text-sm font-medium
                    transition-all duration-200
                    disabled:opacity-50 disabled:cursor-not-allowed
                    hover:bg-ev-accent/90
                  "
                >
                  <Eraser className="w-4 h-4" strokeWidth={2} />
                  Remove Object
                </button>
              </div>
            </div>

            <div className="text-xs text-ev-text-muted flex items-center gap-2">
              <Check className="w-3 h-3 text-ev-accent" />
              <span>Click to add selection points. Right-click to remove.</span>
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
              beforeAlt="Original"
              afterAlt="Object removed"
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
