"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { RotateCcw, Download } from "lucide-react";
import { DropZone } from "@/components/DropZone";
import { ToolLayout } from "@/components/ToolLayout";
import { downloadBlob, createObjectURL, revokeObjectURL } from "@/lib/imageUtils";

type OutputFormat = "image/png" | "image/jpeg" | "image/webp";

const FORMAT_LABELS: Record<OutputFormat, string> = {
  "image/png": "PNG",
  "image/jpeg": "JPEG",
  "image/webp": "WebP",
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function CompressPage() {
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [originalSize, setOriginalSize] = useState(0);
  const [quality, setQuality] = useState(80);
  const [maxWidth, setMaxWidth] = useState(0);
  const [maxHeight, setMaxHeight] = useState(0);
  const [lockAspect, setLockAspect] = useState(true);
  const [aspectRatio, setAspectRatio] = useState(1);
  const [format, setFormat] = useState<OutputFormat>("image/jpeg");
  const [outputBlob, setOutputBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileAccepted = useCallback((file: File) => {
    const url = createObjectURL(file);
    setOriginalUrl(url);
    setOriginalSize(file.size);

    const img = new Image();
    img.onload = () => {
      setMaxWidth(img.width);
      setMaxHeight(img.height);
      setAspectRatio(img.width / img.height);
    };
    img.src = url;
  }, []);

  const handleWidthChange = (w: number) => {
    setMaxWidth(w);
    if (lockAspect && aspectRatio > 0) {
      setMaxHeight(Math.round(w / aspectRatio));
    }
  };

  const handleHeightChange = (h: number) => {
    setMaxHeight(h);
    if (lockAspect && aspectRatio > 0) {
      setMaxWidth(Math.round(h * aspectRatio));
    }
  };

  // Recompress whenever settings change
  useEffect(() => {
    if (!originalUrl || maxWidth === 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      canvas.width = maxWidth;
      canvas.height = maxHeight;
      ctx.drawImage(img, 0, 0, maxWidth, maxHeight);

      const qualityValue = format === "image/png" ? undefined : quality / 100;
      canvas.toBlob(
        (blob) => {
          if (blob) {
            setOutputBlob(blob);
            if (previewUrl) URL.revokeObjectURL(previewUrl);
            setPreviewUrl(URL.createObjectURL(blob));
          }
        },
        format,
        qualityValue
      );
    };
    img.src = originalUrl;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [originalUrl, quality, maxWidth, maxHeight, format]);

  const handleDownload = async () => {
    if (!outputBlob) return;
    const ext = format === "image/jpeg" ? "jpg" : format === "image/webp" ? "webp" : "png";
    const filename = `edgevision-${Date.now()}.${ext}`;
    await downloadBlob(outputBlob, filename);
  };

  const handleReset = () => {
    if (originalUrl) revokeObjectURL(originalUrl);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setOriginalUrl(null);
    setPreviewUrl(null);
    setOutputBlob(null);
    setOriginalSize(0);
    setQuality(80);
  };

  const savings = outputBlob ? Math.max(0, Math.round((1 - outputBlob.size / originalSize) * 100)) : 0;

  return (
    <ToolLayout
      title="Compress"
      description="Reduce image file size with quality, format, and dimension controls."
    >
      <canvas ref={canvasRef} className="hidden" />

      <AnimatePresence mode="wait">
        {!originalUrl && (
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

        {originalUrl && previewUrl && (
          <motion.div
            key="editor"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-6"
          >

            <div
              className="rounded-lg overflow-hidden bg-ev-surface flex items-center justify-center"
              style={{ maxHeight: "300px" }}
            >
              <img
                src={previewUrl}
                alt="Compressed"
                className="w-full h-auto"
                style={{ maxHeight: "300px", objectFit: "contain" }}
              />
            </div>


            <div className="glass-panel rounded-lg p-5">
              <div className="flex items-center justify-between text-sm">
                <div>
                  <span className="text-ev-text-muted">Original: </span>
                  <span className="text-ev-text-bright font-mono">{formatBytes(originalSize)}</span>
                </div>
                <div>
                  <span className="text-ev-text-muted">Output: </span>
                  <span className="text-ev-accent font-mono">
                    {outputBlob ? formatBytes(outputBlob.size) : "—"}
                  </span>
                </div>
                {savings > 0 && (
                  <span className="text-xs px-2 py-0.5 rounded bg-ev-accent/10 text-ev-accent font-sora">
                    −{savings}%
                  </span>
                )}
              </div>
            </div>


            <div className="glass-panel rounded-lg p-5 space-y-5">

              <div>
                <p className="font-sora text-xs text-ev-text-muted uppercase tracking-wider mb-2">
                  Format
                </p>
                <div className="flex gap-2">
                  {(Object.entries(FORMAT_LABELS) as [OutputFormat, string][]).map(([f, label]) => (
                    <button
                      key={f}
                      onClick={() => setFormat(f)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-sora transition-colors ${
                        format === f
                          ? "bg-ev-accent/15 text-ev-accent border border-ev-accent/30"
                          : "border border-ev-border text-ev-text-muted hover:border-ev-accent/30"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>


              {format !== "image/png" && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-ev-text-muted">Quality</span>
                    <span className="text-xs text-ev-text-bright font-mono">{quality}%</span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={100}
                    value={quality}
                    onChange={(e) => setQuality(Number(e.target.value))}
                    className="w-full h-1 bg-ev-border rounded-full appearance-none cursor-pointer accent-ev-accent"
                  />
                </div>
              )}


              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="font-sora text-xs text-ev-text-muted uppercase tracking-wider">
                    Dimensions
                  </p>
                  <label className="flex items-center gap-1.5 text-xs text-ev-text-muted cursor-pointer">
                    <input
                      type="checkbox"
                      checked={lockAspect}
                      onChange={(e) => setLockAspect(e.target.checked)}
                      className="accent-ev-accent"
                    />
                    Lock ratio
                  </label>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <label className="text-[10px] text-ev-text-muted uppercase">W</label>
                    <input
                      type="number"
                      value={maxWidth}
                      onChange={(e) => handleWidthChange(Number(e.target.value))}
                      className="w-full mt-1 px-3 py-2 rounded-lg bg-ev-dark border border-ev-border text-sm text-ev-text-bright font-mono focus:border-ev-accent/50 outline-none"
                    />
                  </div>
                  <span className="text-ev-text-muted text-sm mt-4">×</span>
                  <div className="flex-1">
                    <label className="text-[10px] text-ev-text-muted uppercase">H</label>
                    <input
                      type="number"
                      value={maxHeight}
                      onChange={(e) => handleHeightChange(Number(e.target.value))}
                      className="w-full mt-1 px-3 py-2 rounded-lg bg-ev-dark border border-ev-border text-sm text-ev-text-bright font-mono focus:border-ev-accent/50 outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>


            <div className="flex items-center justify-between gap-4 flex-wrap">
              <button
                onClick={handleDownload}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-ev-accent text-ev-dark font-sora text-sm font-medium hover:bg-ev-accent-bright transition-colors"
              >
                <Download className="w-4 h-4" strokeWidth={2} />
                Download
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
      </AnimatePresence>
    </ToolLayout>
  );
}
