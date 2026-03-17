"use client";

import { useState, useCallback, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { RotateCcw, Download } from "lucide-react";
import { DropZone } from "@/components/DropZone";
import { ToolLayout } from "@/components/ToolLayout";
import { downloadBlob, generateFilename, createObjectURL, revokeObjectURL } from "@/lib/imageUtils";

const PRESETS = [
  { label: "1:1", value: 1, desc: "Square" },
  { label: "4:5", value: 4 / 5, desc: "Portrait" },
  { label: "16:9", value: 16 / 9, desc: "Landscape" },
  { label: "9:16", value: 9 / 16, desc: "Story" },
  { label: "4:3", value: 4 / 3, desc: "Standard" },
  { label: "Free", value: 0, desc: "Custom" },
];

const MAX_PREVIEW_H = 400;

export default function SmartCropPage() {
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [imgNatural, setImgNatural] = useState({ w: 0, h: 0 });
  const [imgRendered, setImgRendered] = useState({ w: 0, h: 0 });
  const [ratio, setRatio] = useState(1);

  const [cropOffset, setCropOffset] = useState({ x: 0, y: 0 });
  const [freeRect, setFreeRect] = useState<{ x: number; y: number; w: number; h: number } | null>(null);

  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, offsetX: 0, offsetY: 0 });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleFileAccepted = useCallback((file: File) => {
    const url = createObjectURL(file);
    setOriginalUrl(url);
    setCropOffset({ x: 0, y: 0 });
    setFreeRect(null);
  }, []);

  // When the image loads, compute rendered size to fit within max constraints
  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    const natW = img.naturalWidth;
    const natH = img.naturalHeight;
    setImgNatural({ w: natW, h: natH });

    // Container is 100% width (max ~720px from ToolLayout), capped at MAX_PREVIEW_H
    const containerW = containerRef.current?.parentElement?.clientWidth ?? 720;
    const scale = Math.min(containerW / natW, MAX_PREVIEW_H / natH, 1);
    setImgRendered({ w: Math.round(natW * scale), h: Math.round(natH * scale) });
  };

  // Convert pointer to image-pixel coords using the known rendered dimensions
  const toImageCoords = useCallback(
    (clientX: number, clientY: number) => {
      if (!containerRef.current || imgRendered.w === 0) return { ix: 0, iy: 0 };
      const rect = containerRef.current.getBoundingClientRect();
      const relX = clientX - rect.left;
      const relY = clientY - rect.top;
      const sx = imgNatural.w / imgRendered.w;
      const sy = imgNatural.h / imgRendered.h;
      return {
        ix: Math.max(0, Math.min(imgNatural.w, relX * sx)),
        iy: Math.max(0, Math.min(imgNatural.h, relY * sy)),
      };
    },
    [imgNatural, imgRendered]
  );

  const getPresetCropBox = useCallback(() => {
    if (imgNatural.w === 0) return { x: 0, y: 0, w: 0, h: 0 };
    const imgRatio = imgNatural.w / imgNatural.h;
    let cropW: number, cropH: number;
    if (ratio > imgRatio) {
      cropW = imgNatural.w;
      cropH = cropW / ratio;
    } else {
      cropH = imgNatural.h;
      cropW = cropH * ratio;
    }
    const maxX = imgNatural.w - cropW;
    const maxY = imgNatural.h - cropH;
    const x = Math.max(0, Math.min(maxX, (imgNatural.w - cropW) / 2 + cropOffset.x));
    const y = Math.max(0, Math.min(maxY, (imgNatural.h - cropH) / 2 + cropOffset.y));
    return { x, y, w: cropW, h: cropH };
  }, [imgNatural, ratio, cropOffset]);

  const getCropBox = useCallback(() => {
    if (ratio === 0) {
      if (freeRect && freeRect.w > 5 && freeRect.h > 5) return freeRect;
      return { x: 0, y: 0, w: imgNatural.w, h: imgNatural.h };
    }
    return getPresetCropBox();
  }, [ratio, freeRect, imgNatural, getPresetCropBox]);

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);

    if (ratio === 0) {
      const { ix, iy } = toImageCoords(e.clientX, e.clientY);
      dragStart.current = { x: ix, y: iy, offsetX: 0, offsetY: 0 };
      setFreeRect({ x: ix, y: iy, w: 0, h: 0 });
    } else {
      dragStart.current = {
        x: e.clientX, y: e.clientY,
        offsetX: cropOffset.x, offsetY: cropOffset.y,
      };
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !containerRef.current) return;

    if (ratio === 0) {
      const { ix, iy } = toImageCoords(e.clientX, e.clientY);
      setFreeRect({
        x: Math.min(dragStart.current.x, ix),
        y: Math.min(dragStart.current.y, iy),
        w: Math.abs(ix - dragStart.current.x),
        h: Math.abs(iy - dragStart.current.y),
      });
    } else {
      const rect = containerRef.current.getBoundingClientRect();
      const scaleX = imgNatural.w / rect.width;
      const scaleY = imgNatural.h / rect.height;
      setCropOffset({
        x: dragStart.current.offsetX + (e.clientX - dragStart.current.x) * scaleX,
        y: dragStart.current.offsetY + (e.clientY - dragStart.current.y) * scaleY,
      });
    }
  };

  const handlePointerUp = () => setIsDragging(false);

  const handleDownload = async () => {
    if (!originalUrl) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const crop = getCropBox();
    canvas.width = Math.round(crop.w);
    canvas.height = Math.round(crop.h);

    const img = new Image();
    img.onload = async () => {
      ctx.drawImage(img, crop.x, crop.y, crop.w, crop.h, 0, 0, crop.w, crop.h);
      canvas.toBlob(async (blob) => {
        if (blob) await downloadBlob(blob, generateFilename());
      }, "image/png");
    };
    img.src = originalUrl;
  };

  const handleReset = () => {
    if (originalUrl) revokeObjectURL(originalUrl);
    setOriginalUrl(null);
    setImgNatural({ w: 0, h: 0 });
    setImgRendered({ w: 0, h: 0 });
    setCropOffset({ x: 0, y: 0 });
    setFreeRect(null);
  };

  // Overlay percentages — now based on exact image dimensions, not container
  const crop = getCropBox();
  const pctX = imgNatural.w ? (crop.x / imgNatural.w) * 100 : 0;
  const pctY = imgNatural.h ? (crop.y / imgNatural.h) * 100 : 0;
  const pctW = imgNatural.w ? (crop.w / imgNatural.w) * 100 : 100;
  const pctH = imgNatural.h ? (crop.h / imgNatural.h) * 100 : 100;
  const showOverlay = ratio !== 0 || (freeRect && freeRect.w > 5 && freeRect.h > 5);

  return (
    <ToolLayout
      title="Smart Crop"
      description="Crop images to popular aspect ratios or draw a custom selection."
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

        {originalUrl && (
          <motion.div
            key="editor"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-6"
          >

            <div className="flex justify-center">
              <div
                ref={containerRef}
                className={`relative rounded-lg overflow-hidden bg-ev-surface select-none touch-none ${
                  ratio === 0 ? "cursor-crosshair" : "cursor-move"
                }`}
                style={{
                  width: imgRendered.w || "100%",
                  height: imgRendered.h || "auto",
                }}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerUp}
              >
                <img
                  src={originalUrl}
                  alt="Crop preview"
                  className="block w-full h-full"
                  draggable={false}
                  onLoad={handleImageLoad}
                />

                {showOverlay && (
                  <>
                    <div className="absolute left-0 right-0 top-0 bg-black/60" style={{ height: `${pctY}%` }} />
                    <div className="absolute left-0 right-0 bottom-0 bg-black/60" style={{ height: `${Math.max(0, 100 - pctY - pctH)}%` }} />
                    <div className="absolute bg-black/60" style={{ top: `${pctY}%`, left: 0, width: `${pctX}%`, height: `${pctH}%` }} />
                    <div className="absolute bg-black/60" style={{ top: `${pctY}%`, right: 0, width: `${Math.max(0, 100 - pctX - pctW)}%`, height: `${pctH}%` }} />
                    <div
                      className="absolute border border-ev-accent/60 rounded-sm pointer-events-none"
                      style={{ top: `${pctY}%`, left: `${pctX}%`, width: `${pctW}%`, height: `${pctH}%` }}
                    />
                  </>
                )}

                {ratio === 0 && !freeRect && !isDragging && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="px-3 py-1.5 rounded-lg bg-ev-black/70 text-xs text-ev-text-muted font-sora">
                      Click and drag to select area
                    </span>
                  </div>
                )}
              </div>
            </div>


            <div className="glass-panel rounded-lg p-5">
              <p className="font-sora text-xs text-ev-text-muted uppercase tracking-wider mb-3">
                Aspect Ratio
              </p>
              <div className="flex flex-wrap gap-2">
                {PRESETS.map((p) => (
                  <button
                    key={p.label}
                    onClick={() => {
                      setRatio(p.value);
                      setCropOffset({ x: 0, y: 0 });
                      setFreeRect(null);
                    }}
                    className={`px-3 py-2 rounded-lg text-xs font-sora transition-colors ${
                      ratio === p.value
                        ? "bg-ev-accent/15 text-ev-accent border border-ev-accent/30"
                        : "border border-ev-border text-ev-text-muted hover:border-ev-accent/30"
                    }`}
                  >
                    <span className="font-medium">{p.label}</span>
                    <span className="ml-1.5 opacity-60">{p.desc}</span>
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
                Download Cropped
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
