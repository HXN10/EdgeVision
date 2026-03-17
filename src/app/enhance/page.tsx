"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { RotateCcw, Download, Wand2 } from "lucide-react";
import { DropZone } from "@/components/DropZone";
import { ToolLayout } from "@/components/ToolLayout";
import { downloadBlob, generateFilename, createObjectURL, revokeObjectURL } from "@/lib/imageUtils";

interface Adjustments {
  brightness: number;
  contrast: number;
  saturation: number;
  sharpness: number;
  warmth: number;
}

const DEFAULT: Adjustments = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
  sharpness: 0,
  warmth: 0,
};

const AUTO: Adjustments = {
  brightness: 108,
  contrast: 112,
  saturation: 115,
  sharpness: 30,
  warmth: 5,
};

const SLIDERS: { key: keyof Adjustments; label: string; min: number; max: number; unit: string }[] = [
  { key: "brightness", label: "Brightness", min: 50, max: 150, unit: "%" },
  { key: "contrast", label: "Contrast", min: 50, max: 150, unit: "%" },
  { key: "saturation", label: "Saturation", min: 0, max: 200, unit: "%" },
  { key: "sharpness", label: "Sharpness", min: 0, max: 100, unit: "" },
  { key: "warmth", label: "Warmth", min: -30, max: 30, unit: "" },
];

export default function EnhancePage() {
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [adjustments, setAdjustments] = useState<Adjustments>({ ...DEFAULT });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileAccepted = useCallback((file: File) => {
    setOriginalFile(file);
    const url = createObjectURL(file);
    setOriginalUrl(url);
    setAdjustments({ ...DEFAULT });
  }, []);

  // Apply adjustments whenever they change
  useEffect(() => {
    if (!originalUrl || !originalFile) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;

      // Apply CSS-like filters
      ctx.filter = `brightness(${adjustments.brightness}%) contrast(${adjustments.contrast}%) saturate(${adjustments.saturation}%)`;
      ctx.drawImage(img, 0, 0);
      ctx.filter = "none";

      // Apply warmth via pixel manipulation
      if (adjustments.warmth !== 0) {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        const w = adjustments.warmth;
        for (let i = 0; i < data.length; i += 4) {
          data[i] = Math.min(255, Math.max(0, data[i]! + w));         // R
          data[i + 2] = Math.min(255, Math.max(0, data[i + 2]! - w)); // B
        }
        ctx.putImageData(imageData, 0, 0);
      }

      // Apply sharpness via unsharp mask
      if (adjustments.sharpness > 0) {
        const amount = adjustments.sharpness / 100;
        const tempCanvas = document.createElement("canvas");
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        const tempCtx = tempCanvas.getContext("2d")!;
        tempCtx.filter = `blur(1px)`;
        tempCtx.drawImage(canvas, 0, 0);
        tempCtx.filter = "none";

        // Blend: original + amount * (original - blurred)
        const origData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const blurData = tempCtx.getImageData(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < origData.data.length; i += 4) {
          origData.data[i] = Math.min(255, Math.max(0, origData.data[i]! + amount * (origData.data[i]! - blurData.data[i]!)));
          origData.data[i + 1] = Math.min(255, Math.max(0, origData.data[i + 1]! + amount * (origData.data[i + 1]! - blurData.data[i + 1]!)));
          origData.data[i + 2] = Math.min(255, Math.max(0, origData.data[i + 2]! + amount * (origData.data[i + 2]! - blurData.data[i + 2]!)));
        }
        ctx.putImageData(origData, 0, 0);
      }

      setPreviewUrl(canvas.toDataURL("image/png"));
    };
    img.src = originalUrl;
  }, [originalUrl, originalFile, adjustments]);

  const handleAutoEnhance = () => {
    setAdjustments({ ...AUTO });
  };

  const handleResetAdjustments = () => {
    setAdjustments({ ...DEFAULT });
  };

  const handleDownload = async () => {
    if (!previewUrl) return;
    const res = await fetch(previewUrl);
    const blob = await res.blob();
    await downloadBlob(blob, generateFilename());
  };

  const handleReset = () => {
    if (originalUrl) revokeObjectURL(originalUrl);
    setOriginalUrl(null);
    setOriginalFile(null);
    setPreviewUrl(null);
    setAdjustments({ ...DEFAULT });
  };

  return (
    <ToolLayout
      title="Auto Enhance"
      description="One-click optimization or fine-tune brightness, contrast, saturation, and more."
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
                alt="Enhanced"
                className="w-full h-auto"
                style={{ maxHeight: "400px", objectFit: "contain" }}
              />
            </div>


            <div className="glass-panel rounded-lg p-5 space-y-5">
              <div className="flex items-center justify-between">
                <p className="font-sora text-xs text-ev-text-muted uppercase tracking-wider">
                  Adjustments
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleAutoEnhance}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-ev-accent/10 text-ev-accent text-xs font-sora hover:bg-ev-accent/20 transition-colors"
                  >
                    <Wand2 className="w-3 h-3" strokeWidth={2} />
                    Auto
                  </button>
                  <button
                    onClick={handleResetAdjustments}
                    className="px-3 py-1.5 rounded-md text-ev-text-muted text-xs hover:text-ev-text transition-colors"
                  >
                    Reset
                  </button>
                </div>
              </div>

              {SLIDERS.map(({ key, label, min, max }) => (
                <div key={key} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-ev-text-muted">{label}</span>
                    <span className="text-xs text-ev-text-bright font-mono">
                      {adjustments[key]}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={min}
                    max={max}
                    value={adjustments[key]}
                    onChange={(e) =>
                      setAdjustments((prev) => ({ ...prev, [key]: Number(e.target.value) }))
                    }
                    className="w-full h-1 bg-ev-border rounded-full appearance-none cursor-pointer accent-ev-accent"
                  />
                </div>
              ))}
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
