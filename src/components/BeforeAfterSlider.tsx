"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { GripVertical } from "lucide-react";

interface BeforeAfterSliderProps {
  beforeSrc: string;
  afterSrc: string;
  beforeAlt?: string;
  afterAlt?: string;
}

export function BeforeAfterSlider({
  beforeSrc,
  afterSrc,
  beforeAlt = "Original image",
  afterAlt = "Background removed",
}: BeforeAfterSliderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const updatePosition = useCallback(
    (clientX: number) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
      setSliderPosition(percentage);
    },
    []
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      setIsDragging(true);
      updatePosition(e.clientX);
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [updatePosition]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging) return;
      updatePosition(e.clientX);
    },
    [isDragging, updatePosition]
  );

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Keyboard accessibility
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const step = 2;
    if (e.key === "ArrowLeft") {
      setSliderPosition((prev) => Math.max(0, prev - step));
    } else if (e.key === "ArrowRight") {
      setSliderPosition((prev) => Math.min(100, prev + step));
    }
  }, []);

  // Preload after image
  useEffect(() => {
    const img = new Image();
    img.onload = () => setImageLoaded(true);
    img.src = afterSrc;
  }, [afterSrc]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="w-full"
    >
      <div
        ref={containerRef}
        className="relative w-full overflow-hidden rounded-lg bg-ev-surface select-none touch-none"
        style={{ maxHeight: "400px" }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onKeyDown={handleKeyDown}
        role="slider"
        aria-label="Image comparison slider"
        aria-valuenow={Math.round(sliderPosition)}
        aria-valuemin={0}
        aria-valuemax={100}
        tabIndex={0}
      >
        {/* Checkerboard background for transparency */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(45deg, #1a1a1a 25%, transparent 25%),
              linear-gradient(-45deg, #1a1a1a 25%, transparent 25%),
              linear-gradient(45deg, transparent 75%, #1a1a1a 75%),
              linear-gradient(-45deg, transparent 75%, #1a1a1a 75%)
            `,
            backgroundSize: "16px 16px",
            backgroundPosition: "0 0, 0 8px, 8px -8px, -8px 0px",
            backgroundColor: "#151515",
          }}
        />

        {/* After image (background removed — full width, below) */}
        {imageLoaded && (
          <img
            src={afterSrc}
            alt={afterAlt}
            className="relative block w-full h-auto"
            style={{ maxHeight: "400px", objectFit: "contain" }}
            draggable={false}
          />
        )}

        {/* Before image (original, clipped over the processed image) */}
        <img
          src={beforeSrc}
          alt={beforeAlt}
          className="absolute inset-0 block h-auto w-full"
          style={{
            clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`,
            maxHeight: "400px",
            objectFit: "contain",
          }}
          draggable={false}
        />

        {/* Slider line */}
        <div
          className="absolute top-0 bottom-0 w-px bg-ev-accent"
          style={{
            left: `${sliderPosition}%`,
            boxShadow: "0 0 8px rgba(6, 182, 212, 0.4)",
          }}
        />

        {/* Slider handle */}
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-10"
          style={{ left: `${sliderPosition}%` }}
        >
          <div
            className={`
              w-8 h-8 rounded-full bg-ev-dark border border-ev-accent 
              flex items-center justify-center cursor-grab
              transition-transform duration-200
              ${isDragging ? "scale-110 cursor-grabbing" : ""}
            `}
            style={{
              boxShadow: "0 0 12px rgba(6, 182, 212, 0.3)",
            }}
          >
            <GripVertical className="w-3.5 h-3.5 text-ev-accent" strokeWidth={2} />
          </div>
        </div>

        {/* Labels */}
        <div className="absolute top-3 left-3 px-2 py-1 rounded bg-ev-black/70 text-[10px] font-sora uppercase tracking-wider text-ev-accent">
          Removed
        </div>
        <div className="absolute top-3 right-3 px-2 py-1 rounded bg-ev-black/70 text-[10px] font-sora uppercase tracking-wider text-ev-text-muted">
          Original
        </div>
      </div>
    </motion.div>
  );
}
