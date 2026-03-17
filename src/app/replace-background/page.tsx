"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { RotateCcw, Download } from "lucide-react";
import { useBackgroundRemoval } from "@/hooks/useBackgroundRemoval";
import { detectBrowserCompat, type BrowserCompatReport } from "@/lib/browserCompat";
import { DropZone } from "@/components/DropZone";
import { ProgressBar } from "@/components/ProgressBar";
import { BrowserCompat } from "@/components/BrowserCompat";
import { ToolLayout } from "@/components/ToolLayout";
import { downloadBlob, generateFilename } from "@/lib/imageUtils";

const PRESET_COLORS = [
  "#FFFFFF", "#000000", "#1a1a2e", "#0f3460",
  "#e94560", "#16c79a", "#f5c542", "#5c5470",
];

export default function ReplaceBackgroundPage() {
  const {
    state,
    progress,
    stage,
    originalUrl,
    resultUrl,
    error,
    processImage,
    reset,
    cancel,
  } = useBackgroundRemoval();

  const [compatReport, setCompatReport] = useState<BrowserCompatReport | null>(null);
  const [bgColor, setBgColor] = useState("#FFFFFF");
  const [bgImage, setBgImage] = useState<string | null>(null);
  const [compositeUrl, setCompositeUrl] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    setCompatReport(detectBrowserCompat());
  }, []);

  const handleFileAccepted = useCallback(
    (file: File) => {
      setBgImage(null);
      setCompositeUrl(null);
      processImage(file);
    },
    [processImage]
  );

  const handleBgImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setBgImage(url);
    }
  };

  // Composite foreground onto background whenever settings change
  useEffect(() => {
    if (!resultUrl) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const fg = new Image();
    fg.crossOrigin = "anonymous";
    fg.onload = () => {
      canvas.width = fg.width;
      canvas.height = fg.height;

      if (bgImage) {
        const bg = new Image();
        bg.crossOrigin = "anonymous";
        bg.onload = () => {
          ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);
          ctx.drawImage(fg, 0, 0);
          setCompositeUrl(canvas.toDataURL("image/png"));
        };
        bg.src = bgImage;
      } else {
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(fg, 0, 0);
        setCompositeUrl(canvas.toDataURL("image/png"));
      }
    };
    fg.src = resultUrl;
  }, [resultUrl, bgColor, bgImage]);

  const handleDownload = async () => {
    if (!compositeUrl) return;
    const res = await fetch(compositeUrl);
    const blob = await res.blob();
    await downloadBlob(blob, generateFilename());
  };

  const handleReset = () => {
    if (bgImage) URL.revokeObjectURL(bgImage);
    setBgImage(null);
    setCompositeUrl(null);
    reset();
  };

  return (
    <ToolLayout
      title="Replace Background"
      description="Remove the background and replace it with a solid color or custom image."
    >
      <canvas ref={canvasRef} className="hidden" />

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
            transition={{ duration: 0.3 }}
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
            className="space-y-6"
          >
            <div className="glass-panel rounded-lg p-6 space-y-4">
              <ProgressBar progress={progress} stage={stage} />
              <button
                onClick={cancel}
                className="inline-flex items-center gap-1.5 text-xs text-ev-text-muted hover:text-ev-text transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}

        {state === "complete" && compositeUrl && (
          <motion.div
            key="complete"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-6"
          >

            <div
              className="rounded-lg overflow-hidden bg-ev-surface flex items-center justify-center"
              style={{ maxHeight: "400px" }}
            >
              <img
                src={compositeUrl}
                alt="Result"
                className="w-full h-auto"
                style={{ maxHeight: "400px", objectFit: "contain" }}
              />
            </div>


            <div className="glass-panel rounded-lg p-5 space-y-4">
              <p className="font-sora text-xs text-ev-text-muted uppercase tracking-wider">
                Background
              </p>


              <div className="flex items-center gap-2 flex-wrap">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => { setBgColor(c); setBgImage(null); }}
                    className={`w-8 h-8 rounded-lg border-2 transition-all duration-150 ${
                      bgColor === c && !bgImage
                        ? "border-ev-accent scale-110"
                        : "border-ev-border hover:border-ev-text-muted"
                    }`}
                    style={{ backgroundColor: c }}
                    title={c}
                  />
                ))}


                <label className="w-8 h-8 rounded-lg border-2 border-ev-border hover:border-ev-text-muted overflow-hidden cursor-pointer relative">
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => { setBgColor(e.target.value); setBgImage(null); }}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <div className="w-full h-full" style={{ background: "conic-gradient(red, yellow, lime, aqua, blue, magenta, red)" }} />
                </label>
              </div>


              <div>
                <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-ev-border text-xs text-ev-text-muted hover:border-ev-accent/30 hover:text-ev-text cursor-pointer transition-colors">
                  <input
                    type="file"
                    accept="image/png,image/jpeg"
                    onChange={handleBgImageUpload}
                    className="hidden"
                  />
                  Upload background image
                </label>
              </div>
            </div>


            <div className="flex items-center justify-between gap-4 flex-wrap">
              <button
                onClick={handleDownload}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-ev-accent text-ev-dark font-sora text-sm font-medium hover:bg-ev-accent-bright transition-colors"
              >
                <Download className="w-4 h-4" strokeWidth={2} />
                Download PNG
              </button>

              <button
                onClick={handleReset}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-lg border border-ev-border text-ev-text-muted font-sora text-sm hover:border-ev-accent/30 hover:text-ev-text transition-colors"
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
            className="space-y-4"
          >
            <div className="rounded-lg border border-ev-danger/30 bg-red-500/5 p-6">
              <p className="font-sora text-sm text-ev-danger mb-1">Processing Failed</p>
              <p className="text-xs text-ev-text-muted">{error}</p>
            </div>
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-lg border border-ev-border text-ev-text-muted font-sora text-sm hover:border-ev-accent/30 hover:text-ev-text transition-colors"
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
