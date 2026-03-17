"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { RotateCcw, Download } from "lucide-react";
import { DropZone } from "@/components/DropZone";
import { BeforeAfterSlider } from "@/components/BeforeAfterSlider";
import { ToolLayout } from "@/components/ToolLayout";
import { downloadBlob, generateFilename, createObjectURL, revokeObjectURL } from "@/lib/imageUtils";

export default function DenoisePage() {
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [intensity, setIntensity] = useState(40);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileAccepted = useCallback((file: File) => {
    const url = createObjectURL(file);
    setOriginalUrl(url);
    setIntensity(40);
  }, []);

  useEffect(() => {
    if (!originalUrl) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;

      // Step 1: Draw original
      ctx.drawImage(img, 0, 0);

      // Step 2: Get original pixel data
      const origData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      // Step 3: Draw blurred version
      const blurRadius = Math.max(0.5, (intensity / 100) * 3);
      ctx.filter = `blur(${blurRadius}px)`;
      ctx.drawImage(img, 0, 0);
      ctx.filter = "none";

      // Step 4: Edge-preserving blend — keep edges sharp
      const blurData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const blend = intensity / 100;

      for (let i = 0; i < origData.data.length; i += 4) {
        const rDiff = Math.abs(origData.data[i]! - blurData.data[i]!);
        const gDiff = Math.abs(origData.data[i + 1]! - blurData.data[i + 1]!);
        const bDiff = Math.abs(origData.data[i + 2]! - blurData.data[i + 2]!);
        const edgeStrength = (rDiff + gDiff + bDiff) / (3 * 255);

        // Reduce blending on edges to preserve detail
        const localBlend = blend * (1 - Math.min(1, edgeStrength * 4));

        origData.data[i] = Math.round(origData.data[i]! * (1 - localBlend) + blurData.data[i]! * localBlend);
        origData.data[i + 1] = Math.round(origData.data[i + 1]! * (1 - localBlend) + blurData.data[i + 1]! * localBlend);
        origData.data[i + 2] = Math.round(origData.data[i + 2]! * (1 - localBlend) + blurData.data[i + 2]! * localBlend);
      }

      ctx.putImageData(origData, 0, 0);

      if (previewUrl) URL.revokeObjectURL(previewUrl);
      canvas.toBlob((blob) => {
        if (blob) setPreviewUrl(URL.createObjectURL(blob));
      }, "image/png");
    };
    img.src = originalUrl;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [originalUrl, intensity]);

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
  };

  return (
    <ToolLayout
      title="Denoise"
      description="Reduce grain and noise while preserving edges and detail."
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

            <BeforeAfterSlider
              beforeSrc={originalUrl}
              afterSrc={previewUrl}
              beforeAlt="Original (noisy)"
              afterAlt="Denoised"
            />


            <div className="glass-panel rounded-lg p-5 space-y-3">
              <div className="flex items-center justify-between">
                <p className="font-sora text-xs text-ev-text-muted uppercase tracking-wider">
                  Intensity
                </p>
                <span className="text-xs text-ev-text-bright font-mono">{intensity}%</span>
              </div>
              <input
                type="range"
                min={10}
                max={100}
                value={intensity}
                onChange={(e) => setIntensity(Number(e.target.value))}
                className="w-full h-1 bg-ev-border rounded-full appearance-none cursor-pointer accent-ev-accent"
              />
              <div className="flex justify-between text-[10px] text-ev-text-muted">
                <span>Subtle</span>
                <span>Strong</span>
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
