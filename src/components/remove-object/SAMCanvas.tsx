"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Undo2, Trash2 } from "lucide-react";

interface Point {
  x: number;
  y: number;
}

interface SAMCanvasProps {
  imageUrl: string;
  onMaskCreated: (maskDataUrl: string) => void;
  onPointsChanged?: (points: Point[]) => void;
}

export function SAMCanvas({ imageUrl, onMaskCreated, onPointsChanged }: SAMCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  
  const [points, setPoints] = useState<Point[]>([]);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushSize, setBrushSize] = useState(20);

  const drawPoints = useCallback((pts: Point[]) => {
    const canvas = overlayCanvasRef.current;
    const imgCanvas = canvasRef.current;
    if (!canvas || !imgCanvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    pts.forEach((point, index) => {
      ctx.beginPath();
      ctx.arc(point.x, point.y, brushSize + 4, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(6, 182, 212, 0.2)";
      ctx.fill();
      
      ctx.beginPath();
      ctx.arc(point.x, point.y, 8, 0, Math.PI * 2);
      ctx.fillStyle = "#06b6d4";
      ctx.fill();
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 2;
      ctx.stroke();
    });
    
    if (pts.length > 1) {
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      pts.forEach((pt) => {
        ctx.lineTo(pt.x, pt.y);
      });
      ctx.closePath();
      ctx.fillStyle = "rgba(6, 182, 212, 0.15)";
      ctx.fill();
      ctx.strokeStyle = "rgba(6, 182, 212, 0.5)";
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }, [brushSize]);

  // Load image and set up canvas
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      imageRef.current = img;
      if (canvasRef.current && containerRef.current) {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        
        // Calculate scale to fit image in container
        const containerWidth = container.clientWidth;
        const containerHeight = Math.min(500, containerWidth * (img.height / img.width));
        
        const scaleX = containerWidth / img.width;
        const scaleY = containerHeight / img.height;
        const fitScale = Math.min(scaleX, scaleY);
        
        canvas.width = img.width * fitScale;
        canvas.height = img.height * fitScale;
        
        if (overlayCanvasRef.current) {
          overlayCanvasRef.current.width = canvas.width;
          overlayCanvasRef.current.height = canvas.height;
        }
        
        setScale(fitScale);
        setOffset({ x: 0, y: 0 });
        
        // Draw image
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        }
        
        // Redraw points
        drawPoints([]);
      }
    };
    img.src = imageUrl;
  }, [imageUrl, drawPoints]);

  const getCanvasPoint = useCallback((e: React.PointerEvent): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (e.button === 2) return; // Ignore right click
    const point = getCanvasPoint(e);
    setIsDrawing(true);
    setPoints((prev) => {
      const newPoints = [...prev, point];
      drawPoints(newPoints);
      onPointsChanged?.(newPoints);
      return newPoints;
    });
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, [getCanvasPoint, drawPoints, onPointsChanged]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDrawing) return;
    // Don't add points on move, only on click
  }, [isDrawing]);

  const handlePointerUp = useCallback(() => {
    setIsDrawing(false);
  }, []);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    // Remove last point on right click
    setPoints((prev) => {
      if (prev.length === 0) return prev;
      const newPoints = prev.slice(0, -1);
      drawPoints(newPoints);
      onPointsChanged?.(newPoints);
      return newPoints;
    });
  }, [drawPoints, onPointsChanged]);

  const handleUndo = useCallback(() => {
    setPoints((prev) => {
      const newPoints = prev.slice(0, -1);
      drawPoints(newPoints);
      onPointsChanged?.(newPoints);
      return newPoints;
    });
  }, [drawPoints, onPointsChanged]);

  const handleClear = useCallback(() => {
    setPoints([]);
    drawPoints([]);
    onPointsChanged?.([]);
  }, [drawPoints, onPointsChanged]);

  // Generate mask when points change
  useEffect(() => {
    if (points.length === 0 || !imageRef.current) {
      onMaskCreated("");
      return;
    }

    // Create a mask canvas
    const img = imageRef.current;
    const maskCanvas = document.createElement("canvas");
    maskCanvas.width = img.width;
    maskCanvas.height = img.height;
    const maskCtx = maskCanvas.getContext("2d");
    
    if (maskCtx) {
      // Create convex hull of points for mask
      if (points.length >= 3) {
        // Fill polygon
        maskCtx.beginPath();
        maskCtx.moveTo(points[0].x, points[0].y);
        points.forEach((pt) => {
          maskCtx.lineTo(pt.x, pt.y);
        });
        maskCtx.closePath();
        maskCtx.fillStyle = "white";
        maskCtx.fill();
      } else if (points.length === 1) {
        // Draw circle for single point
        maskCtx.beginPath();
        maskCtx.arc(points[0].x, points[0].y, brushSize, 0, Math.PI * 2);
        maskCtx.fillStyle = "white";
        maskCtx.fill();
      } else if (points.length === 2) {
        // Draw line for two points
        maskCtx.lineWidth = brushSize * 2;
        maskCtx.strokeStyle = "white";
        maskCtx.lineCap = "round";
        maskCtx.beginPath();
        maskCtx.moveTo(points[0].x, points[0].y);
        maskCtx.lineTo(points[1].x, points[1].y);
        maskCtx.stroke();
      }
      
      const maskDataUrl = maskCanvas.toDataURL();
      onMaskCreated(maskDataUrl);
    }
  }, [points, brushSize, onMaskCreated]);

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center gap-4 px-2">
        <div className="flex items-center gap-2 text-sm text-ev-text-muted">
          <span>Brush:</span>
          <input
            type="range"
            min="10"
            max="50"
            value={brushSize}
            onChange={(e) => setBrushSize(Number(e.target.value))}
            className="w-24 accent-ev-accent"
          />
          <span className="w-8">{brushSize}px</span>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleUndo}
            disabled={points.length === 0}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs text-ev-text-muted hover:text-ev-text disabled:opacity-30 transition-colors"
          >
            <Undo2 className="w-3.5 h-3.5" />
            Undo
          </button>
          
          <button
            onClick={handleClear}
            disabled={points.length === 0}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs text-ev-text-muted hover:text-ev-danger disabled:opacity-30 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear
          </button>
        </div>
        
        <div className="ml-auto text-xs text-ev-text-muted">
          {points.length} point{points.length !== 1 ? "s" : ""} selected
        </div>
      </div>
      
      {/* Canvas container */}
      <div
        ref={containerRef}
        className="relative w-full overflow-hidden rounded-lg bg-ev-dark/50 select-none touch-none"
        style={{ maxHeight: "500px" }}
        onContextMenu={handleContextMenu}
      >
        {/* Base image canvas */}
        <canvas
          ref={canvasRef}
          className="block w-full h-auto"
          style={{ maxHeight: "500px", objectFit: "contain" }}
        />
        
        {/* Overlay for points */}
        <canvas
          ref={overlayCanvasRef}
          className="absolute top-0 left-0 w-full h-full pointer-events-none"
          style={{ maxHeight: "500px", objectFit: "contain" }}
        />
        
        {/* Click handler overlay */}
        <div
          className="absolute top-0 left-0 w-full h-full cursor-crosshair"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        />
        
        {/* Instructions */}
        {points.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="px-4 py-2 rounded bg-ev-black/70 text-sm text-ev-text-muted">
              Click to add selection points
            </div>
          </div>
        )}
      </div>
      
      {/* Help text */}
      <div className="text-xs text-ev-text-muted/60 px-2">
        Left-click to add points. Right-click to remove last point. Connect 3+ points to create a selection area.
      </div>
    </div>
  );
}
