"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { RotateCcw, Download } from "lucide-react";
import { DropZone } from "@/components/DropZone";
import { ToolLayout } from "@/components/ToolLayout";
import { downloadBlob, generateFilename, createObjectURL, revokeObjectURL } from "@/lib/imageUtils";

export default function UpscalePage() {
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [scale, setScale] = useState(2);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState({ original: { w: 0, h: 0 }, upscaled: { w: 0, h: 0 } });
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileAccepted = useCallback((file: File) => {
    const url = createObjectURL(file);
    setOriginalUrl(url);

    const img = new Image();
    img.onload = () => setDimensions((d) => ({ ...d, original: { w: img.width, h: img.height } }));
    img.src = url;
  }, []);

  useEffect(() => {
    if (!originalUrl) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      const newW = img.width * scale;
      const newH = img.height * scale;
      canvas.width = newW;
      canvas.height = newH;

      // High-quality upscale
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, newW, newH);

      // Sharpening pass (unsharp mask)
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = newW;
      tempCanvas.height = newH;
      const tempCtx = tempCanvas.getContext("2d")!;
      tempCtx.filter = "blur(1px)";
      tempCtx.drawImage(canvas, 0, 0);
      tempCtx.filter = "none";

      const origData = ctx.getImageData(0, 0, newW, newH);
      const blurData = tempCtx.getImageData(0, 0, newW, newH);
      const amount = 0.4;

      for (let i = 0; i < origData.data.length; i += 4) {
        origData.data[i] = Math.min(255, Math.max(0, origData.data[i]! + amount * (origData.data[i]! - blurData.data[i]!)));
        origData.data[i + 1] = Math.min(255, Math.max(0, origData.data[i + 1]! + amount * (origData.data[i + 1]! - blurData.data[i + 1]!)));
        origData.data[i + 2] = Math.min(255, Math.max(0, origData.data[i + 2]! + amount * (origData.data[i + 2]! - blurData.data[i + 2]!)));
      }
      ctx.putImageData(origData, 0, 0);

      setDimensions((d) => ({ ...d, upscaled: { w: newW, h: newH } }));

      if (previewUrl) URL.revokeObjectURL(previewUrl);
      canvas.toBlob((blob) => {
        if (blob) setPreviewUrl(URL.createObjectURL(blob));
      }, "image/png");
    };
    img.src = originalUrl;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [originalUrl, scale]);

  const handleDownload = async () => {
    if (!previewUrl) return;
    const res = await fetch(previewUrl);
    const blob = await res.blob();
    await downloadBlob(blob, generateFilename());
  };

  const handleReset = () => {
    if (originalUrl) revokeObjectURL(originalUrl);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setOriginalUrl(null);
    setPreviewUrl(null);
    setDimensions({ original: { w: 0, h: 0 }, upscaled: { w: 0, h: 0 } });
  };

  return (
    <ToolLayout
      title="Upscale"
      description="Enlarge images with high-quality interpolation and sharpening."
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
              style={{ maxHeight: "400px" }}
            >
              <img
                src={previewUrl}
                alt="Upscaled"
                className="w-full h-auto"
                style={{ maxHeight: "400px", objectFit: "contain" }}
              />
            </div>


            <div className="glass-panel rounded-lg p-5">
              <div className="flex items-center justify-between text-sm">
                <div>
                  <span className="text-ev-text-muted">Original: </span>
                  <span className="text-ev-text-bright font-mono">
                    {dimensions.original.w} × {dimensions.original.h}
                  </span>
                </div>
                <span className="text-ev-text-muted">→</span>
                <div>
                  <span className="text-ev-text-muted">Upscaled: </span>
                  <span className="text-ev-accent font-mono">
                    {dimensions.upscaled.w} × {dimensions.upscaled.h}
                  </span>
                </div>
              </div>
            </div>


            <div className="glass-panel rounded-lg p-5">
              <p className="font-sora text-xs text-ev-text-muted uppercase tracking-wider mb-3">
                Scale Factor
              </p>
              <div className="flex gap-2">
                {[2, 3, 4].map((s) => (
                  <button
                    key={s}
                    onClick={() => setScale(s)}
                    className={`px-4 py-2 rounded-lg text-sm font-sora font-medium transition-colors ${
                      scale === s
                        ? "bg-ev-accent/15 text-ev-accent border border-ev-accent/30"
                        : "border border-ev-border text-ev-text-muted hover:border-ev-accent/30"
                    }`}
                  >
                    {s}×
                  </button>
                ))}
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
      </AnimatePresence>
    </ToolLayout>
  );
}
